import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight, FileSearch, Scale, Calculator, FileText, Users, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tloush — Plateforme RH francophone pour les salariés en Israël",
  description: "Analysez votre fiche de paie, comprenez vos droits, calculez vos indemniés et trouvez un expert francophone en Israël.",
  keywords: ["fiche de paie israël", "droits salariés israël", "avocat travail israël", "francophone israël"],
};

const MODULES = [
  {
    href: "/analyze",
    icon: FileSearch,
    emoji: "🔍",
    title: "Analyser ma fiche",
    desc: "Upload votre bulletin de salaire en hébreu. Notre IA le traduit, l'analyse et détecte les anomalies.",
    cta: "Analyser maintenant",
    highlight: true,
  },
  {
    href: "/droits",
    icon: Scale,
    emoji: "⚖️",
    title: "Comprendre mes droits",
    desc: "Guides complets sur les congés, heures sup, licenciement, Keren Hishtalmut. En français, mis à jour.",
    cta: "Lire les guides",
    highlight: false,
  },
  {
    href: "/calculateurs",
    icon: Calculator,
    emoji: "💰",
    title: "Calculer",
    desc: "Simulateur brut→net, calculateur de Pitzuim, solde de congés. Barèmes 2024.",
    cta: "Accéder aux calculateurs",
    highlight: false,
  },
  {
    href: "/modeles",
    icon: FileText,
    emoji: "📝",
    title: "Rédiger une lettre",
    desc: "Modèles prêts à personnaliser : réclamation salariale, contestation de licenciement, demande de documents.",
    cta: "Voir les modèles",
    highlight: false,
  },
  {
    href: "/experts",
    icon: Users,
    emoji: "👨‍⚖️",
    title: "Trouver un expert",
    desc: "Avocats, comptables et conseillers RH francophones en Israël. Vérifiés, réactifs.",
    cta: "Voir l'annuaire",
    highlight: false,
  },
];

const REASSURANCES = [
  "100 % en français",
  "Gratuit et sans inscription",
  "Données non conservées",
  "Mis à jour 2024",
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            🇮🇱 Spécialement conçu pour les francophones en Israël
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
            Travaillez sereinement
            <span className="text-brand-600"> en Israël</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-8">
            Analysez votre fiche de paie, comprenez vos droits et trouvez un expert francophone.
            Tout ce dont vous avez besoin, en français.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/analyze" className="btn-primary py-3 px-6 text-base">
              Analyser ma fiche <ArrowRight size={16} />
            </Link>
            <Link href="/experts" className="btn-secondary py-3 px-6 text-base">
              Trouver un expert
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {REASSURANCES.map((r) => (
              <span key={r} className="flex items-center gap-1.5 text-xs text-neutral-500">
                <CheckCircle2 size={12} className="text-success" /> {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Modules */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Tout ce qu’il vous faut</h2>
          <p className="text-neutral-500 text-sm">Cinq outils intégrés pour gérer votre vie professionnelle en Israël.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ href, icon: Icon, emoji, title, desc, cta, highlight }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-2xl border p-6 transition-all group hover:shadow-md ${highlight ? "bg-brand-600 border-brand-600 text-white col-span-full sm:col-span-2 lg:col-span-1" : "bg-white border-neutral-100 hover:border-brand-200"}`}
            >
              <span className="text-3xl mb-4 block">{emoji}</span>
              <h3 className={`font-bold text-lg mb-2 ${highlight ? "text-white" : "text-neutral-900 group-hover:text-brand-700"} transition-colors`}>
                {title}
              </h3>
              <p className={`text-sm mb-4 ${highlight ? "text-brand-100" : "text-neutral-500"}`}>{desc}</p>
              <span className={`inline-flex items-center gap-1 text-sm font-semibold ${highlight ? "text-white" : "text-brand-600"}`}>
                {cta} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Pour les professionnels */}
      <section className="bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Professionnels francophones</p>
            <h2 className="text-xl font-bold mb-2">Rejoignez l’annuaire Tloush</h2>
            <p className="text-neutral-400 text-sm">Connectez-vous avec des milliers de salariés francophones qui cherchent votre expertise.</p>
          </div>
          <Link href="/experts/rejoindre" className="bg-white text-neutral-900 font-semibold px-5 py-3 rounded-xl text-sm hover:bg-neutral-100 transition-colors shrink-0">
            Rejoindre le répertoire
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
