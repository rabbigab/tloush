import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donner votre avis | Tloush Recommande',
  description: 'Notez votre experience avec un prestataire francophone. Votre avis aide la communaute.',
  robots: { index: false, follow: false },
}

export default function AvisLayout({ children }: { children: React.ReactNode }) {
  return children
}
