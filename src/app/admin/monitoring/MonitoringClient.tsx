'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Activity, DollarSign, AlertTriangle, Clock, TrendingUp, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { formatCost } from '@/lib/claudePricing'

interface MonitoringData {
  period: '1d' | '7d' | '30d'
  summary: {
    totalCalls: number
    successCalls: number
    errorCalls: number
    errorRate: number
    totalTokensIn: number
    totalTokensOut: number
    totalCost: number
    avgDuration: number
    p50: number
    p95: number
    p99: number
  }
  byRoute: Record<string, { calls: number; errors: number; cost: number; avgDuration: number }>
  topUsers: { userId: string; cost: number; calls: number }[]
  timeseries: { day: string; calls: number; cost: number }[]
  recentErrors: {
    id: string
    endpoint: string
    error_code: string | null
    error_message: string
    severity: string
    occurrence_count: number
    last_seen_at: string
  }[]
}

export default function MonitoringClient() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/monitoring?period=${period}`)
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
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
          {error || 'Erreur de chargement'}
        </div>
      </div>
    )
  }

  const { summary, byRoute, topUsers, timeseries, recentErrors } = data
  const maxCallsInDay = Math.max(...timeseries.map(t => t.calls), 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/admin"
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Monitoring</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Claude API, performance, erreurs</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['1d', '7d', '30d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {p === '1d' ? '24h' : p === '7d' ? '7 jours' : '30 jours'}
            </button>
          ))}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity size={20} />}
          label="Appels Claude"
          value={summary.totalCalls.toLocaleString('fr-FR')}
          subtitle={`${summary.successCalls} OK / ${summary.errorCalls} erreurs`}
          color="blue"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label="Cout total"
          value={formatCost(summary.totalCost)}
          subtitle={`${((summary.totalTokensIn + summary.totalTokensOut) / 1000).toFixed(0)}k tokens`}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Taux d'erreur"
          value={`${summary.errorRate.toFixed(2)}%`}
          subtitle={`${summary.errorCalls} erreurs`}
          color={summary.errorRate > 5 ? 'red' : 'amber'}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Latence moyenne"
          value={`${(summary.avgDuration / 1000).toFixed(1)}s`}
          subtitle={`P50 ${(summary.p50 / 1000).toFixed(1)}s · P95 ${(summary.p95 / 1000).toFixed(1)}s`}
          color="purple"
        />
      </div>

      {/* Timeseries mini-chart */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={14} />
          Appels par jour
        </h2>
        {timeseries.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucune donnee pour cette periode</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {timeseries.map(t => (
              <div
                key={t.day}
                className="flex-1 flex flex-col items-center justify-end group relative"
              >
                <div
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-colors cursor-pointer"
                  style={{ height: `${(t.calls / maxCallsInDay) * 100}%`, minHeight: '2px' }}
                />
                <div className="absolute bottom-full mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {t.day} : {t.calls} appels · {formatCost(t.cost)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* By route + Top users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Par endpoint
          </h2>
          <div className="space-y-2">
            {Object.entries(byRoute)
              .sort((a, b) => b[1].cost - a[1].cost)
              .map(([route, stats]) => (
                <div key={route} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">{route}</p>
                    <p className="text-xs text-slate-400">
                      {stats.calls} appels · {(stats.avgDuration / 1000).toFixed(1)}s moy
                      {stats.errors > 0 && <span className="text-red-500 ml-1"> · {stats.errors} erreurs</span>}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 ml-3">
                    {formatCost(stats.cost)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Top 10 utilisateurs (par cout)
          </h2>
          {topUsers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucun utilisateur</p>
          ) : (
            <div className="space-y-2">
              {topUsers.map((u, i) => (
                <div key={u.userId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                      {u.userId.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCost(u.cost)}
                    </p>
                    <p className="text-xs text-slate-400">{u.calls} appels</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent errors */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <XCircle size={14} className="text-red-500" />
          Erreurs recentes non resolues
        </h2>
        {recentErrors.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Aucune erreur active</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentErrors.map(e => (
              <div key={e.id} className="p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        e.severity === 'critical' ? 'bg-red-200 text-red-800' :
                        e.severity === 'error' ? 'bg-red-100 text-red-700' :
                        e.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {e.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{e.endpoint}</span>
                      {e.occurrence_count > 1 && (
                        <span className="text-xs text-red-600 font-semibold">x{e.occurrence_count}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{e.error_message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Derniere : {new Date(e.last_seen_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
    </div>
  )
}
