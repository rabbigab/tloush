'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Scale } from 'lucide-react'
import clsx from 'clsx'
import RightsDetectorClient from './RightsDetectorClient'
import RightsCheckClient from './RightsCheckClient'

type TabSlug = 'aides' | 'travail'

interface Props {
  initialTab: TabSlug
  profileComplete: boolean
}

const TABS: Array<{ slug: TabSlug; label: string; icon: typeof Sparkles; description: string }> = [
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
]

/**
 * Hub unique /aides regroupant deux outils historiquement separes :
 * - /rights-detector (scan profil -> aides publiques eligibles)
 * - /rights-check (calcul droits salarie base sur employeeRights.ts)
 *
 * Les deux logiques restent independantes dans leurs clients respectifs.
 * Ce composant gere uniquement la navigation par onglets + l'URL
 * synchronisee (?tab=aides|travail) pour permettre les deep-links.
 */
export default function AidesHubClient({ initialTab, profileComplete }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabSlug>(initialTab)

  // Synchronise l'URL (?tab=...) quand l'utilisateur change d'onglet,
  // sans recharger la page. Permet aussi le partage du lien.
  useEffect(() => {
    const current = searchParams.get('tab')
    if (activeTab === 'aides' && current) {
      // onglet par defaut -> URL propre sans query string
      router.replace(pathname, { scroll: false })
    } else if (activeTab !== 'aides' && current !== activeTab) {
      const params = new URLSearchParams(searchParams)
      params.set('tab', activeTab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [activeTab, pathname, router, searchParams])

  const handleTabChange = useCallback((slug: TabSlug) => {
    setActiveTab(slug)
  }, [])

  return (
    <div>
      {/* Tabs header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            Mes aides et droits
          </h1>
          <p className="text-sm text-neutral-600 dark:text-slate-400">
            {TABS.find((t) => t.slug === activeTab)?.description}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Navigation entre aides et droits du travail"
          className="flex gap-1 sm:gap-2 border-b border-neutral-200 dark:border-slate-700"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.slug
            return (
              <button
                key={tab.slug}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.slug}`}
                id={`tab-${tab.slug}`}
                onClick={() => handleTabChange(tab.slug)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
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

      {/* Panels */}
      <div
        role="tabpanel"
        id="panel-aides"
        aria-labelledby="tab-aides"
        hidden={activeTab !== 'aides'}
      >
        {activeTab === 'aides' && <RightsDetectorClient profileComplete={profileComplete} />}
      </div>
      <div
        role="tabpanel"
        id="panel-travail"
        aria-labelledby="tab-travail"
        hidden={activeTab !== 'travail'}
      >
        {activeTab === 'travail' && <RightsCheckClient />}
      </div>
    </div>
  )
}
