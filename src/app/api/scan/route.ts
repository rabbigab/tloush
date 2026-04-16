import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { validateFile } from "@/lib/fileValidation";
import { createRateLimit } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/apiAuth";
import { canUseFeature, incrementUsage } from "@/lib/subscription";
import { extractTextFromImage, buildOcrContext } from "@/lib/ocrPreprocess";
import type { DocumentType, DocumentAnalysis, DocumentDetection } from "@/types/scanner";
import {
  SCAN_SYSTEM_PROMPTS,
  SCAN_USER_PROMPTS,
  SCAN_DETECTION_SYSTEM,
  SCAN_DETECTION_USER,
} from "@/lib/prompts";

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "payslip",
  "contract",
  "officialLetter",
  "taxNotice",
  "lease",
  "termination",
  "medicalBill",
  "kupatHolimLetter",
  "prescription",
  "labResults",
  "universal",
];

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Allow up to 5 minutes for document analysis (Claude calls can be slow)
export const maxDuration = 300;
const ratelimit = createRateLimit("scan", 10, "1 h");

const SYSTEM_PROMPTS = SCAN_SYSTEM_PROMPTS;
const USER_PROMPTS = SCAN_USER_PROMPTS;

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const timing = (label: string) => console.log(`[TIMING][scan] ${label}: ${Date.now() - t0}ms`);

  try {
    // Auth check
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { user, supabase } = auth;
    timing("auth");

    // Rate limiting
    if (ratelimit) {
      const { success } = await ratelimit.limit(user.id);
      if (!success) {
        return NextResponse.json({ error: "Limite atteinte. Réessayez plus tard." }, { status: 429 });
      }
    }

    // Check subscription & quota
    const access = await canUseFeature(supabase, user.id, 'document_analysis');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, code: 'QUOTA_EXCEEDED' }, { status: 403 });
    }
    timing("checks");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawDocumentType = formData.get("documentType") as string | null;
    const requestedType: DocumentType | null =
      rawDocumentType && VALID_DOCUMENT_TYPES.includes(rawDocumentType as DocumentType)
        ? (rawDocumentType as DocumentType)
        : null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // File validation
    const validationError = await validateFile(file);
    if (validationError) return validationError;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const base64Data = fileBuffer.toString("base64");
    const mimeType = file.type as string;
    timing(`file_parsed (${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB, ${mimeType})`);

    // Pre-OCR with Tesseract (Hebrew + English) for cross-validation
    const ocrResult = await extractTextFromImage(fileBuffer, mimeType);
    const ocrContext = buildOcrContext(ocrResult);
    timing(`ocr_done (${ocrResult.text.length} chars)`);

    // ─── Pass 1 : Détection automatique du type (si pas fourni) ───
    let documentType: DocumentType;
    let detection: DocumentDetection | null = null;
    if (requestedType) {
      documentType = requestedType;
    } else {
      detection = await detectDocumentType(fileBuffer, base64Data, mimeType, ocrContext);
      documentType = detection.type;
      timing(`detection_done (${documentType}, confidence ${detection.confidence})`);
    }

    // ─── Pass 2 : Analyse adaptée au type détecté/demandé ───
    const contentBlocks = buildContentBlocks(SYSTEM_PROMPTS, USER_PROMPTS, documentType, base64Data, mimeType);
    const startTime = Date.now();

    // Build system prompt with cache_control pour prompt caching
    const basePrompt = SYSTEM_PROMPTS[documentType];
    const systemBlocks: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }> = [
      {
        type: "text",
        text: basePrompt,
        cache_control: { type: "ephemeral" },  // Cache le prompt de base
      },
    ];
    if (ocrContext) {
      systemBlocks.push({ type: "text", text: ocrContext });
    }

    timing("prompt_built");

    // Cast needed: 'document' content block not yet in SDK types (v0.24)
    const message = await (client.messages.create as Function)({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: systemBlocks,
      messages: [
        {
          role: "user",
          content: contentBlocks,
        },
      ],
    }) as Anthropic.Message;

    const processingTime = Date.now() - startTime;
    timing(`claude_complete (${processingTime}ms)`);

    // Defensive: guard against empty or non-text Claude responses
    if (!message.content || message.content.length === 0) {
      console.error("[/api/scan] Empty Claude response:", message);
      return NextResponse.json(
        { error: "Réponse vide du service d'analyse. Réessayez dans quelques instants." },
        { status: 502 }
      );
    }
    if (message.content[0].type !== "text") {
      console.error("[/api/scan] Non-text Claude response block:", message.content[0].type);
      return NextResponse.json(
        { error: "Format de réponse inattendu du service d'analyse." },
        { status: 502 }
      );
    }

    const rawText = message.content[0].text;

    // Strip possible markdown fences
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let data: DocumentAnalysis;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[/api/scan] JSON parse failed:", parseErr, "rawText:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "Impossible de parser la réponse de l'IA. Réessayez avec un document plus clair." },
        { status: 422 }
      );
    }

    // Calculate confidence score (0-100)
    const confidenceScore = calculateConfidenceScore(data, documentType);

    // Increment usage counter (non-critical — log but don't fail the request)
    incrementUsage(supabase, user.id, 'documents_analyzed').catch(err => {
      console.error("[/api/scan] incrementUsage failed:", err);
    });
    timing("TOTAL_RESPONSE");

    // Note: rawTranslation omitted from response to avoid leaking raw AI output
    return NextResponse.json({
      documentType,
      data,
      confidenceScore,
      processingTime,
      detection, // peut être null si type imposé par l'appelant
    });
  } catch (err: unknown) {
    console.error("[/api/scan]", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Helpers ───

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: ImageMediaType; data: string } }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

