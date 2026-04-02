'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/inbox'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Connexion</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="vous@email.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 placeholder-slate-400"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:underline font-medium">
            Mot de passe oublie ?
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.99]"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link href="/auth/register" className="text-brand-600 hover:underline font-medium">
          Creer un compte
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-extrabold text-brand-600">Tloush</h1>
            <p className="text-slate-500 text-sm mt-1">Votre assistant administratif en Israel</p>
          </Link>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-xs text-slate-400 mt-4">
          <Link href="/privacy" className="underline hover:text-slate-500">Politique de confidentialite</Link>
        </p>
      </div>
    </div>
  )
}
