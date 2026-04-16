import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Devenir prestataire francophone | Tloush Recommande' },
  description:
    'Inscrivez-vous gratuitement sur l\'annuaire Tloush Recommande. Recevez des clients francophones qualifies en Israel. Sans commission.',
}

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children
}