function buildContentBlocks(
  systemPrompts: Record<DocumentType, string>,
  userPrompts: Record<DocumentType, string>,
  documentType: DocumentType,
  base64Data: string,
  mimeType: string,
): ContentBlock[] {
  // systemPrompts argument kept for consistency but not used here
  void systemPrompts;
  if (mimeType === "application/pdf") {
    return [
      { type: "text", text: userPrompts[documentType] },
      {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64Data },
      },
    ];
  }
  const imageMediaType = (mimeType === "image/png" ? "image/png" : "image/jpeg") as ImageMediaType;
  return [
    { type: "text", text: userPrompts[documentType] },
    {
      type: "image",
      source: { type: "base64", media_type: imageMediaType, data: base64Data },
    },
  ];
}

/**
 * Premier appel Claude : classifie le document.
 * Court (max 256 tokens), JSON strict. Fallback sur "universal" en cas d'échec.
 */
async function detectDocumentType(
  _fileBuffer: Buffer,
  base64Data: string,
  mimeType: string,
  ocrContext: string | null,
): Promise<DocumentDetection> {
  type DetectContentBlock = ContentBlock;
  const content: DetectContentBlock[] =
    mimeType === "application/pdf"
      ? [
          { type: "text", text: SCAN_DETECTION_USER },
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64Data },
          },
        ]
      : [
          { type: "text", text: SCAN_DETECTION_USER },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: (mimeType === "image/png" ? "image/png" : "image/jpeg") as ImageMediaType,
              data: base64Data,
            },
          },
        ];

  const systemBlocks: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }> = [
    { type: "text", text: SCAN_DETECTION_SYSTEM, cache_control: { type: "ephemeral" } },
  ];
  if (ocrContext) systemBlocks.push({ type: "text", text: ocrContext });

  try {
    const message = await (client.messages.create as Function)({
      model: "claude-sonnet-4-5",
      max_tokens: 256,
      system: systemBlocks,
      messages: [{ role: "user", content }],
    }) as Anthropic.Message;

    if (!message.content?.[0] || message.content[0].type !== "text") {
      return { type: "universal", language: "other", confidence: 0 };
    }
    const cleaned = message.content[0].text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as Partial<DocumentDetection>;
    const type: DocumentType = VALID_DOCUMENT_TYPES.includes(parsed.type as DocumentType)
      ? (parsed.type as DocumentType)
      : "universal";
    const language = (parsed.language as DocumentDetection["language"]) ?? "other";
    const confidence = typeof parsed.confidence === "number"
      ? Math.min(100, Math.max(0, parsed.confidence))
      : 0;
    return { type, language, confidence };
  } catch (err) {
    console.error("[/api/scan] detection failed, falling back to universal:", err);
    return { type: "universal", language: "other", confidence: 0 };
  }
}

// Helper to estimate confidence based on extracted data completeness
function calculateConfidenceScore(data: DocumentAnalysis, documentType: DocumentType): number {
  let filledFields = 0;
  let totalFields = 0;

  const countFields = (obj: unknown, depth = 0): [number, number] => {
    if (depth > 5) return [0, 0]; // Prevent infinite recursion
    let filled = 0;
    let total = 0;

    if (obj === null || obj === undefined) {
      return [0, 1];
    }

    if (typeof obj === "object" && !Array.isArray(obj)) {
      const objAsRecord = obj as Record<string, unknown>;
      for (const [_, value] of Object.entries(objAsRecord)) {
        const [f, t] = countFields(value, depth + 1);
        filled += f;
        total += t;
      }
    } else if (Array.isArray(obj)) {
      // For arrays, if non-empty it counts as 1 filled field
      if (obj.length > 0) {
        filled += 1;
      }
      total += 1;
    } else {
      // Primitive value
      filled += obj ? 1 : 0;
      total += 1;
    }

    return [filled, total];
  };

  const [f, t] = countFields(data);
  filledFields = f;
  totalFields = t;

  const score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  return Math.min(100, Math.max(0, score));
}
