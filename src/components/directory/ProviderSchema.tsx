import type { Provider } from '@/types/directory'
import { getProviderDisplayName } from '@/lib/providerDisplay'

interface ProviderSchemaProps {
  provider: Provider
  categoryLabel: string
  reviews?: { rating: number; comment: string | null; created_at: string }[]
}

export function ProviderJsonLd({ provider, categoryLabel, reviews }: ProviderSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${getProviderDisplayName(provider)} — ${categoryLabel}`,
    description: provider.description || `${categoryLabel} francophone en Israel`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: provider.service_areas[0] || 'Israel',
      addressCountry: 'IL',
    },
    areaServed: provider.service_areas.map(area => ({
      '@type': 'City',
      name: area,
    })),
    knowsLanguage: provider.languages,
    ...(provider.total_reviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: provider.average_rating.toString(),
        reviewCount: provider.total_reviews.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(reviews && reviews.length > 0 && {
      review: reviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating.toString(),
        },
        datePublished: r.created_at.split('T')[0],
        ...(r.comment && { reviewBody: r.comment }),
      })),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface CategoryListSchemaProps {
  categoryLabel: string
  providers: { first_name: string; last_name: string; slug: string; category: string; average_rating: number }[]
}

export function CategoryListJsonLd({ categoryLabel, providers }: CategoryListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryLabel}s francophones en Israel`,
    numberOfItems: providers.length,
    itemListElement: providers.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://tloush.com/annuaire/${p.category}/${p.slug}`,
      name: getProviderDisplayName(p),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQSchemaProps {
  questions: { question: string; answer: string }[]
}

export function FAQJsonLd({ questions }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
