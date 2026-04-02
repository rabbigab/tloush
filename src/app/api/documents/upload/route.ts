import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

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
  "document_type": "payslip" | "official_letter" | "contract" | "tax" | "other",
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
}`

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

    // 3. Sauvegarder en base
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

    return NextResponse.json({ document })
  } catch (err) {
    console.error('[/api/documents/upload]', err)
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
