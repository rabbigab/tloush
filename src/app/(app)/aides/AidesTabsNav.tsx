'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Scale, Plane } from 'lucide-react'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

export type AidesTabSlug = 'aides' | 'travail' | 'olim'

interface TabDef {
  slug: AidesTabSlug
  label: string
  icon: LucideIcon
  description: string
}

export const AIDES_TABS: TabDef[] = [
  {
    slug: 'aides',
    label: 'Detecter mes aides',
    icon: Sparkles,
    description: 'Aides publiques auxquelles vous avez potentiellement droit (BTL, fiscales, olim, etc.)',
  },
  {
    slug: 'travail',
    label: 'Droits du travail',
    icon: Scale,
    description: 'Verifiez vos droits salaries (conges, pitzuim, primes, etc.)',
  },
  {
    slug: 'olim',
    label: 'Aides olim',
    icon: Plane,
    description: 'Questionnaire dedie aux nouveaux immigrants : sal klita, ulpan, douanes, hypotheque olim, etc.',
  },
]

interface Props {
  activeTab: AidesTabSlug
  /**
   * Pour les onglets gerees en in-page tab switch (aides + travail), un
   * callback qui change l'etat local du parent. Pour olim (sous-route
   * dediee), la navigation se fait via router.push.
   */
  onLocalTabChange?: (slug: 'aides' | 'travail') => void
}

/**
 * Navigation par onglets partagee entre /aides (hub) et /aides/olim.
 * - Onglets "aides" et "travail" : in-page tab switch via onLocalTabChange.
 * - Onglet "olim" : navigation reelle vers /aides/olim (sous-route).
 *
 * Le composant detecte automatiquement l'onglet actif via la prop activeTab.
 */
export default function AidesTabsNav({ activeTab, onLocalTabChange }: Props) {
  const router = useRouter()

  function handleClick(slug: AidesTabSlug) {
    if (slug === 'olim') {
      router.push('/aides/olim')
    } else if (activeTab === 'olim') {
      // depuis /aides/olim, retour vers /aides avec le tab voulu
      router.push(slug === 'aides' ? '/aides' : `/aides?tab=${slug}`)
    } else if (onLocalTabChange) {
      onLocalTabChange(slug)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
          Mes aides et droits
        </h1>
        <p className="text-sm text-neutral-600 dark:text-slate-400">
          {AIDES_TABS.find((t) => t.slug === activeTab)?.description}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Navigation entre aides, droits du travail et aides olim"
        className="flex gap-1 sm:gap-2 border-b border-neutral-200 dark:border-slate-700 overflow-x-auto"
      >
        {AIDES_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.slug
          return (
            <button
              key={tab.slug}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleClick(tab.slug)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap',
                isActive
                  ? 'border-brand-500 text-brand-700 dark:text-brand-300'
                  : 'border-transparent text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200'
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
