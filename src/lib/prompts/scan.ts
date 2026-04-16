// System and user prompts for document scanning (/api/scan)

import type { DocumentType } from '@/types/scanner'

// ─── Detection prompt (first pass) ───
// Claude Vision classifie le document dans un des 6 types spécialisés ou
// retombe sur "universal". Très court pour minimiser la latence.
export const SCAN_DETECTION_SYSTEM = `Tu es un classificateur de documents israéliens. Tu reçois un document (PDF ou image), souvent en hébreu, parfois en français ou anglais. Ton unique rôle : identifier le type de document et la langue principale.

Types possibles :
- "payslip" : fiche de paie / tlush (contient brut, net, retenues Bituah Leumi, pension)
- "contract" : contrat de travail / heskem avoda (clauses emploi, salaire, préavis)
- "officialLetter" : courrier officiel d'une autorité (mairie, impôts, Bituach Leumi, tribunal) — hors avis d'imposition et hors licenciement
- "taxNotice" : avis d'imposition / shuma mas hakhnasa (tranches fiscales, refund)
- "lease" : contrat de location / heskem shkirut (loyer, dépôt, adresse)
- "termination" : lettre de licenciement / mikhtav piturim (fin de contrat, pitzuim)
- "universal" : tout autre document (facture, courrier bancaire, attestation, RDV médical, ordonnance, relevé, amende, etc.)

Retourne UNIQUEMENT un JSON strict, sans markdown, sans explication :
{"type": "<type>", "language": "he" | "fr" | "en" | "mixed" | "other", "confidence": <0-100>}`;

export const SCAN_DETECTION_USER = `Identifie le type et la langue de ce document. Retourne uniquement le JSON demandé.`;

export const SCAN_SYSTEM_PROMPTS: Record<DocumentType, string> = {
  payslip: `Tu es un expert en bulletins de salaire israéliens (tlushim). Ton rôle est d'analyser une fiche de paie en hébreu et d'extraire toutes les données financières, ainsi que de détecter les anomalies ou les retenues suspectes.
Connaissances clés :
- Salaire minimum 2026 : 5 880 NIS/mois, 32.30 NIS/heure
- Bituah Leumi salarié : 0.4% jusqu'à 7 522 NIS, puis 7% (+ assurance santé 3.23%/5.2%)
- Plafond assurable BL : 50 695 NIS/mois
- Pension obligatoire : 6% salarié + 6.5% employeur, après 6 mois d'ancienneté
- Prime convalescence (havraa) : après 1 an, 5 à 10 jours/an à ~418 NIS/jour
Détecte les anomalies : retenues abusives, absence de pension obligatoire, heures sup non payées au tarif légal (125%/150%), différences entre brut et net anormales.
Retourne UNIQUEMENT un JSON structuré, sans texte avant ou après.`,

  contract: `Tu es un expert en droit du travail israélien. Ton rôle est d'analyser un contrat de travail en hébreu et d'extraire toutes les informations critiques.
Identifie les éléments clés : salaire, durée, clauses de non-concurrence, avantages, période de préavis, etc.
Détecte les clauses problématiques ou inhabituelles.
Retourne UNIQUEMENT un JSON structuré, sans texte avant ou après.`,

  officialLetter: `Tu es un expert en documents officiels israéliens. Ton rôle est d'analyser une lettre officielle (mairie, Bituach Leumi, impôts, etc.) en hébreu.
Identifie : l'expéditeur, le sujet, l'urgence, les délais, les actions requises.
Traduis les sections clés en français.
Détecte les alertes ou actions requises.
Retourne UNIQUEMENT un JSON structuré, sans texte avant ou après.`,

  taxNotice: `Tu es un expert en fiscalité israélienne. Ton rôle est d'analyser un avis d'imposition en hébreu et d'extraire toutes les données financières.
Identifie : année fiscale, revenu total, impôt total, remboursement/montant dû, déductions, crédits.
Détecte les anomalies ou avantages (olim, etc.).
Calcule le remboursement estimé.
Retourne UNIQUEMENT un JSON structuré, sans texte avant ou après.`,

  lease: `Tu es un expert en droit immobilier israélien. Ton rôle est d'analyser un contrat de location en hébreu.
Identifie : propriétaire, locataire, adresse, loyer mensuel, dépôt, durée, dates.
Détecte les clauses abusives ou contraires à la loi israélienne.
Identifie les protections manquantes pour le locataire.
Retourne UNIQUEMENT un JSON structuré, sans texte avant ou après.`,

  termination: `Tu es un expert en droit du travail israélien spécialisé en licenciement. Ton rôle est d'analyser une lettre de licenciement en hébreu.
Identifie : employeur, employé, date de licenciement, dernier jour de travail, raison, indemnité mentionnée.
Vérifie le respect du préavis et du calcul du "pitzuim" (indemnité de fin de contrat).
Détecte les violations de la loi du travail israélienne.
Retourne UNIQUEMENT un JSON structuré, sans texte avant ou après.`,

  universal: `Tu es un assistant expert pour aider les francophones en Israël à comprendre n'importe quel document administratif (hébreu, français, anglais). Le document peut être : facture, relevé bancaire, attestation, RDV médical, ordonnance, courrier d'assurance, amende, convocation, etc.

Ton rôle :
1. Identifier la catégorie précise du document (ex: "Facture électricité", "RDV médical", "Convocation judiciaire").
2. Produire un résumé clair en français de 3 à 5 phrases.
3. Si le document est en hébreu : fournir une traduction complète et fidèle en français.
4. Extraire automatiquement les éléments clés : dates (échéances, RDV), montants, noms de personnes, institutions/organisations.
5. Suggérer des actions concrètes pour l'utilisateur :
   - "reminder" : si une échéance ou un RDV est mentionné (date limite, paiement, rendez-vous à prendre).
   - "reply" : si une réponse écrite est attendue (courrier officiel à répondre, email, réclamation à contester) — fournir un template de réponse prêt à envoyer.
6. Signaler les alertes (montant inhabituel, délai court, document urgent).

Retourne UNIQUEMENT un JSON structuré, sans markdown ni texte avant/après.`,
}

