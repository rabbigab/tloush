import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { createRateLimit } from '@/lib/rateLimit'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

// La page /experts est publique (listee dans PUBLIC_ROUTES du middleware),
// donc ce endpoint accepte les soumissions non-authentifiees. Un rate-limit
// par IP empeche les abus.
const ratelimit = createRateLimit('experts-waitlist', 5, '1 h')

const VALID_CATEGORIES = new Set(['comptable', 'avocat', 'any'])

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'tloush-default-salt'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)

    if (ratelimit) {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Reessayez dans une heure.' },
          { status: 429 },
        )
      }
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Corps de requete invalide' }, { status: 400 })
    }

    const { email: rawEmail, category: rawCategory } = body as {
      email?: unknown
      category?: unknown
    }

    if (typeof rawEmail !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }
    const email = rawEmail.trim().toLowerCase()
    if (email.length < 5 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    let category: string = 'any'
    if (typeof rawCategory === 'string' && VALID_CATEGORIES.has(rawCategory)) {
      category = rawCategory
    }

    // Recupere l'user connecte s'il l'est (optionnel — route publique)
    let userId: string | null = null
    try {
      const supabase = await createServerSupabase()
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id || null
    } catch {
      // ignore — route publique
    }

    // Insert via service role pour contourner RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { error } = await supabaseAdmin.from('experts_waitlist').insert({
      email,
      category,
      user_id: userId,
      source: 'experts_page',
      ip_hash: hashIp(ip),
      user_agent: req.headers.get('user-agent')?.slice(0, 255) || null,
    })

    if (error) {
      // Unique index sur (lower(email), coalesce(category, 'any')) — doublon = deja inscrit
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, alreadyRegistered: true })
      }
      console.error('[/api/experts/waitlist] DB insert failed:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/experts/waitlist]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
