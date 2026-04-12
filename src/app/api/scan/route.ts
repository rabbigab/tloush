import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { validateFile } from "@/lib/fileValidation";
import { createRateLimit } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/apiAuth";
import { canUseFeature, incrementUsage } from "@/lib/subscription";
import { extractTextFromImage, buildOcrContext } from "@/lib/ocrPreprocess";
import type { DocumentType, DocumentAnalysis } from "@/types/scanner";
import { SCAN_SYSTEM_PROMPTS, SCAN_USER_PROMPTS } from "@/lib/prompts";

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
    const documentType = formData.get("documentType") as DocumentType | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // File validation
    const validationError = await validateFile(file);
    if (validationError) return validationError;

    if (!documentType || !SYSTEM_PROMPTS[documentType]) {
      return NextResponse.json(
        { error: "Type de document invalide" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const base64Data = fileBuffer.toString("base64");
    const mimeType = file.type as string;
    timing(`file_parsed (${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB, ${mimeType})`);

    // Pre-OCR with Tesseract (Hebrew + English) for cross-validation
    const ocrResult = await extractTextFromImage(fileBuffer, mimeType);
    const ocrContext = buildOcrContext(ocrResult);
    timing(`ocr_done (${ocrResult.text.length} chars)`);

    // Build content based on file type
    type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: ImageMediaType; data: string } }
      | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

    let contentBlocks: ContentBlock[];

    if (mimeType === "application/pdf") {
      contentBlocks = [
        { type: "text", text: USER_PROMPTS[documentType] },
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64Data,
          },
        },
      ];
    } else {
      const imageMediaType = (
        mimeType === "image/png" ? "image/png" : "image/jpeg"
      ) as ImageMediaType;
      contentBlocks = [
        { type: "text", text: USER_PROMPTS[documentType] },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: imageMediaType,
            data: base64Data,
          },
        },
      ];
    }

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

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip possible markdown fences
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let data: DocumentAnalysis;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error: "Impossible de parser la réponse de l'IA",
          raw: rawText,
        },
        { status: 422 }
      );
    }

    // Calculate confidence score (0-100)
    // Higher confidence if all critical fields are present
    const confidenceScore = calculateConfidenceScore(data, documentType);

    // Increment usage counter
    await incrementUsage(supabase, user.id, 'documents_analyzed');
    timing("TOTAL_RESPONSE");

    return NextResponse.json({
      documentType,
      data,
      rawTranslation: rawText,
      confidenceScore,
      processingTime,
    });
  } catch (err: unknown) {
    console.error("[/api/scan]", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
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
