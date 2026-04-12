import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ListingFilters } from '@/types/listings'

/**
 * GET /api/listings/search — Recherche d'annonces avec filtres
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const filters: ListingFilters = {
    source: searchParams.get('source') as ListingFilters['source'] || undefined,
    listing_type: searchParams.get('type') as ListingFilters['listing_type'] || undefined,
    property_type: searchParams.get('property') as ListingFilters['property_type'] || undefined,
    city: searchParams.get('city') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    min_rooms: searchParams.get('min_rooms') ? Number(searchParams.get('min_rooms')) : undefined,
    max_rooms: searchParams.get('max_rooms') ? Number(searchParams.get('max_rooms')) : undefined,
    min_size: searchParams.get('min_size') ? Number(searchParams.get('min_size')) : undefined,
    max_size: searchParams.get('max_size') ? Number(searchParams.get('max_size')) : undefined,
    has_parking: searchParams.get('parking') === 'true' ? true : undefined,
    has_elevator: searchParams.get('elevator') === 'true' ? true : undefined,
    furnished: searchParams.get('furnished') === 'true' ? true : undefined,
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
    sort_by: searchParams.get('sort') as ListingFilters['sort_by'] || 'date_desc',
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  // Appliquer les filtres
  if (filters.source) query = query.eq('source', filters.source)
  if (filters.listing_type) query = query.eq('listing_type', filters.listing_type)
  if (filters.property_type) query = query.eq('property_type', filters.property_type)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters.min_price) query = query.gte('price', filters.min_price)
  if (filters.max_price) query = query.lte('price', filters.max_price)
  if (filters.min_rooms) query = query.gte('rooms', filters.min_rooms)
  if (filters.max_rooms) query = query.lte('rooms', filters.max_rooms)
  if (filters.min_size) query = query.gte('size_sqm', filters.min_size)
  if (filters.max_size) query = query.lte('size_sqm', filters.max_size)
  if (filters.has_parking) query = query.eq('parking', true)
  if (filters.has_elevator) query = query.eq('elevator', true)
  if (filters.furnished) query = query.eq('furnished', true)

  // Tri
  switch (filters.sort_by) {
    case 'price_asc':
      query = query.order('price', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false, nullsFirst: false })
      break
    case 'size_desc':
      query = query.order('size_sqm', { ascending: false, nullsFirst: false })
      break
    case 'date_desc':
    default:
      query = query.order('scraped_at', { ascending: false })
      break
  }

  // Pagination
  const page = filters.page || 1
  const limit = filters.limit || 20
  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    listings: data || [],
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
  })
}
