import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { validateFile } from '@/lib/fileValidation'
import { createRateLimit } from '@/lib/rateLimit'
import { requireAuth } from '@/lib/apiAuth'
import { canUseFeature, incrementUsage } from '@/lib/subscription'
import { parseDeadline, detectAmountAnomaly } from '@/lib/parsers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ratelimit = createRateLimit('upload', 5, '1 h')

const SYSTEM_PROMPT = `Tu es un expert en documents administratifs israéliens pour francophones.
Ton rôle est d'analyser un document (fiche de paie, courrier officiel, contrat, facture, etc.) et de retourner un JSON structuré en FRANÇAIS.
Tu dois non seulement expliquer le document, mais aussi détecter les anomalies potentielles, les points à vérifier et recommander des actions concrètes.
IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant ou après.`

const USER_PROMPT = `Analyse ce document israélien et retourne UNIQUEMENT ce JSON :

{
  "document_type": "payslip" | "bituah_leumi" | "tax_notice" | "work_contract" | "pension" | "health_insurance" | "rental" | "bank" | "official_letter" | "contract" | "invoice" | "receipt" | "utility_bill" | "insurance" | "other",
  "category": "travail" | "securite_sociale" | "fiscal" | "retraite" | "logement" | "bancaire" | "finance" | "autre",
  "summary_fr": "Résumé en 2-3 phrases en français de ce document",
  "is_urgent": true/false,
  "action_required": true/false,
  "action_description": "Ce que l'utilisateur doit faire en priorité, ou null",
  "period": "Période concernée ex: 'Avril 2025' ou null",
  "key_info": {
    "emitter": "Qui envoie ce document",
    "amount": "Montant principal si applicable ou null",
    "deadline": "Date limite si applicable (format JJ/MM/AAAA) ou null"
  },
  "attention_points": [
    {
      "level": "ok" | "info" | "warning" | "critical",
      "title": "Titre court du point",
      "description": "Explication en 1-2 phrases"
    }
  ],
  "recommended_actions": [
    {
      "priority": "immediate" | "soon" | "when_possible",
      "action": "Description de l'action à mener",
      "deadline": "Date limite si applicable ou null"
    }
  ],
  "should_consult_pro": {
    "recommended": true/false,
    "reason": "Pourquoi consulter un pro, ou null",
    "pro_type": "comptable" | "avocat" | "conseiller_fiscal" | "agent_immobilier" | null
  },
  "analysis_data": {
    "full_analysis": "Analyse détaillée complète en français"
  }
}

GUIDE attention_points.level :
- "ok" = tout est normal, rien à signaler
- "info" = information utile à connaître
- "warning" = point à vérifier, anomalie potentielle
- "critical" = action urgente requise, risque important

GUIDE recommended_actions.priority :
- "immediate" = à faire dans les 48h
- "soon" = à faire dans les 2 semaines
- "when_possible" = pas urgent mais recommandé

Pour les factures/tickets (invoice, receipt, utility_bill, insurance) :
- Extraire le fournisseur, le montant TTC, la date de la facture
- Indiquer si c'est une dépense récurrente probable (mensuelle, bimestrielle, etc.)
- Ajouter un champ "recurring_info" dans analysis_data: {"is_recurring": true/false, "frequency": "monthly"|"bimonthly"|"quarterly"|"annual"|"one_time", "provider": "nom du fournisseur", "amount": nombre}

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
- "invoice" = facture (arnona, électricité, eau, internet, téléphone, etc.)
- "receipt" = ticket de caisse, reçu
- "utility_bill" = facture de service public
- "insurance" = document d'assurance (habitation, voiture, etc.)
- "other" = tout document ne correspondant à aucune catégorie

Guide pour category :
- "travail" = payslip, work_contract
- "securite_sociale" = bituah_leumi, health_insurance
- "fiscal" = tax_notice
- "retraite" = pension
- "logement" = rental
- "bancaire" = bank
- "finance" = invoice, receipt, utility_bill, insurance
- "autre" = official_letter, contract, other`

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

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

    // Check subscription & quota
    const access = await canUseFeature(supabase, user.id, 'document_analysis')
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, code: 'QUOTA_EXCEEDED' }, { status: 403 })
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

    // Cast needed: 'document' content block not yet in SDK types (v0.24)
    const message = await (anthropic.messages.create as Function)({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contentBlocks }]
    }) as Anthropic.Message

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

    // 4. Parse deadline into DATE format
    const rawDeadline = (analysisResult.key_info as Record<string, unknown>)?.deadline
    const deadlineDate = parseDeadline(rawDeadline)

    // 5. Sauvegarder en base
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
        deadline: deadlineDate,
        analysis_data: analysisResult,
        analyzed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    // Track recurring expense if detected
    if (document) {
      const recurringInfo = (analysisResult.analysis_data as Record<string, unknown>)?.recurring_info as
        | { is_recurring?: boolean; frequency?: string; provider?: string; amount?: number }
        | undefined
      const providerName = recurringInfo?.provider || (analysisResult.key_info as Record<string, unknown>)?.emitter as string | undefined
      if (recurringInfo?.is_recurring && providerName) {
        try {
          const amount = recurringInfo.amount ?? null
          const frequency = recurringInfo.frequency || 'monthly'
          const today = new Date().toISOString().split('T')[0]

          // Check if similar recurring expense exists for this user
          const { data: existing } = await supabase
            .from('recurring_expenses')
            .select('id, document_ids, amount')
            .eq('user_id', user.id)
            .ilike('provider_name', providerName)
            .maybeSingle()

          if (existing) {
            // Anomaly detection: compare new amount vs previous tracked amount
            const anomaly = amount ? detectAmountAnomaly(amount, existing.amount || 0) : null
            if (anomaly) {
              const { pct, level, direction: dir } = anomaly
              const direction = dir === 'up' ? 'augmenté' : 'diminué'
              {
                const anomalyPoint = {
                  level,
                  title: `Montant ${direction} de ${pct.toFixed(0)}%`,
                  description: `Cette facture ${providerName} est à ${amount}₪ contre ${existing.amount}₪ habituellement. Vérifiez que c'est normal.`,
                }
                const existingPoints = Array.isArray((analysisResult.attention_points as unknown[]))
                  ? (analysisResult.attention_points as Array<Record<string, unknown>>)
                  : []
                analysisResult.attention_points = [anomalyPoint, ...existingPoints]
                // Persist updated analysis
                await supabase
                  .from('documents')
                  .update({ analysis_data: analysisResult })
                  .eq('id', document.id)

                // Fire-and-forget email notification for significant anomalies
                if (pct >= 30 && process.env.CRON_SECRET) {
                  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : 'http://localhost:3000')
                  fetch(`${baseUrl}/api/alerts/anomaly`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      documentId: document.id,
                      provider: providerName,
                      newAmount: amount,
                      previousAmount: existing.amount,
                      pct,
                    }),
                  }).catch(err => console.error('[Anomaly Alert] Fire-and-forget error:', err))
                }
              }
            }
            const docIds = Array.isArray(existing.document_ids) ? existing.document_ids : []
            if (!docIds.includes(document.id)) docIds.push(document.id)
            await supabase
              .from('recurring_expenses')
              .update({
                document_ids: docIds,
                last_seen_date: today,
                amount: amount ?? existing.amount,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)
          } else {
            await supabase.from('recurring_expenses').insert({
              user_id: user.id,
              provider_name: providerName,
              category: (analysisResult.category as string) || null,
              amount,
              frequency,
              last_seen_date: today,
              document_ids: [document.id],
              status: 'active',
            })
          }
        } catch (recurErr) {
          console.error('[Recurring] Error tracking recurring expense:', recurErr)
        }
      }

      // Auto-group into folder by emitter
      const emitter = (analysisResult.key_info as Record<string, unknown>)?.emitter as string | undefined
      if (emitter && emitter.trim().length > 0) {
        try {
          const { data: existingFolder } = await supabase
            .from('folders')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', emitter)
            .maybeSingle()

          let folderId = existingFolder?.id
          if (!folderId) {
            const { data: newFolder } = await supabase
              .from('folders')
              .insert({
                user_id: user.id,
                name: emitter,
                category: (analysisResult.category as string) || null,
                auto_generated: true,
                status: 'active',
              })
              .select('id')
              .single()
            folderId = newFolder?.id
          }

          if (folderId) {
            await supabase.from('documents').update({ folder_id: folderId }).eq('id', document.id)
          }
        } catch (folderErr) {
          console.error('[Folder] Auto-group error:', folderErr)
        }
      }
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

    // Increment usage counter after successful analysis
    await incrementUsage(supabase, user.id, 'documents_analyzed')

    return NextResponse.json({ document })
  } catch (err) {
    console.error('[/api/documents/upload]', err)
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
