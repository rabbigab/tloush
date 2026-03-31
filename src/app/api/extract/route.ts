import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en fiches de paie israeliennes (tloush maskoret).
Ton role est d'extraire TOUTES les informations d'une fiche de paie israelienne.
Les fiches israeliennes sont en hebreu. Tu lis l'hebreu couramment.
IMPORTANT : Retourne UNIQUEMENT le JSON demande, sans texte avant ou apres, sans markdown.`;

const USER_PROMPT = `Analyse cette fiche de paie israelienne.
Retourne ce JSON exact (sans markdown) :

{
  "employerName": "nom employeur ou null",
  "employeeName": "nom salarie ou null",
  "employeeId": "numero employe masque ou null",
  "period": "periode ex Avril 2024 ou null",
  "paymentDate": "JJ/MM/AAAA ou null",
  "baseSalary": null,
  "grossSalary": null,
  "netSalary": null,
  "hourlyRate": null,
  "regularHours": null,
  "overtimeHours": null,
  "totalBenefits": null,
  "totalDeductions": null,
  "leaveBalance": null,
  "sickBalance": null,
  "pensionDetected": false,
  "nationalInsuranceDetected": false,
  "incomeTaxDetected": false,
  "kerenHishtalmutDetected": false,
  "rawLines": [],
  "confidenceScore": 0,
  "extractionMode": "ocr"
}

REGLES :
- employerName = le texte a cote de "שם החברה" ou "שם המעסיק" en HAUT du document.
  ATTENTION : le texte en bas du document apres "בוצע ע\"י" ou "באמצעות" est le NOM DU LOGICIEL DE PAIE, PAS l'employeur. Ne le confonds pas.
- employeeName = le texte a cote de "שם עובד" ou "שם העובד".
- שכר יסוד = salaire de base -> baseSalary
- ברוטו = brut -> grossSalary
- נטו / לתשלום = net -> netSalary
- ביטוח לאומי = securite sociale -> nationalInsuranceDetected: true
- מס הכנסה = impot revenu -> incomeTaxDetected: true
- פנסיה = pension -> pensionDetected: true
- קרן השתלמות = epargne formation -> kerenHishtalmutDetected: true
- נסיעות = transport, הבראה = convalescence, בונוס = prime
- שעות רגילות = heures normales -> regularHours
- שעות נוספות = heures supplementaires -> overtimeHours
- יתרת חופשה = solde conges en JOURS -> leaveBalance
- יתרת מחלה = solde maladie en JOURS -> sickBalance
- Les deductions sont des valeurs NEGATIVES
- Les avantages sont des valeurs POSITIVES

Pour rawLines, ajoute chaque ligne :
{ "hebrewLabel": "texte hebreu", "normalizedKey": "cle", "frenchLabel": "traduction", "value": nombre, "unit": "ILS ou hours ou days ou %" }

Score de confiance : 90-100 = clair, 70-89 = correct, 50-69 = incertain, 0-49 = peu lisible`;
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
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } },
      ];
    } else {
      const imgType = mimeType === "image/png" ? "image/png" : "image/jpeg";
      messageContent = [
        { type: "text", text: USER_PROMPT },
        { type: "image", source: { type: "base64", media_type: imgType, data: base64Data } },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = await (client as any).messages.create({
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
