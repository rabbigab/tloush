import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en fiches de paie israeliennes (tloush maskoret / תלוש משכורת).
Tu lis l'hebreu couramment et tu es specialise dans l'extraction precise de donnees depuis des documents hebreux scannes ou photographies.

REGLES CRITIQUES DE LECTURE DE L'HEBREU :
1. L'hebreu se lit de DROITE A GAUCHE (RTL). Ne confonds pas l'ordre des mots.
2. CONFUSIONS DE LETTRES FREQUENTES - Fais tres attention a ces paires :
   - ב (bet) vs כ (kaf) - tres similaires, regarde le dagesh (point interieur)
   - ד (dalet) vs ר (resh) - le dalet a un angle droit, le resh est arrondi
   - ו (vav) vs ז (zayin) - le zayin a un petit trait en haut a gauche
   - ח (het) vs ת (tav) - le tav a un pied a gauche
   - ח (het) vs ה (he) - le he a une ouverture en haut a gauche
   - ם (mem sofit) vs ס (samekh) - le mem sofit est carre, le samekh est arrondi
   - ע (ayin) vs צ (tsadi) - formes differentes mais confondues en basse resolution
   - כ (kaf) vs ב (bet) - le kaf est plus arrondi
   - ג (gimel) vs נ (nun) - le gimel a un pied, le nun est plus droit
   - ג׳ (gimel + geresh = son "j") - utilise dans les noms d'origine etrangere (ex: ג'ורג' = George). Ne pas confondre le geresh (׳) avec une apostrophe
   - ז׳ (zayin + geresh = son "zh") - dans les noms comme Jean, Jacques
   - צ׳ (tsadi + geresh = son "tch") - dans les noms comme Charlie, Richard
   - ש (shin) vs שׂ (sin) - le point est a droite pour shin, a gauche pour sin
3. LETTRES FINALES (SOFIT) - A la fin d'un mot, certaines lettres changent de forme :
   - מ → ם (mem → mem sofit)
   - נ → ן (nun → nun sofit)
   - צ → ץ (tsadi → tsadi sofit)
   - פ → ף (pe → pe sofit)
   - כ → ך (kaf → kaf sofit)
4. Pour les NOMS PROPRES (personnes et entreprises), sois EXTREMEMENT attentif car :
   - Les noms ne sont pas dans le dictionnaire, tu ne peux pas deviner
   - Chaque lettre compte - une confusion ב/כ ou ד/ר change completement le nom
   - Lis chaque lettre individuellement, puis verifie que le mot entier est coherent
   - Si un nom semble etrange, relis-le lettre par lettre depuis la droite

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

=== NOMS (TRES IMPORTANT - LIRE AVEC PRECISION) ===
Les noms de l'employeur et du salarie sont les informations les PLUS sensibles.
Une seule lettre erronee rend le nom incorrect et inutilisable.

Ou trouver le NOM DE L'EMPLOYEUR (שם מעביד / שם מעסיק / שם חברה) :
- En haut du document, souvent pres du logo de l'entreprise
- A cote des mots : מעביד (maavid), מעסיק (maasik), חברה (hevra), שם החברה
- Parfois dans un en-tete encadre ou en gras

Ou trouver le NOM DU SALARIE (שם עובד / שם העובד) :
- Pres des mots : עובד (oved), שם העובד (shem haoved), שם פרטי (prenom), שם משפחה (nom de famille)
- Souvent a cote du numero de ת.ז. (teudat zehut = carte d'identite)
- Le format est generalement : שם משפחה + שם פרטי (nom de famille puis prenom)

REGLES POUR LIRE LES NOMS :
1. Lis CHAQUE LETTRE une par une de droite a gauche
2. Fais tres attention aux paires confondantes :
   ב/כ, ד/ר, ו/ז, ח/ת, ח/ה, ם/ס, ע/צ, ג/נ, ג׳/ג
3. Verifie les lettres finales : ם ן ץ ף ך (uniquement en fin de mot)
4. Si le nom contient un guillemet (") c'est souvent une abbreviation (resh"tav etc.)
5. Copie le texte EXACTEMENT comme il apparait, lettre par lettre
6. Ne traduis PAS les noms, ne les modifie PAS, ne les "corrige" PAS
7. En cas de doute sur une lettre, choisis celle qui forme un nom plausible en hebreu

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
- קרן השתלמות (keren hishtalmut) = epargne formation -> kerenHishtalmutDetected: true
- ביטוח מנהלים (bituah menahalim) = assurance cadres -> bituahMenahalim
- קופת גמל = caisse retraite complementaire -> pension
- אבדן כושר עבודה = assurance incapacite -> otherDeduction

=== CONGES ET MALADIE ===
- יתרת חופשה / יתרה חופשה (yitrat chofsha) = solde conges -> leaveBalance (unit: days)
- יתרת מחלה (yitrat machala) = solde maladie -> sickBalance (unit: days)
- Cherche dans les tableaux en bas de page les colonnes : צבר/ניצל/יתרה (accumule/utilise/restant)
- Prends la colonne יתרה (restant/solde)

=== RAWLINES ===
Pour CHAQUE ligne de la fiche, ajoute une entree :
{ "hebrewLabel": "texte hebreu exact", "normalizedKey": "cle", "frenchLabel": "traduction", "value": nombre, "unit": "ILS ou hours ou days ou %" }

=== SCORE DE CONFIANCE ===
- 90-100 : document clair, toutes les valeurs lisibles
- 70-89 : la plupart des valeurs lisibles
- 50-69 : certaines valeurs incertaines
- 0-49 : document peu lisible`;

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
    const rawLines = Array.isArray(parsed.rawLines)
      ? parsed.rawLines as Array<{normalizedKey:string, value:number|null, unit?:string}>
      : [];

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
