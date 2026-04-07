import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '@/lib/apiAuth'
import { COMPARE_PAYSLIPS_SYSTEM_PROMPT } from '@/lib/prompts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const { docId1, docId2 } = await req.json()
    if (!docId1 || !docId2) {
      return NextResponse.json({ error: 'Deux documents requis' }, { status: 400 })
    }

    // Fetch both documents
    const { data: docs } = await supabase
      .from('documents')
      .select('id, file_name, document_type, summary_fr, period, analysis_data, created_at')
      .in('id', [docId1, docId2])
      .eq('user_id', user.id)

    if (!docs || docs.length !== 2) {
      return NextResponse.json({ error: 'Documents introuvables' }, { status: 404 })
    }

    // Sort by date (older first)
    const sorted = docs.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const [older, newer] = sorted

    // Ask Claude to compare
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: COMPARE_PAYSLIPS_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Compare ces deux fiches de paie israéliennes et retourne UNIQUEMENT ce JSON :

{
  "summary": "Résumé de la comparaison en 2-3 phrases",
  "changes": [
    {
      "field": "Nom du champ (ex: Salaire net, Heures sup, etc.)",
      "old_value": "Valeur dans le document ancien",
      "new_value": "Valeur dans le document récent",
      "change_percent": number ou null,
      "severity": "positive" | "neutral" | "warning" | "alert",
      "explanation": "Explication en français de ce changement"
    }
  ],
  "anomalies": [
    {
      "description": "Description de l'anomalie",
      "severity": "warning" | "alert",
      "recommendation": "Ce que l'utilisateur devrait faire"
    }
  ],
  "overall_status": "stable" | "improved" | "degraded" | "attention_required"
}

DOCUMENT ANCIEN (${older.period || 'période inconnue'}) :
Fichier : ${older.file_name}
Analyse : ${JSON.stringify(older.analysis_data, null, 2)}

DOCUMENT RÉCENT (${newer.period || 'période inconnue'}) :
Fichier : ${newer.file_name}
Analyse : ${JSON.stringify(newer.analysis_data, null, 2)}`
      }]
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let comparison: Record<string, unknown> = {}
    try {
      comparison = JSON.parse(cleaned)
    } catch {
      comparison = {
        summary: 'Comparaison effectuée mais le format de réponse est inattendu.',
        changes: [],
        anomalies: [],
        overall_status: 'stable'
      }
    }

    return NextResponse.json({
      comparison,
      older: { id: older.id, file_name: older.file_name, period: older.period },
      newer: { id: newer.id, file_name: newer.file_name, period: newer.period },
    })
  } catch (err) {
    console.error('[/api/documents/compare]', err)
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
