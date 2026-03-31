import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { DocumentType, DocumentAnalysis } from "@/types/scanner";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// System prompts for each document type
const SYSTEM_PROMPTS: Record<DocumentType, string> = {
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
};

const USER_PROMPTS: Record<DocumentType, string> = {
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
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as DocumentType | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    if (!documentType || !SYSTEM_PROMPTS[documentType]) {
      return NextResponse.json(
        { error: "Type de document invalide" },
        { status: 400 }
      );
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
        { type: "text", text: USER_PROMPTS[documentType] },
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
      const imageMediaType = (
        mimeType === "image/png" ? "image/png" : "image/jpeg"
      ) as ImageMediaType;
      contentBlocks = [
        { type: "text", text: USER_PROMPTS[documentType] },
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

    const startTime = Date.now();

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPTS[documentType],
      betas: mimeType === "application/pdf" ? ["pdfs-2024-09-25"] : undefined,
      messages: [
        {
          role: "user",
          content: contentBlocks,
        },
      ],
    });

    const processingTime = Date.now() - startTime;

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip possible markdown fences
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let data: DocumentAnalysis;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error: "Impossible de parser la réponse de l'IA",
          raw: rawText,
        },
        { status: 422 }
      );
    }

    // Calculate confidence score (0-100)
    // Higher confidence if all critical fields are present
    const confidenceScore = calculateConfidenceScore(data, documentType);

    return NextResponse.json({
      documentType,
      data,
      rawTranslation: rawText,
      confidenceScore,
      processingTime,
    });
  } catch (err: unknown) {
    console.error("[/api/scan]", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper to estimate confidence based on extracted data completeness
function calculateConfidenceScore(data: DocumentAnalysis, documentType: DocumentType): number {
  let filledFields = 0;
  let totalFields = 0;

  const countFields = (obj: unknown, depth = 0): [number, number] => {
    if (depth > 5) return [0, 0]; // Prevent infinite recursion
    let filled = 0;
    let total = 0;

    if (obj === null || obj === undefined) {
      return [0, 1];
    }

    if (typeof obj === "object" && !Array.isArray(obj)) {
      const objAsRecord = obj as Record<string, unknown>;
      for (const [_, value] of Object.entries(objAsRecord)) {
        const [f, t] = countFields(value, depth + 1);
        filled += f;
        total += t;
      }
    } else if (Array.isArray(obj)) {
      // For arrays, if non-empty it counts as 1 filled field
      if (obj.length > 0) {
        filled += 1;
      }
      total += 1;
    } else {
      // Primitive value
      filled += obj ? 1 : 0;
      total += 1;
    }

    return [filled, total];
  };

  const [f, t] = countFields(data);
  filledFields = f;
  totalFields = t;

  const score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  return Math.min(100, Math.max(0, score));
}
