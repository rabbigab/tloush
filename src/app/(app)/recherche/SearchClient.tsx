'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, FileText, AlertCircle, Clock, X } from 'lucide-react'
import { DOC_LABELS, DOC_COLORS } from '@/lib/docTypes'

interface SearchResult {
  id: string
  file_name: string
  document_type: string
  period: string | null
  summary_fr: string | null
  is_urgent: boolean
  action_required: boolean
  created_at: string
}

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setHasSearched(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const { results } = await res.json()
          setResults(results)
          setHasSearched(true)
        }
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function highlight(text: string, q: string) {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="page-title mb-1">Recherche</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cherchez dans le nom, résumé, période de tous vos documents.
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ex : arnona, Bituah Leumi, avril 2025..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl pl-11 pr-11 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-300 shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            aria-label="Effacer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">Recherche…</div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <Search size={24} className="text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucun résultat pour &quot;{query}&quot;</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{results.length} résultat{results.length > 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {results.map(doc => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 p-4 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DOC_COLORS[doc.document_type] || DOC_COLORS.other}`}>
                    {DOC_LABELS[doc.document_type] || 'Document'}
                  </span>
                  {doc.is_urgent && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <AlertCircle size={10} /> Urgent
                    </span>
                  )}
                  {doc.action_required && !doc.is_urgent && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      <Clock size={10} /> Action
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {highlight(doc.file_name, query)}
                </p>
                {doc.period && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{highlight(doc.period, query)}</p>
                )}
                {doc.summary_fr && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{highlight(doc.summary_fr, query)}</p>
                )}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">{formatDate(doc.created_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!query && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-brand-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tapez au moins 2 caractères pour chercher.
          </p>
        </div>
      )}
    </div>
  )
}
