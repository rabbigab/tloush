import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import { BookOpen, Sparkles, Scale, Plane, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Vos droits en Israël",
  description:
    "Guides juridiques, détecteur d'aides publiques, droits du travail et aides olim : tout ce qu'un francophone doit savoir en Israël.",
};

interface Section {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  cta: string;
  authRequired?: boolean;
  accent: "brand" | "success" | "info" | "warning";
}

const SECTIONS: Section[] = [
  {
    title: "Guides éducatifs",
    description:
      "Articles en français sur le droit du travail israélien : congés, heures supplémentaires, licenciement, cotisations, avantages.",
    href: "/droits/guides",
    icon: BookOpen,
    cta: "Lire les guides",
    accent: "brand",
  },
  {
    title: "Détecter mes aides",
    description:
      "Scannez votre profil pour découvrir les aides publiques (BTL, fiscales, olim…) auxquelles vous avez potentiellement droit.",
    href: "/aides",
    icon: Sparkles,
    cta: "Lancer la détection",
    authRequired: true,
    accent: "success",
  },
  {
    title: "Droits du travail",
    description:
      "Calculez précisément vos droits de salarié : congés, pitzuim, primes, préavis, selon votre ancienneté et votre profil.",
    href: "/aides?tab=travail",
    icon: Scale,
    cta: "Calculer mes droits",
    authRequired: true,
    accent: "info",
  },
  {
    title: "Aides olim",
    description:
      "Questionnaire dédié aux nouveaux immigrants : sal klita, ulpan, assurance santé, logement, emploi et toutes les aides Misrad HaKlita.",
    href: "/aides/olim",
    icon: Plane,
    cta: "Explorer mes aides olim",
    authRequired: true,
    accent: "warning",
  },
];

const ACCENT_CLASSES: Record<Section["accent"], string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-100 hover:border-brand-300",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300",
  info: "bg-sky-50 text-sky-700 border-sky-100 hover:border-sky-300",
  warning: "bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300",
};

export default function DroitsHubPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">⚖️</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Vos droits en Israël
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm">
            Quatre entrées pour comprendre et activer vos droits : guides juridiques, détecteur d'aides, calcul de vos droits de salarié et questionnaire olim hadashim.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group bg-white rounded-2xl border border-neutral-100 p-5 hover:border-brand-200 hover:shadow-md transition-all flex flex-col"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${ACCENT_CLASSES[section.accent]} mb-4`}>
                  <Icon size={22} />
                </div>
                <h2 className="font-semibold text-neutral-900 text-base mb-1 group-hover:text-brand-700 transition-colors">
                  {section.title}
                </h2>
                <p className="text-sm text-neutral-500 flex-1 mb-4">
                  {section.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-brand-600 group-hover:text-brand-700">
                    {section.cta}
                  </span>
                  <div className="flex items-center gap-2">
                    {section.authRequired && (
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        Connexion requise
                      </span>
                    )}
                    <ChevronRight size={16} className="text-brand-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA scanner */}
        <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-neutral-800 mb-1">Vous avez un document ?</p>
            <p className="text-sm text-neutral-500">
              Analysez automatiquement vos fiches de paie, courriers et contrats pour détecter anomalies et échéances.
            </p>
          </div>
          <Link href="/scanner" className="btn-primary text-sm py-2.5 px-5 shrink-0">
            Analyser un document
          </Link>
        </div>

        <div className="mt-8">
          <DisclaimerBlock compact />
        </div>
      </div>
      <Footer />
    </main>
  );
}
