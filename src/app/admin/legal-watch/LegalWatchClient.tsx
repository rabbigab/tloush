'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, Clock, ExternalLink, RefreshCw, FileText, Scale, Users, Building2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface EnrichedConstant {
  id: string
  name: string
  value: number | string
  unit: string
  source_url: string
  verified_at: string
  verified_by: string
  confidence: 'high' | 'medium' | 'low'
  tax_year?: number
  notes?: string
  days_since_verification: number
  source_name: string
  source_category: string
  is_stale: boolean
  needs_refresh: boolean
}

interface LegalWatchData {
  stats: {
    total_constants: number
    total_sources: number
    stale_count: number
    to_refresh_count: number
  }
  constants: EnrichedConstant[]
  by_category: Record<string, EnrichedConstant[]>
}

const CATEGORY_LABELS: Record<string, string> = {
  tax: 'Fiscal',
  bl: 'Bituach Leumi',
  labor: 'Droit du travail',
  immigration: 'Immigration / Olim',
  general: 'General',
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  tax: FileText,
  bl: Shield,
  labor: Scale,
  immigration: Users,
  general: Building2,
}

export default function LegalWatchClient() {
  const [data, setData] = useState<LegalWatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/legal-watch')
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

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error || 'Erreur de chargement'}
        </div>
      </div>
    )
  }

  const alertsCount = data.stats.stale_count + data.stats.to_refresh_count

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={22} className="text-purple-600" /> Veille legale
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Suivi des constantes legales utilisees dans l'application + alertes automatiques
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<FileText size={20} />} label="Constantes" value={String(data.stats.total_constants)} color="blue" />
        <StatCard icon={<ExternalLink size={20} />} label="Sources" value={String(data.stats.total_sources)} color="purple" />
        <StatCard icon={<Clock size={20} />} label="A verifier" value={String(data.stats.stale_count)} color={data.stats.stale_count > 0 ? 'amber' : 'green'} />
        <StatCard icon={<AlertTriangle size={20} />} label="A rafraichir" value={String(data.stats.to_refresh_count)} color={data.stats.to_refresh_count > 0 ? 'red' : 'green'} />
      </div>

      {/* Alerte globale */}
      {alertsCount > 0 ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-4">
          <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              {alertsCount} constante(s) necessitent une verification
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Un email de rappel est envoye chaque lundi matin a l'administrateur.
              Cliquez sur chaque source officielle pour verifier la valeur actuelle.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-5 flex items-start gap-4">
          <CheckCircle2 size={24} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Toutes les constantes sont a jour
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              Derniere verification globale : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      )}

      {/* Constantes par categorie */}
      {Object.entries(data.by_category).map(([category, constants]) => {
        const Icon = CATEGORY_ICONS[category] || FileText
        return (
          <div key={category} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Icon size={18} className="text-purple-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <span className="text-xs text-slate-400">({constants.length})</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {constants.map(c => (
                <div key={c.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                        {c.tax_year && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                            {c.tax_year}
                          </span>
                        )}
                        {c.is_stale && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Stale
                          </span>
                        )}
                        {c.needs_refresh && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Refresh
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.confidence === 'high' ? 'bg-green-100 text-green-700' :
                          c.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {c.confidence}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                          {c.value}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{c.unit}</span>
                      </div>
                      {c.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.notes}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Verifie il y a {c.days_since_verification}j ({c.verified_at})</span>
                        <span>par {c.verified_by}</span>
                      </div>
                    </div>
                    <a
                      href={c.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline shrink-0"
                    >
                      Source <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div className="text-xs text-slate-400 dark:text-slate-500 text-center p-4">
        Ce dashboard est base sur <code>src/lib/legalWatch.ts</code>. Pour ajouter/modifier une constante,
        editez ce fichier et mettez a jour <code>verified_at</code>.
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue' | 'purple' | 'amber' | 'red' | 'green' }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
