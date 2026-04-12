'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, FileText, Info, Upload } from 'lucide-react'
import type { PayslipTimelineResult } from '@/lib/payslipTimeline'

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec',
]

const CURRENT_YEAR = new Date().getFullYear()

interface ApiResponse extends PayslipTimelineResult {
  year: number
  availableYears: number[]
}

export default function AnnualPayslipClient() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payslips/annual?year=${year}`)
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
  }, [year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error || 'Erreur de chargement'}
        </div>
      </div>
    )
  }

  const { months, coverage, totals, trends, anomalies, availableYears } = data

  // Empty state
  if (months.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Evolution annuelle</h1>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-3xl p-8 text-center">
          <FileText size={48} className="text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Aucune fiche de paie pour {year}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Uploadez vos fiches de paie pour visualiser leur evolution annuelle
            et detecter automatiquement les variations de salaire.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            <Upload size={16} />
            Uploader une fiche
          </Link>
        </div>
      </div>
    )
  }

  // Build monthly data for chart
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const found = months.find(m => m.month === month)
    return {
      month,
      label: MONTH_NAMES[i],
      gross: found?.gross || 0,
      net: found?.net || 0,
      tax: found?.income_tax || 0,
      hasData: !!found,
    }
  })

  const maxGross = Math.max(...chartData.map(d => d.gross))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Evolution annuelle</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {coverage.totalMonths}/12 mois · {coverage.missingMonths.length} mois manquants
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-semibold"
        >
          {availableYears.length > 0 ? availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          )) : <option value={year}>{year}</option>}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Brut annuel"
          value={`${totals.grossYear.toLocaleString('fr-IL')} ₪`}
          subtitle={`Moyenne ${totals.averageMonthly.toLocaleString('fr-IL')} ₪/mois`}
          color="blue"
        />
        <SummaryCard
          label="Net annuel"
          value={`${totals.netYear.toLocaleString('fr-IL')} ₪`}
          subtitle={`${Math.round((totals.netYear / totals.grossYear) * 100)}% du brut`}
          color="green"
        />
        <SummaryCard
          label="Impots preleves"
          value={`${totals.taxYear.toLocaleString('fr-IL')} ₪`}
          subtitle={`${Math.round((totals.taxYear / totals.grossYear) * 100)}% du brut`}
          color="amber"
        />
        <SummaryCard
          label="Evolution"
          value={`${trends.grossEvolutionPct > 0 ? '+' : ''}${trends.grossEvolutionPct.toFixed(1)}%`}
          subtitle="Brut sur la periode"
          color={trends.grossEvolutionPct > 0 ? 'green' : trends.grossEvolutionPct < 0 ? 'red' : 'slate'}
        />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Evolution mensuelle du brut
        </h2>
        <div className="flex items-end gap-2 h-48">
          {chartData.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center group relative">
              {d.hasData ? (
                <>
                  <div className="relative w-full flex items-end" style={{ height: '100%' }}>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${(d.gross / maxGross) * 100}%`, minHeight: '4px' }}
                    />
                  </div>
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {d.label} : {d.gross.toLocaleString('fr-IL')} ₪
                  </div>
                </>
              ) : (
                <div className="w-full h-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-t opacity-50" />
              )}
              <span className="text-xs text-slate-400 mt-2">{d.label}</span>
            </div>
          ))}
        </div>
        {coverage.missingMonths.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1">
            <Info size={12} />
            Mois manquants : {coverage.missingMonths.join(', ')}
          </p>
        )}
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle size={14} />
            Variations detectees ({anomalies.length})
          </h2>
          <div className="space-y-2">
            {anomalies.map((a, i) => {
              const Icon = a.type === 'raise' ? TrendingUp : a.type === 'drop' ? TrendingDown : Info
              const colorCls = a.level === 'warning' ? 'text-amber-600' : a.type === 'raise' ? 'text-green-600' : a.type === 'drop' ? 'text-red-600' : 'text-blue-600'
              const bgCls = a.level === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' :
                            a.type === 'raise' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30' :
                            a.type === 'drop' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' :
                            'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30'
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${bgCls}`}>
                  <Icon size={18} className={`${colorCls} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                      <span className="text-xs text-slate-400">{a.month}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{a.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Monthly table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Detail mensuel
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Mois</th>
                <th className="px-4 py-2 text-right font-medium">Brut</th>
                <th className="px-4 py-2 text-right font-medium">Net</th>
                <th className="px-4 py-2 text-right font-medium">Impot</th>
                <th className="px-4 py-2 text-right font-medium">BL + sante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {months.map(m => (
                <tr key={m.document_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{m.period}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {m.gross ? `${m.gross.toLocaleString('fr-IL')} ₪` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-green-600 dark:text-green-400">
                    {m.net ? `${m.net.toLocaleString('fr-IL')} ₪` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-600 dark:text-amber-400">
                    {m.income_tax ? `${m.income_tax.toLocaleString('fr-IL')} ₪` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-500">
                    {((m.bituah_leumi || 0) + (m.health || 0)) > 0
                      ? `${((m.bituah_leumi || 0) + (m.health || 0)).toLocaleString('fr-IL')} ₪`
                      : '—'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-slate-900 font-bold">
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200">Total</td>
                <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
                  {totals.grossYear.toLocaleString('fr-IL')} ₪
                </td>
                <td className="px-4 py-3 text-right font-mono text-green-700 dark:text-green-300">
                  {totals.netYear.toLocaleString('fr-IL')} ₪
                </td>
                <td className="px-4 py-3 text-right font-mono text-amber-700 dark:text-amber-300">
                  {totals.taxYear.toLocaleString('fr-IL')} ₪
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                  {totals.blYear.toLocaleString('fr-IL')} ₪
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {coverage.missingMonths.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              {coverage.missingMonths.length} mois manquants
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Uploadez les fiches manquantes pour une vue complete : {coverage.missingMonths.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  subtitle,
  color,
}: {
  label: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'amber' | 'red' | 'slate'
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    slate: 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  }
  return (
    <div className={`border rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-75 mb-1">{label}</p>
      <p className="text-2xl font-bold mb-0.5">{value}</p>
      <p className="text-xs opacity-75">{subtitle}</p>
    </div>
  )
}
