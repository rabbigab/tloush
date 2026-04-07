import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { WHATSAPP_SYSTEM_PROMPT } from '@/lib/prompts'

/**
 * WhatsApp Business API webhook.
 * Receives incoming messages (text or image) from users via Twilio/Meta.
 * Analyzes document images and responds with a French summary.
 *
 * Setup required:
 * 1. Create a Meta Business account + WhatsApp Business API
 * 2. Or use Twilio WhatsApp sandbox for testing
 * 3. Set env vars: WHATSAPP_VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
 * 4. Point webhook URL to: https://tloush.com/api/whatsapp/webhook
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Webhook verification (Meta sends this to verify the endpoint)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: Incoming message
export async function POST(req: NextRequest) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    console.warn('[WhatsApp] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
    return NextResponse.json({ received: true })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ received: true })
  }

  // Extract message from Meta webhook format
  const entry = (body.entry as Array<Record<string, unknown>>)?.[0]
  const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0]
  const value = changes?.value as Record<string, unknown>
  const messages = (value?.messages as Array<Record<string, unknown>>)
  const message = messages?.[0]

  if (!message) {
    return NextResponse.json({ received: true })
  }

  const from = message.from as string // sender's phone number
  const messageType = message.type as string

  // Send "typing" indicator
  await sendWhatsAppMessage(phoneNumberId, accessToken, from, 'Merci ! J\'analyse votre document, patientez quelques secondes...')

  try {
    if (messageType === 'image') {
      // Get image URL from WhatsApp
      const imageInfo = message.image as { id: string; mime_type: string }
      const mediaUrl = await getWhatsAppMediaUrl(imageInfo.id, accessToken)

      if (!mediaUrl) {
        await sendWhatsAppMessage(phoneNumberId, accessToken, from, 'Désolé, je n\'ai pas pu récupérer l\'image. Réessayez.')
        return NextResponse.json({ received: true })
      }

      // Download image
      const imageRes = await fetch(mediaUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
      const base64 = imageBuffer.toString('base64')
      const mimeType = imageInfo.mime_type || 'image/jpeg'

      // Analyze with Claude
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: WHATSAPP_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Analyse ce document et donne-moi un résumé en français avec les actions à faire.' },
            { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: base64 } },
          ],
        }],
      })

      const analysis = response.content[0].type === 'text' ? response.content[0].text : 'Analyse impossible.'

      // Track usage
      const userPhone = from.startsWith('+') ? from : `+${from}`
      await trackWhatsAppUsage(userPhone)

      // Send analysis back
      await sendWhatsAppMessage(phoneNumberId, accessToken, from,
        `📄 *Analyse Tloush*\n\n${analysis}\n\n---\n💡 Pour une analyse complète avec suivi, créez votre compte sur tloush.com`
      )
    } else if (messageType === 'text') {
      const text = (message.text as { body: string })?.body || ''

      if (text.toLowerCase().includes('aide') || text.toLowerCase().includes('help')) {
        await sendWhatsAppMessage(phoneNumberId, accessToken, from,
          `🇮🇱 *Bienvenue sur Tloush !*\n\nEnvoyez-moi une *photo* de votre document israélien (fiche de paie, courrier, facture...) et je vous l'explique en français.\n\n📱 Pour plus de fonctionnalités, créez votre compte sur tloush.com`
        )
      } else {
        await sendWhatsAppMessage(phoneNumberId, accessToken, from,
          `Pour analyser un document, envoyez-moi une *photo* (pas un texte).\n\nTapez "aide" pour plus d'informations.`
        )
      }
    } else {
      await sendWhatsAppMessage(phoneNumberId, accessToken, from,
        `Je ne peux analyser que des *photos* de documents. Envoyez-moi une image de votre fiche de paie, courrier ou facture.`
      )
    }
  } catch (err) {
    console.error('[WhatsApp] Error processing message:', err)
    await sendWhatsAppMessage(phoneNumberId, accessToken, from,
      'Désolé, une erreur est survenue. Réessayez dans quelques instants.'
    )
  }

  return NextResponse.json({ received: true })
}

async function sendWhatsAppMessage(phoneNumberId: string, accessToken: string, to: string, text: string) {
  try {
    await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    })
  } catch (err) {
    console.error('[WhatsApp] Send message error:', err)
  }
}

async function getWhatsAppMediaUrl(mediaId: string, accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json()
    return data.url || null
  } catch {
    return null
  }
}

async function trackWhatsAppUsage(phone: string) {
  try {
    // Find user by phone in metadata
    const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const user = data?.users?.find(u =>
      u.user_metadata?.phone === phone || u.phone === phone
    )

    if (user) {
      // Track as document analysis for the user
      const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      const { data: existing } = await supabase
        .from('usage_tracking')
        .select('id, documents_analyzed')
        .eq('user_id', user.id)
        .eq('period', period)
        .single()

      if (existing) {
        await supabase
          .from('usage_tracking')
          .update({ documents_analyzed: (existing.documents_analyzed || 0) + 1 })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('usage_tracking')
          .insert({ user_id: user.id, period, documents_analyzed: 1 })
      }
    }
  } catch (err) {
    console.error('[WhatsApp] Usage tracking error:', err)
  }
}
