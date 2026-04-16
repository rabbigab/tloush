import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Heart, Target, Users, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Tloush aide les francophones en Israël à comprendre leurs documents administratifs en hébreu. Notre mission, notre vision, nos valeurs.',
}

export default function AProposPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={30} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
            À propos de Tloush
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-base leading-relaxed">
            Un outil créé pour simplifier la vie administrative des francophones
            en Israël.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center shrink-0">
              <Target size={22} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-slate-200 mb-3">
                Notre mission
              </h2>
              <p className="text-neutral-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                Vivre en Israël quand on vient d&apos;un pays francophone, c&apos;est
                faire face chaque semaine à des documents administratifs rédigés
                en hébreu : fiches de paie, courriers officiels, avis
                d&apos;imposition, contrats. Comprendre ce qu&apos;ils disent et ce
                qu&apos;ils exigent demande du temps, parfois l&apos;aide d&apos;un
                professionnel, et toujours une dose de stress.
              </p>
              <p className="text-neutral-600 dark:text-slate-300 text-sm leading-relaxed">
                Tloush est né pour rendre ces démarches accessibles, claires et
                gérables en français. Nous combinons intelligence artificielle,
                expertise locale et interface simple pour que chaque olim puisse
                reprendre le contrôle de ses documents.
              </p>
            </div>
          </div>
        </div>

        {/* Valeurs */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center mb-3">
              <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-neutral-800 dark:text-slate-200 mb-2">
              Simplicité
            </h3>
            <p className="text-sm text-neutral-500 dark:text-slate-400 leading-relaxed">
              Des outils qui vont droit au but, sans jargon. Une analyse en
              30 secondes, des explications en français, des calculs clairs.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center mb-3">
              <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-bold text-neutral-800 dark:text-slate-200 mb-2">
              Confiance
            </h3>
            <p className="text-sm text-neutral-500 dark:text-slate-400 leading-relaxed">
              Vos documents restent privés. Aucune publicité, aucune revente de
              données, aucun entraînement d&apos;IA sur votre contenu.
            </p>
          </div>
        </div>

        {/* Note éditoriale */}
        <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-brand-900 dark:text-brand-200 mb-2">
            Un outil, pas un avocat
          </h3>
          <p className="text-sm text-brand-800 dark:text-brand-300 leading-relaxed">
            Tloush est un outil d&apos;aide à la compréhension. Il ne remplace
            jamais l&apos;avis d&apos;un avocat, d&apos;un expert-comptable ou
            d&apos;un conseiller fiscal. Pour toute décision importante,
            consultez un professionnel qualifié — nous pouvons vous orienter via
            notre {' '}
            <Link
              href="/annuaire/professionnels"
              className="underline font-semibold hover:text-brand-700"
            >
              annuaire d&apos;experts francophones
            </Link>
            .
          </p>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-slate-400 mb-3">
            Une question, un retour, une envie de collaborer ?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:underline"
          >
            Nous contacter →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}
