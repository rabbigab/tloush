import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { templates, CATEGORY_LABELS } from "@/data/templates";
import TemplateFiller from "./TemplateFiller";

export async function generateStaticParams() {
  return templates.map((t) => ({
    slug: t.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const template = templates.find((t) => t.slug === params.slug);
  if (!template) return { title: "Modèle introuvable" };
  return {
    title: `${template.title} — Modèle de lettre Tloush`,
    description: template.description,
  };
}

export default function TemplatePage({
  params,
}: {
  params: { slug: string };
}) {
  const template = templates.find((t) => t.slug === params.slug);
  if (!template) notFound();

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Link
          href="/modeles"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Tous les modèles
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-5xl shrink-0">{template.emoji}</span>
          <div className="flex-1">
            <span className="inline-block text-[10px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full mb-2">
              {CATEGORY_LABELS[template.category]}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              {template.title}
            </h1>
            <p className="text-sm text-neutral-600">{template.description}</p>
          </div>
        </div>

        {/* Interactive filler */}
        <TemplateFiller template={template} />

        {/* Disclaimer */}
        <div className="mt-10 bg-neutral-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-neutral-500">
            ⚠️ Modèle fourni à titre indicatif. Adaptez-le à votre situation
            et relisez attentivement avant envoi. En cas de litige complexe,
            consultez un avocat ou un expert du droit du travail.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
