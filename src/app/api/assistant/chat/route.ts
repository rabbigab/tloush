import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRateLimit } from '@/lib/rateLimit'
import { requireAuth } from '@/lib/apiAuth'
import { canUseFeature, incrementUsage } from '@/lib/subscription'
import { buildAssistantSystemPrompt } from '@/lib/prompts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ratelimit = createRateLimit('chat', 30, '1 h')

// Allow up to 60 seconds for Claude chat responses
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    // Rate limiting
    if (ratelimit) {
      const { success } = await ratelimit.limit(user.id)
      if (!success) {
        return NextResponse.json(
          { error: 'Limite atteinte : 30 messages par heure. Réessayez plus tard.' },
          { status: 429 }
        )
      }
    }

    // Check subscription & quota
    const access = await canUseFeature(supabase, user.id, 'assistant_chat')
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, code: 'QUOTA_EXCEEDED' }, { status: 403 })
    }

    const { message, documentId, conversationId } = await req.json()
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message manquant' }, { status: 400 })
    }
    if (message.length > 10000) {
      return NextResponse.json({ error: 'Message trop long (max 10 000 caractères)' }, { status: 400 })
    }

    // Charger le document si fourni
    let documentContext = ''
    if (documentId) {
      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (doc) {
        documentContext = `
DOCUMENT DE RÉFÉRENCE :
- Nom : ${doc.file_name}
- Type : ${doc.document_type}
- Période : ${doc.period || 'Non spécifiée'}
- Résumé : ${doc.summary_fr || 'Non disponible'}
- Analyse complète : ${JSON.stringify(doc.analysis_data, null, 2)}
`
      }
    }

    // Détecter si la question concerne les dépenses / budget
    const expenseKeywords = /combien|budget|d[ée]pens|factur|arnona|mensuel|annuel|co[ûu]te|paye|fournisseur|ab\s*onne|par mois|par an/i
    let expensesContext = ''
    if (expenseKeywords.test(message)) {
      const { data: expenses } = await supabase
        .from('recurring_expenses')
        .select('provider_name, category, amount, currency, frequency, last_seen_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('amount', { ascending: false })
        .limit(30)
      if (expenses && expenses.length > 0) {
        const mult: Record<string, number> = { monthly: 1, bimonthly: 0.5, quarterly: 1 / 3, annual: 1 / 12, one_time: 0 }
        const monthly = expenses.reduce((s, e) => s + (e.amount || 0) * (mult[e.frequency || 'monthly'] ?? 1), 0)
        const list = expenses.map(e => `- ${e.provider_name} : ${e.amount || '?'}${e.currency || '₪'} (${e.frequency || 'monthly'}, ${e.category || 'autre'})`).join('\n')
        expensesContext = `\n\nDÉPENSES RÉCURRENTES SUIVIES (issues des factures scannées) :\nBudget mensuel total estimé : ${monthly.toFixed(0)}₪ · Annuel : ${(monthly * 12).toFixed(0)}₪\n${list}\n`
      }
    }

    // Charger l'historique de la conversation
    let historyMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
    let activeConversationId = conversationId

    if (conversationId) {
      // Vérifier que la conversation appartient à l'utilisateur (prévention IDOR)
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!conv) {
        return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
      }

      const { data: msgs } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10)

      if (msgs) {
        historyMessages = msgs as Array<{ role: 'user' | 'assistant'; content: string }>
      }
    } else {
      // Créer une nouvelle conversation
      const { data: conv } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          document_id: documentId || null,
          title: message.substring(0, 50)
        })
        .select()
        .single()
      activeConversationId = conv?.id
    }

    const systemPrompt = buildAssistantSystemPrompt(documentContext, expensesContext)

    const messages = [
      ...historyMessages,
      { role: 'user' as const, content: message }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

    // Détecter si l'utilisateur indique qu'une action est faite
    const actionDoneKeywords = /c['']?est fait|je l['']?ai fait|c['']?est r[ée]gl[ée]|c['']?est termin[ée]|j['']?ai termin[ée]|effectu[ée]|accompli|r[ée]alis[ée]|d[ée]j[aà] fait|c['']?est bon|c['']?est ok|j['']?ai envoy[ée]|j['']?ai pay[ée]|j['']?ai sign[ée]/i
    if (documentId && actionDoneKeywords.test(message)) {
      const { data: actionDoc } = await supabase
        .from('documents')
        .select('id, action_required, action_completed_at')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (actionDoc && actionDoc.action_required && !actionDoc.action_completed_at) {
        await supabase
          .from('documents')
          .update({
            action_completed_at: new Date().toISOString(),
            action_required: false,
            is_urgent: false,
          })
          .eq('id', documentId)
          .eq('user_id', user.id)
      }
    }

    // Increment usage counter
    await incrementUsage(supabase, user.id, 'assistant_messages')

    // Sauvegarder les messages
    if (activeConversationId) {
      await supabase.from('messages').insert([
        { conversation_id: activeConversationId, role: 'user', content: message },
        { conversation_id: activeConversationId, role: 'assistant', content: assistantMessage }
      ])
    }

    return NextResponse.json({
      message: assistantMessage,
      conversationId: activeConversationId
    })
  } catch (err) {
    console.error('[/api/assistant/chat]', err)
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
