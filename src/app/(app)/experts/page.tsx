'use client'

import Link from 'next/link'
import { Calculator, Scale, Clock, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'comptable',
    label: 'Comptable / Expert-comptable',
    description: 'Fiches de paie, Bituah Leumi, impots, retraite, cotisations sociales',
    icon: Calculator,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600',
    examples: [
      'Comprendre votre fiche de paie',
      'Optimiser votre declaration fiscale',
      'Verifier vos cotisations Bituah Leumi',
      'Analyser votre releve de retraite',
    ],
  },
  {
    id: 'avocat',
    label: 'Avocat',
    description: 'Droit du travail, contrats, litiges, licenciement, droits des salaries',
    icon: Scale,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-600',
    examples: [
      'Verifier un contrat de travail',
      'Contestation de licenciement',
      'Negocier vos conditions',
      'Comprendre vos droits en tant que salarie',
    ],
  },
]

export default function ExpertsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 w-full">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Trouver un expert francophone</h1>
        <p className="text-sm text-slate-500">
          Des professionnels qui parlent francais et connaissent le systeme israelien.
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Annuaire en construction</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Nous selectionnons des professionnels francophones verifies. Les premiers profils arrivent bientot.
          </p>
        </div>
      </div>

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
        <h2 className="font-bold text-lg mb-1">Vous etes professionnel francophone ?</h2>
        <p className="text-blue-100 text-sm mb-4">
          Rejoignez Tloush et connectez-vous avec des clients francophones en Israel qui ont besoin de votre expertise.
        </p>
        <Link
          href="/experts/rejoindre"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Devenir expert reference
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
