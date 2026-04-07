import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Calculator,
  Banknote,
  CalendarDays,
  TrendingDown,
  Baby,
  Briefcase,
  Home,
  Landmark,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculateurs salaire Israël — Tloush",
  description:
    "Calculez votre salaire net, vos indemniés de licenciement et vos congés payés en Israël. Outils gratuits pour salariés francophones.",
};

const CALCULATORS = [
  {
    href: "/calculateurs/brut-net",
    icon: Banknote,
    emoji: "💰",
    title: "Simulateur brut → net",
    description:
      "Estimez votre salaire net à partir du brut. Prend en compte Bituah Leumi, impôt sur le revenu et points de crédit.",
    badge: "Le plus utilisé",
    color: "brand",
  },
  {
    href: "/calculateurs/indemnites",
    icon: TrendingDown,
    emoji: "📋",
    title: "Calculateur de Pitzuim",
    description:
      "Calculez vos indemniés de licenciement selon votre ancienneté et votre salaire de référence.",
    badge: null,
    color: "orange",
  },
  {
    href: "/calculateurs/conges",
    icon: CalendarDays,
    emoji: "🏖️",
    title: "Solde de congés",
    description:
      "Calculez vos jours de congés accumulés et leur valeur monétaire en cas de départ.",
    badge: null,
    color: "green",
  },
  {
    href: "/calculateurs/maternite",
    icon: Baby,
    emoji: "👶",
    title: "Congé Maternité",
    description:
      "Estimez la durée de votre congé maternité/paternité et vos allocations Bituach Leumi en Israël.",
    badge: null,
    color: "pink",
  },
  {
    href: "/freelance",
    icon: Briefcase,
    emoji: "💼",
    title: "Simulateur Freelance",
    description:
      "Osek Patur ou Murshe ? Calculez vos charges, TVA, BL et impôts en tant qu'indépendant en Israël.",
    badge: "Nouveau",
    color: "green",
  },
  {
    href: "/arnona",
    icon: Home,
    emoji: "🏠",
    title: "Simulateur Arnona",
    description:
      "Estimez votre taxe municipale (arnona) selon votre ville, surface et réductions possibles.",
    badge: "Nouveau",
    color: "orange",
  },
  {
    href: "/mashkanta",
    icon: Landmark,
    emoji: "🏗️",
    title: "Simulateur Mashkanta",
    description:
      "Simulez votre prêt immobilier : mensualités, mas rechisha, taux d'endettement et amortissement.",
    badge: "Nouveau",
    color: "blue",
  },
];

export default function CalcuateursPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calculator size={28} className="text-brand-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Calculateurs
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm">
            Des outils de calcul précis, basés sur la législation israélienne en
            vigueur en 2024. Gratuits et sans inscription.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CALCULATORS.map(
            ({
              href,
              icon: Icon,
              emoji,
              title,
              description,
              badge,
            }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-2xl border border-neutral-100 p-6 hover:border-brand-200 hover:shadow-md transition-all group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{emoji}</span>
                  {badge && (
                    <span className="text-[10px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <h2 className="font-bold text-neutral-900 mb-2 group-hover:text-brand-700 transition-colors">
                  {title}
                </h2>
                <p className="text-sm text-neutral-500 flex-1">
                  {description}
                </p>
                <div className="mt-4 text-xs font-medium text-brand-600 flex items-center gap-1">
                  Utiliser →
                </div>
              </Link>
            )
          )}
        </div>

        <div className="mt-10 bg-neutral-100 rounded-2xl p-5 text-center">
          <p className="text-xs text-neutral-500">
            ⚠️ Ces calculateurs sont fournis à titre indicatif. Les montants
            exacts peuvent varier selon votre convention collective, contrat
            individuel et situation personnelle. En cas de doute, consultez un
            expert.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
