import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAdmin = getAdminClient()
  const { id } = await params

  // Fetch provider by slug or id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const column = isUuid ? 'id' : 'slug'

  const { data: provider, error } = await supabaseAdmin
    .from('providers')
    .select('id, slug, first_name, last_name, photo_url, category, specialties, service_areas, languages, description, years_experience, is_referenced, average_rating, total_reviews, created_at')
    .eq(column, id)
    .eq('status', 'active')
    .single()

  if (error || !provider) {
    return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 })
  }

  // Fetch published reviews
  const { data: reviews } = await supabaseAdmin
    .from('provider_reviews')
    .select('id, rating, comment, provider_response, provider_responded_at, created_at, user_id')
    .eq('provider_id', provider.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch photos
  const { data: photos } = await supabaseAdmin
    .from('provider_photos')
    .select('id, photo_url, caption, sort_order')
    .eq('provider_id', provider.id)
    .order('sort_order')

  // Count contacts this month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count: contactsThisMonth } = await supabaseAdmin
    .from('provider_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', provider.id)
    .gte('created_at', monthStart.toISOString())

  return NextResponse.json({
    provider,
    reviews: reviews || [],
    photos: photos || [],
    contacts_this_month: contactsThisMonth || 0,
  }, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}
