'use client'

import { useEffect, Suspense } from 'react'
import { usePathname } from 'next/navigation'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let sid = localStorage.getItem('tloush_sid')
    if (!sid) {
      sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('tloush_sid', sid)
    }
    return sid
  } catch {
    return ''
  }
}

function Tracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    // Ignore admin and api paths
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    const sessionId = getOrCreateSessionId()
    const referrer = typeof document !== 'undefined' ? document.referrer : ''

    // Fire and forget
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: referrer || null,
        session_id: sessionId,
      }),
      keepalive: true,
    }).catch(() => {
      // silently fail
    })
  }, [pathname])

  return null
}

export default function VisitorTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  )
}
