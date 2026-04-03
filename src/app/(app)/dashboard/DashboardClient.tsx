'use client'

import Link from 'next/link'
import { FileText, AlertCircle, CheckCircle, Clock, Inbox, MessageSquare, TrendingUp, Shield, ArrowRight, Zap } from 'lucide-react'
import { DOC_LABELS, DOC_ICONS } from '@/lib/docTypes'
import type { AppDocument } from '@/types'

export default function DashboardClient({ documents }: { documents: AppDocument[] }) {
  const urgent = documents.filter(d => d.is_urgent)
  const actionRequired = documents.filter(d => d.action_required && !d.is_urgent)
  const recent = documents.slice(0, 6)

  const byType: Record<string, number> = {}
  for (const doc of documents) {
    byType[doc.document_type] = (byType[doc.document_type] || 0) + 1
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentCount = documents.filter(d => new Date(d.created_at) > thirtyDaysAgo).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">

      {/* Hero greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 rounded-3xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{greeting} !</h1>
          <p className="text-blue-100 dark:text-blue-300 text-sm sm:text-base">
            {documents.length === 0
              ? 'Uploadez votre premier document pour commencer.'
              : `Vous avez ${documents.length} document${documents.length > 1 ? 's' : ''} dans votre espace.`}
          </p>

          {/* Inline stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <FileText size={16} className="text-blue-200" />
                <p className="text-2xl sm:text-3xl font-bold">{documents.length}</p>
              </div>
              <p className="text-xs text-blue-200 font-medium">Documents</p>
            </div>
            <div className={`backdrop-blur-sm rounded-2xl p-4 text-center border ${urgent.length > 0 ? 'bg-red-500/20 border-red-400/30' : 'bg-white/15 border-white/10'}`}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertCircle size={16} className={urgent.length > 0 ? 'text-red-300' : 'text-blue-200'} />
                <p className="text-2xl sm:text-3xl font-bold">{urgent.length}</p>
              </div>
              <p className={`text-xs font-medium ${urgent.length > 0 ? 'text-red-200' : 'text-blue-200'}`}>Urgents</p>
            </div>
            <div className={`backdrop-blur-sm rounded-2xl p-4 text-center border ${actionRequired.length > 0 ? 'bg-amber-500/20 border-amber-400/30' : 'bg-white/15 border-white/10'}`}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock size={16} className={actionRequired.length > 0 ? 'text-amber-300' : 'text-blue-200'} />
                <p className="text-2xl sm:text-3xl font-bold">{actionRequired.length}</p>
              </div>
              <p className={`text-xs font-medium ${actionRequired.length > 0 ? 'text-amber-200' : 'text-blue-200'}`}>Actions</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp size={16} className="text-blue-200" />
                <p className="text-2xl sm:text-3xl font-bold">{recentCount}</p>
              </div>
              <p className="text-xs text-blue-200 font-medium">Ce mois-ci</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes actives */}
      {(urgent.length > 0 || actionRequired.length > 0) && (
        <div className="space-y-3">
          {urgent.map(doc => (
            <Link
              key={doc.id}
              href={`/assistant?doc=${doc.id}`}
              className="flex items-start gap-3 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/40 dark:to-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 hover:shadow-md hover:shadow-red-500/10 hover:border-red-300 dark:hover:border-red-700 transition-all group min-h-[44px]"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Urgent — {DOC_LABELS[doc.document_type] || doc.document_type}
                  {doc.period && <span className="font-normal text-red-600 dark:text-red-400"> · {doc.period}</span>}
                </p>
                {doc.action_description && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate">{doc.action_description}</p>
                )}
              </div>
              <ArrowRight size={16} className="text-red-300 dark:text-red-600 group-hover:text-red-500 dark:group-hover:text-red-400 shrink-0 mt-1 transition-colors group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
          {actionRequired.map(doc => (
            <Link
              key={doc.id}
              href={`/assistant?doc=${doc.id}`}
              className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/40 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 hover:shadow-md hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-700 transition-all group min-h-[44px]"
            >
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={20} className="text-amber-500 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Action requise — {DOC_LABELS[doc.document_type] || doc.document_type}
                  {doc.period && <span className="font-normal text-amber-600 dark:text-amber-400"> · {doc.period}</span>}
                </p>
                {doc.action_description && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 truncate">{doc.action_description}</p>
                )}
              </div>
              <ArrowRight size={16} className="text-amber-300 dark:text-amber-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 shrink-0 mt-1 transition-colors" />
            </Link>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Repartition par type - prend 1 col */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Par type</h2>
          </div>
          {Object.keys(byType).length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Aucun document</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const pct = Math.round((count / documents.length) * 100)
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <span>{DOC_ICONS[type] || '📄'}</span>
                          {DOC_LABELS[type] || type}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          role="progressbar"
                          aria-valuenow={count}
                          aria-valuemin={0}
                          aria-valuemax={documents.length}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Documents recents - prend 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Documents recents</h2>
            </div>
            <Link href="/inbox" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Aucun document encore</p>
              <Link href="/inbox" className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                <Inbox size={15} />
                Uploader un document
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {recent.map(doc => (
                <Link
                  key={doc.id}
                  href={`/assistant?doc=${doc.id}`}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0 text-lg">
                    {DOC_ICONS[doc.document_type] || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {doc.is_urgent && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
                      {!doc.is_urgent && doc.action_required && <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />}
                      {!doc.is_urgent && !doc.action_required && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {DOC_LABELS[doc.document_type] || doc.document_type}
                      </p>
                    </div>
                    {doc.period && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{doc.period}</p>
                    )}
                    {doc.summary_fr && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{doc.summary_fr}</p>
                    )}
                  </div>
                  <MessageSquare size={14} className="text-slate-200 dark:text-slate-600 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA si pas de documents */}
      {documents.length === 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900 rounded-3xl p-8 sm:p-10 text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/50 dark:bg-blue-900/20 rounded-full -translate-y-1/2 translate-x-1/3" />
          <FileText size={40} className="text-blue-300 dark:text-blue-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Commencez par uploader un document</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-md mx-auto">
            Fiche de paie, courrier officiel, contrat... Tloush vous l&apos;explique en francais en quelques secondes.
          </p>
          <Link
            href="/inbox"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Inbox size={16} />
            Aller a l&apos;inbox
          </Link>
        </div>
      )}

    </div>
  )
}
