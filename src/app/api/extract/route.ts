import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en fiches de paie israéliennes (תלוש שכר / tloush maskoret).
Ton rôle est d'extraire toutes les informations d'une fiche de paie israélienne et de les retourner en JSON structuré.
Les fiches de paie israéliennes sont généralement en hébreu. Tu dois :
1. Lire tous les textes en hébreu
2. Identifier chaque ligne (salaire de base, cotisations, avantages, etc.)
3. Extraire les montants en shekel (₪ / ILS)
4. Retourner un JSON conforme au schéma demandé

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

const USER_PROMPT = `Analyse cette fiche de paie israélienne et extrait toutes les informations.
Retourne UNIQUEMENT ce JSON (sans markdown, sans explication) :

{
  "employerName": "nom de l'employeur ou null",
  "employeeName": "nom du salarié ou null",
  "employeeId": "numéro d'employé (masqué si possible) ou null",
  "period": "période ex: 'Avril 2024' ou '04/2024' ou null",
  "paymentDate": "date de paiement JJ/MM/AAAA ou null",
  "baseSalary": nombre ou null,
  "grossSalary": nombre ou null,
  "netSalary": nombre ou null,
  "hourlyRate": nombre ou null,
  "regularHours": nombre ou null,
  "overtimeHours": nombre ou null,
  "totalBenefits": nombre ou null,
  "totalDeductions": nombre ou null,
  "leaveBalance": nombre (jours) ou null,
  "sickBalance": nombre (jours) ou null,
  "pensionDetected": true/false,
  "nationalInsuranceDetected": true/false,
  "incomeTaxDetected": true/false,
  "rawLines": [
    {
      "hebrewLabel": "texte hébreu de la ligne",
      "normalizedKey": "une des clés suivantes : baseSalary|grossSalary|netSalary|hourlyRate|regularHours|overtimeHours|travelAllowance|mealAllowance|vacationPay|sickPay|holidayBonus|pension|pensionCompensation|nationalInsurance|healthInsurance|incomeTax|unionFee|lunchDeduction|leaveBalance|sickBalance|seniority|bonus|commission|otherBenefit|otherDeduction|unknown",
      "frenchLabel": "traduction française",
      "value": nombre ou null,
      "unit": "ILS ou hours ou days ou %",
      "note": "explication si nécessaire ou omis"
    }
  ],
  "confidenceScore": nombre entre 0 et 100 (ta confiance dans l'extraction),
  "extractionMode": "ocr"
}

Règles importantes :
- שכר יסוד = salaire de base (baseSalary)
- ברוטו = brut (grossSalary)
- נטו = net (netSalary)
- ביטוח לאומי = sécurité sociale (nationalInsurance) → valeur NEGATIVE
- ביטוח בריאות = assurance santé (healthInsurance) → valeur NEGATIVE
- מס הכנסה = impôt sur le revenu (incomeTax) → valeur NEGATIVE
- פנסיה = pension salarié (pension) → valeur NEGATIVE
- נסיעות = remboursement transport (travelAllowance) → valeur POSITIVE
- שעות נוספות = heures supplémentaires (overtimeHours)
- יתרת חופשה = solde congés (leaveBalance) en jours
- יתרת מחלה = solde maladie (sickBalance) en jours
- Les déductions (cotisations, impôts) doivent être des valeurs NEGATIVES
- Les avantages (transports, primes) doivent être des valeurs POSITIVES`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

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

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      betas: mimeType === "application/pdf" ? ["pdfs-2024-09-25"] : undefined,
      messages: [
        {
          role: "user",
          // @ts-expect-error – mixed content blocks
          content: contentBlocks,
        },
      ],
    });

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

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[/api/extract]", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
