import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

/**
 * Source de verite des slugs de categories prestataires.
 * Utilise par sitemap.ts + pages categorie.
 *
 * Audit #12 : ne sont incluses dans le sitemap que les categories
 * avec >=1 prestataire actif. Les categories vides sont marquees
 * noindex dynamiquement dans /annuaire/[categorie]/page.tsx pour
 * ne pas polluer les resultats Google.
 */
const ALL_PROVIDER_CATEGORY_SLUGS = [
  'plombier',
  'electricien',
  'peintre',
  'serrurier',
  'climatisation',
  'bricoleur',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tloush.com'

  const staticPages = [
    '',
    '/pricing',
    '/calculateurs',
    '/calculateurs/brut-net',
    '/calculateurs/conges',
    '/calculateurs/maternite',
    '/calculateurs/indemnites',
    '/droits',
    '/droits/guides',
    '/droits/olim',
    '/modeles',
    '/scanner',
    '/annuaire/professionnels',
    '/privacy',
    '/cgv',
    '/mentions-legales',
    '/annuaire',
    '/annuaire/artisans',
    '/annuaire/artisans/inscription',
    '/contact',
    '/a-propos',
    '/faq',
  ]

  const entries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : ('monthly' as const),
    priority: route === '' ? 1 : route === '/annuaire' ? 0.9 : 0.7,
  }))

  // Provider pages + dynamic category filtering (#12 audit fix).
  // On ne liste dans le sitemap que les categories qui ont au moins
  // un prestataire actif. Les categories vides sont laissees hors
  // sitemap et noindex cote page.
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: providers } = await supabase
      .from('providers')
      .select('slug, category, updated_at')
      .eq('status', 'active')

    if (providers && providers.length > 0) {
      const categoriesWithActiveProviders = new Set(
        providers.map((p) => p.category as string),
      )

      // Category pages (filtrees : seulement celles avec prestataires)
      for (const slug of ALL_PROVIDER_CATEGORY_SLUGS) {
        if (categoriesWithActiveProviders.has(slug)) {
          // lastMod = max des updated_at des prestataires de cette categorie
          const catLastMod = providers
            .filter((p) => p.category === slug)
            .reduce<Date>((max, p) => {
              const d = new Date(p.updated_at)
              return d > max ? d : max
            }, new Date(0))
          entries.push({
            url: `${baseUrl}/annuaire/artisans/${slug}`,
            lastModified: catLastMod > new Date(0) ? catLastMod : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          })
        }
      }

      // Provider pages
      for (const p of providers) {
        entries.push({
          url: `${baseUrl}/annuaire/artisans/${p.category}/${p.slug}`,
          lastModified: new Date(p.updated_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // Silently skip if DB not available at build time.
    // Les categories ne seront pas dans le sitemap jusqu'au prochain build avec DB.
  }

  return entries
}
