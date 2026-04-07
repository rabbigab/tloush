'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PiggyBank, TrendingDown, ArrowRight, AlertTriangle, CheckCircle, Info, Target } from 'lucide-react'
import { auditExpenses, type ExpenseItem, type AuditResult } from '@/lib/smartSaver'

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="8" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{score}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/100</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-2" style={{ color }}>{label}</p>
    </div>
  )
}

export default function SmartSaverClient({ expenses }: { expenses: ExpenseItem[] }) {
  const result: AuditResult = useMemo(() => auditExpenses(expenses), [expenses])

  if (expenses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center mx-auto">
          <PiggyBank size={32} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Smart Saver</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Pour analyser vos depenses et trouver des economies, commencez par ajouter vos charges recurrentes.
        </p>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Ajouter des depenses <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center">
            <PiggyBank size={22} className="text-amber-600" />
          </div>
          Smart Saver
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Analyse de vos depenses recurrentes et recommandations d&apos;economies
        </p>
      </div>

      {/* Score + Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={result.healthScore} label={result.healthLabel} />
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{result.totalMonthly.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">par mois</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{result.totalAnnual.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">par an</p>
              </div>
            </div>
            {result.recommendations.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-2">
                <Target size={16} className="text-green-600 shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  <span className="font-bold">
                    {result.recommendations.reduce((s, r) => s + (r.estimated_savings_monthly || 0), 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪/mois
                  </span>
                  {' '}d&apos;economies potentielles identifiees
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Repartition par categorie</h3>
        <div className="space-y-2">
          {result.categoryBreakdown.map(cat => (
            <div key={cat.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.category}</span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  {cat.monthly.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪/mois ({cat.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown size={16} className="text-green-600" />
            Recommandations d&apos;economies
          </h3>
          <div className="space-y-3">
            {result.recommendations
              .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
              .map(rec => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border ${
                    rec.priority === 'high'
                      ? 'border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10'
                      : rec.priority === 'medium'
                      ? 'border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {rec.priority === 'high' ? (
                      <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    ) : rec.priority === 'medium' ? (
                      <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{rec.title_fr}</p>
                        {rec.estimated_savings_monthly && rec.estimated_savings_monthly > 0 && (
                          <span className="shrink-0 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            -{rec.estimated_savings_monthly}₪/mois
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{rec.description_fr}</p>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{rec.action_fr}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
