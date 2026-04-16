import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Home, Mail, ArrowLeft } from 'lucide-react'

/**
 * Landing "en construction" pour /immobilier.
 *
 * Audit #11 : la page precedente tentait de charger les annonces
 * Yad2/Facebook via un store Zustand + carte Leaflet, mais :
 *  - 0 annonce en DB (table `listings` vide ou feature non activee)
 *  - Fragments de rendu non hydrates visibles dans le DOM
 *  - Message d'erreur "Aucune annonce trouvee" meme sans filtre
 *
 * Le store, les composants (ListingsMap, ListingCard, ListingsFilters,
 * ListingsPagination) et l'API de listings sont conserves tels quels
 * dans le repo pour etre reactives quand la feature sera prete
 * (scraping Yad2 + dataset populate).
 *
 * D'ici la, cette page :
 *  - est noindex (voir layout.tsx)
 *  - n'est plus listee dans la nav (src/components/layout/Header.tsx)
 *  - n'est plus dans le sitemap
 *  - affiche une landing propre avec contact
 */
export default function ImmobilierPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-950/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Home size={28} className="text-brand-600 dark:text-brand-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-slate-100 mb-4">
            Immobilier Israël
          </h1>

          <p className="text-neutral-600 dark:text-slate-300 mb-8 leading-relaxed">
            Nous préparons un annuaire d&apos;annonces immobilières en Israël
            regroupant Yad2, Facebook et les groupes francophones, avec
            filtres avancés et carte interactive.
          </p>

          <div className="bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
            <p className="text-sm font-semibold text-neutral-800 dark:text-slate-200 mb-2">
              Disponible prochainement
            </p>
            <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
              Vous cherchez un appartement francophone en Israël dès maintenant ?
              Écrivez-nous à{' '}
              <a
                href="mailto:contact@tloush.com?subject=Immobilier%20%E2%80%94%20inscription%20liste%20d%27attente"
                className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 underline hover:text-brand-700"
              >
                <Mail size={12} />
                contact@tloush.com
              </a>
              {' '}pour être prévenu du lancement.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
