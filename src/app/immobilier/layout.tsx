import type { Metadata } from 'next'

// Audit #11 : la page /immobilier est actuellement vide (0 listing
// en DB) et affichait des fragments de rendu non hydrates. Tant que
// la feature n'est pas operationnelle, on la masque des moteurs de
// recherche (noindex) et on l'affiche comme landing "en construction"
// avec formulaire de capture email.
// Quand la feature est prete (dataset populate + fix du rendu),
// retirer le `robots: noindex` + retirer /immobilier du robots.ts
// + re-ajouter dans le sitemap + Header nav.
export const metadata: Metadata = {
  title: 'Immobilier Israel — Bientôt disponible',
  description:
    'Un annuaire d\'annonces immobilières en Israël avec filtres et carte interactive, regroupant Yad2, Facebook et groupes francophones. Disponible prochainement.',
  robots: { index: false, follow: true },
}

export default function ImmobilierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
