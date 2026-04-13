'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { X, Upload, MessageSquare, FolderOpen, Bell, Sparkles, ArrowRight, ArrowLeft, ArrowUp, CheckCircle2 } from 'lucide-react'
import { track } from '@/lib/analytics'

const STORAGE_KEY = 'tloush_onboarding_v2'

interface OnboardingStep {
  id: string
  icon: React.ElementType
  title: string
  description: string
  gradient: string
  highlight?: string // CSS selector or ID to highlight
  position?: 'center' | 'bottom' | 'top' // tooltip position relative to highlight
  cta?: string
  ctaAction?: 'next' | 'upload' | 'navigate'
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Bienvenue sur Tloush !',
    description: 'Vous recevez des documents en hébreu et vous ne comprenez pas tout ? Tloush les analyse et vous les explique en français. Essayons ensemble !',
    gradient: 'from-blue-500 to-indigo-600',
    cta: 'C\'est parti !',
    ctaAction: 'next',
  },
  {
    id: 'upload',
    icon: Upload,
    title: 'Envoyez votre premier document',
    description: 'Cliquez sur la zone en pointillés ci-dessus pour envoyer une fiche de paie, une facture, un courrier officiel... En photo ou en PDF, ça marche !',
    gradient: 'from-brand-500 to-brand-600',
    highlight: 'upload-zone',
    position: 'bottom',
    cta: 'J\'envoie mon document',
    ctaAction: 'upload',
  },
  {
    id: 'analysis',
    icon: CheckCircle2,
    title: 'Analyse en quelques secondes',
    description: 'Tloush lit chaque ligne, extrait les montants, vérifie la conformité et vous résume tout en français. Les points importants sont surlignés automatiquement.',
    gradient: 'from-emerald-500 to-teal-600',
    cta: 'Suivant',
    ctaAction: 'next',
  },
  {
    id: 'assistant',
    icon: MessageSquare,
    title: 'Posez vos questions',
    description: 'Vous ne comprenez pas une ligne ? L\'assistant IA répond à toutes vos questions sur vos documents, en français. "C\'est quoi ביטוח לאומי ?" — il vous explique !',
    gradient: 'from-violet-500 to-purple-600',
    cta: 'Suivant',
    ctaAction: 'next',
  },
  {
    id: 'features',
    icon: Bell,
    title: 'Et bien plus encore...',
    description: 'Rappels avant les échéances, suivi des dépenses, dossiers automatiques, détection d\'anomalies sur vos fiches de paie. Tout est automatique.',
    gradient: 'from-amber-500 to-orange-500',
    cta: 'Commencer',
    ctaAction: 'next',
  },
]

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return

    // Show on dashboard (entry page after login)
    if (!pathname?.includes('/dashboard')) return

    const t = setTimeout(() => {
      setVisible(true)
      track('onboarding_v2_started')
    }, 800)
    return () => clearTimeout(t)
  }, [pathname])

  // Update highlight position when step changes
  const updateHighlight = useCallback(() => {
    const current = STEPS[step]
    if (!current?.highlight) {
      setHighlightRect(null)
      return
    }
    const el = document.getElementById(current.highlight)
    if (el) {
      setHighlightRect(el.getBoundingClientRect())
    } else {
      setHighlightRect(null)
    }
  }, [step])

  useEffect(() => {
    if (!visible) return
    updateHighlight()
    window.addEventListener('resize', updateHighlight)
    window.addEventListener('scroll', updateHighlight)
    return () => {
      window.removeEventListener('resize', updateHighlight)
      window.removeEventListener('scroll', updateHighlight)
    }
  }, [visible, updateHighlight])

  function dismiss() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dismissed_at: new Date().toISOString(),
        completed: step === STEPS.length - 1,
        last_step: step,
      }))
    }
    const completed = step === STEPS.length - 1
    track(completed ? 'onboarding_v2_completed' : 'onboarding_v2_dismissed', { step: step + 1 })
    setVisible(false)
  }

  function goNext() {
    if (step === STEPS.length - 1) {
      dismiss()
      return
    }
    setStep(step + 1)
    track('onboarding_v2_step', { step: step + 2 })
  }

  function handleCta() {
    const current = STEPS[step]
    if (current.ctaAction === 'upload') {
      // Trigger click on the upload zone
      const uploadBtn = document.getElementById('upload-zone')
      if (uploadBtn) {
        dismiss()
        uploadBtn.click()
      } else {
        goNext()
      }
    } else {
      goNext()
    }
  }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1
  const showHighlight = highlightRect && current.highlight

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] transition-opacity duration-300">
        {showHighlight ? (
          // SVG mask that cuts out the highlighted element
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="onboarding-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="16"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(15, 23, 42, 0.65)"
              mask="url(#onboarding-mask)"
            />
            {/* Pulsing border around highlighted element */}
            <rect
              x={highlightRect.left - 8}
              y={highlightRect.top - 8}
              width={highlightRect.width + 16}
              height={highlightRect.height + 16}
              rx="16"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        ) : (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        )}
      </div>

      {/* Tooltip / Card */}
      <div
        className="fixed z-[61] px-4"
        style={showHighlight ? {
          top: current.position === 'top'
            ? highlightRect.top - 16
            : highlightRect.bottom + 16,
          left: Math.max(16, Math.min(
            highlightRect.left + highlightRect.width / 2 - 192,
            window.innerWidth - 400
          )),
          transform: current.position === 'top' ? 'translateY(-100%)' : undefined,
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden animate-slideUp">
          {/* Arrow pointing to highlighted element */}
          {showHighlight && current.position === 'bottom' && (
            <div className="flex justify-center -mt-2">
              <ArrowUp size={20} className="text-blue-500 animate-bounce" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors z-10"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>

          <div className="p-5 sm:p-6">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-8 bg-blue-600 dark:bg-blue-400'
                      : i < step
                      ? 'w-4 bg-blue-300 dark:bg-blue-700'
                      : 'w-4 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
              <span className="ml-auto text-[10px] text-slate-400 font-medium">{step + 1}/{STEPS.length}</span>
            </div>

            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${current.gradient} flex items-center justify-center text-white shadow-lg mb-4`}
            >
              <Icon size={24} />
            </div>

            {/* Content */}
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              {current.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 px-5 pb-5 sm:px-6 sm:pb-6">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : dismiss())}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              {step > 0 ? (
                <>
                  <ArrowLeft size={15} />
                  Retour
                </>
              ) : (
                'Passer'
              )}
            </button>

            <button
              onClick={handleCta}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm active:scale-[0.97] bg-gradient-to-r ${current.gradient} hover:shadow-md`}
            >
              {current.cta || (isLast ? 'Commencer' : 'Suivant')}
              {!isLast && <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
