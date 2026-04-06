import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { validateFile } from '@/lib/fileValidation'
import { createRateLimit } from '@/lib/rateLimit'
import { requireAuth } from '@/lib/apiAuth'
import { canUseFeature, incrementUsage, getSubscription } from '@/lib/subscription'
import { parseDeadline, detectAmountAnomaly } from '@/lib/parsers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const freeRateLimit = createRateLimit('upload-free', 3, '1 h')

function buildSystemPrompt(): string {
  let prompt = `Tu es un EXPERT-COMPTABLE spécialisé en droit du travail israélien et en documents administratifs pour francophones vivant en Israël.

TON RÔLE :
- Analyser en profondeur chaque document (fiche de paie, courrier officiel, contrat, facture, relevé, etc.)
- Extraire TOUTES les données chiffrées avec précision — ne jamais inventer ou deviner un chiffre
- Détecter les anomalies, erreurs et points à vérifier
- Vérifier la conformité avec le droit du travail israélien
- Recommander des actions concrètes et pratiques
- Retourner un JSON structuré en FRANÇAIS

RÈGLE ABSOLUE : Lis le document LIGNE PAR LIGNE. Chaque ligne du document contient une information. Ne saute AUCUNE ligne. Si tu vois un chiffre, reporte-le fidèlement. Si tu n'arrives pas à lire une valeur, indique "illisible" plutôt que de deviner.

RÈGLE CRITIQUE SUR LES NOMS PROPRES :
- GARDE TOUJOURS les noms de personnes, d'entreprises et d'organismes EN HÉBREU tel qu'ils apparaissent sur le document.
- NE TRADUIS PAS et NE TRANSLITTÈRE PAS les noms propres. Exemple : écris ג'ואנה לילוש, PAS "Johanna Lellouche".
- Pour les entreprises : garde le nom hébreu original. Exemple : écris לה מולן דורה בע"מ, PAS "Le Moulin Doré".
- Si un nom apparaît à la fois en hébreu et en français/anglais sur le document, utilise la version hébraïque en priorité et mets l'autre entre parenthèses.

CONNAISSANCES DROIT DU TRAVAIL ISRAÉLIEN :
- Salaire minimum 2024-2025 : 5 880.02₪/mois, 32.3₪/heure
- Heures supplémentaires : 125% pour les 2 premières heures au-delà de 8h/jour, 150% au-delà
- Congés payés (חופשה) : selon ancienneté, minimum 12 jours/an les 4 premières années
- Jours de maladie (מחלה) : 1.5 jour/mois accumulé, 90 jours max. Paiement : 0% jour 1, 50% jours 2-3, 100% à partir du jour 4
- Convalescence (הבראה) : 5 jours la 1ère année, augmente avec l'ancienneté. Valeur ~418₪/jour en 2024
- Bituah Leumi (ביטוח לאומי) : cotisation employé ~3.5% jusqu'au seuil, ~12% au-delà
- Caisse de retraite (פנסיה) : cotisation employé ~6%, employeur ~6.5%
- Prévoyance (קופת גמל) : variable, souvent 2.5% employé
- Frais de transport (נסיעות) : remboursement selon trajet réel, plafond mensuel selon distance`

  prompt += `\n\nIMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant ou après.`
  return prompt
}

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

=== GUIDE SPÉCIFIQUE FICHES DE PAIE ISRAÉLIENNES (תלוש משכורת) ===

CRITIQUE : Lis CHAQUE LIGNE du tableau des paiements (תשלומים). Une fiche de paie israélienne contient plusieurs rubriques. Tu DOIS toutes les identifier et les reporter fidèlement.

STRUCTURE TYPE d'une fiche de paie israélienne :
1. EN-TÊTE :
   - שם החברה = Nom de l'entreprise (employeur)
   - שם עובד = Nom de l'employé
   - מס' עובד = Numéro d'employé
   - מחלקה = Département
   - תעודת זהות / ת.ז = Numéro d'identité
   - תחילת עבודה = Date de début d'emploi

