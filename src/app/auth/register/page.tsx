'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Gift } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    track('signup_started', { method: 'email' })
    // Store referral code for Google OAuth flow (params are lost during redirect)
    if (refCode) localStorage.setItem('tloush_referral_code', refCode)
  }, [refCode])

  async function handleGoogleLogin() {
    track('signup_started', { method: 'google' })
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/inbox`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const passwordLength = password.length
  const passwordStrong = passwordLength >= 8
  const passwordsMatch = password === confirm && confirm.length > 0

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!phone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone')
      setLoading(false)
      return
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phone.trim() || undefined,
          referral_code: refCode || undefined,
        },
      },
    })

    if (error) {
      track('signup_failed', { message: error.message })
      setError(error.message)
      setLoading(false)
      return
    }

    track('signup_completed', { method: 'email' })
    setRedirecting(true)
    // Redirect directly to inbox — no email verification needed
    window.location.href = '/inbox'
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <Loader2 size={32} className="animate-spin text-brand-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Compte créé !</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Redirection vers votre espace...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <Image src="/logo.png" alt="Tloush" width={1024} height={1024} className="h-20 sm:h-24 w-auto" unoptimized priority />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Votre assistant administratif en Israel</p>
          </Link>
        </div>

        {refCode && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Gift size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Vous avez été parrainé !</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Créez votre compte pour profiter de vos analyses gratuites.</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Créer un compte</h2>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl transition-colors"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            S&apos;inscrire avec Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-800 px-4 text-slate-400 dark:text-slate-500">ou</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="vous@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Téléphone
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="+972 ou +33..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Israélien, français ou autre — pour vous contacter si besoin</p>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mot de passe
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Minimum 8 caractères"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              {passwordLength > 0 && (
                <p className={`text-xs mt-1.5 ${passwordStrong ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {passwordStrong ? '✓ Mot de passe valide' : `${passwordLength}/8 caractères minimum`}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="reg-confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              {confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs mt-1.5 text-red-600 dark:text-red-400">Les mots de passe ne correspondent pas</p>
              )}
              {passwordsMatch && (
                <p className="text-xs mt-1.5 text-green-600 dark:text-green-400">✓ Les mots de passe correspondent</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.99]"
            >
              {loading ? 'Creation...' : 'Creer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-brand-600 hover:underline font-medium">
              Se connecter
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          En creant un compte, vous acceptez notre{' '}
          <Link href="/privacy" className="underline hover:text-slate-500 dark:hover:text-slate-300">politique de confidentialité</Link>.
        </p>
      </div>
    </div>
  )
}
