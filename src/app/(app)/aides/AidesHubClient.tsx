'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import RightsDetectorClient from './RightsDetectorClient'
import RightsCheckClient from './RightsCheckClient'
import AidesTabsNav from './AidesTabsNav'

type LocalTab = 'aides' | 'travail'

interface Props {
  initialTab: LocalTab
  profileComplete: boolean
}

/**
 * Hub /aides regroupant 3 outils :
 * - "Detecter mes aides" (RightsDetectorClient) : in-page tab
 * - "Droits du travail" (RightsCheckClient) : in-page tab
 * - "Aides olim" : sous-route /aides/olim (navigation via AidesTabsNav)
 *
 * Les 2 premiers tabs sont rendus par switch interne ; olim est une route
 * dediee. Synchronise l'URL (?tab=travail) pour le partage de lien.
 */
export default function AidesHubClient({ initialTab, profileComplete }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<LocalTab>(initialTab)

  // Synchronise l'URL ?tab= avec l'etat local sans recharger.
  useEffect(() => {
    const current = searchParams.get('tab')
    if (activeTab === 'aides' && current) {
      router.replace(pathname, { scroll: false })
    } else if (activeTab !== 'aides' && current !== activeTab) {
      const params = new URLSearchParams(searchParams)
      params.set('tab', activeTab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [activeTab, pathname, router, searchParams])

  const handleLocalTabChange = useCallback((slug: LocalTab) => {
    setActiveTab(slug)
  }, [])

  return (
    <div>
      <AidesTabsNav activeTab={activeTab} onLocalTabChange={handleLocalTabChange} />

      <div hidden={activeTab !== 'aides'}>
        {activeTab === 'aides' && <RightsDetectorClient profileComplete={profileComplete} />}
      </div>
      <div hidden={activeTab !== 'travail'}>
        {activeTab === 'travail' && <RightsCheckClient />}
      </div>
    </div>
  )
}
