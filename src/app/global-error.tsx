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
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Une erreur est survenue
            </h2>
            <p className="text-gray-600 mb-6">
              Nous sommes désolés, quelque chose s'est mal passé. Notre équipe a été notifiée.
            </p>
            <button
              onClick={reset}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
