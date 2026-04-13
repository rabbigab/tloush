'use client'

import { MessageSquare, Eye, CheckCircle, Archive, Bug, Lightbulb, HelpCircle } from 'lucide-react'
import {
  Feedback,
  FEEDBACK_STATUS_LABELS, FEEDBACK_STATUS_COLORS, CATEGORY_LABELS,
  timeAgo,
} from '../types'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  bug: Bug, suggestion: Lightbulb, question: HelpCircle, other: MessageSquare,
}

interface FeedbacksTabProps {
  feedbacks: Feedback[]
  updatingFeedback: string | null
  replyingTo: string | null
  setReplyingTo: (v: string | null) => void
  replyText: string
  setReplyText: (v: string) => void
  sendingReply: boolean
  handleFeedbackStatus: (id: string, status: string) => void
  handleReplyFeedback: (id: string) => void
}

export function FeedbacksTab({
  feedbacks, updatingFeedback,
  replyingTo, setReplyingTo, replyText, setReplyText, sendingReply,
  handleFeedbackStatus, handleReplyFeedback,
}: FeedbacksTabProps) {
  return (
    <div className="space-y-4">
      {feedbacks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <MessageSquare size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Aucun feedback pour le moment</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Les feedbacks des utilisateurs apparaitront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(fb => {
            const CatIcon = CATEGORY_ICONS[fb.category] || MessageSquare
            return (
              <div key={fb.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <CatIcon size={18} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {fb.email || 'Anonyme'}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${FEEDBACK_STATUS_COLORS[fb.status] || FEEDBACK_STATUS_COLORS.new}`}>
                          {FEEDBACK_STATUS_LABELS[fb.status] || fb.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{CATEGORY_LABELS[fb.category]}</span>
                        <span className="text-[10px] text-slate-400">{timeAgo(fb.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{fb.message}</p>
                      {fb.admin_note && (
                        <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-2.5">
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-0.5">Votre reponse :</p>
                          <p className="text-xs text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{fb.admin_note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {fb.email && fb.status !== 'archived' && (
                      <button
                        onClick={() => { setReplyingTo(replyingTo === fb.id ? null : fb.id); setReplyText(fb.admin_note || '') }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Repondre par email"
                      >
                        <MessageSquare size={15} />
                      </button>
                    )}
                    {fb.status === 'new' && (
                      <button
                        onClick={() => handleFeedbackStatus(fb.id, 'read')}
                        disabled={updatingFeedback === fb.id}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Marquer comme lu"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    {(fb.status === 'new' || fb.status === 'read') && (
                      <button
                        onClick={() => handleFeedbackStatus(fb.id, 'resolved')}
                        disabled={updatingFeedback === fb.id}
                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Marquer comme resolu"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleFeedbackStatus(fb.id, 'archived')}
                      disabled={updatingFeedback === fb.id}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Archiver"
                    >
                      <Archive size={15} />
                    </button>
                  </div>
                </div>
                {replyingTo === fb.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Votre reponse..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-slate-400">Un email sera envoye a {fb.email}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText('') }}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleReplyFeedback(fb.id)}
                          disabled={sendingReply || replyText.trim().length < 2}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          {sendingReply ? 'Envoi...' : 'Envoyer'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
