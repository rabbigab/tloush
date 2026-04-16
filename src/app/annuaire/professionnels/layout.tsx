import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

/**
 * Audit #24 : /annuaire/professionnels (ex-/experts) est actuellement
 * une page "Annuaire en construction" avec 0 profil reel. Tant que la
 * table des experts verifies n'est pas alimentee, on masque la page
 * des moteurs de recherche pour ne pas polluer les resultats Google
 * avec une landing vide.
 *
 * Quand >= 3 profils sont valides en prod :
 *  - Retirer `robots: { index: false }` de ce fichier
 *  - Retirer `/annuaire/professionnels` de DISALLOW_ROUTES dans robots.ts
 *  - Re-ajouter la route au sitemap
 */
export const metadata: Metadata = {
  title: 'Professionnels francophones — Annuaire en construction',
  description:
    'Un annuaire d\'experts francophones en Israël (comptables, avocats, notaires, fiscalistes, assureurs, banquiers, conseillers immobiliers). Disponible prochainement.',
  robots: { index: false, follow: true },
}

export default function ProfessionnelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
