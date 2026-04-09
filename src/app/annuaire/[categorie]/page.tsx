import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PROVIDER_CATEGORIES, getCategoryBySlug } from '@/types/directory'
import type { Provider } from '@/types/directory'
import type { Metadata } from 'next'
import ProviderCard from '@/components/directory/ProviderCard'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const revalidate = 1800

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateStaticParams() {
  return PROVIDER_CATEGORIES.map((c) => ({ categorie: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>
}): Promise<Metadata> {
  const { categorie } = await params
  const cat = getCategoryBySlug(categorie)
  if (!cat) return {}

  return {
    title: `${cat.label} francophone en Israel — References | Tloush Recommande`,
    description: `Trouvez un ${cat.label.toLowerCase()} francophone et reference en Israel. Avis clients, notes, contact direct. Gratuit.`,
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

  const { data: providers } = await supabaseAdmin
    .from('providers')
    .select('*')
    .eq('category', categorie)
    .eq('status', 'active')
    .order('average_rating', { ascending: false })
    .order('total_reviews', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        href="/annuaire"
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
            href="/annuaire/inscription"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Devenir prestataire
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded-2xl p-5 text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
        <p>
          Les prestataires references exercent de maniere independante. Tloush agit comme intermediaire de mise en relation et ne garantit pas la qualite des prestations. Il appartient au client de verifier les qualifications du prestataire.
        </p>
      </div>
    </div>
  )
}
