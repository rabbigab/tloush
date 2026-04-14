'use client'

import Image from 'next/image'
import { MapPin, Bed, Maximize, Building2, Car, Wind, ArrowUpRight } from 'lucide-react'
import type { Listing } from '@/types/listings'
import { useListingsStore } from '@/store/listingsStore'

function formatPrice(price: number | null, currency: string): string {
  if (!price) return 'Prix non indique'
  const formatted = price.toLocaleString('fr-IL')
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₪'
  return `${formatted} ${symbol}`
}

function formatSource(source: string): string {
  return source === 'yad2' ? 'Yad2' : 'Facebook'
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Il y a moins d\'1h'
  if (diffHours < 24) return `Il y a ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return `Il y a ${Math.floor(diffDays / 7)} sem.`
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const { selectedId, setSelectedId, hoveredId, setHoveredId } = useListingsStore()
  const isSelected = selectedId === listing.id
  const isHovered = hoveredId === listing.id

  return (
    <div
      className={`relative border rounded-xl p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md'
          : isHovered
          ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/10'
          : 'border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-600'
      }`}
      onClick={() => setSelectedId(isSelected ? null : listing.id)}
      onMouseEnter={() => setHoveredId(listing.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* Image */}
      {listing.images?.[0] && (
        <div className="relative mb-3 rounded-lg overflow-hidden aspect-[16/10] bg-neutral-100 dark:bg-slate-800">
          <Image
            src={listing.images[0]}
            alt={listing.title || 'Photo'}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
          {/* Badge source */}
          <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${
            listing.source === 'yad2'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {formatSource(listing.source)}
          </span>
          {/* Badge type */}
          <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${
            listing.listing_type === 'rent'
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {listing.listing_type === 'rent' ? 'Location' : 'Vente'}
          </span>
        </div>
      )}

      {/* Prix */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-neutral-900 dark:text-white">
          {formatPrice(listing.price, listing.currency)}
        </span>
        {listing.listing_type === 'rent' && listing.price && (
          <span className="text-xs text-neutral-400">/mois</span>
        )}
      </div>

      {/* Localisation */}
      <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-slate-400 mb-3">
        <MapPin size={14} className="shrink-0" />
        <span className="truncate">
          {[listing.street, listing.neighborhood, listing.city].filter(Boolean).join(', ')}
        </span>
      </div>

      {/* Caracteristiques */}
      <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-slate-400 mb-3 flex-wrap">
        {listing.rooms && (
          <span className="flex items-center gap-1">
            <Bed size={14} />
            {listing.rooms} pcs
          </span>
        )}
        {listing.size_sqm && (
          <span className="flex items-center gap-1">
            <Maximize size={14} />
            {listing.size_sqm} m²
          </span>
        )}
        {listing.floor !== null && listing.floor !== undefined && (
          <span className="flex items-center gap-1">
            <Building2 size={14} />
            Et. {listing.floor}
          </span>
        )}
        {listing.parking && (
          <span className="flex items-center gap-1">
            <Car size={14} />
            P
          </span>
        )}
        {listing.air_conditioning && (
          <span className="flex items-center gap-1">
            <Wind size={14} />
            Clim
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-slate-700">
        <span className="text-xs text-neutral-400">
          {timeAgo(listing.scraped_at)}
        </span>
        <a
          href={listing.source_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Voir l'annonce
          <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  )
}
