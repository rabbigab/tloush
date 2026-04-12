'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useListingsStore } from '@/store/listingsStore'
import { ISRAELI_CITIES } from '@/types/listings'

export default function ListingsFilters() {
  const { filters, setFilter, resetFilters, total, loading } = useListingsStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-3">
      {/* Ligne 1: Type + Ville + Recherche rapide */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Location / Vente */}
        <div className="flex rounded-lg border border-neutral-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setFilter('listing_type', 'rent')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filters.listing_type === 'rent'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-700'
            }`}
          >
            Location
          </button>
          <button
            onClick={() => setFilter('listing_type', 'sale')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filters.listing_type === 'sale'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-700'
            }`}
          >
            Vente
          </button>
        </div>

        {/* Ville */}
        <select
          value={filters.city || ''}
          onChange={(e) => setFilter('city', e.target.value || undefined)}
          className="px-3 py-2 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300"
        >
          <option value="">Toutes les villes</option>
          {ISRAELI_CITIES.map(city => (
            <option key={city.slug} value={city.name}>
              {city.name} ({city.nameHe})
            </option>
          ))}
        </select>

        {/* Source */}
        <select
          value={filters.source || ''}
          onChange={(e) => setFilter('source', (e.target.value || undefined) as typeof filters.source)}
          className="px-3 py-2 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300"
        >
          <option value="">Toutes les sources</option>
          <option value="yad2">Yad2</option>
          <option value="facebook">Facebook</option>
        </select>

        {/* Toggle filtres avances */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
            showAdvanced
              ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/30 text-blue-600'
              : 'border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-700'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filtres
        </button>

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-slate-300 transition-colors"
        >
          <X size={14} />
          Reinitialiser
        </button>

        {/* Compteur */}
        <span className="text-sm text-neutral-400 dark:text-slate-500 ml-auto">
          {loading ? 'Chargement...' : `${total} annonce${total > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Ligne 2: Filtres avances */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-neutral-50 dark:bg-slate-800/50 rounded-xl border border-neutral-100 dark:border-slate-700">
          {/* Prix */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500 dark:text-slate-400 font-medium">Prix</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price || ''}
              onChange={(e) => setFilter('min_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-24 px-2 py-1.5 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price || ''}
              onChange={(e) => setFilter('max_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-24 px-2 py-1.5 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            />
          </div>

          {/* Pieces */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500 dark:text-slate-400 font-medium">Pieces</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.min_rooms || ''}
              onChange={(e) => setFilter('min_rooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-16 px-2 py-1.5 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_rooms || ''}
              onChange={(e) => setFilter('max_rooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-16 px-2 py-1.5 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            />
          </div>

          {/* Surface */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500 dark:text-slate-400 font-medium">Surface</label>
            <input
              type="number"
              placeholder="Min m²"
              value={filters.min_size || ''}
              onChange={(e) => setFilter('min_size', e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 px-2 py-1.5 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              placeholder="Max m²"
              value={filters.max_size || ''}
              onChange={(e) => setFilter('max_size', e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 px-2 py-1.5 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.has_parking}
                onChange={(e) => setFilter('has_parking', e.target.checked || undefined)}
                className="rounded border-neutral-300"
              />
              Parking
            </label>
            <label className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.has_elevator}
                onChange={(e) => setFilter('has_elevator', e.target.checked || undefined)}
                className="rounded border-neutral-300"
              />
              Ascenseur
            </label>
            <label className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.furnished}
                onChange={(e) => setFilter('furnished', e.target.checked || undefined)}
                className="rounded border-neutral-300"
              />
              Meuble
            </label>
          </div>

          {/* Tri */}
          <select
            value={filters.sort_by || 'date_desc'}
            onChange={(e) => setFilter('sort_by', e.target.value as typeof filters.sort_by)}
            className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300"
          >
            <option value="date_desc">Plus recentes</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix decroissant</option>
            <option value="size_desc">Plus grandes</option>
          </select>
        </div>
      )}
    </div>
  )
}
