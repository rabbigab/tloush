import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const PROVIDER_CATEGORY_SLUGS = ['plombier', 'electricien', 'peintre', 'serrurier', 'climatisation', 'bricoleur']

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
    '/droits-olim',
    '/modeles',
    '/scanner',
    '/experts',
    '/privacy',
    '/cgv',
    '/mentions-legales',
    '/annuaire',
    '/annuaire/inscription',
  ]

  const entries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly' as const,
    priority: route === '' ? 1 : route === '/annuaire' ? 0.9 : 0.7,
  }))

  // Category pages
  for (const slug of PROVIDER_CATEGORY_SLUGS) {
    entries.push({
      url: `${baseUrl}/annuaire/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Provider pages (fetch from DB)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: providers } = await supabase
      .from('providers')
      .select('slug, category, updated_at')
      .eq('status', 'active')

    if (providers) {
      for (const p of providers) {
        entries.push({
          url: `${baseUrl}/annuaire/${p.category}/${p.slug}`,
          lastModified: new Date(p.updated_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // Silently skip if DB not available at build time
  }

  return entries
}
