import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { guides, CATEGORY_LABELS } from "@/data/guides";
import { Clock, ChevronLeft, Calendar, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = guides.find((g) => g.slug === params.slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | Tloush`,
    description: guide.subtitle,
    keywords: guide.keywords,
  };
}

// Convertit le markdown simple en HTML basique (tables, headers, bold, paragraphs)
function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-neutral-800 mt-8 mb-3">$1</h2>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      if (line.includes('---')) return '';
      const cells = line.split('|').filter(c => c.trim());
      const isHeader = md.indexOf(line) < md.indexOf('|---|') || false;
      const tag = 'td';
      return '<tr>' + cells.map(c => `<${tag} class="px-3 py-2 text-sm border border-neutral-200">${c.trim()}</${tag}>`).join('') + '</tr>';
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, (rows) =>
      `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-neutral-200 rounded-xl overflow-hidden">${rows}</table></div>`
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-neutral-700 text-sm">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (items) => `<ul class="my-3 space-y-1">${items}</ul>`)
    .replace(/⚠️ (.+)/g, '<div class="flex gap-2 items-start bg-warning/10 border border-warning/20 rounded-xl p-3 my-4"><span>⚠️</span><p class="text-sm text-neutral-700">$1</p></div>')
    .replace(/\n\n/g, '</p><p class="text-neutral-700 text-sm leading-relaxed my-3">')
    .replace(/^(?!<)(.+)$/gm, '<p class="text-neutral-700 text-sm leading-relaxed my-3">$1</p>');
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = guides.find((g) => g.slug === params.slug);
  if (!guide) notFound();

  const related = guides.filter((g) => guide.relatedSlugs.includes(g.slug));

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <Link href="/droits" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 transition-colors mb-6">
          <ChevronLeft size={14} /> Tous les guides
        </Link>

        {/* Header article */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">{guide.emoji}</span>
            <div>
              <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
                {CATEGORY_LABELS[guide.category]}
              </span>
              <h1 className="text-xl font-bold text-neutral-900 mt-2 mb-1">{guide.title}</h1>
              <p className="text-neutral-500 text-sm">{guide.subtitle}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1"><Clock size={11} /> {guide.readingTime} de lecture</span>
                <span className="flex items-center gap-1"><Calendar size={11} /> Mis à jour le {new Date(guide.updatedAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div
          className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6 prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.content) }}
        />

        {/* Guides liés */}
        {related.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider mb-3">Guides liés</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/droits/${r.slug}`}
                  className="bg-white rounded-xl border border-neutral-100 p-4 hover:border-brand-200 transition-all flex items-center gap-3 group"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-brand-700 transition-colors truncate">{r.title}</p>
                    <p className="text-xs text-neutral-400">{r.readingTime} de lecture</p>
                  </div>
                  <ChevronRight size={14} className="text-neutral-300 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA expert */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold mb-0.5">Votre situation est plus complexe ?</p>
            <p className="text-brand-100 text-sm">Consultez un expert francophone pour un conseil personnalisé.</p>
          </div>
          <Link href="/experts" className="bg-white text-brand-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-brand-50 transition-colors shrink-0">
            Trouver un expert
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
