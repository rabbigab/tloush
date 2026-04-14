import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SALT || 'tloush')).digest('hex').slice(0, 16)
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getAdminClient()
  let body: { path?: string; referrer?: string; session_id?: string; user_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.path) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 })
  }

  // Get IP from headers (Vercel sets x-forwarded-for)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const country = req.headers.get('x-vercel-ip-country') || null

  // Ignore bots (basic filter)
  const isBot = /bot|crawl|spider|slurp|mediapartners/i.test(userAgent)
  if (isBot) {
    return NextResponse.json({ ok: true, bot: true })
  }

  await supabaseAdmin.from('page_views').insert({
    path: body.path.slice(0, 500),
    referrer: body.referrer?.slice(0, 500) || null,
    user_agent: userAgent.slice(0, 500),
    ip_hash: hashIp(ip),
    country,
    user_id: body.user_id || null,
    session_id: body.session_id?.slice(0, 100) || null,
  })

  return NextResponse.json({ ok: true })
}
