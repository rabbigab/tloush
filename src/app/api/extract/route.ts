import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en fiches de paie israeliennes (tloush maskoret).
Ton role est d'extraire TOUTES les informations d'une fiche de paie israelienne.
Les fiches israeliennes sont en hebreu. Tu lis l'hebreu couramment.
IMPORTANT : Retourne UNIQUEMENT le JSON demande, sans texte avant ou apres, sans markdown.`;

const USER_PROMPT = `Analyse cette fiche de paie israelienne. Retourne ce JSON exact (sans markdown) :

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

REGLES D'EXTRACTION :

=== SALAIRES ===
- שכר יסוד / שכר בסיס (shkhar yesod / shekhar basis) = salaire de base -> baseSalary (positif)
- ברוטו / שכר ברוטו / סה"כ ברוטו (bruto) = salaire brut -> grossSalary (positif)
- נטו / לתשלום / שכר נטו (neto / le-tashlum) = salaire net -> netSalary (positif)
- תעריף שעתי (teur sha'ati) = taux horaire -> hourlyRate
- שכר חודשי (shekher hodshi) = salaire mensuel -> baseSalary

=== HEURES ===
- שעות רגילות / שעות עבודה (sha'ot ragil) = heures normales -> regularHours (unit: hours)
- שעות נוספות (sha'ot nosafot) = heures supplementaires -> overtimeHours (unit: hours)
- שעות נוספות 125% = heures sup 125% -> overtimeHours (unit: hours)
- שעות נוספות 150% = heures sup 150% -> overtimeHours (unit: hours)

=== AVANTAGES (valeurs POSITIVES) ===
- נסיעות / החזר נסיעות / דמי נסיעות (nesiot) = transport -> travelAllowance
- אש"ל / דמי מזון (mazon) = repas -> mealAllowance
- הבראה / דמי הבראה (havra'a) = convalescence -> holidayBonus
- בונוס / מענק / פרמיה (bonus / pramya) = prime -> bonus
- עמלות / עמלה = commissions -> commission

=== DEDUCTIONS OBLIGATOIRES (valeurs NEGATIVES) ===
- ביטוח לאומי / דמי ביטוח לאומי (bituah leumi) = securite sociale -> nationalInsurance (negatif) -> nationalInsuranceDetected: true
- ביטוח בריאות / דמי בריאות (bituah briut) = assurance sante -> healthInsurance (negatif)
- מס הכנסה (mas hachnasa) = impot revenu -> incomeTax (negatif) -> incomeTaxDetected: true
- פנסיה / קרן פנסיה (pensya) = pension salarie -> pension (negatif) -> pensionDetected: true
- קרן השתלמות (keren hishtalmut) = epargne formation -> kerenHishtalmut -> kerenHishtalmutDetected: true
- ביטוח מנהלים (bituah menahalim) = assurance cadres -> bituahMenahalim
- קופת גמל = caisse retraite complementaire -> pension
- אבדן כושר עבודה = assurance incapacite -> otherDeduction

=== CONGES ET MALADIE (TRES IMPORTANT) ===
Les fiches israeliennes ont souvent un TABLEAU en bas avec les soldes de conges.
Ce tableau montre generalement 3 colonnes : accumule / utilise / restant (yitrah).
Tu dois extraire le SOLDE RESTANT (yitrah / nitshal) en jours.

Termes pour les CONGES PAYES :
- yitrat chofshe / yitrat chofsha / yitrat chufsha = solde conges -> leaveBalance (unit: days)
- chofesh / yamei chofesh = conges
- La valeur leaveBalance = le nombre de jours RESTANTS disponibles

Termes pour la MALADIE :
- yitrat machala / yitrat makhal = solde maladie -> sickBalance (unit: days)  
- machala / yamei machala = maladie
- La valeur sickBalance = le nombre de jours RESTANTS disponibles

IMPORTANT leaveBalance et sickBalance :
- Ces valeurs sont des NOMBRES DE JOURS (pas des montants en shekel)
- Cherche dans TOUT le document, y compris les tableaux en bas de page
- Si tu vois un tableau avec colonnes (tzvar/nitshal/shurtash), prends la colonne "yitrah" (restant)
- Ces valeurs peuvent etre 0 (zero) si le salarie a utilise tous ses jours
- Mets la valeur numerique dans leaveBalance et sickBalance ET dans rawLines

=== RAWLINES ===
Pour CHAQUE ligne de la fiche (salaires, avantages, deductions, soldes), ajoute une entree :
{
  "hebrewLabel": "texte hebreu exact de la ligne",
  "normalizedKey": "une cle parmi : baseSalary|grossSalary|netSalary|hourlyRate|regularHours|overtimeHours|travelAllowance|mealAllowance|vacationPay|sickPay|holidayBonus|pension|pensionCompensation|nationalInsurance|healthInsurance|incomeTax|unionFee|lunchDeduction|leaveBalance|sickBalance|seniority|bonus|commission|otherBenefit|otherDeduction|unknown",
  "frenchLabel": "traduction en francais",
  "value": nombre (negatif pour deductions),
  "unit": "ILS ou hours ou days ou %"
}
Pour les soldes de conges/maladie dans rawLines : normalizedKey="leaveBalance" ou "sickBalance", unit="days", value=nombre de jours restants

=== SCORE DE CONFIANCE ===
- 90-100 : document clair, toutes les valeurs lisibles
- 70-89 : la plupart des valeurs lisibles
- 50-69 : certaines valeurs incertaines  
- 0-49 : document peu lisible ou incomplet`;

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

    // Post-processing: si leaveBalance/sickBalance null, essaie de les extraire depuis rawLines
    const rawLines = Array.isArray(parsed.rawLines) ? parsed.rawLines as Array<{normalizedKey:string, value:number|null, unit?:string}> : [];
    
    if (parsed.leaveBalance === null || parsed.leaveBalance === undefined) {
      const leaveLine = rawLines.find(l => l.normalizedKey === "leaveBalance" && l.value !== null);
      if (leaveLine) parsed.leaveBalance = leaveLine.value;
    }
    if (parsed.sickBalance === null || parsed.sickBalance === undefined) {
      const sickLine = rawLines.find(l => l.normalizedKey === "sickBalance" && l.value !== null);
      if (sickLine) parsed.sickBalance = sickLine.value;
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[/api/extract]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 });
  }
}
