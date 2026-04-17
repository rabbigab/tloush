import { MetadataRoute } from 'next'

/**
 * Fichier robots.txt genere dynamiquement depuis Next.js (Q2.5 / audit #27).
 *
 * Motivation : le fichier statique public/robots.txt tendait a divergeer
 * avec le vrai routing. Exemple dans l'audit :
 *  - /inbox etait Disallow alors que la route redirige desormais vers
 *    /dashboard (pattern legacy).
 *  - Des routes authentifiees comme /folders, /expenses, /bank-import,
 *    /rights-check, /freelance, /mashkanta, /search, /help n'etaient
 *    pas listees alors qu'elles existent en (app)/.
 *
 * Ce fichier declare la source de verite ici, synchronisee avec la
 * structure (app)/ reelle. La liste est inspiree des PROTECTED_ROUTES
 * du middleware (voir src/middleware.ts).
 */

// Routes qui nécessitent l'auth et ne doivent pas être crawlées.
// NOTE : à synchroniser avec PROTECTED_ROUTES de src/middleware.ts.
// Un test d'integrite pourrait importer les 2 listes et verifier qu'elles
// correspondent (hors scope minimal de ce fix).
const DISALLOW_ROUTES = [
  '/api/',
  '/auth/',
  // Zone authentifiee (app)/ — alignee avec middleware PROTECTED_ROUTES.
  // Note: tous les slugs ont ete francises (P2). Anciens chemins
  // /assistant, /compare, /folders, /search, /referral, /bank-import,
  // /inbox sont rediriges 308 par next.config.js (pas indexables).
  '/assistant-ia',
  '/profile',
  '/dashboard',
  '/comparer-fiches',
  '/documents',
  '/mes-documents',
  '/expenses',
  '/recherche',
  '/admin',
  '/aides',
  '/parrainage',
  '/letters',
  '/freelance',
  '/mashkanta',
  '/assurances',
  '/import-bancaire',
  '/miluim',
  '/family',
  '/payslips',
  // Pages vides ou en construction — noindex additionnel via leur
  // metadata.robots respective, mais on les cache aussi ici.
  '/immobilier',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_ROUTES,
      },
    ],
    sitemap: 'https://tloush.com/sitemap.xml',
    host: 'https://tloush.com',
  }
}
