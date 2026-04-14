import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const supabaseAdmin = getAdminClient()

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'active'

    // Fetch form submissions from provider_applications table
    if (status === 'applications') {
      const { data, error } = await supabaseAdmin
        .from('provider_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ providers: data || [] })
    }

    const { data, error } = await supabaseAdmin
      .from('providers')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ providers: data || [] })
  } catch (err) {
    console.error('[admin/prestataires GET] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const supabaseAdmin = getAdminClient()

  try {
    const body = await req.json()
    const { first_name, last_name, phone, category, slug } = body

    if (!first_name || !last_name || !phone || !category || !slug) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('providers')
      .insert({
        ...body,
        status: body.status || 'active',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ provider: data })
  } catch (err) {
    console.error('[admin/prestataires POST] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
