// =====================================================
// Orchestrateur de scraping — insere/met a jour en DB
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type { Listing, ListingSource, ScrapingResult } from '@/types/listings'
import { scrapeYad2 } from './yad2'
import { scrapeFacebook } from './facebook'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Insere ou met a jour des listings en DB via upsert.
 * Retourne le nombre de nouvelles et mises a jour.
 */
async function upsertListings(
  listings: Partial<Listing>[]
): Promise<{ newCount: number; updatedCount: number; errors: string[] }> {
  const supabase = getServiceClient()
  let newCount = 0
  let updatedCount = 0
  const errors: string[] = []

  // Batch upsert par lots de 50
  const batchSize = 50
  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize)

    // Verifier lesquels existent deja
    const sourceIds = batch.map(l => l.source_id!).filter(Boolean)
    const source = batch[0]?.source

    const { data: existing } = await supabase
      .from('listings')
      .select('source_id')
      .eq('source', source!)
      .in('source_id', sourceIds)

    const existingIds = new Set((existing || []).map(e => e.source_id))

    const { error } = await supabase
      .from('listings')
      .upsert(
        batch.map(l => ({
          ...l,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'source,source_id' }
      )

    if (error) {
      errors.push(`Upsert batch ${i}: ${error.message}`)
    } else {
      for (const l of batch) {
        if (existingIds.has(l.source_id!)) {
          updatedCount++
        } else {
          newCount++
        }
      }
    }
  }

  return { newCount, updatedCount, errors }
}

/**
 * Log un run de scraping dans la table scraping_logs.
 */
async function logScrapingRun(
  source: ListingSource,
  result: ScrapingResult,
  status: 'completed' | 'failed'
) {
  const supabase = getServiceClient()
  await supabase.from('scraping_logs').insert({
    source,
    finished_at: new Date().toISOString(),
    total_scraped: result.total_scraped,
    new_listings: result.new_listings,
    updated_listings: result.updated_listings,
    errors: result.errors,
    status,
  })
}

/**
 * Lance le scraping complet (Yad2 + Facebook) et insere en DB.
 */
export async function runFullScraping(): Promise<{
  yad2: ScrapingResult
  facebook: ScrapingResult
}> {
  // --- Yad2 ---
  const yad2Start = Date.now()
  let yad2Result: ScrapingResult = {
    source: 'yad2',
    total_scraped: 0,
    new_listings: 0,
    updated_listings: 0,
    errors: [],
    duration_ms: 0,
  }

  try {
    // Scraper location + vente
    const [rentResult, saleResult] = await Promise.all([
      scrapeYad2('rent', undefined, 3),
      scrapeYad2('sale', undefined, 2),
    ])

    const allYad2 = [...rentResult.listings, ...saleResult.listings]
    const yad2Upsert = await upsertListings(allYad2)

    yad2Result = {
      source: 'yad2',
      total_scraped: allYad2.length,
      new_listings: yad2Upsert.newCount,
      updated_listings: yad2Upsert.updatedCount,
      errors: [...rentResult.errors, ...saleResult.errors, ...yad2Upsert.errors],
      duration_ms: Date.now() - yad2Start,
    }

    await logScrapingRun('yad2', yad2Result, 'completed')
  } catch (err) {
    yad2Result.errors.push(err instanceof Error ? err.message : 'Unknown error')
    yad2Result.duration_ms = Date.now() - yad2Start
    await logScrapingRun('yad2', yad2Result, 'failed')
  }

  // --- Facebook ---
  const fbStart = Date.now()
  let fbResult: ScrapingResult = {
    source: 'facebook',
    total_scraped: 0,
    new_listings: 0,
    updated_listings: 0,
    errors: [],
    duration_ms: 0,
  }

  try {
    const { listings: fbListings, errors: fbErrors } = await scrapeFacebook(3)
    const fbUpsert = await upsertListings(fbListings)

    fbResult = {
      source: 'facebook',
      total_scraped: fbListings.length,
      new_listings: fbUpsert.newCount,
      updated_listings: fbUpsert.updatedCount,
      errors: [...fbErrors, ...fbUpsert.errors],
      duration_ms: Date.now() - fbStart,
    }

    await logScrapingRun('facebook', fbResult, 'completed')
  } catch (err) {
    fbResult.errors.push(err instanceof Error ? err.message : 'Unknown error')
    fbResult.duration_ms = Date.now() - fbStart
    await logScrapingRun('facebook', fbResult, 'failed')
  }

  return { yad2: yad2Result, facebook: fbResult }
}

/**
 * Marque comme inactives les annonces qui n'ont pas ete mises a jour
 * depuis X jours (annonces probablement expirees).
 */
export async function deactivateStaleListings(staleDays: number = 14): Promise<number> {
  const supabase = getServiceClient()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - staleDays)

  const { data, error } = await supabase
    .from('listings')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('scraped_at', cutoff.toISOString())
    .select('id')

  if (error) {
    console.error('Erreur deactivation:', error.message)
    return 0
  }

  return data?.length ?? 0
}
