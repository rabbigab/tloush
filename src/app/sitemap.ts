import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tloush.com'

  const staticPages = [
    '',
    '/calculateurs',
    '/calculateurs/brut-net',
    '/calculateurs/conges',
    '/calculateurs/maternite',
    '/calculateurs/indemnites',
    '/droits',
    '/droits-olim',
    '/modeles',
    '/scanner',
    '/privacy',
  ]

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
