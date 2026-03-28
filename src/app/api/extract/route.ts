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
  "rawLines": [],
  "confidenceScore": 0,
  "extractionMode": "ocr"
}

REGLES D'EXTRACTION :

=== SALAIRES ===
- shkhar yesod / shekhar basis = salaire de base -> baseSalary (positif)
- bruto / shkhar bruto = salaire brut -> grossSalary (positif)
- neto / le-tashlum = salaire net -> netSalary (positif)
- teur le-sha'a = taux horaire -> hourlyRate

=== HEURES ===
- sha'ot ragil / sha'ot rgilot = heures normales -> regularHours (unit: hours)
- sha'ot nosafot / sha'ot nospafot = heures supplementaires -> overtimeHours (unit: hours)

=== AVANTAGES (valeurs POSITIVES) ===
- nesiot / dmei nesiot = transport -> travelAllowance
- mazon / dmei mazon = repas -> mealAllowance
- havra'a / dmei havra'a = convalescence -> holidayBonus
- bonus / pramya = prime -> bonus

=== DEDUCTIONS OBLIGATOIRES (valeurs NEGATIVES) ===
- bituah leumi = securite sociale -> nationalInsurance (negatif) -> nationalInsuranceDetected: true
- bituah briut = assurance sante -> healthInsurance (negatif)
- mas hachnasa = impot revenu -> incomeTax (negatif) -> incomeTaxDetected: true
- pensya / keren pensia / ktsat pikduim = pension salarie -> pension (negatif) -> pensionDetected: true

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
