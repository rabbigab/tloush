import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { guides, CATEGORY_LABELS, GuideCategory } from "@/data/guides";
import { Clock, ChevronRight, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides des droits du salarié",
  description:
    "Guides complets en français sur vos droits : congés, heures supplémentaires, licenciement, cotisations. Tout ce qu'un salarié francophone doit savoir en Israël.",
};

const CATEGORIES: { value: GuideCategory | "all"; label: string; emoji: string }[] = [
  { value: "all", label: "Tous les guides", emoji: "📚" },
  { value: "conges", label: "Congés", emoji: "🏖️" },
  { value: "salaire", label: "Salaire", emoji: "💵" },
  { value: "licenciement", label: "Licenciement", emoji: "📋" },
  { value: "cotisations", label: "Cotisations", emoji: "🏦" },
  { value: "avantages", label: "Avantages", emoji: "🎓" },
];

export default function DroitsPage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const selectedCategory = searchParams.categorie;

  const filtered =
    selectedCategory && selectedCategory !== "all"
      ? guides.filter((g) => g.category === selectedCategory)
      : guides;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <Link
          href="/droits"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 transition-colors mb-6"
        >
          <ChevronLeft size={14} />
          Retour au hub des droits
        </Link>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">⚖️</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Vos droits en tant que salarié
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm">
            Tout ce que vous devez savoir sur le droit du travail israélien,
            expliqué en français. Mis à jour régulièrement avec les dernières
            lois en vigueur.
          </p>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => {
            const isActive =
              (!selectedCategory && cat.value === "all") ||
              selectedCategory === cat.value;
            return (
              <Link
                key={cat.value}
                href={
                  cat.value === "all"
                    ? "/droits/guides"
                    : `/droits/guides?categorie=${cat.value}`
                }
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Grille guides */}
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((guide) => (
            <Link
              key={guide.slug}
              href={`/droits/${guide.slug}`}
              className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-brand-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0">{guide.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-neutral-900 text-sm mb-1 group-hover:text-brand-700 transition-colors">
                    {guide.title}
                  </h2>
                  <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                    {guide.subtitle}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[guide.category]}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                        <Clock size={10} />
                        {guide.readingTime}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-brand-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA analyse */}
        <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-neutral-800 mb-1">
              Passez à l'action
            </p>
            <p className="text-sm text-neutral-500">
              Analysez votre fiche de paie pour vérifier que tout est conforme.
            </p>
          </div>
          <Link href="/scanner" className="btn-primary text-sm py-2.5 px-5 shrink-0">
            Analyser ma fiche
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
