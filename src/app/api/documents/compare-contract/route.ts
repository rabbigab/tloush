import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '@/lib/apiAuth'
import { COMPARE_CONTRACT_SYSTEM_PROMPT } from '@/lib/prompts'

export const dynamic = 'force-dynamic'

// Allow up to 60 seconds for Claude contract analysis
export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const { payslipId } = await req.json()
    if (!payslipId) {
      return NextResponse.json({ error: 'payslipId requis' }, { status: 400 })
    }

    // Fetch the payslip
    const { data: payslip, error: payslipError } = await supabase
      .from('documents')
      .select('id, file_name, document_type, period, analysis_data')
      .eq('id', payslipId)
      .eq('user_id', user.id)
      .single()

    if (payslipError || !payslip) {
      return NextResponse.json({ error: 'Fiche de paie introuvable' }, { status: 404 })
    }

    if (payslip.document_type !== 'payslip') {
      return NextResponse.json({ error: 'Le document n\'est pas une fiche de paie' }, { status: 400 })
    }

    // Fetch the user's most recent work contract
    const { data: contract, error: contractError } = await supabase
      .from('documents')
      .select('id, file_name, document_type, period, analysis_data')
      .eq('user_id', user.id)
      .eq('document_type', 'work_contract')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Aucun contrat de travail trouvé' },
        { status: 404 }
      )
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: COMPARE_CONTRACT_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Compare ce contrat de travail avec cette fiche de paie et vérifie que la fiche de paie respecte les termes du contrat.

Retourne UNIQUEMENT ce JSON :
{
  "matches": [
    {
      "field": "Nom du champ comparé",
      "contract_value": "Valeur dans le contrat",
      "payslip_value": "Valeur dans la fiche de paie",
      "status": "ok" | "warning" | "critical"
    }
  ],
  "summary_fr": "Résumé en français de la comparaison globale (2-4 phrases)",
  "issues": ["Description de chaque divergence détectée"]
}

Champs à comparer impérativement (si présents dans les documents) :
- Salaire de base (brut et/ou net)
- Nombre d'heures de travail (mishra / masse horaire)
- Cotisations retraite (pension) - taux employé et employeur
- Keren Hishtalmut (קרן השתלמות) - taux employé et employeur
- Indemnité de transport (nahsaot / נסיעות)
- Jours de congés (vacances / חופשה)
- Conditions d'heures supplémentaires (shaot nosafot / שעות נוספות)
- Primes et avantages promis dans le contrat (bonuses, voiture, téléphone, etc.)
- Tout autre élément pertinent trouvé dans les deux documents

Règles de status :
- "ok" : la valeur correspond au contrat
- "warning" : légère différence ou valeur manquante dans un des documents
- "critical" : divergence significative défavorable à l'employé

CONTRAT DE TRAVAIL :
Fichier : ${contract.file_name}
Analyse : ${JSON.stringify(contract.analysis_data, null, 2)}

FICHE DE PAIE${payslip.period ? ` (${payslip.period})` : ''} :
Fichier : ${payslip.file_name}
Analyse : ${JSON.stringify(payslip.analysis_data, null, 2)}`
      }]
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let comparison: Record<string, unknown>
    try {
      comparison = JSON.parse(cleaned)
    } catch {
      comparison = {
        matches: [],
        summary_fr: 'Comparaison effectuée mais le format de réponse est inattendu. Veuillez réessayer.',
        issues: []
      }
    }

    return NextResponse.json({
      comparison,
      contract: { id: contract.id, file_name: contract.file_name },
      payslip: { id: payslip.id, file_name: payslip.file_name, period: payslip.period },
    })
  } catch (err) {
    console.error('[/api/documents/compare-contract]', err)
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
