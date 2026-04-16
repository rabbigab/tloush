import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/types/directory'
import type { ProviderReviewDisplay } from '@/types/directory'
import type { Metadata } from 'next'
import DirectoryProviderClient from './DirectoryProviderClient'
import { ProviderJsonLd } from '@/components/directory/ProviderSchema'
import { getAdminClient } from '@/lib/supabase/admin'
import { normalizeFirstName, normalizeLastInitial } from '@/lib/providerDisplay'

export const revalidate = 1800

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string; slug: string }>
}): Promise<Metadata> {
  const { categorie, slug } = await params
  const cat = getCategoryBySlug(categorie)

  const { data: provider } = await getAdminClient()
    .from('providers')
    .select('first_name, last_name, service_areas, average_rating, total_reviews')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!provider || !cat) return {}

  // Normalisation defensive : cf. src/lib/providerDisplay.ts pour
  // justification (la DB contient parfois des noms mal capitalises).
  const firstName = normalizeFirstName(provider.first_name)
  const lastInitial = normalizeLastInitial(provider.last_name)
  const city = provider.service_areas?.[0] || 'Israël'
  const catLabel = cat.label

  return {
    title: `${firstName} ${lastInitial} — ${catLabel} francophone à ${city}`,
    description: `${firstName}, ${catLabel.toLowerCase()} francophone à ${city}. ${provider.total_reviews > 0 ? `${provider.average_rating}/5 (${provider.total_reviews} avis).` : ''} Contactez gratuitement via Tloush Recommande.`,
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

  const supabaseAdmin = getAdminClient()

  // Fetch provider
  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('id, slug, first_name, last_name, photo_url, category, specialties, service_areas, languages, description, years_experience, is_referenced, status, average_rating, total_reviews, created_at, updated_at')
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
