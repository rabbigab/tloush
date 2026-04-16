import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, CheckCircle2 } from 'lucide-react'
import { getCategoryBySlug, formatRating } from '@/types/directory'
import type { Provider } from '@/types/directory'
import { getProviderDisplayName, getProviderInitial } from '@/lib/providerDisplay'

interface ProviderCardProps {
  provider: Provider
  topReview?: string | null
  topReviewAuthor?: string | null
}

export default function ProviderCard({ provider, topReview, topReviewAuthor }: ProviderCardProps) {
  const category = getCategoryBySlug(provider.category)
  const CategoryIcon = category?.icon
  const displayName = getProviderDisplayName(provider)

  return (
    <Link
      href={`/annuaire/${provider.category}/${provider.slug}`}
      className="block border border-neutral-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 transition-all bg-white dark:bg-slate-900"
    >
      {/* Header: photo + name + badge */}
      <div className="flex items-start gap-3.5 mb-3">
        {provider.photo_url ? (
          <Image
            src={provider.photo_url}
            alt={displayName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
            loading="lazy"
          />
        ) : (
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${category?.color || 'bg-neutral-100'}`}>
            <span className={category?.iconColor || 'text-neutral-600'}>
              {getProviderInitial(provider.first_name)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{displayName}</h3>
            {provider.is_referenced && (
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400 mt-0.5">
            {CategoryIcon && <CategoryIcon size={14} />}
            <span>{category?.label}</span>
            <span className="text-neutral-300 dark:text-slate-600">·</span>
            <MapPin size={12} />
            <span className="truncate">{provider.service_areas.slice(0, 2).join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      {provider.total_reviews > 0 ? (
        <div className="flex items-center gap-1.5 mb-3">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span className="font-semibold text-sm text-neutral-800 dark:text-white">
            {formatRating(provider.average_rating)}
          </span>
          <span className="text-sm text-neutral-400 dark:text-slate-500">
            ({provider.total_reviews} avis)
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            Nouveau
          </span>
        </div>
      )}

      {/* Specialties */}
      {provider.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.specialties.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Top review quote */}
      {topReview && (
        <p className="text-sm text-neutral-500 dark:text-slate-400 italic line-clamp-2 mb-3">
          &ldquo;{topReview}&rdquo;
          {topReviewAuthor && <span className="not-italic text-neutral-400"> — {topReviewAuthor}</span>}
        </p>
      )}

      {/* CTA */}
      <div className="text-center py-2 rounded-xl border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors">
        Obtenir le contact →
      </div>
    </Link>
  )
}
