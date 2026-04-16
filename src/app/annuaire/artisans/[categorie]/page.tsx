import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { getCategoryBySlug } from '@/types/directory'
import type { Provider } from '@/types/directory'
import type { Metadata } from 'next'
import ProviderCard from '@/components/directory/ProviderCard'
import { CategoryListJsonLd, FAQJsonLd } from '@/components/directory/ProviderSchema'
import DirectoryPageTracker from '@/components/directory/DirectoryPageTracker'
import { CATEGORY_CONTENT } from '@/data/directory-content'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const revalidate = 1800

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>
}): Promise<Metadata> {
  const { categorie } = await params
  const cat = getCategoryBySlug(categorie)
  if (!cat) return {}

  // Audit #12 : si la categorie ne contient aucun prestataire actif,
  // on noindex la page pour ne pas polluer les resultats Google avec
  // des landings vides. Le sitemap.ts applique la meme logique.
  const { count } = await getAdminClient()
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('category', categorie)
    .eq('status', 'active')

  const isEmpty = !count || count === 0

  return {
    title: {
      absolute: `${cat.label === 'Climatisation' ? 'Technicien climatisation' : cat.label} francophone en Israel — References | Tloush Recommande`,
    },
    description: `Trouvez un ${cat.label === 'Climatisation' ? 'technicien climatisation' : cat.label.toLowerCase()} francophone et reference en Israel. Avis clients, notes, contact direct. Gratuit.`,
    robots: isEmpty
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorie: string }>
}) {
  const { categorie } = await params
  const category = getCategoryBySlug(categorie)
  if (!category) notFound()

  const CategoryIcon = category.icon
  const content = CATEGORY_CONTENT[categorie as keyof typeof CATEGORY_CONTENT]

  const { data: providers } = await getAdminClient()
    .from('providers')
    .select('id, slug, first_name, last_name, photo_url, category, specialties, service_areas, languages, description, years_experience, is_referenced, average_rating, total_reviews, created_at, updated_at')
    .eq('category', categorie)
    .eq('status', 'active')
    .order('average_rating', { ascending: false })
    .order('total_reviews', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <DirectoryPageTracker
        event="directory_category_viewed"
        properties={{ category: categorie, provider_count: (providers || []).length }}
      />
      {/* Breadcrumb */}
      <Link
        href="/annuaire/artisans"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 mb-6"
      >
        <ArrowLeft size={14} />
        Toutes les categories
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className={`p-3 rounded-xl border ${category.color}`}>
          <CategoryIcon size={28} className={category.iconColor} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {category.label}s francophones en Israel
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 mt-1">
            {category.hebrewTerm} · {category.description}
          </p>
        </div>
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium mb-8">
        <ShieldCheck size={14} />
        {(providers || []).length} prestataire{(providers || []).length > 1 ? 's' : ''} reference{(providers || []).length > 1 ? 's' : ''}
      </div>

      {/* Provider listing */}
      {(providers || []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(providers as Provider[]).map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-neutral-50 dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-700">
          <CategoryIcon size={40} className="mx-auto text-neutral-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-slate-300 mb-2">
            Bientot disponible
          </h3>
          <p className="text-sm text-neutral-500 dark:text-slate-400 max-w-md mx-auto">
            Nous recrutons activement des {category.label.toLowerCase()}s francophones.
            Revenez bientot ou inscrivez-vous en tant que prestataire.
          </p>
          <Link
            href="/annuaire/artisans/inscription"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Devenir prestataire
          </Link>
        </div>
      )}

      {/* Editorial content + FAQ */}
      {content && (
        <div className="mt-12 space-y-8">
          {/* Guide */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">{content.guideTitle}</h2>
            <p className="text-sm text-neutral-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{content.guideText}</p>
          </div>

          {/* Price range */}
          {content.priceRange && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Fourchette de prix en Israel</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">{content.priceRange}</p>
            </div>
          )}

          {/* Hebrew glossary */}
          {content.glossary && content.glossary.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Vocabulaire hebreu utile</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {content.glossary.map(g => (
                  <div key={g.hebrew} className="bg-neutral-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
                    <span className="font-medium text-neutral-700 dark:text-slate-300">{g.french}</span>
                    <span className="block text-neutral-400 text-xs mt-0.5">{g.hebrew}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {content.faq && content.faq.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Questions frequentes</h3>
              <div className="space-y-3">
                {content.faq.map((q, i) => (
                  <details key={i} className="group border border-neutral-200 dark:border-slate-700 rounded-xl">
                    <summary className="px-4 py-3 text-sm font-medium text-neutral-800 dark:text-slate-200 cursor-pointer list-none flex justify-between items-center">
                      {q.question}
                      <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <p className="px-4 pb-3 text-sm text-neutral-500 dark:text-slate-400">{q.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* JSON-LD Schemas */}
      {(providers || []).length > 0 && (
        <CategoryListJsonLd
          categoryLabel={category.label}
          providers={(providers as Provider[]).map(p => ({ first_name: p.first_name, last_name: p.last_name, slug: p.slug, category: p.category, average_rating: p.average_rating }))}
        />
      )}
      {content?.faq && <FAQJsonLd questions={content.faq} />}

      {/* Disclaimer */}
      <div className="mt-12 bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded-2xl p-5 text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
        <p>
          Les prestataires references exercent de maniere independante. Tloush agit comme intermediaire de mise en relation et ne garantit pas la qualite des prestations. Il appartient au client de verifier les qualifications du prestataire.
        </p>
      </div>
    </div>
  )
}
