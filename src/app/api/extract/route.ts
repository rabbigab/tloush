import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en lecture de fiches de paie israeliennes (תלוש משכורת).
Tu lis l'hebreu couramment. Tu connais parfaitement la structure standard d'un tloush israelien.
Retourne UNIQUEMENT le JSON demande, sans texte, sans markdown.`;

const USER_PROMPT = `Analyse cette fiche de paie israelienne et extrait les informations.

=== STRUCTURE D'UNE FICHE DE PAIE ISRAELIENNE ===
Une fiche de paie israelienne a une structure standard. Voici ou trouver chaque information :

EN-TETE (coin superieur droit) :
- שם החברה ou שם המעסיק = NOM DE L'EMPLOYEUR (c'est l'entreprise qui emploie le salarie)
- שם עובד ou שם העובד = NOM DU SALARIE (la personne qui recoit le salaire)
- מס' עובד = numero d'employe
- תעריף שעתי = taux horaire
- תעריף יום = taux journalier

ATTENTION : En bas du document il y a souvent "בוצע ע"י" ou "באמצעות" suivi du nom du LOGICIEL DE PAIE ou de la societe de traitement. Ce n'est PAS l'employeur ! Ignore cette ligne pour employerName.

PERIODE ET DATE :
- Le mois/annee est souvent en haut au centre : "תלוש משכורת לחודש MM/YYYY"
- La date de paiement peut etre en bas : "בתאריך DD/MM/YYYY"

CORPS DU DOCUMENT :
Colonne de droite = AVANTAGES (תשלומים) - valeurs POSITIVES :
- שכר יסוד = salaire de base (baseSalary)
- נסיעות = transport
- הבראה = convalescence
- שעות נוספות = heures supplementaires
- בונוס / מענק / פרמיה = prime

Colonne de gauche = DEDUCTIONS (ניכויים) - valeurs NEGATIVES :
- ביטוח לאומי = securite sociale (nationalInsuranceDetected: true)
- דמי בריאות / ביטוח בריאות = assurance sante
- מס הכנסה = impot sur le revenu (incomeTaxDetected: true)
- פנסיה / קרן פנסיה = pension (pensionDetected: true)
- קרן השתלמות = epargne formation (kerenHishtalmutDetected: true)

TOTAUX :
- סה"כ תשלומים = total paiements (totalBenefits)
- סה"כ ניכויים = total deductions (totalDeductions)
- ברוטו / שכר ברוטו = salaire brut (grossSalary)
- נטו / נטו לתשלום / שכר נטו = salaire net (netSalary)

TABLEAU EN BAS - CONGES ET MALADIE :
- חופש / חופשה → colonne יתרה = solde conges en jours (leaveBalance)
- מחלה → colonne יתרה = solde maladie en jours (sickBalance)

=== REGLES IMPORTANTES ===
1. employerName = le nom a cote de שם החברה ou שם המעסיק (EN HAUT du document, PAS en bas)
2. employeeName = le nom a cote de שם עובד ou שם העובד
3. NE CONFONDS PAS l'employeur avec le logiciel de paie en bas (בוצע ע"י / באמצעות)
4. Copie les noms hebreux EXACTEMENT comme ils apparaissent, sans les traduire
5. Les deductions sont des valeurs NEGATIVES
6. leaveBalance et sickBalance sont en JOURS (pas en shekels)

Retourne ce JSON exact (sans markdown) :
{
  "employerName": "nom de l'employeur (שם החברה) ou null",
  "employeeName": "nom du salarie (שם עובד) ou null",
  "employeeId": "numero employe ou null",
  "period": "MM/YYYY ou Mois YYYY ou null",
  "paymentDate": "JJ/MM/AAAA ou null",
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
  "kerenHishtalmutDetected": true/false,
  "rawLines": [
    { "hebrewLabel": "texte hebreu", "normalizedKey": "cle", "frenchLabel": "traduction", "value": nombre, "unit": "ILS|hours|days|%" }
  ],
  "confidenceScore": 0-100,
  "extractionMode": "ocr"
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
