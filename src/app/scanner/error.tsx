'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function ScannerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[scanner] Error boundary hit:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-neutral-50">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-600" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
          Le scanner a rencontré un problème
        </h1>
        <p className="text-sm text-slate-500 mb-2 leading-relaxed">
          Impossible d&apos;afficher les résultats de l&apos;analyse. Réessayez avec un autre document
          ou contactez le support si le problème persiste.
        </p>
        {error.message && (
          <p className="text-xs text-slate-400 mb-2 font-mono break-all">
            {error.message}
          </p>
        )}
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6 font-mono">
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
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-700 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <Home size={16} />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
