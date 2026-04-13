'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle2, XCircle, ExternalLink, Loader2, TrendingUp, Shield, Users, Heart, DollarSign, Briefcase, Building2, UserPlus, Info, Plane, GraduationCap, LifeBuoy, Star } from 'lucide-react'
import LegalDisclaimer, { BetaBadge } from '@/components/shared/LegalDisclaimer'

interface DetectedRight {
  id: string
  right_slug: string
  right_title_fr: string
  right_description_fr: string
  authority: string
  category: string
  confidence_score: number
  confidence_level: 'high' | 'medium' | 'low'
  estimated_value: number | null
  value_unit: string
  source: string
  source_doc_id: string | null
  status: 'suggested' | 'claimed' | 'dismissed' | 'verified'
  action_url: string | null
  action_label: string | null
  disclaimer: string | null
  detected_at: string
}

import type { LucideIcon } from 'lucide-react'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fiscal: DollarSign,
  family: Users,
  employment: Briefcase,
  health: Heart,
  retirement: Shield,
  housing: Building2,
  military: Shield,
  welfare: LifeBuoy,
  immigration: Plane,
  education: GraduationCap,
  special: Star,
}

const CATEGORY_LABELS: Record<string, string> = {
  fiscal: 'Fiscal',
  family: 'Famille',
  employment: 'Emploi',
  health: 'Sante',
  retirement: 'Retraite',
  housing: 'Logement',
  military: 'Militaire',
  welfare: 'Aide sociale',
  immigration: 'Alyah / Olim',
  education: 'Education',
  special: 'Special',
}

const CATEGORY_COLORS: Record<string, string> = {
  fiscal: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
  family: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
  employment: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  health: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
  retirement: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
  housing: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400',
  military: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  welfare: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  immigration: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  education: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
  special: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
}

