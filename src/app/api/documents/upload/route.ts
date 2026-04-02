import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { validateFile } from '@/lib/fileValidation'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Rate limiting: 5 uploads per hour per user (free tier)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      prefix: 'ratelimit:upload',
    })
  : null

const SYSTEM_PROMPT = `Tu es un expert en documents administratifs israéliens pour francophones.
Ton rôle est d'analyser un document (fiche de paie, courrier officiel, contrat, etc.) et de retourner un JSON structuré en FRANÇAIS.
IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant ou après.`

const USER_PROMPT = `Analyse ce document israélien et retourne UNIQUEMENT ce JSON :

{
  "document_type": "payslip" | "bituah_leumi" | "tax_notice" | "work_contract" | "pension" | "health_insurance" | "rental" | "bank" | "official_letter" | "contract" | "other",
  "category": "travail" | "securite_sociale" | "fiscal" | "retraite" | "logement" | "bancaire" | "autre",
  "summary_fr": "Résumé en 2-3 phrases en français de ce document",
  "is_urgent": true/false,
  "action_required": true/false,
  "action_description": "Ce que l'utilisateur doit faire, ou null",
  "period": "Période concernée ex: 'Avril 2025' ou null",
  "key_info": {
    "emitter": "Qui envoie ce document",
    "amount": "Montant principal si applicable ou null",
    "deadline": "Date limite si applicable ou null"
  },
  "analysis_data": {
    "full_analysis": "Analyse détaillée complète en français"
  }
}

Guide pour document_type :
- "payslip" = fiche de paie / tloush maskoret
- "bituah_leumi" = tout document du Bituah Leumi (sécurité sociale)
- "tax_notice" = avis d'imposition, formulaire fiscal, mas hachnasa
- "work_contract" = contrat de travail, avenant, lettre d'embauche
- "pension" = relevé de retraite, keren pensia, kupat gemel
- "health_insurance" = kupat holim, assurance santé, mutuelle
- "rental" = contrat de bail, quittance de loyer
- "bank" = relevé bancaire, prêt, document de banque
- "official_letter" = courrier officiel d'une administration
- "contract" = autre contrat non classé ci-dessus
- "other" = tout document ne correspondant à aucune catégorie

Guide pour category :
- "travail" = payslip, work_contract
- "securite_sociale" = bituah_leumi, health_insurance
- "fiscal" = tax_notice
- "retraite" = pension
- "logement" = rental
- "bancaire" = bank
- "autre" = official_letter, contract, other`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Rate limiting
    if (ratelimit) {
      const { success, remaining, reset } = await ratelimit.limit(user.id)
      if (!success) {
        return NextResponse.json(
          { error: 'Limite atteinte : 5 documents par heure. Réessayez plus tard.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        )
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    // File validation
    const validationError = validateFile(file)
    if (validationError) return validationError

    // 1. Upload vers Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const storagePath = `${user.id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json({ error: 'Erreur lors du stockage du fichier' }, { status: 500 })
    }

    // 2. Analyse Claude
    const base64Data = fileBuffer.toString('base64')
    const mimeType = file.type as string

    type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    type ContentBlock =
      | { type: 'text'; text: string }
      | { type: 'image'; source: { type: 'base64'; media_type: ImageMediaType; data: string } }
      | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }

    let contentBlocks: ContentBlock[]

    if (mimeType === 'application/pdf') {
      contentBlocks = [
        { type: 'text', text: USER_PROMPT },
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } }
      ]
    } else {
      const imageMediaType = (mimeType === 'image/png' ? 'image/png' : 'image/jpeg') as ImageMediaType
      contentBlocks = [
        { type: 'text', text: USER_PROMPT },
        { type: 'image', source: { type: 'base64', media_type: imageMediaType, data: base64Data } }
      ]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (anthropic.messages.create as any)({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      betas: mimeType === 'application/pdf' ? ['pdfs-2024-09-25'] : undefined,
      messages: [{ role: 'user', content: contentBlocks }]
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let analysisResult: Record<string, unknown> = {}
    try {
      analysisResult = JSON.parse(cleaned)
    } catch {
      analysisResult = { summary_fr: 'Document analysé', document_type: 'other' }
    }

    // 3. Auto-compare with previous payslip if applicable
    if (analysisResult.document_type === 'payslip') {
      const { data: previousPayslip } = await supabase
        .from('documents')
        .select('period, analysis_data, summary_fr')
        .eq('user_id', user.id)
        .eq('document_type', 'payslip')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (previousPayslip) {
        try {
          const compareResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 512,
            system: 'Tu compares deux fiches de paie et retournes UNIQUEMENT un JSON. Sois bref et précis.',
            messages: [{
              role: 'user',
              content: `Compare brièvement ces 2 fiches de paie. Retourne UNIQUEMENT ce JSON :
{"has_significant_change": true/false, "change_summary": "Résumé en 1 phrase des changements vs mois précédent, ou null si stable", "change_percent": number ou null}

FICHE PRÉCÉDENTE (${previousPayslip.period || '?'}) : ${JSON.stringify(previousPayslip.analysis_data)}
FICHE ACTUELLE (${analysisResult.period || '?'}) : ${JSON.stringify(analysisResult)}`
            }]
          })
          const compareRaw = compareResponse.content[0].type === 'text' ? compareResponse.content[0].text : ''
          const compareCleaned = compareRaw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
          const compareResult = JSON.parse(compareCleaned)

          if (compareResult.has_significant_change && compareResult.change_summary) {
            analysisResult.comparison_note = compareResult.change_summary
            analysisResult.comparison_change_percent = compareResult.change_percent
            // Append comparison note to summary
            const currentSummary = (analysisResult.summary_fr as string) || ''
            analysisResult.summary_fr = `${currentSummary} [vs ${previousPayslip.period || 'mois précédent'} : ${compareResult.change_summary}]`
          }
        } catch (compareErr) {
          console.error('[Auto-compare] Error:', compareErr)
          // Non-blocking: continue without comparison
        }
      }
    }

    // 4. Sauvegarder en base
    const fileType = mimeType === 'application/pdf' ? 'pdf' : 'image'
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: storagePath,
        file_type: fileType,
        document_type: (analysisResult.document_type as string) || 'other',
        status: 'analyzed',
        is_urgent: Boolean(analysisResult.is_urgent),
        summary_fr: (analysisResult.summary_fr as string) || null,
        action_required: Boolean(analysisResult.action_required),
        action_description: (analysisResult.action_description as string) || null,
        period: (analysisResult.period as string) || null,
        analysis_data: analysisResult,
        analyzed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    // Send urgent alert email (fire-and-forget, don't block response)
    if (document && Boolean(analysisResult.is_urgent) && process.env.CRON_SECRET) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
      fetch(`${baseUrl}/api/alerts/urgent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({ userId: user.id, documentId: document.id }),
      }).catch(err => console.error('[Urgent Alert] Fire-and-forget error:', err))
    }

    return NextResponse.json({ document })
  } catch (err) {
    console.error('[/api/documents/upload]', err)
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
