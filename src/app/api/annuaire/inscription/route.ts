import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { first_name, last_name, phone, email, category, specialties, service_areas, description, osek_number, reference_name, reference_phone } = body

  // Validation minimale
  if (!first_name?.trim() || !last_name?.trim() || !phone?.trim() || !category?.trim()) {
    return NextResponse.json({ error: 'Prenom, nom, telephone et categorie sont requis' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('provider_applications')
    .insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      category: category.trim(),
      specialties: specialties || [],
      service_areas: service_areas || [],
      description: description?.trim() || null,
      osek_number: osek_number?.trim() || null,
      reference_name: reference_name?.trim() || null,
      reference_phone: reference_phone?.trim() || null,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
