'use client'

import { useState, useEffect } from 'react'
import { Star, Check, AlertCircle } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function AvisPage() {
  const [token, setToken] = useState('')
  const [initialRating, setInitialRating] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'form' | 'loading' | 'done' | 'error'>('form')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token') || ''
    const r = parseInt(params.get('rating') || '0')
    setToken(t)
    if (r >= 1 && r <= 5) {
      setRating(r)
      setInitialRating(r)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !rating) return
    setStatus('loading')

    try {
      const res = await fetch('/api/annuaire/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, comment: comment.trim() || null }),
      })

      if (res.ok) {
        track('directory_review_submitted', { rating })
        setStatus('done')
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Une erreur est survenue')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Erreur reseau. Reessayez.')
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle size={40} className="mx-auto text-neutral-300 mb-4" />
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Lien invalide</h1>
        <p className="text-sm text-neutral-500">Ce lien d&apos;avis est invalide ou a expire.</p>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Merci pour votre avis !</h1>
        <p className="text-sm text-neutral-500 dark:text-slate-400">
          Votre retour aide les autres francophones a trouver des prestataires de confiance.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Erreur</h1>
        <p className="text-sm text-neutral-500">{errorMsg}</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 text-center">
        Votre avis
      </h1>
      <p className="text-sm text-neutral-500 dark:text-slate-400 text-center mb-8">
        Notez votre experience pour aider la communaute.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star rating */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={`transition-colors ${
                  i <= (hoverRating || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-200 dark:text-slate-700'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-neutral-500">
          {rating === 5 && 'Excellent'}
          {rating === 4 && 'Bien'}
          {rating === 3 && 'Correct'}
          {rating === 2 && 'Decevant'}
          {rating === 1 && 'Mauvais'}
          {rating === 0 && 'Selectionnez une note'}
        </p>

        {/* Comment */}
        <textarea
          placeholder="Un commentaire ? (optionnel)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
        />

        <button
          type="submit"
          disabled={!rating || status === 'loading'}
          className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? 'Envoi...' : 'Envoyer mon avis'}
        </button>
      </form>

      <p className="text-xs text-neutral-400 text-center mt-6">
        Votre avis aide les autres francophones a trouver des prestataires de confiance.
      </p>
    </div>
  )
}