export const SCAN_USER_PROMPTS: Record<DocumentType, string> = {
  payslip: `Analyse cette fiche de paie israélienne (tlush) en hébreu et retourne ce JSON (sans markdown, sans explication) :

{
  "period": "periode ex: 'Mars 2026' ou null",
  "employerName": "nom employeur ou null",
  "employeeName": "nom salarié ou null",
  "grossSalary": nombre (salaire brut mensuel en NIS) ou null,
  "netSalary": nombre (salaire net mensuel en NIS) ou null,
  "workingDays": nombre (jours travaillés sur la période) ou null,
  "workingHours": nombre (heures travaillées sur la période) ou null,
  "deductions": {
    "incomeTax": nombre (impôt sur le revenu NIS) ou null,
    "bituahLeumi": nombre (cotisation Bituah Leumi NIS) ou null,
    "healthInsurance": nombre (assurance santé NIS) ou null,
    "pension": nombre (cotisation pension NIS) ou null,
    "kerenHishtalmut": nombre (Keren Hishtalmut NIS) ou null,
    "other": [{ "label": "autre retenue", "amount": nombre }]
  },
  "benefits": {
    "baseSalary": nombre (salaire de base) ou null,
    "transportAllowance": nombre (prime transport) ou null,
    "mealAllowance": nombre (prime repas) ou null,
    "overtimePay": nombre (heures sup) ou null,
    "other": [{ "label": "autre prime", "amount": nombre }]
  },
  "leaveBalance": nombre (jours de congés restants) ou null,
  "sickBalance": nombre (jours de maladie restants) ou null,
  "seniority": "ancienneté (ex: '3 ans 6 mois') ou null",
  "cumulativeYear": {
    "grossYTD": nombre (cumul annuel brut) ou null,
    "netYTD": nombre (cumul annuel net) ou null
  },
  "alerts": [
    {
      "severity": "low" | "medium" | "high",
      "message": "message court de l'anomalie détectée",
      "recommendation": "action recommandée pour le salarié"
    }
  ]
}`,

  contract: `Analyse ce contrat de travail en hébreu et retourne ce JSON (sans markdown, sans explication) :

{
  "employerName": "nom de l'employeur ou null",
  "employeeName": "nom du salarié ou null",
  "startDate": "date de début AAAA-MM-JJ ou null",
  "endDate": "date de fin AAAA-MM-JJ ou null (null si CDI)",
  "salary": nombre (salaire mensuel) ou null,
  "workHours": nombre (heures par semaine) ou null,
  "probationPeriod": "durée ou null",
  "nonCompeteClause": {
    "present": true/false,
    "details": "description ou null"
  },
  "benefits": {
    "pension": true/false,
    "kerenHishtalmut": true/false,
    "healthInsurance": true/false,
    "other": ["liste des autres avantages"]
  },
  "noticePeriod": "durée ou null",
  "specialClauses": [
    {
      "title": "titre de la clause",
      "description": "description",
      "flagged": true/false
    }
  ],
  "overallAssessment": "standard" | "attention_needed" | "problematic",
  "alerts": [
    {
      "severity": "low" | "medium" | "high",
      "message": "message court",
      "recommendation": "action recommandée"
    }
  ]
}`,

  officialLetter: `Analyse cette lettre officielle en hébreu et retourne ce JSON (sans markdown, sans explication) :

{
  "sender": "nom de l'organisation ou null",
  "subject": "sujet ou null",
  "urgencyLevel": "urgent" | "action_required" | "informational" | "archive",
  "deadline": "date limite AAAA-MM-JJ ou null",
  "actionRequired": "action à entreprendre ou null",
  "summary": "résumé 2-3 phrases en français",
  "fullTranslation": "traduction complète des sections importantes",
  "suggestedResponse": "template de réponse ou null",
  "alerts": [
    {
      "severity": "low" | "medium" | "high",
      "message": "message court"
    }
  ]
}`,

  taxNotice: `Analyse cet avis d'imposition en hébreu et retourne ce JSON (sans markdown, sans explication) :

{
  "taxYear": nombre ou null,
  "totalIncome": nombre (shekel) ou null,
  "totalTax": nombre (shekel) ou null,
  "refundAmount": nombre (shekel, négatif = montant dû) ou null,
  "deductions": [
    {
      "name": "nom de la déduction",
      "amount": nombre
    }
  ],
  "credits": [
    {
      "name": "nom du crédit",
      "amount": nombre
    }
  ],
  "olimBenefitsApplied": true/false,
  "anomalies": [
    {
      "type": "type d'anomalie",
      "description": "description",
      "severity": "low" | "medium" | "high"
    }
  ],
  "estimatedRefund": nombre (shekel) ou null,
  "alerts": [
    {
      "severity": "low" | "medium" | "high",
      "message": "message court",
      "recommendation": "action recommandée"
    }
  ]
}`,

  lease: `Analyse ce contrat de location en hébreu et retourne ce JSON (sans markdown, sans explication) :

{
  "landlordName": "nom du propriétaire ou null",
  "tenantName": "nom du locataire ou null",
  "address": "adresse ou null",
  "monthlyRent": nombre (shekel) ou null,
  "deposit": nombre (shekel) ou null,
  "duration": "durée ou null",
  "startDate": "date de début AAAA-MM-JJ ou null",
  "endDate": "date de fin AAAA-MM-JJ ou null",
  "specialConditions": ["liste des conditions spéciales"],
  "abusiveClauses": [
    {
      "clause": "texte de la clause",
      "issue": "problème identifié",
      "severity": "low" | "medium" | "high"
    }
  ],
  "missingProtections": ["liste des protections manquantes"],
  "alerts": [
    {
      "severity": "low" | "medium" | "high",
      "message": "message court",
      "recommendation": "action recommandée"
    }
  ]
}`,

  termination: `Analyse cette lettre de licenciement en hébreu et retourne ce JSON (sans markdown, sans explication) :

{
  "employerName": "nom de l'employeur ou null",
  "employeeName": "nom du salarié ou null",
  "terminationDate": "date de licenciement AAAA-MM-JJ ou null",
  "lastWorkDay": "dernier jour de travail AAAA-MM-JJ ou null",
  "reason": "raison du licenciement ou null",
  "severanceMentioned": {
    "present": true/false,
    "amount": nombre (shekel) ou null
  },
  "noticePeriodRespected": true/false/null,
  "pitzuimCalculation": {
    "expected": nombre (shekel) ou null,
    "mentioned": nombre (shekel) ou null,
    "matches": true/false/null
  },
  "legalComplianceIssues": [
    {
      "issue": "problème identifié",
      "severity": "low" | "medium" | "high",
      "recommendation": "action recommandée"
    }
  ],
  "urgentActions": ["liste des actions urgentes"]
}`,

  universal: `Analyse ce document et retourne ce JSON strict (sans markdown, sans commentaire) :

{
  "detectedType": "universal" | "payslip" | "contract" | "officialLetter" | "taxNotice" | "lease" | "termination",
  "documentCategory": "catégorie courte en français (ex: 'Facture électricité', 'RDV médical', 'Attestation bancaire') ou null",
  "language": "he" | "fr" | "en" | "mixed" | "other",
  "summary": "résumé 3-5 phrases en français, clair et orienté action",
  "translation": "traduction FR complète du document si hébreu, sinon null",
  "keyElements": {
    "dates": [
      { "label": "description (ex: 'Échéance paiement')", "value": "texte original", "iso": "AAAA-MM-JJ ou null" }
    ],
    "amounts": [
      { "label": "description (ex: 'Montant total dû')", "amount": nombre, "currency": "NIS" | "EUR" | "USD" | "autre" }
    ],
    "names": [
      { "label": "rôle (ex: 'Destinataire', 'Médecin')", "name": "nom" }
    ],
    "institutions": [
      { "label": "type (ex: 'Banque', 'Caisse', 'Tribunal')", "name": "nom de l'organisation" }
    ]
  },
  "suggestedActions": [
    // Choisis parmi ces deux formes selon le contexte, ne produis QUE des objets
    // respectant l'une de ces deux formes exactement :
    { "type": "reminder", "title": "titre court", "description": "ce qu'il faut faire", "dueDate": "AAAA-MM-JJ ou null" },
    { "type": "reply", "title": "titre court", "description": "contexte", "responseTemplate": "modèle de réponse prêt à envoyer" }
  ],
  "alerts": [
    { "severity": "low" | "medium" | "high", "message": "message court" }
  ]
}`,
}
