import { NextRequest, NextResponse } from 'next/server'
import { runFullScraping, deactivateStaleListings } from '@/lib/scraping'

/**
 * CRON: Scrape quotidien des annonces immobilieres.
 * Yad2 + Facebook Groups → normalisation → insertion DB
 * Configure dans vercel.json: 0 5 * * * (tous les jours a 5h UTC = 8h Israel)
 */
export const maxDuration = 300 // 5 minutes max (Vercel Pro)

export async function GET(req: NextRequest) {
  // Verifier le secret CRON
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    // Lancer le scraping complet
    const results = await runFullScraping()

    // Desactiver les annonces non mises a jour depuis 14 jours
    const deactivated = await deactivateStaleListings(14)

    return NextResponse.json({
      success: true,
      results,
      deactivated_stale: deactivated,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron scraping error:', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
