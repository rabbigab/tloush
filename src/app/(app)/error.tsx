'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { track } from '@/lib/analytics'

export default function AppError({
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
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Oups, une erreur est survenue
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Pas de panique, notre équipe a été notifiée. Vous pouvez réessayer ou retourner à l&apos;accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Home size={16} />
            Mon inbox
          </Link>
        </div>
      </div>
    </div>
  )
}