export default function RightsDetectorClient({ profileComplete }: { profileComplete: boolean }) {
  const [rights, setRights] = useState<DetectedRight[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [filter, setFilter] = useState<'suggested' | 'all' | 'claimed'>('suggested')
  const [error, setError] = useState('')

  const fetchRights = useCallback(async () => {
    try {
      const res = await fetch('/api/rights-detector')
      if (res.ok) {
        const data = await res.json()
        setRights(data.rights || [])
      } else {
        const data = await res.json().catch(() => ({}))
        console.error('[rights-detector fetch] failed:', { status: res.status, data })
        const msg = data.error || `Erreur de chargement (HTTP ${res.status})`
        setError(data.db_error ? `${msg}\nDetail DB : ${data.db_error}` : msg)
      }
    } catch (err) {
      console.error('[rights-detector fetch] network error:', err)
      setError(`Erreur de chargement : ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRights()
  }, [fetchRights])

  async function scan() {
    console.log('[rights-detector] scan started')
    setScanning(true)
    setError('')
    try {
      const res = await fetch('/api/rights-detector', { method: 'POST' })
      console.log('[rights-detector] scan response:', res.status)
      const data = await res.json().catch(() => ({}))
      console.log('[rights-detector] scan data:', data)
      if (!res.ok) {
        console.error('[rights-detector scan] failed:', { status: res.status, data })
        const msg = data.error || `Erreur lors du scan (HTTP ${res.status})`
        setError(data.db_error ? `${msg}\nDetail DB : ${data.db_error}` : msg)
        return
      }
      setRights(data.rights || [])
      if ((data.rights || []).length === 0 && data.detected_count === 0) {
        setError(data.message || 'Aucun droit detecte pour votre profil actuel. Completez plus de champs pour debloquer plus de resultats.')
      }
    } catch (err) {
      console.error('[rights-detector scan] network error:', err)
      setError(`Erreur reseau : ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setScanning(false)
    }
  }

  async function updateStatus(id: string, status: DetectedRight['status']) {
    try {
      await fetch('/api/rights-detector', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      fetchRights()
    } catch {
      setError('Erreur reseau')
    }
  }

  if (!profileComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes droits detectes</h1>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-3xl p-8 text-center">
          <Sparkles size={48} className="text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Profil requis
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Pour detecter vos droits non reclames, Tloush a besoin de votre profil :
            annee d'alyah, situation familiale, enfants, emploi...
          </p>
          <Link
            href="/profile/edit"
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700"
          >
            <UserPlus size={16} />
            Completer mon profil
          </Link>
        </div>
      </div>
    )
  }

  const filtered = rights.filter(r => {
    if (filter === 'suggested') return r.status === 'suggested'
    if (filter === 'claimed') return r.status === 'claimed' || r.status === 'verified'
    return true
  })

  const totalValue = rights
    .filter(r => r.status === 'suggested' && r.estimated_value)
    .reduce((s, r) => s + Number(r.estimated_value || 0), 0)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={22} className="text-purple-600" /> Mes droits detectes
            <BetaBadge />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Scan de votre profil et de vos documents pour trouver les droits non reclames.
          </p>
        </div>
        <button
          onClick={scan}
          disabled={scanning}
          className="px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {scanning ? 'Scan en cours...' : 'Scanner mes droits'}
        </button>
      </div>

      {/* Disclaimer legal force */}
      <LegalDisclaimer
        level="legal_advice"
        topic="des droits et aides en Israel"
        expert_label="Consulter un expert"
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1">Echec du scan</p>
              <pre className="text-xs whitespace-pre-wrap break-words font-mono">{error}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {rights.length > 0 && totalValue > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center">
              <TrendingUp size={28} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                Valeur annuelle potentielle
              </p>
              <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                {Math.round(totalValue).toLocaleString('fr-IL')} ₪
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Estimation cumulee des droits non reclames detectes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {rights.length === 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
          <Sparkles size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Lancez votre premier scan
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Tloush va analyser votre profil et vos documents pour identifier les droits auxquels vous avez potentiellement droit.
          </p>
          <button
            onClick={scan}
            disabled={scanning}
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles size={16} />
            Lancer le scan
          </button>
        </div>
      )}

      {/* Filter tabs */}
      {rights.length > 0 && (
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {([
            { id: 'suggested' as const, label: 'A reclamer', count: rights.filter(r => r.status === 'suggested').length },
            { id: 'claimed' as const, label: 'Reclames', count: rights.filter(r => r.status === 'claimed' || r.status === 'verified').length },
            { id: 'all' as const, label: 'Tous', count: rights.length },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                filter === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      )}

      {/* Rights list */}
      <div className="space-y-3">
        {filtered.map(r => {
          const Icon = CATEGORY_ICONS[r.category] || Sparkles
          const confidenceBadge =
            r.confidence_level === 'high' ? { bg: 'bg-green-100 text-green-700', label: 'Haute confiance' } :
            r.confidence_level === 'medium' ? { bg: 'bg-amber-100 text-amber-700', label: 'Confiance moyenne' } :
            { bg: 'bg-slate-100 text-slate-700', label: 'A verifier' }

          return (
            <div
              key={r.id}
              className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 ${
                r.status === 'dismissed'
                  ? 'opacity-50 border-slate-200 dark:border-slate-700'
                  : r.status === 'claimed' || r.status === 'verified'
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_COLORS[r.category] || 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'}`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{r.right_title_fr}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceBadge.bg}`}>
                      {confidenceBadge.label}
                    </span>
                    <span className="text-xs text-slate-400">{CATEGORY_LABELS[r.category] || r.category}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{r.right_description_fr}</p>
                  {r.estimated_value && (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                      ≈ {Number(r.estimated_value).toLocaleString('fr-IL')} {r.value_unit}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mb-3">
                    Source : {r.authority}
                  </p>
                  {r.disclaimer && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1 mb-3">
                      <AlertCircle size={10} className="shrink-0 mt-0.5" />
                      {r.disclaimer}
                    </p>
                  )}

                  {r.status === 'suggested' && (
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      {r.action_url && (
                        r.action_url.startsWith('/') ? (
                          <Link
                            href={r.action_url}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                          >
                            {r.action_label || 'Voir plus'} →
                          </Link>
                        ) : (
                          <a
                            href={r.action_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                          >
                            {r.action_label || 'Voir plus'} <ExternalLink size={12} />
                          </a>
                        )
                      )}
                      <button
                        onClick={() => updateStatus(r.id, 'claimed')}
                        className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Deja reclame
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'dismissed')}
                        className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium flex items-center gap-1"
                      >
                        <XCircle size={14} /> Pas concerne
                      </button>
                    </div>
                  )}
                  {(r.status === 'claimed' || r.status === 'verified') && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Reclame
                      </span>
                      <button
                        onClick={() => updateStatus(r.id, 'suggested')}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
