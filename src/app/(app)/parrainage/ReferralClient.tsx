'use client'

import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Users, Star, Share2, MessageCircle } from 'lucide-react'

interface ReferralData {
  code: string
  shareUrl: string
  stats: {
    totalReferred: number
    paidReferred: number
    bonusAnalyses: number
    freeMonthsEarned: number
  }
}

export default function ReferralClient() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function copyLink() {
    if (!data) return
    navigator.clipboard.writeText(data.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    if (!data) return
    const text = encodeURIComponent(
      `Salut ! Je te recommande Tloush, une app qui analyse tes documents israéliens en français (fiches de paie, courriers, factures...). C'est gratuit pour commencer 👉 ${data.shareUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gift size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Parrainez, gagnez !
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Invitez vos amis francophones en Israël. Chaque inscription vous offre 1 analyse gratuite.
          Si votre filleul passe en payant, vous recevez 1 mois Solo offert !
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Comment ça marche</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-300">1</div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Partagez votre lien</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Envoyez votre lien unique à vos amis, collègues, famille.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-300">2</div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ils s&apos;inscrivent gratuitement</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vous recevez immédiatement <strong>+1 analyse gratuite</strong> par inscription.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-sm font-bold text-amber-700 dark:text-amber-300">3</div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ils passent en payant ?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vous recevez <strong>1 mois Solo gratuit</strong> (valeur 49₪) pour chaque filleul qui souscrit un plan payant.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share link */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
        <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
          <Share2 size={16} />
          Votre lien de parrainage
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.shareUrl}
            readOnly
            className="flex-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 font-mono select-all"
            onClick={e => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={copyLink}
            className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shrink-0 ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <MessageCircle size={16} />
            Partager sur WhatsApp
          </button>
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3">
          Code : <span className="font-mono font-bold">{data.code}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Users size={20} className="mx-auto text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.stats.totalReferred}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Filleul{data.stats.totalReferred !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Star size={20} className="mx-auto text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.stats.paidReferred}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Devenus payants</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Gift size={20} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{data.stats.bonusAnalyses}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Analyses bonus</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Gift size={20} className="mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.stats.freeMonthsEarned}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mois offerts</p>
        </div>
      </div>
    </div>
  )
}
