import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')
  const city = searchParams.get('city')

  if (!q && !category && !city) {
    return NextResponse.json({ providers: [] })
  }

  let query = supabaseAdmin
    .from('providers')
    .select('id, slug, first_name, last_name, photo_url, category, specialties, service_areas, average_rating, total_reviews, is_referenced')
    .eq('status', 'active')

  if (category) {
    query = query.eq('category', category)
  }

  if (city) {
    query = query.contains('service_areas', [city])
  }

  if (q) {
    // Sanitize input: remove PostgREST special characters to prevent filter injection
    const sanitized = q.replace(/[,().]/g, ' ').trim()
    if (sanitized) {
      query = query.or(`first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
    }
  }

  const { data, error } = await query
    .order('average_rating', { ascending: false })
    .limit(30)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ providers: data || [] }, {
    headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=300' },
  })
}
