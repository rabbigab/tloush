'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
          Oups, une erreur est survenue
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
          Quelque chose s'est mal passé de notre côté. Notre équipe a été notifiée automatiquement.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono">
            Code : {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 px-5 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Home size={16} />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
