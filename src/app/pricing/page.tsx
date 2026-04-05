'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Check, X, Loader2, Star, Shield, Bell, FolderOpen, BarChart3, Users, MessageSquare } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Découverte',
    price: 0,
    period: '2 mois',
    tagline: 'Testez Tloush gratuitement',
    popular: false,
    features: [
      { text: 'Analysez vos premiers documents', included: true },
      { text: 'Résultat complet en français', included: true },
      { text: 'Historique 30 jours', included: true },
      { text: 'Assistant IA personnel', included: false },
      { text: 'Suivi des dépenses', included: false },
      { text: 'Rappels et échéances', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaStyle: 'border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700',
  },
  {
    id: 'solo',
    name: 'Solo',
    price: 49,
    period: '/mois',
    tagline: 'Votre copilote administratif complet',
    popular: true,
    stripePriceEnv: 'solo',
    features: [
      { text: 'Analyse complète de tous vos documents', included: true },
      { text: 'Détection des anomalies et points à vérifier', included: true, highlight: true },
      { text: 'Rappels automatiques avant les échéances', included: true, highlight: true },
      { text: 'Suivi de vos dépenses récurrentes', included: true, highlight: true },
      { text: 'Assistant personnel intelligent', included: true },
      { text: 'Comparaison de documents dans le temps', included: true },
      { text: 'Récapitulatif hebdomadaire par email', included: true },
      { text: 'Historique complet et sécurisé', included: true },
    ],
    cta: 'Choisir Solo',
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25',
  },
  {
    id: 'family',
    name: 'Famille',
    price: 99,
    period: '/mois',
    tagline: 'Le copilote de toute la famille',
    popular: false,
    stripePriceEnv: 'family',
    features: [
      { text: 'Tout le plan Solo, plus :', included: true },
      { text: 'Jusqu\'à 5 membres de la famille', included: true, highlight: true },
      { text: 'Chacun son espace personnel', included: true },
      { text: 'Documents et dépenses de toute la famille', included: true, highlight: true },
      { text: 'Suivi global : travail, logement, finances', included: true },
      { text: 'Alertes et résumés pour toute la famille', included: true },
    ],
    cta: 'Choisir Famille',
    ctaStyle: 'border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30',
  },
]

const VALUE_PROPS = [
  {
    icon: Shield,
    title: 'Vous ne passez plus à côté de vos droits',
    desc: 'Tloush repère les anomalies et les points importants que vous auriez pu manquer.',
  },
  {
    icon: Bell,
    title: 'Vous ne ratez plus une échéance',
    desc: 'Rappels automatiques avant chaque date limite importante.',
  },
  {
    icon: BarChart3,
    title: 'Vous savez où va votre argent',
    desc: 'Scannez vos factures et suivez vos charges récurrentes simplement.',
  },
  {
    icon: MessageSquare,
    title: 'Vous avez les réponses à vos questions',
    desc: 'Un assistant qui connaît vos documents et répond en français.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(planId: string) {
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
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Reprenez le contrôle de vos papiers
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Ne laissez plus vos documents en hébreu vous stresser. Tloush vous aide à comprendre, vérifier et agir.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {VALUE_PROPS.map((vp) => {
            const Icon = vp.icon
            return (
              <div key={vp.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{vp.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{vp.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 lg:p-8 flex flex-col ${
                plan.popular
                  ? 'border-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <Star size={14} fill="currentColor" />
                    Le plus populaire
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{plan.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{plan.tagline}</p>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">Gratuit</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{plan.price}₪</span>
                      <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                    </>
                  )}
                </div>
                {plan.price === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Pendant 2 mois, sans engagement</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check size={18} className="text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <X size={18} className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${
                      !feature.included
                        ? 'text-slate-400 dark:text-slate-500'
                        : (feature as { highlight?: boolean }).highlight
                          ? 'text-slate-800 dark:text-slate-200 font-medium'
                          : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${plan.ctaStyle}`}
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

        {/* FAQ / Trust */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
            Questions fréquentes
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Puis-je annuler à tout moment ?',
                a: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre profil. Vous continuerez à avoir accès jusqu\'à la fin de la période payée.',
              },
              {
                q: 'Que se passe-t-il après les 2 mois gratuits ?',
                a: 'Votre accès sera limité. Vous pourrez choisir un plan payant pour continuer à utiliser toutes les fonctionnalités de Tloush. Vos documents restent sauvegardés.',
              },
              {
                q: 'Le plan Famille, comment ça marche ?',
                a: 'Invitez jusqu\'à 4 membres de votre famille par email. Chacun a son propre espace et ses propres documents. Le quota de documents est partagé entre les membres.',
              },
              {
                q: 'Quels moyens de paiement acceptez-vous ?',
                a: 'Nous acceptons les cartes Visa, Mastercard et American Express via notre partenaire de paiement sécurisé Stripe.',
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {faq.q}
                </summary>
                <p className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
