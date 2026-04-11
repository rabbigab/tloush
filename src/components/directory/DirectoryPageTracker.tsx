'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

type DirectoryEvent =
  | 'directory_viewed'
  | 'directory_category_viewed'
  | 'directory_provider_viewed'

interface Props {
  event: DirectoryEvent
  properties?: Record<string, unknown>
}

export default function DirectoryPageTracker({ event, properties }: Props) {
  useEffect(() => {
    track(event, properties)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
