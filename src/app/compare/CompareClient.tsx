'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, BarChart3, Loader2 } from 'lucide-react'
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
  stable: { label: 'Stable', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Minus },
  improved: { label: 'Amélioré', color: 'bg-green-50 text-green-700 border-green-200', icon: TrendingUp },
  degraded: { label: 'Dégradé', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: TrendingDown },
  attention_required: { label: 'Attention requise', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle },
}

const SEVERITY_COLORS = {
  positive: 'bg-green-50 border-green-200',
  neutral: 'bg-slate-50 border-slate-200',
  warning: 'bg-amber-50 border-amber-200',
  alert: 'bg-red-50 border-red-200',
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
        setError(data.error || 'Erreur lors de la comparaison')
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/inbox" className="text-slate-400 hover:text-slate-600" aria-label="Retour à la boîte de réception">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-xl font-extrabold text-blue-600">Tloush</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500 font-medium">Comparer mes fiches de paie</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Sélection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            Comparer deux fiches de paie
          </h2>
          <p className="text-sm text-slate-500 mb-5">Sélectionnez deux fiches pour voir les différences et anomalies</p>

          {payslips.length < 2 ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <BarChart3 size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Pas assez de fiches de paie</p>
              <p className="text-xs text-slate-400 mt-1">
                Uploadez au moins 2 fiches de paie dans votre inbox pour utiliser la comparaison.
              </p>
              <Link href="/inbox" className="inline-block mt-4 text-sm text-blue-600 font-medium hover:text-blue-700">
                Aller à l'inbox
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Fiche ancienne</label>
                  <select
                    value={doc1}
                    onChange={e => setDoc1(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Fiche récente</label>
                  <select
                    value={doc2}
                    onChange={e => setDoc2(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
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

              <button
                onClick={handleCompare}
                disabled={!doc1 || !doc2 || doc1 === doc2 || loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Résultats */}
        {result && (
          <>
            {/* Status global */}
            {(() => {
              const status = STATUS_CONFIG[result.comparison.overall_status] || STATUS_CONFIG.stable
              const StatusIcon = status.icon
              return (
                <div className={`rounded-2xl border p-5 ${status.color}`}>
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
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Changements détectés</h3>
                <div className="space-y-3">
                  {result.comparison.changes.map((change, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${SEVERITY_COLORS[change.severity]}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-800">{change.field}</span>
                        {change.change_percent !== null && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            change.change_percent > 0
                              ? 'bg-green-100 text-green-700'
                              : change.change_percent < 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {change.change_percent > 0 ? '+' : ''}{change.change_percent}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span>{change.old_value}</span>
                        <ArrowRight size={10} />
                        <span className="font-medium text-slate-700">{change.new_value}</span>
                      </div>
                      <p className="text-xs text-slate-600">{change.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {result.comparison.anomalies.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Anomalies détectées
                </h3>
                <div className="space-y-3">
                  {result.comparison.anomalies.map((anomaly, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${
                      anomaly.severity === 'alert' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <p className="text-sm font-medium text-slate-800 mb-1">{anomaly.description}</p>
                      <p className="text-xs text-slate-600">{anomaly.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pas d'anomalie */}
            {result.comparison.anomalies.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Aucune anomalie détectée</p>
                  <p className="text-xs text-green-600">Les changements entre les deux fiches semblent normaux.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
