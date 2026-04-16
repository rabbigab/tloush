import type { Metadata } from 'next'

/**
 * Audit #24 : /experts est actuellement une page "Annuaire en
 * construction" avec 0 profil reel. Tant que la table des experts
 * verifies n'est pas alimentee, on masque la page des moteurs de
 * recherche pour ne pas polluer les resultats Google avec une
 * landing vide.
 *
 * Quand >= 3 profils sont valides en prod :
 *  - Retirer `robots: { index: false }` de ce fichier
 *  - Retirer `/experts` de DISALLOW_ROUTES dans src/app/robots.ts
 *    (si present)
 *  - Re-ajouter `/experts` au sitemap (deja present, verifier)
 */
export const metadata: Metadata = {
  title: 'Experts francophones — Annuaire en construction',
  description:
    'Un annuaire d\'experts francophones en Israël (comptables, avocats, notaires, fiscalistes, assureurs, banquiers, conseillers immobiliers). Disponible prochainement.',
  robots: { index: false, follow: true },
}

export default function ExpertsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
