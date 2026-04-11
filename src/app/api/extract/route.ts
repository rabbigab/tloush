import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { validateFile } from "@/lib/fileValidation";
import { createRateLimit } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/apiAuth";
import { canUseFeature, incrementUsage } from "@/lib/subscription";
import { EXTRACT_SYSTEM_PROMPT, EXTRACT_USER_PROMPT } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const ratelimit = createRateLimit("extract", 10, "1 h");

// Allow up to 60 seconds for Claude extraction
export const maxDuration = 60;

const SYSTEM_PROMPT = EXTRACT_SYSTEM_PROMPT;
const USER_PROMPT = EXTRACT_USER_PROMPT;

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { user, supabase } = auth;

    // Check subscription & quota
    const access = await canUseFeature(supabase, user.id, 'document_analysis');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, code: 'QUOTA_EXCEEDED' }, { status: 403 });
    }

    // Rate limiting
    if (ratelimit) {
      const { success } = await ratelimit.limit(user.id);
      if (!success) {
        return NextResponse.json({ error: "Limite atteinte. Réessayez plus tard." }, { status: 429 });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // File validation
    const validationError = await validateFile(file);
    if (validationError) return validationError;

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type as string;

    // Build content based on file type
    type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: ImageMediaType; data: string } }
      | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

    let contentBlocks: ContentBlock[];

    if (mimeType === "application/pdf") {
      contentBlocks = [
        { type: "text", text: USER_PROMPT },
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
      // image/jpeg or image/png
      const imageMediaType = (
        mimeType === "image/png" ? "image/png" : "image/jpeg"
      ) as ImageMediaType;
      contentBlocks = [
        { type: "text", text: USER_PROMPT },
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

    // Cast needed: 'document' content block not yet in SDK types (v0.24)
    const message = await (client.messages.create as Function)({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: contentBlocks,
        },
      ],
    }) as Anthropic.Message;

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip possible markdown fences
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Return a minimal document with the raw text as a note
      return NextResponse.json(
        {
          error: "Impossible de parser la réponse de l'IA",
          raw: rawText,
        },
        { status: 422 }
      );
    }

    // Increment usage counter
    await incrementUsage(supabase, user.id, 'documents_analyzed');

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[/api/extract]", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
