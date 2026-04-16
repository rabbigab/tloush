import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import { Wrench, Briefcase, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Annuaire francophone | Trouver un professionnel en Israël — Tloush" },
  description:
    "Trouvez un artisan (plombier, électricien, peintre…) ou un professionnel francophone (comptable, avocat, fiscaliste…) en Israël. Gratuit, référencés par Tloush.",
};

interface Section {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  examples: string;
  cta: string;
  accent: "brand" | "info";
}

const SECTIONS: Section[] = [
  {
    title: "Artisans du quotidien",
    description:
      "Plombier, électricien, peintre, serrurier, chauffage/climatisation, bricoleur. Prestataires référencés et notés par la communauté francophone.",
    href: "/annuaire/artisans",
    icon: Wrench,
    examples: "Plombier · Électricien · Peintre · Serrurier · Climatisation · Bricoleur",
    cta: "Voir les artisans",
    accent: "brand",
  },
  {
    title: "Professionnels francophones",
    description:
      "Comptables, avocats, notaires, fiscalistes, assureurs, banquiers, conseillers immobiliers. Des experts qui parlent français et connaissent le système israélien.",
    href: "/annuaire/professionnels",
    icon: Briefcase,
    examples: "Comptable · Avocat · Notaire · Fiscaliste · Assureur · Banquier",
    cta: "Voir les professionnels",
    accent: "info",
  },
];

const ACCENT_CLASSES: Record<Section["accent"], string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-100 hover:border-brand-300",
  info: "bg-sky-50 text-sky-700 border-sky-100 hover:border-sky-300",
};

export default function AnnuaireHubPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">⭐</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Trouver un professionnel
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm">
            Deux annuaires distincts : artisans pour votre quotidien, professionnels francophones pour vos démarches administratives et juridiques.
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
                <p className="text-sm text-neutral-500 flex-1 mb-3">
                  {section.description}
                </p>
                <p className="text-xs text-neutral-400 mb-4">
                  {section.examples}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-brand-600 group-hover:text-brand-700">
                    {section.cta}
                  </span>
                  <ChevronRight size={16} className="text-brand-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <DisclaimerBlock compact />
        </div>
      </div>
      <Footer />
    </main>
  );
}
