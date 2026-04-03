'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, BarChart3, Loader2 } from 'lucide-react'
import { track } from '@/lib/analytics'

interface Payslip {
  id: string
  file_name: string
  period: string | null
  document_type: string
  created_at: string
}

interface Change {
  field: string
  old_value: string
  new_value: string
  change_percent: number | null
  severity: 'positive' | 'neutral' | 'warning' | 'alert'
  explanation: string
}

interface Anomaly {
  description: string
  severity: 'warning' | 'alert'
  recommendation: string
}

interface ComparisonResult {
  comparison: {
    summary: string
    changes: Change[]
    anomalies: Anomaly[]
    overall_status: 'stable' | 'improved' | 'degraded' | 'attention_required'
  }
  older: { id: string; file_name: string; period: string | null }
  newer: { id: string; file_name: string; period: string | null }
}

const STATUS_CONFIG = {
  stable: { label: 'Stable', color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800', icon: Minus },
  improved: { label: 'Ameliore', color: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800', icon: TrendingUp },
  degraded: { label: 'Degrade', color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', icon: TrendingDown },
  attention_required: { label: 'Attention requise', color: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800', icon: AlertTriangle },
}

const SEVERITY_COLORS = {
  positive: 'bg-green-50 border-green-200 border-l-4 border-l-green-500 dark:bg-green-950/30 dark:border-green-800 dark:border-l-green-500',
  neutral: 'bg-slate-50 border-slate-200 border-l-4 border-l-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:border-l-slate-500',
  warning: 'bg-amber-50 border-amber-200 border-l-4 border-l-amber-500 dark:bg-amber-950/30 dark:border-amber-800 dark:border-l-amber-500',
  alert: 'bg-red-50 border-red-200 border-l-4 border-l-red-500 dark:bg-red-950/30 dark:border-red-800 dark:border-l-red-500',
}

export default function CompareClient({ payslips }: { payslips: Payslip[] }) {
  const [doc1, setDoc1] = useState('')
  const [doc2, setDoc2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ComparisonResult | null>(null)

  async function handleCompare() {
    if (!doc1 || !doc2 || doc1 === doc2) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId1: doc1, docId2: doc2 })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(res.status === 429
          ? 'Limite atteinte. Réessayez plus tard.'
          : 'Une erreur est survenue lors de la comparaison. Réessayez.')
        return
      }
      setResult(data)
      track('report_generated', { type: 'comparison', status: data.comparison?.overall_status })
    } catch {
      setError('Erreur de connexion. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 w-full">

        {/* Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="page-title mb-1 flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-600" />
            Comparer deux fiches de paie
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Sélectionnez deux fiches pour voir les différences et anomalies</p>

          {payslips.length < 2 ? (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6 text-center">
              <BarChart3 size={28} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Pas assez de fiches de paie</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Uploadez au moins 2 fiches de paie dans votre inbox pour utiliser la comparaison.
              </p>
              <Link href="/inbox" className="inline-flex items-center gap-1.5 mt-4 text-sm text-brand-600 font-medium hover:text-brand-700 min-h-[44px]">
                Aller à l&apos;inbox
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              <fieldset>
                <legend className="sr-only">Sélectionnez deux fiches à comparer</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="doc1" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Fiche ancienne</label>
                    <select
                      id="doc1"
                      value={doc1}
                      onChange={e => setDoc1(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white dark:bg-slate-700"
                    >
                      <option value="">Sélectionner...</option>
                      {payslips.map(p => (
                        <option key={p.id} value={p.id} disabled={p.id === doc2}>
                          {p.period || p.file_name} — {formatDate(p.created_at)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="doc2" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Fiche recente</label>
                    <select
                      id="doc2"
                      value={doc2}
                      onChange={e => setDoc2(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white dark:bg-slate-700"
                    >
                      <option value="">Sélectionner...</option>
                      {payslips.map(p => (
                        <option key={p.id} value={p.id} disabled={p.id === doc1}>
                          {p.period || p.file_name} — {formatDate(p.created_at)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              <button
                onClick={handleCompare}
                disabled={!doc1 || !doc2 || doc1 === doc2 || loading}
                className="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    Comparer
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </>
          )}

          {error && (
            <div className="mt-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Resultats */}
        {result && (
          <>
            {/* Status global */}
            {(() => {
              const status = STATUS_CONFIG[result.comparison.overall_status] || STATUS_CONFIG.stable
              const StatusIcon = status.icon
              return (
                <div className={`rounded-2xl border p-5 shadow-sm ${status.color}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusIcon size={20} />
                    <h3 className="font-bold text-base">{status.label}</h3>
                  </div>
                  <p className="text-sm">{result.comparison.summary}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs opacity-75">
                    <span>{result.older.period || result.older.file_name}</span>
                    <ArrowRight size={12} />
                    <span>{result.newer.period || result.newer.file_name}</span>
                  </div>
                </div>
              )
            })()}

            {/* Changements */}
            {result.comparison.changes.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="section-heading mb-4">Changements detectes</h3>
                <div className="space-y-3">
                  {result.comparison.changes.map((change, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${SEVERITY_COLORS[change.severity]}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{change.field}</span>
                        {change.change_percent !== null && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            change.change_percent > 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : change.change_percent < 0
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {change.change_percent > 0 ? '+' : ''}{change.change_percent}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span className="line-through opacity-60">{change.old_value}</span>
                        <ArrowRight size={10} />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{change.new_value}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{change.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {result.comparison.anomalies.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="section-heading mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
                  Anomalies detectees
                </h3>
                <div className="space-y-3">
                  {result.comparison.anomalies.map((anomaly, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${
                      anomaly.severity === 'alert'
                        ? 'bg-red-50 border-red-200 border-l-4 border-l-red-500 dark:bg-red-950/30 dark:border-red-800 dark:border-l-red-500'
                        : 'bg-amber-50 border-amber-200 border-l-4 border-l-amber-500 dark:bg-amber-950/30 dark:border-amber-800 dark:border-l-amber-500'
                    }`}>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{anomaly.description}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{anomaly.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pas d'anomalie */}
            {result.comparison.anomalies.length === 0 && (
              <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Aucune anomalie detectee</p>
                  <p className="text-xs text-green-700 dark:text-green-400">Les changements entre les deux fiches semblent normaux.</p>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  )
}
