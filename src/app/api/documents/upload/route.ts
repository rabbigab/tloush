import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { validateFile } from '@/lib/fileValidation'
import { createRateLimit } from '@/lib/rateLimit'
import { requireAuth } from '@/lib/apiAuth'
import { canUseFeature, incrementUsage, getSubscription } from '@/lib/subscription'
import { parseDeadline, detectAmountAnomaly } from '@/lib/parsers'
import { preprocessImage, buildQualityHint } from '@/lib/imagePreprocess'
import { verifyPayslip, calculateNetSalary } from '@/lib/israeliPayroll'
import { calculateEmployeeRights } from '@/lib/employeeRights'
import { buildUploadSystemPrompt, UPLOAD_USER_PROMPT, COMPARE_PAYSLIPS_INLINE_SYSTEM_PROMPT } from '@/lib/prompts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const freeRateLimit = createRateLimit('upload-free', 3, '1 h')

// Allow up to 5 minutes for document analysis (Claude calls can be slow)
export const maxDuration = 300

function buildSystemPrompt(): string {
  return buildUploadSystemPrompt()
}

const USER_PROMPT = UPLOAD_USER_PROMPT

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    // Check subscription & quota
    const access = await canUseFeature(supabase, user.id, 'document_analysis')
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, code: 'QUOTA_EXCEEDED' }, { status: 403 })
    }

    // Rate limiting — only for free plan (paid plans have no hourly limit)
    const sub = await getSubscription(supabase, user.id)
    if (sub.planId === 'free' && freeRateLimit) {
      const { success, remaining, reset } = await freeRateLimit.limit(user.id)
      if (!success) {
        return NextResponse.json(
          { error: 'Limite atteinte. Réessayez plus tard.' },
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
    const employeeName = (formData.get('employee_name') as string)?.trim() || ''
    const employerName = (formData.get('employer_name') as string)?.trim() || ''
    const docPeriod = (formData.get('doc_period') as string)?.trim() || ''

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    // File validation
    const validationError = await validateFile(file)
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

    // 2. Preprocess image for better OCR quality
    const mimeType = file.type as string
    const preprocessResult = await preprocessImage(fileBuffer, mimeType)
    const analysisBuffer = preprocessResult.enhanced ? preprocessResult.buffer : fileBuffer
    const base64Data = analysisBuffer.toString('base64')

    if (preprocessResult.enhanced) {
      console.log(`[upload] Image enhanced: quality=${preprocessResult.quality}, fixes=[${preprocessResult.appliedFixes.join(', ')}]`)
    }

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
      // Enhanced images are always PNG, originals keep their type
      const outputMime = preprocessResult.enhanced ? 'image/png' : mimeType
      const imageMediaType = (outputMime === 'image/png' ? 'image/png' : 'image/jpeg') as ImageMediaType
      contentBlocks = [
        { type: 'text', text: USER_PROMPT },
        { type: 'image', source: { type: 'base64', media_type: imageMediaType, data: base64Data } }
      ]
    }

    // Build system prompt, inject user-provided context if available
    let systemPrompt = buildSystemPrompt()
    if (employeeName || employerName || docPeriod) {
      systemPrompt += `\n\nCONTEXTE FOURNI PAR L'UTILISATEUR (utilise ces infos pour mieux reconnaître les noms sur le document) :`
      if (employeeName) systemPrompt += `\n- Nom de l'employé/titulaire : ${JSON.stringify(employeeName)}`
      if (employerName) systemPrompt += `\n- Employeur / émetteur du document : ${JSON.stringify(employerName)}`
      if (docPeriod) systemPrompt += `\n- Période du document : ${JSON.stringify(docPeriod)}`
      systemPrompt += `\nATTENTION : ces infos sont indicatives. Base-toi TOUJOURS sur ce qui est écrit dans le document. Utilise ces infos uniquement pour mieux identifier les noms propres.`
    }

    // Add quality hint if image was enhanced
    const qualityHint = buildQualityHint(preprocessResult)
    if (qualityHint) {
      systemPrompt += qualityHint
    }

    // Cast needed: 'document' content block not yet in SDK types (v0.24)
    const message = await (anthropic.messages.create as Function)({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
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
            system: COMPARE_PAYSLIPS_INLINE_SYSTEM_PROMPT,
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

    // 3b. Payslip verification with Israeli payroll calculator
    if (analysisResult.document_type === 'payslip') {
      try {
        const payslipDetails = (analysisResult.analysis_data as Record<string, unknown>)?.payslip_details as Record<string, unknown> | undefined
        if (payslipDetails) {
          const grossSalary = Number(payslipDetails.gross_salary) || 0
          if (grossSalary > 0) {
            const verificationChecks = verifyPayslip({
              grossSalary,
              netSalary: Number(payslipDetails.net_salary) || undefined,
              incomeTax: Number(payslipDetails.income_tax) || undefined,
              bituahLeumi: Number(payslipDetails.bituah_leumi) || undefined,
              healthInsurance: Number(payslipDetails.health_insurance) || undefined,
              pensionEmployee: Number(payslipDetails.pension_employee) || undefined,
              hourlyRate: Number(payslipDetails.base_hourly_rate) || undefined,
              hoursWorked: Number(payslipDetails.hours_worked) || undefined,
              overtimeHours125: Number(payslipDetails.overtime_125_hours) || undefined,
              overtimeRate125: Number(payslipDetails.overtime_125_rate) || undefined,
              overtimeHours150: Number(payslipDetails.overtime_150_hours) || undefined,
              overtimeRate150: Number(payslipDetails.overtime_150_rate) || undefined,
              creditPoints: Number(payslipDetails.tax_credit_points) || undefined,
              vacationDays: Number(payslipDetails.vacation_balance) || undefined,
            })

            // Add verification results to analysis
            ;(analysisResult.analysis_data as Record<string, unknown>).payroll_verification = verificationChecks

            // Calculate expected net for display
            const calcResult = calculateNetSalary({ grossMonthlySalary: grossSalary })
            ;(analysisResult.analysis_data as Record<string, unknown>).calculated_net = calcResult.net
            ;(analysisResult.analysis_data as Record<string, unknown>).payroll_breakdown = calcResult.breakdown

            // Merge critical/warning checks into attention_points
            const existingPoints = (analysisResult.attention_points as Array<Record<string, unknown>>) || []
            for (const check of verificationChecks) {
              if (check.level === 'critical' || check.level === 'warning') {
                existingPoints.push({
                  level: check.level,
                  title: `[Vérification auto] ${check.title}`,
                  description: check.description,
                })
              }
            }
            analysisResult.attention_points = existingPoints
          }
        }
      } catch (verifyErr) {
        console.error('[Payslip verification] Error:', verifyErr)
        // Non-blocking
      }
    }

    // 3c. Employee rights estimation from payslip data
    if (analysisResult.document_type === 'payslip') {
      try {
        const payslipDetails = (analysisResult.analysis_data as Record<string, unknown>)?.payslip_details as Record<string, unknown> | undefined
        if (payslipDetails) {
          const grossSalary = Number(payslipDetails.gross_salary) || 0
          const startDate = payslipDetails.start_date as string | undefined
          let seniorityYears = 1
          if (startDate) {
            const start = new Date(startDate)
            if (!isNaN(start.getTime())) {
              seniorityYears = Math.max(1, Math.floor((Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
            }
          }

          if (grossSalary > 0) {
            const rights = calculateEmployeeRights({
              seniorityYears,
              workDaysPerWeek: 5,
              hoursPerDay: 9,
              monthlySalary: grossSalary,
              employmentType: 'full_time',
              hasPension: Number(payslipDetails.pension_employee) > 0,
              hasKerenHishtalmut: Number(payslipDetails.keren_hishtalmut_employee) > 0,
            })

            // Store rights summary in analysis_data
            ;(analysisResult.analysis_data as Record<string, unknown>).employee_rights = {
              vacation_days: rights.vacation.adjustedForWorkWeek,
              vacation_value: rights.vacation.annualValue,
              sick_days_estimate: rights.sickLeave.currentEstimate,
              convalescence_amount: rights.convalescence.annualAmount,
              severance_estimate: rights.severance.estimatedAmount,
              notice_days: rights.notice.employeeDays,
              pension_required: rights.pension.isRequired,
              pension_total_monthly: rights.pension.totalMonthly,
              credit_points: rights.creditPoints.totalPoints,
              summary: rights.summary.filter(s => s.status === 'critical' || s.status === 'warning'),
            }

            // Add critical rights issues to attention_points
            const existingPoints = (analysisResult.attention_points as Array<Record<string, unknown>>) || []
            for (const item of rights.summary) {
              if (item.status === 'critical') {
                existingPoints.push({
                  level: 'critical',
                  title: `[Droits] ${item.title}`,
                  description: item.description,
                })
              }
            }
            analysisResult.attention_points = existingPoints
          }
        }
      } catch (rightsErr) {
        console.error('[Employee rights] Error:', rightsErr)
      }
    }

    // 4. Parse deadline into DATE format
    const rawDeadline = (analysisResult.key_info as Record<string, unknown>)?.deadline
    const deadlineDate = parseDeadline(rawDeadline)

    // 5. Sauvegarder en base
    const fileType = mimeType === 'application/pdf' ? 'pdf' : 'image'

    // Build insert payload — only include optional columns if they have values
    // to avoid errors if columns haven't been migrated yet
    const insertPayload: Record<string, unknown> = {
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
    }
    if (deadlineDate) insertPayload.deadline = deadlineDate

    let document: Record<string, unknown> | null = null
    let dbError: { message?: string; code?: string } | null = null

    // Try with full payload first, retry without optional columns if it fails
    const result = await supabase
      .from('documents')
      .insert(insertPayload)
      .select()
      .single()

    if (result.error) {
      // Retry without deadline column (might not exist in DB)
      console.warn('DB insert failed, retrying without optional columns:', result.error.message)
      delete insertPayload.deadline
      const retry = await supabase
        .from('documents')
        .insert(insertPayload)
        .select()
        .single()
      document = retry.data
      dbError = retry.error
    } else {
      document = result.data
      dbError = result.error
    }

    if (dbError || !document) {
      console.error('DB error:', dbError)
      return NextResponse.json(
        { error: `Erreur lors de la sauvegarde: ${dbError?.message || 'Inconnu'}` },
        { status: 500 }
      )
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

      // Auto-group into folder by document type (e.g. "Fiches de paie", "Factures")
      const docType = (analysisResult.document_type as string) || 'other'
      const FOLDER_NAMES: Record<string, string> = {
        payslip: 'Fiches de paie',
        bituah_leumi: 'Bituah Leumi',
        tax_notice: 'Documents fiscaux',
        work_contract: 'Contrats de travail',
        pension: 'Retraite',
        health_insurance: 'Assurance santé',
        rental: 'Logement',
        bank: 'Documents bancaires',
        official_letter: 'Courriers officiels',
        contract: 'Contrats',
        invoice: 'Factures',
        receipt: 'Tickets de caisse',
        utility_bill: 'Factures services',
        insurance: 'Assurances',
        other: 'Autres documents',
      }
      const folderName = FOLDER_NAMES[docType] || FOLDER_NAMES.other
      try {
        const { data: existingFolder } = await supabase
          .from('folders')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', folderName)
          .maybeSingle()

        let folderId = existingFolder?.id
        if (!folderId) {
          const { data: newFolder } = await supabase
            .from('folders')
            .insert({
              user_id: user.id,
              name: folderName,
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

    // Fire-and-forget emails (don't block response)
    if (document && process.env.CRON_SECRET) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
        ?? (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000')
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      }
      const body = JSON.stringify({ userId: user.id, documentId: document.id })

      // Urgent alert email
      if (Boolean(analysisResult.is_urgent)) {
        fetch(`${baseUrl}/api/alerts/urgent`, { method: 'POST', headers, body })
          .catch(err => console.error('[Urgent Alert] Fire-and-forget error:', err))
      }

      // Post-analysis summary email
      fetch(`${baseUrl}/api/alerts/analysis-complete`, { method: 'POST', headers, body })
        .catch(err => console.error('[Analysis Email] Fire-and-forget error:', err))
    }

    // Increment usage counter after successful analysis
    await incrementUsage(supabase, user.id, 'documents_analyzed')

    return NextResponse.json({ document })
  } catch (err) {
    console.error('[/api/documents/upload]', err)
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    const stack = err instanceof Error ? err.stack : undefined
    // Log to Sentry-like structure for debugging
    console.error('[UPLOAD_ERROR]', JSON.stringify({
      message,
      stack,
      name: err instanceof Error ? err.name : 'unknown',
    }))
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
