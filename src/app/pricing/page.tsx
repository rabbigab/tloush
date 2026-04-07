'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { track } from '@/lib/analytics'
import { Check, X, Loader2, Star } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    period: '',
    description: 'Découvrez Tloush gratuitement',
    popular: false,
    features: [
      { text: '3 analyses offertes', included: true },
      { text: 'Questionnaire droits des olim', included: true },
      { text: 'Historique 7 jours', included: true },
      { text: 'Assistant IA', included: false },
      { text: 'Traduction messages hébreux', included: false },
      { text: 'Support prioritaire', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaStyle: 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
  },
  {
    id: 'solo',
    name: 'Solo',
    price: 49,
    period: '/mois',
    description: 'Pour gérer vos documents au quotidien',
    popular: true,
    stripePriceEnv: 'solo',
    features: [
      { text: '30 analyses de documents/mois', included: true },
      { text: 'Questionnaire droits des olim', included: true },
      { text: 'Historique 1 an', included: true },
      { text: 'Assistant IA (200 msg/mois)', included: true },
      { text: 'Traduction messages hébreux', included: true },
      { text: 'Support prioritaire', included: true },
    ],
    cta: 'Choisir Solo',
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25',
  },
  {
    id: 'family',
    name: 'Famille',
    price: 99,
    period: '/mois',
    description: "Pour toute la famille, jusqu'à 5 membres",
    popular: false,
    stripePriceEnv: 'family',
    features: [
      { text: '100 analyses de documents/mois', included: true },
      { text: 'Questionnaire droits des olim', included: true },
      { text: 'Historique 1 an', included: true },
      { text: 'Assistant IA (500 msg/mois)', included: true },
      { text: 'Traduction messages hébreux', included: true },
      { text: "Jusqu'à 5 membres", included: true },
    ],
    cta: 'Choisir Famille',
    ctaStyle: 'border-2 border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => { track('pricing_viewed') }, [])

  async function handleSubscribe(planId: string) {
    track('checkout_started', { plan: planId })
    if (planId === 'free') {
      router.push('/auth/register')
      return
    }

    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: planId === 'solo'
            ? process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO
            : process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY,
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        router.push('/auth/register?redirect=/pricing')
      }
    } catch {
      router.push('/auth/register?redirect=/pricing')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Simplifiez votre vie administrative en Israël. 3 analyses offertes pour découvrir, puis à partir de 49₪/mois.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 lg:p-8 flex flex-col ${
                plan.popular
                  ? 'border-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <Star size={14} fill="currentColor" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-slate-900">Gratuit</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-slate-900">{plan.price}₪</span>
                      <span className="text-slate-500">{plan.period}</span>
                    </>
                  )}
                </div>
                {plan.price === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 documents offerts</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check size={18} className="text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <X size={18} className="text-slate-300 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 ${plan.ctaStyle}`}
              >
                {loading === plan.id ? (
                  <Loader2 size={18} className="animate-spin mx-auto" />
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 text-center mb-8">
            Questions fréquentes
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Puis-je annuler à tout moment ?',
                a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre profil. Vous continuerez à avoir accès jusqu'à la fin de la période payée.",
              },
              {
                q: "Que se passe-t-il après les 3 analyses gratuites ?",
                a: "Vous pourrez choisir un plan payant pour continuer à utiliser Tloush. Vos documents déjà analysés restent sauvegardés.",
              },
              {
                q: 'Le plan Famille, comment ça marche ?',
                a: "Vous pouvez inviter jusqu'à 4 autres membres de votre famille. Chacun a son propre espace et ses propres documents, mais le quota est partagé.",
              },
              {
                q: 'Quels moyens de paiement acceptez-vous ?',
                a: 'Nous acceptons les cartes de crédit Visa, Mastercard et American Express via notre partenaire de paiement sécurisé Stripe.',
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer font-medium text-slate-900 hover:bg-slate-50 transition-colors">
                  {faq.q}
                </summary>
                <p className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
      }
