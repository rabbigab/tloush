import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Immobilier Israel — Annonces Yad2 + Facebook | Tloush',
  description:
    'Toutes les annonces immobilieres en Israel au meme endroit. Yad2, Facebook, groupes francophones. Carte interactive, filtres avances.',
  keywords: [
    'immobilier israel',
    'location appartement israel',
    'yad2 francais',
    'appartement tel aviv',
    'louer israel',
    'acheter israel',
    'annonces immobilieres israel',
  ],
}

export default function ImmobilierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
