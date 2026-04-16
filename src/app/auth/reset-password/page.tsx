'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

type SessionStatus = 'checking' | 'valid' | 'invalid'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  // Guard : la page ne doit etre accessible que via un lien de
  // reinitialisation valide (Supabase pose une session de type
  // recovery apres le clic sur le magic link envoye par email).
  // Si aucune session, on affiche une erreur explicite et on
  // redirige vers /auth/forgot-password.
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('checking')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setSessionStatus(data.session ? 'valid' : 'invalid')
    })
  }, [])

  const passwordLength = password.length
  const passwordStrong = passwordLength >= 8
  const passwordsMatch = password === confirm && confirm.length > 0

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

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
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message === 'New password should be different from the old password.'
        ? 'Le nouveau mot de passe doit etre different de l\'ancien'
        : 'Une erreur est survenue. Reessayez ou demandez un nouveau lien.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (sessionStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <Loader2 size={28} className="animate-spin text-brand-600 dark:text-brand-400 mx-auto mb-4" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Verification du lien de reinitialisation...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (sessionStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-3">
              <Image src="/logo.png" alt="Tloush" width={1024} height={1024} className="h-20 sm:h-24 w-auto" unoptimized priority />
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Lien invalide ou expire</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Ce lien de reinitialisation n&apos;est plus valable. Les liens expirent au bout d&apos;une heure. Demandez un nouveau lien.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Demander un nouveau lien
            </Link>
            <Link
              href="/auth/login"
              className="inline-block mt-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Retour a la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Mot de passe modifie</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Votre mot de passe a ete mis a jour. Redirection en cours...
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

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Nouveau mot de passe</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Minimum 8 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                autoFocus
              />
              {passwordLength > 0 && (
                <p className={`text-xs mt-1.5 ${passwordStrong ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {passwordStrong ? '✓ Mot de passe valide' : `${passwordLength}/8 caracteres minimum`}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
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
              {loading ? 'Mise a jour...' : 'Mettre a jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
