'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      setError('Une erreur est survenue. Verifiez votre email et reessayez.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Email envoye</h2>
              <p className="text-sm text-slate-500 mb-1">
                Si un compte existe avec <strong>{email}</strong>, vous recevrez un lien pour reinitialiser votre mot de passe.
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Verifiez aussi vos spams si vous ne voyez pas l&apos;email.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:underline text-sm font-medium"
              >
                <ArrowLeft size={14} />
                Retour a la connexion
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
              >
                <ArrowLeft size={14} />
                Retour
              </Link>

              <h2 className="text-xl font-bold text-slate-900 mb-2">Mot de passe oublie ?</h2>
              <p className="text-sm text-slate-500 mb-6">
                Entrez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="vous@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 placeholder-slate-400"
                    autoFocus
                  />
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
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
