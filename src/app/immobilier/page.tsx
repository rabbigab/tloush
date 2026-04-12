'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Map, List, LayoutGrid, Home, Building2, TrendingUp } from 'lucide-react'
import { useListingsStore } from '@/store/listingsStore'
import ListingCard from '@/components/listings/ListingCard'
import ListingsFilters from '@/components/listings/ListingsFilters'
import ListingsPagination from '@/components/listings/ListingsPagination'

// Charger la carte dynamiquement (pas de SSR pour Leaflet)
const ListingsMap = dynamic(() => import('@/components/listings/ListingsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-xl bg-neutral-100 dark:bg-slate-800 flex items-center justify-center">
      <span className="text-neutral-400">Chargement de la carte...</span>
    </div>
  ),
})

export default function ImmobilierPage() {
  const { listings, loading, error, view, setView, fetchListings, total } = useListingsStore()

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Home size={20} className="text-blue-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  Immobilier Israel
                </h1>
              </div>
              <p className="text-sm text-neutral-500 dark:text-slate-400">
                Toutes les annonces Yad2 + Facebook au meme endroit
              </p>
            </div>

            {/* Vue switcher */}
            <div className="flex rounded-lg border border-neutral-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`p-2 transition-colors ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-slate-700'
                }`}
                title="Liste"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setView('split')}
                className={`p-2 transition-colors ${
                  view === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-slate-700'
                }`}
                title="Liste + Carte"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('map')}
                className={`p-2 transition-colors ${
                  view === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-slate-700'
                }`}
                title="Carte"
              >
                <Map size={18} />
              </button>
            </div>
          </div>

          {/* Filtres */}
          <ListingsFilters />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-[1600px] mx-auto">
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Vue Split: Liste + Carte */}
        {view === 'split' && (
          <div className="flex h-[calc(100vh-200px)]">
            {/* Liste a gauche */}
            <div className="w-1/2 overflow-y-auto border-r border-neutral-200 dark:border-slate-700 p-4 space-y-3">
              {loading ? (
                <ListingSkeleton count={6} />
              ) : listings.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                  <ListingsPagination />
                </>
              )}
            </div>
            {/* Carte a droite */}
            <div className="w-1/2 sticky top-[200px]">
              <ListingsMap listings={listings} />
            </div>
          </div>
        )}

        {/* Vue Liste seule */}
        {view === 'list' && (
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ListingSkeleton count={9} />
              </div>
            ) : listings.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                <ListingsPagination />
              </>
            )}
          </div>
        )}

        {/* Vue Carte seule */}
        {view === 'map' && (
          <div className="h-[calc(100vh-200px)]">
            <ListingsMap listings={listings} />
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Building2 size={48} className="text-neutral-300 dark:text-slate-600 mb-4" />
      <h3 className="text-lg font-semibold text-neutral-700 dark:text-slate-300 mb-2">
        Aucune annonce trouvee
      </h3>
      <p className="text-sm text-neutral-500 dark:text-slate-400 max-w-sm">
        Essayez d'elargir vos criteres de recherche ou de changer de ville.
      </p>
    </div>
  )
}

function ListingSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-neutral-200 dark:border-slate-700 rounded-xl p-4 animate-pulse">
          <div className="h-36 bg-neutral-200 dark:bg-slate-700 rounded-lg mb-3" />
          <div className="h-5 bg-neutral-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
          <div className="h-4 bg-neutral-100 dark:bg-slate-800 rounded w-2/3 mb-3" />
          <div className="flex gap-3">
            <div className="h-4 bg-neutral-100 dark:bg-slate-800 rounded w-16" />
            <div className="h-4 bg-neutral-100 dark:bg-slate-800 rounded w-16" />
            <div className="h-4 bg-neutral-100 dark:bg-slate-800 rounded w-16" />
          </div>
        </div>
      ))}
    </>
  )
}
