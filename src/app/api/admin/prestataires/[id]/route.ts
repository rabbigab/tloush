import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { getAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const supabaseAdmin = getAdminClient()

  try {
    const { id } = await params
    const body = await req.json()

    const { data, error } = await supabaseAdmin
      .from('providers')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ provider: data })
  } catch (err) {
    console.error('[admin/prestataires PATCH] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const supabaseAdmin = getAdminClient()

  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('providers')
      .update({ status: 'delisted' })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/prestataires DELETE] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
