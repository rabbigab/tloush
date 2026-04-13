'use client'

import { RefreshCw } from 'lucide-react'

interface VisiteursTabProps {
  visitorStats: any
  visitorLoading: boolean
}

export function VisiteursTab({ visitorStats, visitorLoading }: VisiteursTabProps) {
  if (visitorLoading && !visitorStats) {
    return (
      <div className="text-center py-16 text-slate-400">
        <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
        <p className="text-sm">Chargement des statistiques...</p>
      </div>
    )
  }

  if (!visitorStats) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-2">Aucune donnee de visiteur</p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Assurez-vous que la table <code>page_views</code> a ete creee dans Supabase (migration <code>analytics.sql</code>).
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Visiteurs aujourd&apos;hui</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.today_visitors}</p>
          <p className="text-xs text-slate-400 mt-1">{visitorStats.totals.today_views} pages vues</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Visiteurs 7 jours</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.week_visitors}</p>
          <p className="text-xs text-slate-400 mt-1">{visitorStats.totals.week_views} pages vues</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Visiteurs ce mois</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.month_visitors}</p>
          <p className="text-xs text-slate-400 mt-1">{visitorStats.totals.month_views} pages vues</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total (depuis le debut)</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.all_time_views}</p>
          <p className="text-xs text-slate-400 mt-1">pages vues</p>
        </div>
      </div>

      {/* Daily trend chart */}
      {visitorStats.daily_trend.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Évolution (30 derniers jours)</h3>
          <div className="flex items-end gap-1 h-32">
            {visitorStats.daily_trend.map((d: any) => {
              const maxViews = Math.max(...visitorStats.daily_trend.map((x: any) => x.views), 1)
              const height = (d.views / maxViews) * 100
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                    {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}: {d.views} vues / {d.visitors} visiteurs
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top pages */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Pages les plus visitées</h3>
          <div className="space-y-2">
            {visitorStats.top_pages.slice(0, 10).map((p: any) => (
              <div key={p.path} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[70%]" title={p.path}>{p.path}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 ml-2">{p.count}</span>
              </div>
            ))}
            {visitorStats.top_pages.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Aucune donnee</p>
            )}
          </div>
        </div>

        {/* Top sources */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Sources de trafic</h3>
          <div className="space-y-2">
            {visitorStats.top_referrers.slice(0, 10).map((r: any) => (
              <div key={r.source} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{r.source}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{r.count}</span>
              </div>
            ))}
            {visitorStats.top_referrers.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Aucune donnee</p>
            )}
          </div>
        </div>
      </div>

      {/* Countries */}
      {visitorStats.top_countries.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Top pays</h3>
          <div className="flex flex-wrap gap-2">
            {visitorStats.top_countries.map((c: any) => (
              <span key={c.country} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                {c.country} : {c.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
