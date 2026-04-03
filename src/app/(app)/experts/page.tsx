'use client'

import Link from 'next/link'
import { Calculator, Scale, Clock, ArrowRight } from 'lucide-react'

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
      'Analyser votre releve de retraite',
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
          Des professionnels qui parlent français et connaissent le système israélien.
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Annuaire en construction</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Nous sélectionnons des professionnels francophones vérifiés. Les premiers profils arrivent bientôt.
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
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white text-center shadow-md">
        <h2 className="font-bold text-lg mb-1">Vous êtes professionnel francophone ?</h2>
        <p className="text-brand-100 text-sm mb-4">
          Rejoignez Tloush et connectez-vous avec des clients francophones en Israël qui ont besoin de votre expertise.
        </p>
        <Link
          href="/experts/rejoindre"
          className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          Devenir expert reference
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
