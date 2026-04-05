'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    track('error_boundary_hit', { error: error.message, digest: error.digest })
  }, [error])

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#f8fafc' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              Erreur critique
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
              L&apos;application a rencontré une erreur inattendue. Notre équipe a été notifiée et travaille à résoudre le problème.
            </p>
            <button
              onClick={reset}
              style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}
            >
              Recharger l&apos;application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
