// System and user prompts for document scanning (/api/scan)

import type { DocumentType } from '@/types/scanner'

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
}
