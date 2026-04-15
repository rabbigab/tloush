'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator, Scale, Clock, ArrowRight, Bell, Check, Loader2 } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'comptable',
    label: 'Comptable / Expert-comptable',
    description: 'Fiches de paie, Bituah Leumi, impôts, retraite, cotisations sociales',
    icon: Calculator,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600',
    examples: [
      'Comprendre votre fiche de paie',
      'Optimiser votre déclaration fiscale',
      'Vérifier vos cotisations Bituah Leumi',
      'Analyser votre relevé de retraite',
    ],
  },
  {
    id: 'avocat',
    label: 'Avocat',
    description: 'Droit du travail, contrats, litiges, licenciement, droits des salariés',
    icon: Scale,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-600',
    examples: [
      'Vérifier un contrat de travail',
      'Contestation de licenciement',
      'Négocier vos conditions',
      'Comprendre vos droits en tant que salarié',
    ],
  },
]

function WaitlistBanner() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMessage('')
    try {
      const res = await fetch('/api/experts/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category: 'any' }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setErrorMessage(data.error || 'Erreur serveur, reessayez dans un instant.')
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setErrorMessage('Connexion impossible. Verifiez votre internet et reessayez.')
      setStatus('error')
    }
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Clock size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Annuaire en construction</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            Nous sélectionnons des professionnels francophones vérifiés. Les premiers profils arrivent bientôt.
          </p>
        </div>
      </div>

      {status === 'done' ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium">
          <Check size={16} />
          Vous serez prévenu par email dès que l&apos;annuaire sera disponible !
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Bell size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
            Prévenez-moi
          </button>
        </form>
      )}

      {status === 'error' && errorMessage && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  )
}

export default function ExpertsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 w-full">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Trouver un expert francophone</h1>
        <p className="text-sm text-slate-500">
          Des professionnels qui parlent français et connaissent le système israélien.
        </p>
      </div>

      {/* Coming soon banner + waitlist */}
      <WaitlistBanner />

      {/* Category cards */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <div
              key={cat.id}
              className={`rounded-2xl border p-5 transition-colors ${cat.color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 ${cat.iconColor}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{cat.label}</h2>
                  <p className="text-xs text-slate-500">{cat.description}</p>
                </div>
              </div>
              <div className="ml-13 space-y-1.5">
                {cat.examples.map((ex) => (
                  <p key={ex} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                    {ex}
                  </p>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-400 mt-3 ml-13">
                Profils disponibles prochainement
              </p>
            </div>
          )
        })}
      </div>

      {/* CTA for professionals */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white text-center shadow-md">
        <h2 className="font-bold text-lg mb-1">Vous êtes professionnel francophone ?</h2>
        <p className="text-brand-100 text-sm mb-4">
          Rejoignez Tloush et connectez-vous avec des clients francophones en Israël qui ont besoin de votre expertise.
        </p>
        <Link
          href="/experts/rejoindre"
          className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          Devenir expert référencé
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
