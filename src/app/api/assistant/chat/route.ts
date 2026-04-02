import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Rate limiting: 30 messages per hour per user
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, '1 h'),
      prefix: 'ratelimit:chat',
    })
  : null

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

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

    const { message, documentId, conversationId } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message manquant' }, { status: 400 })

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

    // Charger l'historique de la conversation
    let historyMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
    let activeConversationId = conversationId

    if (conversationId) {
      const { data: msgs } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20)

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

    const systemPrompt = `Tu es l'assistant Tloush, un expert en administration israélienne pour les francophones vivant en Israël.

Tu aides les utilisateurs à comprendre leurs documents administratifs israéliens (fiches de paie, courriers officiels, contrats, documents fiscaux, etc.).

Tes réponses doivent être :
- En français
- Claires et accessibles (pas de jargon inutile)
- Pratiques et actionnables ("voici ce que vous devez faire...")
- Honnêtes sur les limites (tu n'es pas un avocat ou comptable)
- Chaleureuses et rassurantes

${documentContext ? `Tu as accès au document suivant de l'utilisateur :\n${documentContext}` : 'Aucun document spécifique chargé. Réponds aux questions générales sur l\'administration israélienne.'}

IMPORTANT — Recommandation d'experts :
Quand la question dépasse tes compétences (juridique, fiscal complexe, litige), recommande un expert adapté avec un lien vers l'annuaire Tloush :
- Pour les questions fiscales/comptables → "Consultez un expert-comptable francophone sur [notre annuaire](/experts?specialite=comptabilite)"
- Pour le droit du travail (contrats, licenciements) → "Consultez un avocat spécialisé sur [notre annuaire](/experts?specialite=droit-travail)"
- Pour la fiscalité → "Consultez un fiscaliste sur [notre annuaire](/experts?specialite=fiscalite)"
Donne toujours les informations générales d'abord, puis suggère l'expert si nécessaire.`

    const messages = [
      ...historyMessages,
      { role: 'user' as const, content: message }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

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
