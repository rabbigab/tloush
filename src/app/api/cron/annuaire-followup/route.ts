import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateReviewToken } from '@/lib/reviewTokens'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'

/** Simple Shabbat check (Friday 14:00 - Saturday 21:00 Israel time) */
function isShabbat(): boolean {
  const now = new Date()
  // Israel is UTC+3 (simplified, ignoring DST edge)
  const israelHour = (now.getUTCHours() + 3) % 24
  const israelDay = now.getUTCDay() // 0=Sun ... 5=Fri, 6=Sat
  if (israelDay === 5 && israelHour >= 14) return true
  if (israelDay === 6 && israelHour < 21) return true
  return false
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isShabbat()) {
    return NextResponse.json({ message: 'Shabbat — skipping followup' })
  }

  const now = new Date()
  let sent = 0
  let reminders = 0

  // --- J+2 Follow-up ---
  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const twoDaysAgoStart = new Date(twoDaysAgo)
  twoDaysAgoStart.setHours(0, 0, 0, 0)
  const twoDaysAgoEnd = new Date(twoDaysAgo)
  twoDaysAgoEnd.setHours(23, 59, 59, 999)

  const { data: contacts } = await supabaseAdmin
    .from('provider_contacts')
    .select('id, user_id, provider_id, created_at')
    .is('followup_sent_at', null)
    .eq('whatsapp_opted_in', true)
    .gte('created_at', twoDaysAgoStart.toISOString())
    .lte('created_at', twoDaysAgoEnd.toISOString())

  if (contacts?.length) {
    for (const contact of contacts) {
      // Get provider name
      const { data: provider } = await supabaseAdmin
        .from('providers')
        .select('first_name, last_name, category')
        .eq('id', contact.provider_id)
        .single()

      if (!provider) continue

      // Generate review token
      const token = await generateReviewToken(contact.user_id, contact.provider_id)

      // Build review links (one per rating)
      const reviewLinks = [1, 2, 3, 4, 5].map(r =>
        `${SITE_URL}/annuaire/avis?token=${token}&rating=${r}`
      )

      // Log the message (in production, integrate with WhatsApp Business API)
      console.log(`[FOLLOWUP J+2] Contact ${contact.id}:`, {
        provider: `${provider.first_name} ${provider.last_name}`,
        category: provider.category,
        reviewLinks,
        message: `Bonjour ! Vous avez contacte ${provider.first_name} (${provider.category}) via Tloush il y a 2 jours. Comment ca s'est passe ? Notez: ${reviewLinks[4]} (5/5) | ${reviewLinks[3]} (4/5) | ${reviewLinks[2]} (3/5) | ${reviewLinks[1]} (2/5) | ${reviewLinks[0]} (1/5). Pour ne plus recevoir, repondez STOP.`,
      })

      // Mark as sent
      await supabaseAdmin
        .from('provider_contacts')
        .update({ followup_sent_at: now.toISOString() })
        .eq('id', contact.id)

      sent++
    }
  }

  // --- J+5 Reminder ---
  const threeDaysAfterFollowup = new Date(now)
  threeDaysAfterFollowup.setDate(threeDaysAfterFollowup.getDate() - 5)
  const reminderStart = new Date(threeDaysAfterFollowup)
  reminderStart.setHours(0, 0, 0, 0)
  const reminderEnd = new Date(threeDaysAfterFollowup)
  reminderEnd.setHours(23, 59, 59, 999)

  const { data: reminderContacts } = await supabaseAdmin
    .from('provider_contacts')
    .select('id, user_id, provider_id')
    .not('followup_sent_at', 'is', null)
    .is('followup_reminder_sent_at', null)
    .eq('whatsapp_opted_in', true)
    .gte('created_at', reminderStart.toISOString())
    .lte('created_at', reminderEnd.toISOString())

  if (reminderContacts?.length) {
    for (const contact of reminderContacts) {
      // Check if review already exists
      const { data: existingReview } = await supabaseAdmin
        .from('provider_reviews')
        .select('id')
        .eq('user_id', contact.user_id)
        .eq('provider_id', contact.provider_id)
        .single()

      if (existingReview) continue // Already reviewed, skip

      const { data: provider } = await supabaseAdmin
        .from('providers')
        .select('first_name')
        .eq('id', contact.provider_id)
        .single()

      if (!provider) continue

      const token = await generateReviewToken(contact.user_id, contact.provider_id)

      console.log(`[REMINDER J+5] Contact ${contact.id}:`, {
        message: `Bonjour, avez-vous pu joindre ${provider.first_name} ? Votre retour aide la communaute. ${SITE_URL}/annuaire/avis?token=${token}&rating=5 Pour ne plus recevoir, repondez STOP.`,
      })

      await supabaseAdmin
        .from('provider_contacts')
        .update({ followup_reminder_sent_at: now.toISOString() })
        .eq('id', contact.id)

      reminders++
    }
  }

  return NextResponse.json({
    followups_sent: sent,
    reminders_sent: reminders,
    timestamp: now.toISOString(),
  })
}
