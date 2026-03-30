import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { templates, CATEGORY_LABELS } from "@/data/templates";
import { FileText, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modèles de lettres — Tloush",
  description: "Modèles de lettres prêts à envoyer pour réclamer votre salaire, contester un licenciement ou demander des documents RH.",
};

export default function ModelesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">

        <div className="text-center mb-10">
          <div className="text-4xl mb-3">📝</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">Modèles de lettres</h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm">
            Des lettres rédigées en français, prêtes à personnaliser et envoyer.
            Basées sur la législation israélienne en vigueur.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((tpl) => (
            <Link
              key={tpl.slug}
              href={`/modeles/${tpl.slug}`}
              className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-brand-200 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <span className="text-3xl shrink-0">{tpl.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="font-semibold text-neutral-900 text-sm group-hover:text-brand-700 transition-colors">
                    {tpl.title}
                  </h2>
                  <span className="text-[10px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full shrink-0">
                    {CATEGORY_LABELS[tpl.category]}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{tpl.description}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-brand-600">
                  Utiliser ce modèle <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-brand-50 border border-brand-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-neutral-700 mb-1 font-medium">Votre situation est plus complexe ?</p>
          <p className="text-xs text-neutral-500 mb-4">Un avocat francophone peut rédiger une lettre juridiquement plus solide.</p>
          <Link href="/experts?specialite=droit-travail" className="btn-primary text-sm py-2 px-5">
            Trouver un avocat
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
