'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Info, AlertCircle, Clock, ListChecks, UserCheck, CalendarClock, MessageSquare, Download, Check, Eye } from 'lucide-react'
import { DOC_LABELS, DOC_ICONS, DOC_COLORS } from '@/lib/docTypes'

interface AttentionPoint {
  level: 'ok' | 'info' | 'warning' | 'critical'
  title: string
  description: string
}

interface RecommendedAction {
  priority: 'immediate' | 'soon' | 'when_possible'
  action: string
  deadline?: string | null
}

interface ConsultPro {
  recommended: boolean
  reason?: string | null
  pro_type?: string | null
}

interface DocumentData {
  id: string
  file_name: string
  document_type: string
  status: string
  is_urgent: boolean
  action_required: boolean
  action_description: string | null
  summary_fr: string | null
  period: string | null
  deadline: string | null
  action_completed_at: string | null
  created_at: string
  analyzed_at: string | null
  analysis_data: {
    full_analysis?: string
    attention_points?: AttentionPoint[]
    recommended_actions?: RecommendedAction[]
    should_consult_pro?: ConsultPro
    key_info?: {
      emitter?: string
      amount?: string
      deadline?: string
    }
    recurring_info?: {
      is_recurring?: boolean
      frequency?: string
      provider?: string
      amount?: number
    }
    [key: string]: unknown
  } | null
}

const LEVEL_CONFIG = {
  ok: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', label: 'OK' },
  info: { icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'À vérifier' },
  critical: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: 'Alerte' },
}

const PRIORITY_CONFIG = {
  immediate: { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Immédiat' },
  soon: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Prochainement' },
  when_possible: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Quand possible' },
}

const PRO_LABELS: Record<string, string> = {
  comptable: 'Comptable',
  avocat: 'Avocat',
  conseiller_fiscal: 'Conseiller fiscal',
  agent_immobilier: 'Agent immobilier',
}

export default function DocumentDetailClient({ document: doc, originalUrl }: { document: DocumentData; originalUrl: string | null }) {
  const [actionDone, setActionDone] = useState(!!doc.action_completed_at)
  const [showOriginal, setShowOriginal] = useState(false)
  const analysis = doc.analysis_data
  const attentionPoints = analysis?.attention_points || []
  const actions = analysis?.recommended_actions || []
  const consultPro = analysis?.should_consult_pro
  const keyInfo = analysis?.key_info
  const recurringInfo = analysis?.recurring_info

  async function markActionDone() {
    setActionDone(true)
    try {
      await fetch(`/api/documents/${doc.id}/action`, { method: 'POST' })
    } catch {
      setActionDone(false)
    }
  }

  const deadlineDate = doc.deadline ? new Date(doc.deadline + 'T00:00:00') : null
  const deadlineFormatted = deadlineDate?.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/inbox" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${DOC_COLORS[doc.document_type] || DOC_COLORS.other}`}>
              {DOC_ICONS[doc.document_type] || '📄'} {DOC_LABELS[doc.document_type] || 'Document'}
            </span>
            {doc.is_urgent && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Urgent</span>
            )}
            {doc.period && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{doc.period}</span>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{doc.file_name}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          {originalUrl && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition-colors ${
                showOriginal
                  ? 'text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              <Eye size={14} />
              Original
            </button>
          )}
          <Link
            href={`/assistant?doc=${doc.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          >
            <MessageSquare size={14} />
            Poser une question
          </Link>
          <Link
            href={`/api/documents/${doc.id}/export`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={14} />
          </Link>
        </div>
      </div>

      {/* Original document viewer */}
      {showOriginal && originalUrl && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Eye size={14} />
              Document original
            </h2>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ouvrir dans un nouvel onglet
            </a>
          </div>
          {doc.file_name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (
            <img
              src={originalUrl}
              alt={doc.file_name}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700"
            />
          ) : doc.file_name.match(/\.pdf$/i) ? (
            <iframe
              src={originalUrl}
              className="w-full h-[600px] rounded-xl border border-slate-200 dark:border-slate-700"
              title="Document original"
            />
          ) : (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Aperçu non disponible pour ce type de fichier
              </p>
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <Download size={14} />
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {doc.summary_fr && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Résumé</h2>
          <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">{doc.summary_fr}</p>
        </div>
      )}

      {/* Key info */}
      {keyInfo && (keyInfo.emitter || keyInfo.amount || keyInfo.deadline) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {keyInfo.emitter && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Émetteur</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{keyInfo.emitter}</p>
            </div>
          )}
          {keyInfo.amount && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Montant</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{keyInfo.amount}</p>
            </div>
          )}
          {deadlineFormatted && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                <CalendarClock size={12} /> Échéance
              </p>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{deadlineFormatted}</p>
            </div>
          )}
        </div>
      )}

      {/* Recurring info */}
      {recurringInfo?.is_recurring && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 flex items-center gap-3">
          <Clock size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Dépense récurrente détectée</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              {recurringInfo.provider && `${recurringInfo.provider} · `}
              {recurringInfo.amount && `${recurringInfo.amount}₪ · `}
              {recurringInfo.frequency === 'monthly' && 'Mensuel'}
              {recurringInfo.frequency === 'bimonthly' && 'Bimestriel'}
              {recurringInfo.frequency === 'quarterly' && 'Trimestriel'}
              {recurringInfo.frequency === 'annual' && 'Annuel'}
              {recurringInfo.frequency === 'one_time' && 'Ponctuel'}
            </p>
          </div>
        </div>
      )}

      {/* Attention points */}
      {attentionPoints.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Points détectés
          </h2>
          <div className="space-y-3">
            {attentionPoints.map((point, idx) => {
              const config = LEVEL_CONFIG[point.level] || LEVEL_CONFIG.info
              const Icon = config.icon
              return (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${config.border} ${config.bg}`}>
                  <Icon size={18} className={`${config.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{point.title}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>{config.label}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{point.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recommended actions */}
      {actions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ListChecks size={14} />
            Actions recommandées
          </h2>
          <div className="space-y-3">
            {actions.map((action, idx) => {
              const config = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.when_possible
              return (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200">{action.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>{config.label}</span>
                      {action.deadline && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Avant le {action.deadline}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action required banner */}
      {doc.action_required && doc.action_description && (
        <div className={`rounded-2xl border-2 p-5 flex items-start gap-4 ${actionDone ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'}`}>
          {actionDone ? (
            <CheckCircle size={22} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={22} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${actionDone ? 'text-green-800 dark:text-green-200 line-through' : 'text-amber-800 dark:text-amber-200'}`}>
              {doc.action_description}
            </p>
            {!actionDone && (
              <button
                onClick={markActionDone}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                <Check size={12} />
                Marquer comme fait
              </button>
            )}
          </div>
        </div>
      )}

      {/* Consult pro */}
      {consultPro?.recommended && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-5 flex items-start gap-4">
          <UserCheck size={22} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
              Consultation recommandée : {PRO_LABELS[consultPro.pro_type || ''] || 'un professionnel'}
            </p>
            {consultPro.reason && (
              <p className="text-sm text-purple-700 dark:text-purple-300">{consultPro.reason}</p>
            )}
            <Link
              href="/experts"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 mt-2 hover:underline"
            >
              Voir les experts francophones
              <ArrowLeft size={12} className="rotate-180" />
            </Link>
          </div>
        </div>
      )}

      {/* Full analysis */}
      {analysis?.full_analysis && (
        <details className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <summary className="p-6 cursor-pointer font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2">
            <FileText size={14} />
            Analyse détaillée complète
          </summary>
          <div className="px-6 pb-6">
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {analysis.full_analysis}
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
