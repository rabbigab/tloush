import { create } from 'zustand'
import type { Listing, ListingFilters, ListingType, ListingSource } from '@/types/listings'

interface ListingsState {
  listings: Listing[]
  total: number
  page: number
  totalPages: number
  loading: boolean
  error: string | null

  // Filtres
  filters: ListingFilters
  setFilter: <K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) => void
  resetFilters: () => void

  // Selection carte
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  hoveredId: string | null
  setHoveredId: (id: string | null) => void

  // Vue
  view: 'list' | 'map' | 'split'
  setView: (view: 'list' | 'map' | 'split') => void

  // Actions
  fetchListings: () => Promise<void>
  setPage: (page: number) => void
}

const DEFAULT_FILTERS: ListingFilters = {
  listing_type: 'rent',
  page: 1,
  limit: 20,
  sort_by: 'date_desc',
}

export const useListingsStore = create<ListingsState>((set, get) => ({
  listings: [],
  total: 0,
  page: 1,
  totalPages: 0,
  loading: false,
  error: null,

  filters: { ...DEFAULT_FILTERS },
  selectedId: null,
  hoveredId: null,
  view: 'split',

  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value, page: 1 },
      page: 1,
    }))
    get().fetchListings()
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS }, page: 1 })
    get().fetchListings()
  },

  setSelectedId: (id) => set({ selectedId: id }),
  setHoveredId: (id) => set({ hoveredId: id }),
  setView: (view) => set({ view }),

  setPage: (page) => {
    set(state => ({ page, filters: { ...state.filters, page } }))
    get().fetchListings()
  },

  fetchListings: async () => {
    set({ loading: true, error: null })

    const { filters } = get()
    const params = new URLSearchParams()

    if (filters.source) params.set('source', filters.source)
    if (filters.listing_type) params.set('type', filters.listing_type)
    if (filters.property_type) params.set('property', filters.property_type)
    if (filters.city) params.set('city', filters.city)
    if (filters.min_price) params.set('min_price', String(filters.min_price))
    if (filters.max_price) params.set('max_price', String(filters.max_price))
    if (filters.min_rooms) params.set('min_rooms', String(filters.min_rooms))
    if (filters.max_rooms) params.set('max_rooms', String(filters.max_rooms))
    if (filters.min_size) params.set('min_size', String(filters.min_size))
    if (filters.max_size) params.set('max_size', String(filters.max_size))
    if (filters.has_parking) params.set('parking', 'true')
    if (filters.has_elevator) params.set('elevator', 'true')
    if (filters.furnished) params.set('furnished', 'true')
    if (filters.sort_by) params.set('sort', filters.sort_by)
    params.set('page', String(filters.page || 1))
    params.set('limit', String(filters.limit || 20))

    try {
      const res = await fetch(`/api/listings/search?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      set({
        listings: data.listings,
        total: data.total,
        page: data.page,
        totalPages: data.total_pages,
        loading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erreur de chargement',
        loading: false,
      })
    }
  },
}))
