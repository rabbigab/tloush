import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `Regarde attentivement cette fiche de paie israelienne.

ETAPE 1 - Lis d'abord le HAUT du document (en-tete) :
- Trouve le texte a cote de 'שם החברה' ou 'שם המעסיק' = c'est le nom de l'EMPLOYEUR
- Trouve le texte a cote de 'שם עובד' ou 'שם העובד' = c'est le nom du SALARIE
- IGNORE tout texte en bas du document apres 'בוצע ע"י' ou 'באמצעות' (c'est le logiciel de paie, PAS l'employeur)

ETAPE 2 - Lis les montants :
- שכר יסוד = salaire de base (baseSalary)
- ברוטו / סה"כ תשלומים = brut (grossSalary)
- נטו / נטו לתשלום = net (netSalary)
- שעות רגילות = heures normales (regularHours), שעות נוספות = heures sup (overtimeHours)
- ביטוח לאומי = securite sociale → nationalInsuranceDetected: true
- מס הכנסה = impot → incomeTaxDetected: true
- פנסיה = pension → pensionDetected: true
- קרן השתלמות = epargne formation → kerenHishtalmutDetected: true
- נסיעות = transport, הבראה = convalescence, בונוס/מענק = prime

ETAPE 3 - Lis le tableau des conges en bas :
- חופש/חופשה colonne יתרה = solde conges en jours (leaveBalance)
- מחלה colonne יתרה = solde maladie en jours (sickBalance)

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "employerName": "nom exact en hebreu ou null",
  "employeeName": "nom exact en hebreu ou null",
  "employeeId": "numero ou null",
  "period": "MM/YYYY ou null",
  "paymentDate": "JJ/MM/AAAA ou null",
  "baseSalary": null, "grossSalary": null, "netSalary": null,
  "hourlyRate": null, "regularHours": null, "overtimeHours": null,
  "totalBenefits": null, "totalDeductions": null,
  "leaveBalance": null, "sickBalance": null,
  "pensionDetected": false, "nationalInsuranceDetected": false,
  "incomeTaxDetected": false, "kerenHishtalmutDetected": false,
  "rawLines": [], "confidenceScore": 0, "extractionMode": "ocr"
}`;
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
        { type: "text", text: EXTRACTION_PROMPT },
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } },
      ];
    } else {
      const imgType = mimeType === "image/png" ? "image/png" : "image/jpeg";
      messageContent = [
        { type: "text", text: EXTRACTION_PROMPT },
        { type: "image", source: { type: "base64", media_type: imgType, data: base64Data } },
      ];
    }

    // Use extended thinking so the model carefully reads the document before answering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = await (client as any).messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 16000,
      thinking: {
        type: "enabled",
        budget_tokens: 10000,
      },
      messages: [{ role: "user", content: messageContent }],
    });

    // Extract the text block (skip thinking blocks)
    let rawText = "";
    for (const block of msg.content) {
      if (block.type === "text") {
        rawText = block.text;
        break;
      }
    }

    // Strip possible markdown fences
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Impossible de parser la reponse", raw: rawText }, { status: 422 });
    }

    // Post-processing: extraire leaveBalance/sickBalance depuis rawLines si null
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
