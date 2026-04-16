import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Mail, MessageSquare, ShieldCheck, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez l\'équipe Tloush pour toute question, suggestion, demande de support ou signalement. Réponse sous 48h en moyenne.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={30} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
            Nous contacter
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-base leading-relaxed">
            Une question, une suggestion, un bug à signaler ? Nous lisons tous
            les messages et répondons généralement sous 48 heures.
          </p>
        </div>

        {/* Canaux de contact */}
        <div className="space-y-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquare size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-neutral-800 dark:text-slate-200 mb-1">
                  Questions générales, suggestions, bugs
                </h2>
                <p className="text-sm text-neutral-500 dark:text-slate-400 mb-3">
                  Pour toute question sur le produit, une suggestion
                  d&apos;amélioration ou un bug à signaler.
                </p>
                <a
                  href="mailto:contact@tloush.com?subject=Tloush%20%E2%80%94%20Contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:underline"
                >
                  contact@tloush.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-neutral-800 dark:text-slate-200 mb-1">
                  Protection des données (RGPD)
                </h2>
                <p className="text-sm text-neutral-500 dark:text-slate-400 mb-3">
                  Pour exercer vos droits (accès, rectification, suppression,
                  portabilité) ou toute question relative à vos données
                  personnelles.
                </p>
                <a
                  href="mailto:privacy@tloush.com?subject=Tloush%20%E2%80%94%20Demande%20RGPD"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  privacy@tloush.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Ressources */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6">
          <h2 className="font-bold text-neutral-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-neutral-400" />
            Avant de nous contacter
          </h2>
          <p className="text-sm text-neutral-500 dark:text-slate-400 mb-4">
            Votre question a peut-être déjà une réponse dans nos pages
            publiques :
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/faq"
                className="text-brand-700 dark:text-brand-400 hover:underline"
              >
                → FAQ (questions fréquentes)
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="text-brand-700 dark:text-brand-400 hover:underline"
              >
                → Tarifs et plans
              </Link>
            </li>
            <li>
              <Link
                href="/cgv"
                className="text-brand-700 dark:text-brand-400 hover:underline"
              >
                → Conditions générales de vente
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-brand-700 dark:text-brand-400 hover:underline"
              >
                → Politique de confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  )
}
