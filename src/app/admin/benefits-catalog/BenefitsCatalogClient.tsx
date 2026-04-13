'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, CheckCircle2, AlertTriangle, AlertCircle, Search, RefreshCw } from 'lucide-react'
import type { BenefitDefinition } from '@/lib/benefitsCatalog'

interface CatalogData {
  metadata: {
    version: string
    last_updated: string
    total_benefits: number
    data_sources: string[]
    disclaimer_global: string
  }
  summary: {
    total: number
    high_confidence: number
    needs_verification: number
    by_category: Record<string, number>
  }
  stats: {
    total: number
    byCategory: Record<string, number>
    byAuthority: Record<string, number>
    byConfidence: { high: number; medium: number; low: number }
    byStatus: { verified: number; needs_verification: number; estimated: number }
  }
  catalog: BenefitDefinition[]
}

const CATEGORY_LABELS: Record<string, string> = {
  fiscal: 'Fiscal',
  family: 'Famille',
  employment: 'Emploi',
  health: 'Sante',
  retirement: 'Retraite',
  housing: 'Logement',
  military: 'Militaire',
  welfare: 'Aide sociale',
  immigration: 'Alyah / Olim',
  education: 'Education',
  special: 'Special',
}

const AUTHORITY_LABELS: Record<string, string> = {
  bituach_leumi: 'Bituach Leumi',
  tax_authority: 'Rashut HaMisim',
  misrad_haklita: 'Misrad HaKlita',
  misrad_hashikun: 'Misrad HaShikun',
  misrad_habitahon: 'Misrad HaBitachon',
  municipality: 'Mairie',
  misrad_hachinuch: 'Misrad HaChinuch',
  claims_conference: 'Claims Conference',
  other: 'Autre',
}

export default function BenefitsCatalogClient() {
  const [data, setData] = useState<CatalogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/benefits-catalog')
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Erreur')
        return
      }
      setData(await res.json())
      setError('')
    } catch {
      setError('Erreur reseau')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.catalog
    if (categoryFilter !== 'all') list = list.filter(b => b.category === categoryFilter)
    if (confidenceFilter !== 'all') list = list.filter(b => b.confidence === confidenceFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        b =>
          b.title_fr.toLowerCase().includes(q) ||
          b.description_fr.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q)
      )
    }
    return list
  }, [data, categoryFilter, confidenceFilter, search])

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error || 'Erreur de chargement'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Catalogue de benefices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Version {data.metadata.version} · derniere maj {data.metadata.last_updated}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total benefices" value={String(data.stats.total)} color="blue" />
        <StatCard
          label="Haute confiance"
          value={String(data.stats.byConfidence.high)}
          subtitle={`${Math.round((data.stats.byConfidence.high / data.stats.total) * 100)}%`}
          color="green"
        />
        <StatCard
          label="A verifier"
          value={String(data.stats.byStatus.needs_verification)}
          subtitle={`${Math.round((data.stats.byStatus.needs_verification / data.stats.total) * 100)}%`}
          color="amber"
        />
        <StatCard
          label="Categories"
          value={String(Object.keys(data.stats.byCategory).length)}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un benefice..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
        >
          <option value="all">Toutes categories ({data.stats.total})</option>
          {Object.entries(data.stats.byCategory).map(([cat, count]) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] || cat} ({count})
            </option>
          ))}
        </select>
        <select
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
        >
          <option value="all">Toutes confiances</option>
          <option value="high">Haute confiance ({data.stats.byConfidence.high})</option>
          <option value="medium">Moyenne ({data.stats.byConfidence.medium})</option>
          <option value="low">Basse ({data.stats.byConfidence.low})</option>
        </select>
      </div>

      {/* Benefits list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            Aucun benefice ne correspond aux filtres.
          </div>
        )}
        {filtered.map(b => (
          <div
            key={b.slug}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {b.title_fr}
                  </h3>
                  {b.title_he && (
                    <span className="text-xs text-slate-400" dir="rtl">{b.title_he}</span>
                  )}
                  <ConfidenceBadge level={b.confidence} />
                  <StatusBadge status={b.status} />
                  <span className="text-xs font-mono text-slate-400">{b.slug}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{b.description_fr}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span>{CATEGORY_LABELS[b.category] || b.category}</span>
              <span>·</span>
              <span>{AUTHORITY_LABELS[b.authority] || b.authority}</span>
              {b.estimated_annual_value !== undefined && (
                <>
                  <span>·</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    ≈ {Number(b.estimated_annual_value).toLocaleString('fr-IL')} {b.value_unit}
                  </span>
                </>
              )}
              {b.tax_year && (
                <>
                  <span>·</span>
                  <span>Annee {b.tax_year}</span>
                </>
              )}
              <span>·</span>
              <span>Verifie {b.verified_at}</span>
            </div>

            {b.notes && (
              <p className="text-xs text-slate-400 italic mb-2">Note: {b.notes}</p>
            )}

            {b.disclaimer && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1 mb-2">
                <AlertCircle size={10} className="shrink-0 mt-0.5" />
                {b.disclaimer}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3">
              <a
                href={b.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Source officielle <ExternalLink size={10} />
              </a>
              {b.info_url && (
                <a
                  href={b.info_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline inline-flex items-center gap-1"
                >
                  Info tierce <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
        {data.metadata.disclaimer_global}
      </div>
    </div>
  )
}

function StatCard({ label, value, subtitle, color }: { label: string; value: string; subtitle?: string; color: 'blue' | 'green' | 'amber' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <p className={`text-xs font-medium uppercase tracking-wider mb-2 px-2 py-0.5 inline-block rounded-full ${colors[color]}`}>
        {label}
      </p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  )
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700',
  }
  const labels = { high: 'Haute', medium: 'Moyenne', low: 'Basse' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[level]}`}>
      {labels[level]}
    </span>
  )
}

function StatusBadge({ status }: { status: 'verified' | 'needs_verification' | 'estimated' }) {
  if (status === 'verified') {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
        <CheckCircle2 size={10} /> Verifie
      </span>
    )
  }
  if (status === 'needs_verification') {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 inline-flex items-center gap-1">
        <AlertTriangle size={10} /> A verifier
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
      Estime
    </span>
  )
}
