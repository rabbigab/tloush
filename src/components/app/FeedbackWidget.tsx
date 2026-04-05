'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Loader2, Check } from 'lucide-react'

type Category = 'bug' | 'suggestion' | 'question' | 'other'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'suggestion', label: 'Suggestion', emoji: '💡' },
  { value: 'question', label: 'Question', emoji: '❓' },
  { value: 'other', label: 'Autre', emoji: '💬' },
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category>('suggestion')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (message.trim().length < 5) {
      setError('Message trop court (min. 5 caractères)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur envoi')
      }
      setSuccess(true)
      setMessage('')
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setError('')
    setSuccess(false)
  }

  return (
    <>
      {/* Floating button — offset above mobile nav bar */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
          aria-label="Envoyer un feedback"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-semibold hidden sm:inline">Feedback</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-40 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div>
              <h3 className="font-bold text-sm">Votre avis compte</h3>
              <p className="text-xs text-blue-100 mt-0.5">On vous répond en moins de 24h</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Message envoyé !</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Merci pour votre retour.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Catégorie
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        category === cat.value
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="feedback-message" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Votre message
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Partagez votre retour, votre suggestion ou votre question…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right">
                  {message.length}/2000
                </p>
              </div>

              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || message.trim().length < 5}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Envoi…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
