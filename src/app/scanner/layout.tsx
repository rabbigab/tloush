import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scanner de documents hébreux',
  description:
    'Analysez vos documents hébreux en quelques secondes : contrats, lettres officielles, avis d\'imposition, baux, lettres de licenciement. IA spécialisée Israël.',
  openGraph: {
    title: 'Scanner de documents hébreux',
    description: 'Analyse IA de vos documents israéliens en français.',
    type: 'website',
  },
}

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return children
}
