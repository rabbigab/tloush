'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const next = searchParams.get('next') || '/inbox'

    // Check for error params from Supabase/Google
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    if (errorParam) {
      setError(errorDescription || errorParam)
      return
    }

    // The Supabase client will automatically detect the auth response
    // (code param for PKCE or hash fragment for implicit flow)
    // and exchange it for a session
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Session established — redirect
        window.location.href = next
      }
    })

    // Also check if we already have a session (in case the event fired before listener was set)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = next
      }
    })

    // If the URL has a code param, exchange it manually
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('[auth/callback] Code exchange error:', error.message)
          setError('Erreur de connexion. Veuillez réessayer.')
        } else {
          window.location.href = next
        }
      })
    }

    // Timeout — if nothing happens after 10s, show error
    const timeout = setTimeout(() => {
      setError('La connexion a pris trop de temps. Veuillez réessayer.')
    }, 10000)

    return () => clearTimeout(timeout)
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
          <div className="text-3xl mb-4">&#9888;&#65039;</div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Erreur de connexion</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <a
            href="/auth/login"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 size={32} className="text-brand-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Connexion en cours...</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Veuillez patienter</p>
        </div>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="text-brand-600 animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
