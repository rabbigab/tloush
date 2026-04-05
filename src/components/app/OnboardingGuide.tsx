'use client'

import { useEffect, useState } from 'react'
import { X, Upload, Wallet, Folder, Bell, ArrowRight, ArrowLeft } from 'lucide-react'
import { track } from '@/lib/analytics'

const STORAGE_KEY = 'tloush_onboarding_dismissed_v1'

const STEPS = [
  {
    icon: Upload,
    title: 'Bienvenue sur Tloush 👋',
    description:
      'Votre copilote administratif pour Israël. Uploadez un document en hébreu (fiche de paie, facture, courrier officiel…) et Tloush vous l\'explique en français.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: Wallet,
    title: 'Suivez vos dépenses',
    description:
      'À chaque facture scannée, Tloush détecte les dépenses récurrentes et vous alerte si un montant augmente anormalement. Consultez la page Dépenses.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Folder,
    title: 'Vos dossiers vivants',
    description:
      'Tloush regroupe automatiquement les documents par émetteur (Arnona, Bituah Leumi, CNAM…) pour que vous retrouviez tout en un clic.',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Bell,
    title: 'Jamais plus d\'oubli',
    description:
      'Les échéances et actions urgentes sont extraites automatiquement. Vous recevez des rappels par email avant la date limite.',
    gradient: 'from-amber-500 to-orange-500',
  },
]

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      // Small delay so the guide feels intentional, not a jumpscare
      const t = setTimeout(() => {
        setVisible(true)
        track('onboarding_started')
      }, 600)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    }
    const completed = step === STEPS.length - 1
    track(completed ? 'onboarding_completed' : 'onboarding_dismissed', { step: step + 1 })
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Fermer le guide"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${current.gradient} flex items-center justify-center text-white shadow-md mb-5`}
          >
            <Icon size={26} />
          </div>

          <h2
            id="onboarding-title"
            className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2"
          >
            {current.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-6 bg-blue-600 dark:bg-blue-400'
                  : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Aller à l'étape ${i + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : dismiss())}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            {step > 0 ? (
              <>
                <ArrowLeft size={16} />
                Précédent
              </>
            ) : (
              'Passer'
            )}
          </button>

          <button
            onClick={() => (isLast ? dismiss() : setStep(step + 1))}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            {isLast ? 'Commencer' : 'Suivant'}
            {!isLast && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
