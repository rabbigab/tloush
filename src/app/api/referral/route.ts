import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

/**
 * GET  — Get current user's referral code + stats
 * POST — Apply a referral code (called after signup)
 */

// Generate a short referral code from user ID
function generateCode(userId: string): string {
  // Use first 8 chars of user UUID + simple hash
  const base = userId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `TL-${base}`
}

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const code = generateCode(user.id)

  // Count referrals
  const { count: totalReferred } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)

  const { count: paidReferred } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)
    .eq('referred_upgraded', true)

  // Count bonus analyses earned
  const { data: bonusRow } = await supabase
    .from('referral_bonuses')
    .select('bonus_analyses, free_months_earned')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    code,
    shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'}/auth/register?ref=${code}`,
    stats: {
      totalReferred: totalReferred || 0,
      paidReferred: paidReferred || 0,
      bonusAnalyses: bonusRow?.bonus_analyses || 0,
      freeMonthsEarned: bonusRow?.free_months_earned || 0,
    },
  })
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { referralCode } = await req.json()
  if (!referralCode || typeof referralCode !== 'string') {
    return NextResponse.json({ error: 'Code de parrainage manquant' }, { status: 400 })
  }

  const cleanCode = referralCode.trim().toUpperCase()

  // Prevent self-referral
  if (cleanCode === generateCode(user.id)) {
    return NextResponse.json({ error: 'Vous ne pouvez pas utiliser votre propre code' }, { status: 400 })
  }

  // Check if user was already referred
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('referred_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Vous avez déjà utilisé un code de parrainage' }, { status: 400 })
  }

  // Find the referrer by matching their code against all users
  // Code format: TL-{first 8 chars of UUID uppercase without dashes}
  const prefix = cleanCode.replace('TL-', '')
  const { data: allUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  const referrer = allUsers?.users?.find(u => {
    const uCode = u.id.replace(/-/g, '').slice(0, 8).toUpperCase()
    return uCode === prefix
  })

  if (!referrer) {
    return NextResponse.json({ error: 'Code de parrainage invalide' }, { status: 404 })
  }

  // Create referral record
  await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    referred_id: user.id,
    referral_code: cleanCode,
    referred_upgraded: false,
  })

  // Grant +1 bonus analysis to the referrer
  const { data: existingBonus } = await supabase
    .from('referral_bonuses')
    .select('id, bonus_analyses')
    .eq('user_id', referrer.id)
    .single()

  if (existingBonus) {
    await supabase
      .from('referral_bonuses')
      .update({ bonus_analyses: (existingBonus.bonus_analyses || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', existingBonus.id)
  } else {
    await supabase.from('referral_bonuses').insert({
      user_id: referrer.id,
      bonus_analyses: 1,
      free_months_earned: 0,
    })
  }

  return NextResponse.json({ ok: true, message: 'Code appliqué ! Votre parrain reçoit 1 analyse bonus.' })
}
