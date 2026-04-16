import Link from 'next/link'
import { ArrowRight, Users, Star, ShieldCheck } from 'lucide-react'
import { PROVIDER_CATEGORIES } from '@/types/directory'
import DirectoryPageTracker from '@/components/directory/DirectoryPageTracker'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Annuaire prestataires francophones en Israel | Tloush Recommande' },
  description:
    'Trouvez un plombier, electricien, peintre ou serrurier francophone en Israel. Prestataires references, avis de la communaute. Gratuit.',
}

export const revalidate = 3600

export default function AnnuairePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <DirectoryPageTracker event="directory_viewed" />
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium mb-4">
          <ShieldCheck size={14} />
          Prestataires references par Tloush
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mb-4">
          Trouvez un prestataire francophone de confiance
        </h1>
        <p className="text-lg text-neutral-500 dark:text-slate-400 max-w-2xl mx-auto">
          Plombier, electricien, peintre... Tous parlent francais, tous sont references par notre equipe et notes par la communaute.
        </p>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {PROVIDER_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/annuaire/artisans/${cat.slug}`}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all hover:shadow-md ${cat.color}`}
            >
              <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm`}>
                <Icon size={22} className={cat.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-neutral-900 dark:text-white">{cat.label}</h2>
                  <span className="text-xs text-neutral-400 dark:text-slate-500">({cat.hebrewTerm})</span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-slate-400">{cat.description}</p>
              </div>
              <ArrowRight size={16} className="text-neutral-300 dark:text-slate-600 shrink-0 mt-1" />
            </Link>
          )
        })}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-8">
          Comment ca marche
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              icon: Users,
              title: 'Choisissez',
              desc: 'Parcourez les prestataires par categorie et ville. Lisez les avis de la communaute.',
            },
            {
              step: '2',
              icon: ShieldCheck,
              title: 'Inscrivez-vous',
              desc: "Creez un compte gratuit en 10 secondes pour obtenir le numero du prestataire.",
            },
            {
              step: '3',
              icon: Star,
              title: 'Notez',
              desc: "Apres l'intervention, partagez votre experience pour aider la communaute.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA prestataire */}
      <div className="text-center mb-12 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Vous etes prestataire francophone ?</h2>
        <p className="text-sm text-neutral-500 dark:text-slate-400 mb-4">
          Rejoignez l&apos;annuaire gratuitement et recevez des clients qualifies. Sans commission.
        </p>
        <Link
          href="/annuaire/artisans/inscription"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
        >
          Devenir prestataire <ArrowRight size={16} />
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded-2xl p-5 text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
        <p>
          <strong>Tloush Recommande</strong> est un service gratuit de mise en relation. Les prestataires references exercent leur activite de maniere independante. Tloush n&apos;est pas partie aux contrats conclus entre les clients et les prestataires et ne garantit pas la qualite des prestations. Les notes refletent l&apos;experience des utilisateurs.
        </p>
      </div>
    </div>
  )
}
