import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getCategoryBySlug } from '@/types/directory'
import type { ProviderReviewDisplay } from '@/types/directory'
import type { Metadata } from 'next'
import DirectoryProviderClient from './DirectoryProviderClient'
import { ProviderJsonLd } from '@/components/directory/ProviderSchema'

export const revalidate = 1800

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string; slug: string }>
}): Promise<Metadata> {
  const { categorie, slug } = await params
  const cat = getCategoryBySlug(categorie)

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('first_name, last_name, service_areas, average_rating, total_reviews')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!provider || !cat) return {}

  const city = provider.service_areas?.[0] || 'Israel'

  return {
    title: `${provider.first_name} ${provider.last_name.charAt(0)}. — ${cat.label} francophone a ${city} | Tloush`,
    description: `${provider.first_name}, ${cat.label.toLowerCase()} francophone a ${city}. ${provider.total_reviews > 0 ? `${provider.average_rating}/5 (${provider.total_reviews} avis).` : ''} Contactez gratuitement via Tloush Recommande.`,
  }
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ categorie: string; slug: string }>
}) {
  const { categorie, slug } = await params
  const category = getCategoryBySlug(categorie)
  if (!category) notFound()

  // Fetch provider
  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!provider) notFound()

  // Fetch published reviews
  const { data: reviews } = await supabaseAdmin
    .from('provider_reviews')
    .select('id, rating, comment, provider_response, provider_responded_at, created_at, user_id')
    .eq('provider_id', provider.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  // Count contacts this month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count: contactsThisMonth } = await supabaseAdmin
    .from('provider_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', provider.id)
    .gte('created_at', monthStart.toISOString())

  return (
    <>
      <ProviderJsonLd
        provider={provider}
        categoryLabel={category.label}
        reviews={(reviews || []).map(r => ({ rating: r.rating, comment: r.comment, created_at: r.created_at }))}
      />
      <DirectoryProviderClient
        provider={provider}
        reviews={(reviews || []) as ProviderReviewDisplay[]}
        contactsThisMonth={contactsThisMonth || 0}
        categoryLabel={category.label}
        categorySlug={category.slug}
      />
    </>
  )
}
