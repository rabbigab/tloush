'use client'

import Link from 'next/link'
import { FileText, AlertCircle, CheckCircle, Clock, Inbox, MessageSquare } from 'lucide-react'

interface Doc {
  id: string
  document_type: string
  is_urgent: boolean
  action_required: boolean
  action_description: string | null
  summary_fr: string | null
  period: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  payslip: 'Fiche de paie',
  bituah_leumi: 'Bituah Leumi',
  tax_notice: 'Avis d\'impot',
  work_contract: 'Contrat de travail',
  pension: 'Retraite',
  health_insurance: 'Assurance sante',
  rental: 'Logement',
  bank: 'Bancaire',
  official_letter: 'Courrier officiel',
  contract: 'Contrat',
  tax: 'Document fiscal',
  other: 'Autre',
}

const TYPE_COLORS: Record<string, string> = {
  payslip: 'bg-blue-100 text-blue-800',
  bituah_leumi: 'bg-teal-100 text-teal-800',
  tax_notice: 'bg-yellow-100 text-yellow-800',
  work_contract: 'bg-indigo-100 text-indigo-800',
  pension: 'bg-emerald-100 text-emerald-800',
  health_insurance: 'bg-cyan-100 text-cyan-800',
  rental: 'bg-amber-100 text-amber-800',
  bank: 'bg-violet-100 text-violet-800',
  official_letter: 'bg-purple-100 text-purple-800',
  contract: 'bg-emerald-100 text-emerald-800',
  tax: 'bg-orange-100 text-orange-800',
  other: 'bg-slate-100 text-slate-700',
}

export default function DashboardClient({ documents }: { documents: Doc[] }) {
  const urgent = documents.filter(d => d.is_urgent)
  const actionRequired = documents.filter(d => d.action_required && !d.is_urgent)
  const recent = documents.slice(0, 5)

  const byType: Record<string, number> = {}
  for (const doc of documents) {
    byType[doc.document_type] = (byType[doc.document_type] || 0) + 1
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentCount = documents.filter(d => new Date(d.created_at) > thirtyDaysAgo).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 w-full">

        {/* Alertes actives */}
        {(urgent.length > 0 || actionRequired.length > 0) && (
          <div className="space-y-3">
            {urgent.map(doc => (
              <Link
                key={doc.id}
                href={`/assistant?doc=${doc.id}`}
                className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 hover:shadow-sm transition-all min-h-[44px]"
              >
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800">
                    Urgent — {TYPE_LABELS[doc.document_type] || doc.document_type}
                    {doc.period && <span className="font-normal text-red-600"> · {doc.period}</span>}
                  </p>
                  {doc.action_description && (
                    <p className="text-xs text-red-600 mt-0.5 truncate">{doc.action_description}</p>
                  )}
                </div>
                <span className="text-xs text-red-500 shrink-0 font-medium">Voir →</span>
              </Link>
            ))}
            {actionRequired.map(doc => (
              <Link
                key={doc.id}
                href={`/assistant?doc=${doc.id}`}
                className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 hover:shadow-sm transition-all min-h-[44px]"
              >
                <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    Action requise — {TYPE_LABELS[doc.document_type] || doc.document_type}
                    {doc.period && <span className="font-normal text-amber-600"> · {doc.period}</span>}
                  </p>
                  {doc.action_description && (
                    <p className="text-xs text-amber-700 mt-0.5 truncate">{doc.action_description}</p>
                  )}
                </div>
                <span className="text-xs text-amber-500 shrink-0 font-medium">Voir →</span>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
            <p className="text-xs text-slate-500 mt-1">Documents total</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">{urgent.length}</p>
            <p className="text-xs text-slate-500 mt-1">Urgents</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{actionRequired.length}</p>
            <p className="text-xs text-slate-500 mt-1">Actions en attente</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-brand-600">{recentCount}</p>
            <p className="text-xs text-slate-500 mt-1">Ce mois-ci</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Repartition par type */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="section-heading mb-4">Par type de document</h2>
            {Object.keys(byType).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Aucun document analyse</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_COLORS[type] || 'bg-slate-100 text-slate-700'}`}>
                        {TYPE_LABELS[type] || type}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-400 rounded-full transition-all"
                            role="progressbar"
                            aria-valuenow={count}
                            aria-valuemin={0}
                            aria-valuemax={documents.length}
                            style={{ width: `${(count / documents.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 w-4 text-right font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Documents recents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading">Documents recents</h2>
              <Link href="/inbox" className="text-xs text-brand-600 hover:underline font-medium">Voir tout</Link>
            </div>
            {recent.length === 0 ? (
              <div className="text-center py-6">
                <FileText size={28} className="text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Aucun document</p>
                <Link href="/inbox" className="text-xs text-brand-600 mt-2 inline-block hover:underline font-medium">
                  Uploader mon premier document →
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map(doc => (
                  <Link
                    key={doc.id}
                    href={`/assistant?doc=${doc.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group min-h-[44px]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {doc.is_urgent
                        ? <AlertCircle size={14} className="text-red-500" />
                        : doc.action_required
                          ? <Clock size={14} className="text-amber-500" />
                          : <CheckCircle size={14} className="text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {TYPE_LABELS[doc.document_type] || doc.document_type}
                        {doc.period && <span className="text-slate-400 font-normal"> · {doc.period}</span>}
                      </p>
                      {doc.summary_fr && (
                        <p className="text-xs text-slate-500 truncate">{doc.summary_fr}</p>
                      )}
                    </div>
                    <MessageSquare size={12} className="text-slate-300 group-hover:text-brand-500 shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA si pas de documents */}
        {documents.length === 0 && (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8 text-center">
            <FileText size={36} className="text-brand-300 mx-auto mb-3" />
            <h3 className="font-bold text-brand-900 mb-1">Commencez par uploader un document</h3>
            <p className="text-sm text-brand-600 mb-4">
              Fiche de paie, courrier officiel, contrat... Tloush vous l&apos;explique en francais.
            </p>
            <Link
              href="/inbox"
              className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors active:scale-95"
            >
              <Inbox size={15} />
              Aller a l&apos;inbox
            </Link>
          </div>
        )}

    </div>
  )
}
