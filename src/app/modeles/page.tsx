import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { templates, CATEGORY_LABELS, type TemplateCategory } from "@/data/templates";
import { FileText, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Modèles de lettres",
  description:
    "Modèles de lettres gratuits pour vos démarches en Israël : réclamation salaire, démission, recours Bituach Leumi, heures supplémentaires, certificat de travail.",
};

const CATEGORY_ORDER: (TemplateCategory | "all")[] = [
  "all",
  "salaire",
  "licenciement",
  "heures-sup",
  "documents",
];

const CATEGORY_META: Record<TemplateCategory | "all", { label: string; emoji: string }> = {
  all: { label: "Tous les modèles", emoji: "📚" },
  salaire: { label: CATEGORY_LABELS.salaire, emoji: "💰" },
  licenciement: { label: CATEGORY_LABELS.licenciement, emoji: "📋" },
  "heures-sup": { label: CATEGORY_LABELS["heures-sup"], emoji: "⏰" },
  documents: { label: CATEGORY_LABELS.documents, emoji: "📄" },
};

export default function ModelsPage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const selected = searchParams.categorie;
  const filtered =
    selected && selected !== "all"
      ? templates.filter((t) => t.category === selected)
      : templates;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-brand-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Modèles de lettres
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm">
            Lettres types gratuites pour vos démarches administratives en
            Israël. Personnalisez en remplissant quelques champs, puis
            copiez-collez dans votre email ou courrier.
          </p>
        </div>

        {/* Categories filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isActive = (!selected && cat === "all") || selected === cat;
            return (
              <Link
                key={cat}
                href={cat === "all" ? "/modeles" : `/modeles?categorie=${cat}`}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300"
                }`}
              >
                <span>{meta.emoji}</span>
                {meta.label}
              </Link>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-500">
            Aucun modèle dans cette catégorie pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((t) => (
              <Link
                key={t.slug}
                href={`/modeles/${t.slug}`}
                className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-brand-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-neutral-900 text-sm mb-1 group-hover:text-brand-700 transition-colors">
                      {t.title}
                    </h2>
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[t.category]}
                      </span>
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
        )}

        {/* Info */}
        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <div className="text-2xl shrink-0">ℹ️</div>
          <div className="text-xs text-blue-900 leading-relaxed">
            <p className="font-semibold mb-1">À propos de ces modèles</p>
            <p>
              Ces lettres sont rédigées en français et référencent la loi
              israélienne en vigueur. Elles sont fournies à titre indicatif
              et ne remplacent pas un conseil juridique personnalisé. Pour
              les litiges complexes, consultez un expert du droit du travail.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
