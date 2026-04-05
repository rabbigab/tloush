import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
