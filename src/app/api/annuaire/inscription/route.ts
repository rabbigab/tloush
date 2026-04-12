import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requete invalide' }, { status: 400 })
  }

  const first_name = body.first_name as string | undefined
  const last_name = body.last_name as string | undefined
  const phone = body.phone as string | undefined
  const email = body.email as string | undefined
  const category = body.category as string | undefined
  const specialties = body.specialties as string[] | undefined
  const service_areas = body.service_areas as string[] | undefined
  const description = body.description as string | undefined
  const osek_number = body.osek_number as string | undefined
  const reference_name = body.reference_name as string | undefined
  const reference_phone = body.reference_phone as string | undefined
  const years_experience = body.years_experience as number | undefined

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
      years_experience: years_experience || null,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
