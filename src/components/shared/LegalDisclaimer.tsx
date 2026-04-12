'use client'

import { AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type DisclaimerLevel = 'beta' | 'estimate' | 'legal_advice' | 'informational'

interface LegalDisclaimerProps {
  level: DisclaimerLevel
  topic: string
  official_url?: string
  official_label?: string
  expert_url?: string
  expert_label?: string
}

/**
 * Disclaimer legal force pour les features qui donnent des chiffres
 * ou des informations legales / fiscales.
 *
 * IMPORTANT : Tloush est un outil d'aide a la comprehension et NON
 * un conseil juridique ou fiscal. Les calculs sont des estimations
 * basees sur les regles publiques, mais chaque cas est unique.
 */
export default function LegalDisclaimer({
  level,
  topic,
  official_url,
  official_label = 'Source officielle',
  expert_url = '/experts',
  expert_label = 'Consulter un expert',
}: LegalDisclaimerProps) {
  const config = {
    beta: {
      bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Fonctionnalite en beta',
      body: `Cette fonctionnalite est en beta. Les calculs sont bases sur les regles publiques ${topic}, mais peuvent contenir des erreurs ou ne pas couvrir tous les cas particuliers. **Ne vous basez jamais uniquement sur Tloush pour prendre une decision officielle.**`,
    },
    estimate: {
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Estimation indicative uniquement',
      body: `Ces chiffres sont une **estimation indicative** basee sur les baremes publics ${topic}. Chaque situation est unique. **Tloush n'est pas un conseil fiscal ou juridique.** Pour une demande officielle, verifiez aupres de la source ou consultez un professionnel.`,
    },
    legal_advice: {
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-600 dark:text-red-400',
      title: 'Ne remplace pas un conseil professionnel',
      body: `Les informations concernant ${topic} sont complexes et individuelles. Tloush vous donne des pistes mais **ne remplace JAMAIS** un avocat, comptable ou yoetz mas. Avant toute demarche impliquant de l'argent ou des droits legaux, consultez un professionnel.`,
    },
    informational: {
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'A titre informatif',
      body: `Ces informations sont donnees a titre informatif. Les regles ${topic} peuvent evoluer. Verifiez la source officielle avant toute demarche.`,
    },
  }[level]

  return (
    <div className={`border rounded-xl p-4 ${config.bg}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold mb-1 ${config.text}`}>{config.title}</p>
          <p className={`text-sm ${config.text}`}>
            {config.body.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
            )}
          </p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {official_url && (
              <a
                href={official_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs font-semibold underline inline-flex items-center gap-1 ${config.text}`}
              >
                {official_label} <ExternalLink size={10} />
              </a>
            )}
            {expert_url && (
              <Link
                href={expert_url}
                className={`text-xs font-semibold underline inline-flex items-center gap-1 ${config.text}`}
              >
                {expert_label} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Badge BETA pour le header des pages sensibles
 */
export function BetaBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 px-2 py-1 rounded-full">
      BETA
    </span>
  )
}
