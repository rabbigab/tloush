'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useListingsStore } from '@/store/listingsStore'

export default function ListingsPagination() {
  const { page, totalPages, setPage, loading } = useListingsStore()

  if (totalPages <= 1) return null

  const pages: (number | 'dots')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'dots') {
      pages.push('dots')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page <= 1 || loading}
        className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((p, i) =>
        p === 'dots' ? (
          <span key={`dots-${i}`} className="px-2 text-neutral-400">...</span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p)}
            disabled={loading}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-blue-600 text-white'
                : 'text-neutral-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages || loading}
        className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
