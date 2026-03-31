import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;

// Step 1: Use Google Cloud Vision to extract raw text from the image/PDF
async function extractTextWithVision(base64Data: string): Promise<string> {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

  const body = {
    requests: [
      {
        image: { content: base64Data },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        imageContext: {
          languageHints: ["he", "en"],
        },
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Vision API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const fullText = data.responses?.[0]?.fullTextAnnotation?.text ?? "";
  return fullText;
}

// Step 2: Use Claude to structure the extracted text into JSON
const SYSTEM_PROMPT = `Tu es un expert en fiches de paie israeliennes (tloush maskoret).
Tu recois le texte brut extrait par OCR d'une fiche de paie israelienne.
Ton role est d'identifier et structurer toutes les informations en JSON.
Les fiches israeliennes sont en hebreu. Tu lis l'hebreu couramment.
IMPORTANT : Retourne UNIQUEMENT le JSON demande, sans texte avant ou apres, sans markdown.`;

const USER_PROMPT_TEMPLATE = `Voici le texte brut extrait par OCR d'une fiche de paie israelienne :

---
TEXT_PLACEHOLDER
---

A partir de ce texte, retourne ce JSON exact (sans markdown) :
{
  "employerName": "nom employeur ou null",
  "employeeName": "nom salarie ou null",
  "employeeId": "numero employe ou null",
  "period": "periode ex Avril 2024 ou null",
  "paymentDate": "JJ/MM/AAAA ou null",
  "baseSalary": null, "grossSalary": null, "netSalary": null,
  "hourlyRate": null, "regularHours": null, "overtimeHours": null,
  "totalBenefits": null, "totalDeductions": null,
  "leaveBalance": null, "sickBalance": null,
  "pensionDetected": false, "nationalInsuranceDetected": false,
  "incomeTaxDetected": false, "kerenHishtalmutDetected": false,
  "rawLines": [], "confidenceScore": 0, "extractionMode": "ocr"
}

REGLES :
- employerName = texte a cote de "שם החברה" ou "שם המעסיק". ATTENTION : ignorer le texte apres "בוצע ע\"י" ou "באמצעות" (c'est le logiciel de paie).
- employeeName = texte a cote de "שם עובד" ou "שם העובד".
- שכר יסוד = baseSalary, ברוטו = grossSalary, נטו/לתשלום = netSalary
- ביטוח לאומי → nationalInsuranceDetected: true, מס הכנסה → incomeTaxDetected: true
- פנסיה → pensionDetected: true, קרן השתלמות → kerenHishtalmutDetected: true
- שעות רגילות = regularHours, שעות נוספות = overtimeHours
- יתרת חופשה = leaveBalance (jours), יתרת מחלה = sickBalance (jours)
- Deductions = valeurs NEGATIVES, Avantages = valeurs POSITIVES
- rawLines : une entree par ligne { hebrewLabel, normalizedKey, frenchLabel, value, unit }`;
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier recu" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    // STEP 1: Extract text using Google Cloud Vision OCR
    let ocrText = "";
    if (GOOGLE_VISION_API_KEY) {
      try {
        ocrText = await extractTextWithVision(base64Data);
        console.log("[OCR] Google Vision extracted", ocrText.length, "chars");
      } catch (visionErr) {
        console.error("[OCR] Google Vision failed, falling back to Claude vision:", visionErr);
      }
    } else {
      console.log("[OCR] No GOOGLE_VISION_API_KEY, using Claude vision directly");
    }

    // STEP 2: Send to Claude for structuring
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messageContent: any[];

    if (ocrText) {
      // We have OCR text - send it as text only (more reliable)
      const prompt = USER_PROMPT_TEMPLATE.replace("TEXT_PLACEHOLDER", ocrText);
      messageContent = [{ type: "text", text: prompt }];
    } else if (mimeType === "application/pdf") {
      // Fallback: send image/pdf directly to Claude
      const fallbackPrompt = USER_PROMPT_TEMPLATE.replace("TEXT_PLACEHOLDER", "(Lis le document ci-joint)");
      messageContent = [
        { type: "text", text: fallbackPrompt },
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } },
      ];
    } else {
      const imgType = mimeType === "image/png" ? "image/png" : "image/jpeg";
      const fallbackPrompt = USER_PROMPT_TEMPLATE.replace("TEXT_PLACEHOLDER", "(Lis l'image ci-jointe)");
      messageContent = [
        { type: "text", text: fallbackPrompt },
        { type: "image", source: { type: "base64", media_type: imgType, data: base64Data } },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = await (anthropic as any).messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: messageContent }],
    });

    const rawText = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Impossible de parser la reponse", raw: rawText }, { status: 422 });
    }

    // Post-processing
    const rawLines = Array.isArray(parsed.rawLines)
      ? parsed.rawLines as Array<{normalizedKey:string, value:number|null}>
      : [];
    if (parsed.leaveBalance == null) {
      const line = rawLines.find(l => l.normalizedKey === "leaveBalance" && l.value != null);
      if (line) parsed.leaveBalance = line.value;
    }
    if (parsed.sickBalance == null) {
      const line = rawLines.find(l => l.normalizedKey === "sickBalance" && l.value != null);
      if (line) parsed.sickBalance = line.value;
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[/api/extract]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
