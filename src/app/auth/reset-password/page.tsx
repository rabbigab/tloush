'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

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
      router.push('/inbox')
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Mot de passe modifie</h2>
            <p className="text-sm text-slate-500">
              Votre mot de passe a ete mis a jour. Redirection en cours...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-extrabold text-brand-600">Tloush</h1>
            <p className="text-slate-500 text-sm mt-1">Votre assistant administratif en Israel</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Nouveau mot de passe</h2>
          <p className="text-sm text-slate-500 mb-6">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Minimum 8 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 placeholder-slate-400"
                autoFocus
              />
              {passwordLength > 0 && (
                <p className={`text-xs mt-1.5 ${passwordStrong ? 'text-green-600' : 'text-amber-600'}`}>
                  {passwordStrong ? '✓ Mot de passe valide' : `${passwordLength}/8 caracteres minimum`}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
              {confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs mt-1.5 text-red-600">Les mots de passe ne correspondent pas</p>
              )}
              {passwordsMatch && (
                <p className="text-xs mt-1.5 text-green-600">✓ Les mots de passe correspondent</p>
              )}
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
              {loading ? 'Mise a jour...' : 'Mettre a jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
