import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { HelpCircle, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description:
    'Les réponses aux questions les plus fréquentes sur Tloush : facturation, quotas, analyses, sécurité des données, remboursement.',
}

const FAQ = [
  {
    section: 'Facturation et abonnement',
    items: [
      {
        q: 'Puis-je annuler à tout moment ?',
        a: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre profil ou via le portail client Stripe. Vous continuerez à avoir accès aux fonctionnalités payantes jusqu\'à la fin de la période déjà payée. Aucun remboursement au prorata n\'est effectué.',
      },
      {
        q: 'Les prix sont-ils en ILS ou en € ?',
        a: 'Les prix affichés sont en shekels israéliens (ILS / ₪), toutes taxes comprises. La TVA israélienne (Ma\'am, 17 % en 2026) est incluse dans les tarifs.',
      },
      {
        q: 'Puis-je obtenir une facture ?',
        a: 'Oui, une facture électronique est disponible après chaque paiement depuis votre profil ou via le portail Stripe. Elle peut être utilisée pour votre comptabilité personnelle ou professionnelle.',
      },
      {
        q: 'Quels moyens de paiement acceptez-vous ?',
        a: 'Nous acceptons les cartes de crédit Visa, Mastercard et American Express via notre partenaire Stripe. Aucune donnée bancaire n\'est stockée sur nos serveurs.',
      },
      {
        q: 'Que se passe-t-il après les 3 analyses gratuites ?',
        a: 'Vous pouvez choisir un plan payant (Solo à 49₪/mois pour 30 analyses, ou Famille à 99₪/mois pour 100 analyses). Vos documents déjà analysés restent sauvegardés même sans abonnement actif.',
      },
    ],
  },
  {
    section: 'Plans et quotas',
    items: [
      {
        q: 'Comment fonctionne le plan Famille ?',
        a: 'Vous pouvez inviter jusqu\'à 4 autres membres de votre famille. Chacun a son propre espace et ses propres documents, mais le quota de 100 analyses/mois est partagé entre tous les membres.',
      },
      {
        q: 'Que contient le plan Gratuit ?',
        a: '3 analyses offertes au total (pas par mois), le questionnaire droits des olim, l\'historique 7 jours, et les calculateurs publics (sans limitation). L\'assistant IA n\'est pas inclus.',
      },
      {
        q: 'Que se passe-t-il si je dépasse mon quota mensuel ?',
        a: 'Vous recevez une notification. Vous pouvez attendre le renouvellement du mois suivant ou passer au plan supérieur. Aucun frais caché ne vous est facturé.',
      },
    ],
  },
  {
    section: 'Analyses et documents',
    items: [
      {
        q: 'Quels types de documents puis-je analyser ?',
        a: 'Fiches de paie (tlushim), contrats de travail, lettres officielles (Bituah Leumi, municipalité, impôts), avis d\'imposition, contrats de location, lettres de licenciement. Le format PDF et les photos sont acceptés.',
      },
      {
        q: 'Mes documents sont-ils stockés en sécurité ?',
        a: 'Oui. Les documents sont stockés dans un bucket privé Supabase avec isolation par utilisateur (Row Level Security). Chiffrement TLS 1.3 sur toutes les communications. Aucune donnée n\'est utilisée pour entraîner des modèles d\'IA.',
      },
      {
        q: 'Qui a accès à mes documents ?',
        a: 'Uniquement vous. Aucun employé Tloush n\'a accès à vos documents en dehors d\'un incident technique explicitement autorisé par vous. Claude (Anthropic) reçoit le contenu du document le temps de l\'analyse et ne le conserve pas.',
      },
      {
        q: 'Combien de temps mes documents sont-ils conservés ?',
        a: 'Tant que votre compte est actif. Après suppression de votre compte, vos documents sont purgés dans les 90 jours. Voir notre politique de confidentialité pour les détails.',
      },
    ],
  },
  {
    section: 'Sécurité et RGPD',
    items: [
      {
        q: 'Respectez-vous le RGPD ?',
        a: 'Oui. Nous appliquons à la fois le RGPD (résidents UE) et la Loi israélienne sur la protection de la vie privée (1981). Vous disposez de tous vos droits RGPD : accès, rectification, effacement, portabilité, opposition. Contactez privacy@tloush.com pour toute demande.',
      },
      {
        q: 'Utilisez-vous des cookies publicitaires ?',
        a: 'Non. Aucun cookie publicitaire tiers. Nous utilisons uniquement des cookies strictement nécessaires (authentification, session) et des outils d\'analytics anonymisés (PostHog, Sentry) pour améliorer le service.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={30} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
            Questions fréquentes
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-sm leading-relaxed">
            Les réponses aux questions les plus souvent posées sur Tloush.
            Votre question n&apos;est pas dans la liste ?{' '}
            <Link
              href="/contact"
              className="text-brand-600 dark:text-brand-400 underline hover:text-brand-700"
            >
              Contactez-nous
            </Link>
            .
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {FAQ.map((section) => (
            <div key={section.section}>
              <h2 className="text-sm font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {section.section}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <details
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-neutral-100 dark:border-slate-700 overflow-hidden group"
                  >
                    <summary className="px-5 py-4 cursor-pointer font-medium text-neutral-800 dark:text-slate-200 text-sm hover:bg-neutral-50 dark:hover:bg-slate-700/50 transition-colors">
                      {item.q}
                    </summary>
                    <p className="px-5 pb-4 text-sm text-neutral-600 dark:text-slate-300 leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 rounded-2xl p-6 text-center">
          <Mail size={28} className="text-brand-600 dark:text-brand-400 mx-auto mb-3" />
          <p className="font-semibold text-neutral-800 dark:text-slate-200 mb-2">
            Vous ne trouvez pas votre réponse ?
          </p>
          <p className="text-sm text-neutral-500 dark:text-slate-400 mb-4">
            Écrivez-nous, nous répondons généralement sous 48 heures.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}
