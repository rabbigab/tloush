import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Approve an application: create provider + delete application
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params

    // Get the application
    const { data: app, error: fetchErr } = await supabaseAdmin
      .from('provider_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !app) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })
    }

    // Generate slug from name
    const slug = `${app.first_name?.toLowerCase()}.${app.last_name?.charAt(0)?.toLowerCase()}`

    // Create provider
    const { error: insertErr } = await supabaseAdmin
      .from('providers')
      .insert({
        first_name: app.first_name,
        last_name: app.last_name,
        phone: app.phone,
        email: app.email || null,
        category: app.category,
        slug,
        specialties: app.specialties || [],
        service_areas: app.service_areas || [],
        languages: ['fr', 'he'],
        description: app.description || null,
        years_experience: app.years_experience || null,
        osek_number: app.osek_number || null,
        status: 'active',
        is_referenced: false,
      })

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Delete the application
    await supabaseAdmin
      .from('provider_applications')
      .delete()
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/applications POST] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// Reject/delete an application
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('provider_applications')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/applications DELETE] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