2. TABLEAU DES PAIEMENTS (תשלומים) — colonnes typiques :
   - תאור התשלום = Description du paiement
   - כמות = Quantité (heures, jours)
   - תעריף = Tarif/Taux
   - תעריף יום = Tarif journalier
   - תעריף שעה = Tarif horaire
   - סכום = Montant

3. LIGNES DE PAIEMENT COURANTES (lis-les TOUTES) :
   - שכר יסוד = Salaire de base
   - נסיעות = Indemnité de transport
   - שעות נוספות 125% = Heures supplémentaires à 125%
   - שעות נוספות 150% = Heures supplémentaires à 150%
   - שעות נוספות 100% = Heures supplémentaires à 100%
   - מחלה = Jours de maladie
   - חופשה = Congés payés
   - הבראה = Prime de convalescence (havra'a)
   - חגים = Jours fériés
   - פרמיה / בונוס = Prime/Bonus
   - עמלות = Commissions
   - תוספת = Supplément

4. RETENUES (ניכויים) :
   - מס הכנסה = Impôt sur le revenu
   - ביטוח לאומי / ב.ל = Bituah Leumi (sécurité sociale)
   - דמי בריאות = Assurance santé
   - קופת גמל / קופ"ג = Caisse de prévoyance
   - קרן פנסיה / קה"ל = Caisse de retraite
   - אלטשולר שחם / מגדל / מנורה / כלל / הראל = Noms de caisses de retraite/prévoyance

5. INFORMATIONS COMPLÉMENTAIRES :
   - נקודות זיכוי = Points de crédit fiscal (Nekudot Zikuy)
   - ימי עבודה = Jours travaillés
   - שעות עבודה = Heures travaillées
   - שעות תקן = Heures standard
   - ימי תקן = Jours standard
   - שכר מינימום לחודש = Salaire minimum mensuel (informatif)
   - שכר מינימום לשעה = Salaire minimum horaire (informatif)
   - צבירת חופש = Cumul congés
   - צבירת מחלה = Cumul maladie

6. TOTAUX :
   - סה"כ תשלומים = Total des paiements
   - סה"כ ניכויים = Total des retenues
   - שכר ברוטו = Salaire brut
   - שכר נטו / נטו לתשלום = Salaire net à payer

RÈGLES POUR LES FICHES DE PAIE :
- Le taux horaire DE BASE est celui de la ligne שכר יסוד (souvent entre 30-80₪). NE PAS le confondre avec un calcul brut/heures.
- Si tu vois des lignes שעות נוספות (125%, 150%, 200%), il Y A des heures supplémentaires — ne dis JAMAIS qu'il n'y en a pas.
- Vérifie que le taux des heures sup est bien 125% ou 150% du taux de base. Calcul : taux_base × 1.25 = taux 125%, taux_base × 1.5 = taux 150%.
- Compare le salaire de base au שכר מינימום (salaire minimum) si indiqué. Si le taux horaire est inférieur à 32.3₪, c'est un WARNING critique.
- Reporte dans le summary_fr : salaire brut, net, heures sup (nombre d'heures + montant) s'il y en a, et tout élément notable.

VÉRIFICATIONS DE CONFORMITÉ (attention_points) :
- Taux horaire inférieur au minimum légal (32.3₪/h) → critical
- Heures sup non majorées correctement (125%/150%) → warning
- Plus de 186 heures mensuelles sans heures sup → warning (la norme est ~182h)
- Cotisation Bituah Leumi absente ou anormalement basse → warning
- Cotisation retraite absente alors que l'employé a plus de 6 mois d'ancienneté → warning
- Frais de transport absents pour un employé avec lieu de travail → info
- Prime de convalescence (הבראה) absente après 1 an d'ancienneté → info
- Écart entre la somme des lignes et le total brut affiché → warning
- Date d'édition du document très éloignée de la période de paie → warning
- Cumul congés (צבירת חופש) négatif → warning
- Différence nette entre le brut déclaré au Bituah Leumi (חייב ב.ל) et le brut réel → info

Dans analysis_data, ajoute OBLIGATOIREMENT un objet "payslip_details" :
{
  "employee_name": "nom de l'employé EN HÉBREU tel qu'écrit sur le document",
  "employer_name": "nom de l'employeur EN HÉBREU tel qu'écrit sur le document",
  "employee_id": "numéro d'identité",
  "start_date": "date début emploi",
  "department": "département/numéro",
  "base_salary": nombre,
  "base_hourly_rate": nombre,
  "daily_rate": nombre ou null,
  "hours_worked": nombre,
  "days_worked": nombre ou null,
  "standard_hours": nombre ou null,
  "standard_days": nombre ou null,
  "overtime_125_hours": nombre ou null,
  "overtime_125_rate": nombre ou null,
  "overtime_125_amount": nombre ou null,
  "overtime_150_hours": nombre ou null,
  "overtime_150_rate": nombre ou null,
  "overtime_150_amount": nombre ou null,
  "sick_days": nombre ou null,
  "sick_amount": nombre ou null,
  "vacation_days": nombre ou null,
  "vacation_amount": nombre ou null,
  "convalescence_days": nombre ou null,
  "convalescence_amount": nombre ou null,
  "transport": nombre ou null,
  "bonuses": nombre ou null,
  "commissions": nombre ou null,
  "other_payments": [{"description": "...", "amount": nombre}],
  "gross_salary": nombre,
  "income_tax": nombre ou null,
  "bituah_leumi": nombre ou null,
  "health_insurance": nombre ou null,
  "pension_employee": nombre ou null,
  "pension_employer": nombre ou null,
  "provident_fund": nombre ou null,
  "other_deductions": [{"description": "...", "amount": nombre}],
  "total_deductions": nombre,
  "net_salary": nombre,
  "tax_credit_points": nombre ou null,
  "tax_credit_amount": nombre ou null,
  "vacation_balance": nombre ou null,
  "sick_balance": nombre ou null,
  "edition_date": "date d'édition du document"
}

Si le montant brut ne correspond pas à la somme des lignes, signale-le en warning.

=== FIN GUIDE FICHES DE PAIE ===

=== GUIDE SPÉCIFIQUE DOCUMENTS BITUAH LEUMI (ביטוח לאומי) ===
- Identifier le type exact : allocation, convocation, confirmation de droits, appel, etc.
- Extraire les montants d'allocation, dates de paiement, périodes couvertes
- Vérifier si un délai de réponse/recours est mentionné → action_required = true
- Termes clés : קצבה (allocation), תביעה (demande), זכאות (éligibilité), ערעור (appel), מועד אחרון (date limite)

=== GUIDE SPÉCIFIQUE CONTRATS DE TRAVAIL (חוזה עבודה) ===
- Vérifier que le salaire proposé ≥ salaire minimum
- Identifier : période d'essai, préavis, clause de non-concurrence, heures de travail
- Termes clés : תקופת ניסיון (période d'essai), הודעה מוקדמת (préavis), שעות עבודה (heures), חופשה שנתית (congé annuel)

=== GUIDE SPÉCIFIQUE DOCUMENTS FISCAUX (מס הכנסה) ===
- Identifier le type : avis d'imposition (שומה), formulaire annuel (106), demande de remboursement, confirmation
- Extraire : revenus déclarés, impôts payés, crédits d'impôt, solde dû ou remboursement
- Vérifier les délais de recours/paiement

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

    // Build system prompt, inject user-provided context if available
    let systemPrompt = buildSystemPrompt()
    if (employeeName || employerName || docPeriod) {
      systemPrompt += `\n\nCONTEXTE FOURNI PAR L'UTILISATEUR (utilise ces infos pour mieux reconnaître les noms sur le document) :`
      if (employeeName) systemPrompt += `\n- Nom de l'employé/titulaire : ${employeeName}`
      if (employerName) systemPrompt += `\n- Employeur / émetteur du document : ${employerName}`
      if (docPeriod) systemPrompt += `\n- Période du document : ${docPeriod}`
      systemPrompt += `\nATTENTION : ces infos sont indicatives. Base-toi TOUJOURS sur ce qui est écrit dans le document. Utilise ces infos uniquement pour mieux identifier les noms propres.`
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

    // Send urgent alert email (fire-and-forget, don't block response)
    if (document && Boolean(analysisResult.is_urgent) && process.env.CRON_SECRET) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
        ?? (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000')
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
