import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const city = searchParams.get('city')
  const minRating = searchParams.get('min_rating')
  const sort = searchParams.get('sort') || 'rating'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabaseAdmin
    .from('providers')
    .select('id, slug, first_name, last_name, photo_url, category, specialties, service_areas, languages, description, years_experience, is_referenced, average_rating, total_reviews, created_at')
    .eq('status', 'active')

  if (category) {
    query = query.eq('category', category)
  }

  if (city) {
    query = query.contains('service_areas', [city])
  }

  if (minRating) {
    query = query.gte('average_rating', parseFloat(minRating))
  }

  if (sort === 'rating') {
    query = query.order('average_rating', { ascending: false }).order('total_reviews', { ascending: false })
  } else if (sort === 'reviews') {
    query = query.order('total_reviews', { ascending: false })
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ providers: data || [], total: count }, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}
