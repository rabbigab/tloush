'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Star, MapPin, CheckCircle2, Phone, MessageCircle,
  Globe, Clock, Info, ChevronDown, ChevronUp,
} from 'lucide-react'
import { formatRating } from '@/types/directory'
import { getProviderDisplayName, normalizeFirstName, getProviderInitial } from '@/lib/providerDisplay'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import type { Provider, ProviderReviewDisplay } from '@/types/directory'

interface Props {
  provider: Provider
  reviews: ProviderReviewDisplay[]
  contactsThisMonth: number
  categoryLabel: string
  categorySlug: string
}

export default function DirectoryProviderClient({
  provider,
  reviews,
  contactsThisMonth,
  categoryLabel,
  categorySlug,
}: Props) {
  // Prenom normalise affiche a l'utilisateur (cf. src/lib/providerDisplay)
  const displayFirstName = normalizeFirstName(provider.first_name)
  const [user, setUser] = useState<{ id: string; phone?: string } | null>(null)
  const [contactRevealed, setContactRevealed] = useState(false)
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Gate form state
  const [gateEmail, setGateEmail] = useState('')
  const [gatePassword, setGatePassword] = useState('')
  const [gatePhone, setGatePhone] = useState('')
  const [whatsappOptIn, setWhatsappOptIn] = useState(false)
  const [gateError, setGateError] = useState('')

  const displayName = getProviderDisplayName(provider)

  useEffect(() => {
    track('directory_provider_viewed', {
      provider_id: provider.id,
      category: provider.category,
      has_reviews: provider.total_reviews > 0,
    })
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, phone: data.user.user_metadata?.phone })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function revealContact() {
    setLoading(true)
    try {
      const res = await fetch('/api/annuaire/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: provider.id,
          whatsapp_opted_in: whatsappOptIn,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setRevealedPhone(data.phone)
        setContactRevealed(true)
        track('directory_contact_revealed', {
          provider_id: provider.id,
          category: provider.category,
          whatsapp_opted_in: whatsappOptIn,
        })
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false)
    }
  }

  function handleCTAClick() {
    if (!user || !user.phone) {
      setShowGate(true)
      track('directory_contact_gate_shown', {
        provider_id: provider.id,
        category: provider.category,
        user_state: !user ? 'anonymous' : 'missing_phone',
      })
      return
    }
    revealContact()
  }

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGateError('')
    setLoading(true)

    try {
      const supabase = createClient()

      if (!user) {
        // Sign up new user
        const { error } = await supabase.auth.signUp({
          email: gateEmail,
          password: gatePassword,
          options: { data: { phone: gatePhone } },
        })
        if (error) {
          if (error.message.includes('already registered')) {
            // Try to sign in instead
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: gateEmail,
              password: gatePassword,
            })
            if (loginError) { setGateError(loginError.message); setLoading(false); return }
          } else {
            setGateError(error.message); setLoading(false); return
          }
        }
        setUser({ id: 'new', phone: gatePhone })
      } else if (!user.phone && gatePhone) {
        // Update phone for existing user
        await supabase.auth.updateUser({ data: { phone: gatePhone } })
        setUser({ ...user, phone: gatePhone })
      }

      setShowGate(false)
      // Reveal contact after signup
      await revealContact()
    } catch {
      setGateError('Une erreur est survenue. Reessayez.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/annuaire/${categorySlug}/${provider.slug}?reveal=1`,
      },
    })
  }

  // Auto-reveal after OAuth redirect
  useEffect(() => {
    if (user && new URLSearchParams(window.location.search).get('reveal') === '1') {
      revealContact()
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 5)
  const whatsappLink = revealedPhone
    ? `https://wa.me/${revealedPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${displayFirstName}, je vous contacte via Tloush Recommande pour ${categoryLabel}. Etes-vous disponible ?`)}`
    : '#'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        href={`/annuaire/${categorySlug}`}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 mb-6"
      >
        <ArrowLeft size={14} />
        {categoryLabel}s francophones
      </Link>

      {/* Provider header */}
      <div className="flex items-start gap-4 mb-6">
        {provider.photo_url ? (
          <Image src={provider.photo_url} alt={displayName} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-2xl font-bold text-brand-600">
            {getProviderInitial(provider.first_name)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">{displayName}</h1>
            {provider.is_referenced && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium">
                <CheckCircle2 size={12} />
                Reference
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-slate-400 mt-1 flex-wrap">
            <span>{categoryLabel}</span>
            <span className="text-neutral-300">·</span>
            <MapPin size={13} />
            <span>{provider.service_areas.join(', ')}</span>
          </div>
          {provider.total_reviews > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              <span className="font-bold text-neutral-800 dark:text-white">
                {formatRating(provider.average_rating)}
              </span>
              <span className="text-sm text-neutral-400">({provider.total_reviews} avis)</span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      {provider.description && (
        <p className="text-neutral-600 dark:text-slate-300 mb-4 leading-relaxed">{provider.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {provider.specialties.map((s) => (
          <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400">
            {s}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-slate-400 mb-8">
        {provider.languages.length > 0 && (
          <span className="flex items-center gap-1.5"><Globe size={14} /> {provider.languages.join(', ')}</span>
        )}
        {provider.years_experience && (
          <span className="flex items-center gap-1.5"><Clock size={14} /> {provider.years_experience} ans d&apos;experience</span>
        )}
      </div>

      {/* CTA or revealed contact */}
      {contactRevealed && revealedPhone ? (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-8">
          <p className="text-lg font-bold text-neutral-900 dark:text-white mb-3">{revealedPhone}</p>
          <div className="flex gap-3">
            <a
              href={`tel:${revealedPhone}`}
              onClick={() => track('directory_provider_called', { provider_id: provider.id, category: provider.category })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-800 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Phone size={16} /> Appeler
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('directory_provider_whatsapped', { provider_id: provider.id, category: provider.category })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
          <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-xl">
            <p className="text-sm text-brand-700 dark:text-brand-300">
              {displayFirstName} vous a envoye un devis ?{' '}
              <Link href="/scanner" className="underline font-medium hover:text-brand-900">
                Analysez-le gratuitement avec Tloush
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleCTAClick}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-500/25 transition-colors mb-2 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : `Obtenir le numero de ${displayFirstName} (compte gratuit requis)`}
        </button>
      )}

      {!contactRevealed && contactsThisMonth > 0 && (
        <p className="text-xs text-neutral-400 dark:text-slate-500 text-center mb-8">
          {contactsThisMonth} personne{contactsThisMonth > 1 ? 's' : ''} {contactsThisMonth > 1 ? 'ont' : 'a'} contacte {displayFirstName} ce mois-ci
        </p>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
            Avis ({reviews.length})
          </h2>
          <div className="space-y-4">
            {visibleReviews.map((review) => (
              <div key={review.id} className="border border-neutral-100 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-slate-700'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-neutral-600 dark:text-slate-300">{review.comment}</p>
                )}
                {review.provider_response && (
                  <div className="mt-3 pl-3 border-l-2 border-brand-200 dark:border-brand-800">
                    <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mb-1">Reponse du professionnel</p>
                    <p className="text-sm text-neutral-500 dark:text-slate-400">{review.provider_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {reviews.length > 5 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="flex items-center gap-1 mx-auto mt-4 text-sm text-brand-600 hover:text-brand-700"
            >
              {showAllReviews ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAllReviews ? 'Voir moins' : `Voir les ${reviews.length} avis`}
            </button>
          )}
        </div>
      )}

      {/* Referenced badge info */}
      {provider.is_referenced && (
        <div className="bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded-2xl p-4 mb-8">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Que signifie &laquo; Reference par Tloush &raquo; ?</p>
              <ul className="text-xs text-neutral-500 dark:text-slate-400 space-y-1">
                <li>Identite controlee (Teudat Zehut)</li>
                <li>Entreprise enregistree (numero Osek)</li>
                <li>Francophone confirme (appel telephonique)</li>
                <li>Au moins 1 reference client controlee</li>
              </ul>
              <p className="text-xs text-neutral-400 dark:text-slate-500 mt-2 italic">
                Ce badge ne garantit pas la qualite du travail. Les avis des utilisateurs completent cette verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-neutral-400 dark:text-slate-500 leading-relaxed">
        <p>
          En demandant ces coordonnees, vous reconnaissez que Tloush agit uniquement comme intermediaire. Toute relation contractuelle est conclue directement entre vous et le prestataire.
        </p>
      </div>

      {/* Gate modal */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Dernier pas pour contacter {displayFirstName}
              </h2>
              <button
                onClick={() => setShowGate(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-sm text-neutral-500 dark:text-slate-400 mb-5">
              Creez votre compte en 10 secondes pour obtenir son numero. C&apos;est gratuit.
            </p>

            {/* Google OAuth */}
            {!user && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-300 font-medium text-sm hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors mb-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continuer avec Google
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-slate-700" />
                  <span className="text-xs text-neutral-400">ou</span>
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-slate-700" />
                </div>
              </>
            )}

            <form onSubmit={handleGateSubmit} className="space-y-3">
              {!user && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={gateEmail}
                    onChange={(e) => setGateEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    required
                    minLength={6}
                    value={gatePassword}
                    onChange={(e) => setGatePassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </>
              )}
              <div>
                <input
                  type="tel"
                  placeholder="+972..."
                  required
                  value={gatePhone}
                  onChange={(e) => setGatePhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <p className="text-xs text-neutral-400 mt-1">Pour recevoir les coordonnees par WhatsApp</p>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-1 rounded border-neutral-300"
                />
                <span className="text-xs text-neutral-500 dark:text-slate-400">
                  J&apos;accepte de recevoir un message de suivi par WhatsApp apres l&apos;intervention, afin de donner mon avis sur la prestation. Je peux me desinscrire a tout moment.
                </span>
              </label>

              {gateError && (
                <p className="text-xs text-red-500">{gateError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Chargement...' : user ? 'Voir le numero' : `Creer mon compte et voir le numero`}
              </button>
            </form>

            <p className="text-xs text-neutral-400 text-center mt-4 flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Vos donnees restent privees. Jamais partagees.
            </p>

            {!user && (
              <p className="text-xs text-neutral-400 text-center mt-2">
                Deja un compte ?{' '}
                <button
                  onClick={async () => {
                    const supabase = createClient()
                    const { error } = await supabase.auth.signInWithPassword({ email: gateEmail, password: gatePassword })
                    if (!error) {
                      const { data } = await supabase.auth.getUser()
                      if (data.user) {
                        setUser({ id: data.user.id, phone: data.user.user_metadata?.phone })
                        setShowGate(false)
                        await revealContact()
                      }
                    } else {
                      setGateError(error.message)
                    }
                  }}
                  className="text-brand-600 hover:underline"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
