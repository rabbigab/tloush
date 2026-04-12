import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/listings/stats — Statistiques de l'aggregateur
 */
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { count: totalActive },
    { count: totalYad2 },
    { count: totalFacebook },
    { count: totalRent },
    { count: totalSale },
    { data: lastScrape },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('source', 'yad2').eq('is_active', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('source', 'facebook').eq('is_active', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('listing_type', 'rent').eq('is_active', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('listing_type', 'sale').eq('is_active', true),
    supabase.from('scraping_logs').select('*').order('started_at', { ascending: false }).limit(1),
  ])

  return NextResponse.json({
    total_active: totalActive || 0,
    by_source: {
      yad2: totalYad2 || 0,
      facebook: totalFacebook || 0,
    },
    by_type: {
      rent: totalRent || 0,
      sale: totalSale || 0,
    },
    last_scrape: lastScrape?.[0] || null,
  })
}
