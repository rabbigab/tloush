import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en fiches de paie israeliennes (tloush maskoret).
Ton role est d'extraire toutes les informations d'une fiche de paie israelienne et de les retourner en JSON structure.
Les fiches de paie israeliennes sont generalement en hebreu. Tu dois :
1. Lire tous les textes en hebreu
2. Identifier chaque ligne (salaire de base, cotisations, avantages, etc.)
3. Extraire les montants en shekel (ILS)
4. Retourner un JSON conforme au schema demande

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant ou apres.`;

const USER_PROMPT = `Analyse cette fiche de paie israelienne et extrait toutes les informations.
Retourne UNIQUEMENT ce JSON (sans markdown, sans explication) :

{
  "employerName": "nom de l'employeur ou null",
  "employeeName": "nom du salarie ou null",
  "employeeId": "numero d'employe ou null",
  "period": "periode ex: 'Avril 2024' ou null",
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
  "pensionDetected": true ou false,
  "nationalInsuranceDetected": true ou false,
  "incomeTaxDetected": true ou false,
  "rawLines": [
    {
      "hebrewLabel": "texte hebreu de la ligne",
      "normalizedKey": "baseSalary|grossSalary|netSalary|hourlyRate|regularHours|overtimeHours|travelAllowance|mealAllowance|vacationPay|sickPay|holidayBonus|pension|pensionCompensation|nationalInsurance|healthInsurance|incomeTax|unionFee|lunchDeduction|leaveBalance|sickBalance|seniority|bonus|commission|otherBenefit|otherDeduction|unknown",
      "frenchLabel": "traduction francaise",
      "value": nombre ou null,
      "unit": "ILS ou hours ou days ou %"
    }
  ],
  "confidenceScore": nombre entre 0 et 100,
  "extractionMode": "ocr"
}

Regles importantes :
- shkhar yesod = salaire de base (baseSalary)
- bruto = brut (grossSalary)
- neto = net (netSalary)
- bituah leumi = securite sociale (nationalInsurance) -> valeur NEGATIVE
- bituah briut = assurance sante (healthInsurance) -> valeur NEGATIVE
- mas hachnasa = impot sur le revenu (incomeTax) -> valeur NEGATIVE
- pensya = pension salarie (pension) -> valeur NEGATIVE
- nesiot = remboursement transport (travelAllowance) -> valeur POSITIVE
- Les deductions doivent etre des valeurs NEGATIVES
- Les avantages doivent etre des valeurs POSITIVES`;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messageContent: any[];

    if (mimeType === "application/pdf") {
      messageContent = [
        { type: "text", text: USER_PROMPT },
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64Data },
        },
      ];
    } else {
      const imageType = mimeType === "image/png" ? "image/png" : "image/jpeg";
      messageContent = [
        { type: "text", text: USER_PROMPT },
        {
          type: "image",
          source: { type: "base64", media_type: imageType, data: base64Data },
        },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anthropicClient = client as any;
    const message = await anthropicClient.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: messageContent }],
    });

    const rawText =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Impossible de parser la reponse de l'IA", raw: rawText },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[/api/extract]", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
