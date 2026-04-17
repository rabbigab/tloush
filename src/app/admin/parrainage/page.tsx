'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Loader2, ExternalLink, Gift } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

interface SocialShare {
  id: string
  user_id: string
  post_url: string
  group_name: string | null
  status: 'pending' | 'approved' | 'rejected'
  promo_code: string | null
  created_at: string
  reviewed_at: string | null
}

const MAX_CODES = 200

export default function AdminParrainagePage() {
  const [shares, setShares] = useState<SocialShare[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchShares = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('social_shares')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setShares(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchShares() }, [fetchShares])

  const approvedCount = shares.filter(s => s.status === 'approved').length
  const pendingCount = shares.filter(s => s.status === 'pending').length

  async function handleAction(shareId: string, action: 'approve' | 'reject') {
    setActionLoading(shareId)
    try {
      const res = await fetch('/api/parrainage/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_id: shareId, action }),
      })
      if (res.ok) {
        await fetchShares()
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Parrainage FB</h1>
          <p className="text-sm text-slate-500">Gestion des partages et codes promo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{shares.length}</p>
          <p className="text-xs text-slate-500">Total soumis</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
          <p className="text-xs text-emerald-600">Codes distribues ({MAX_CODES - approvedCount} restants)</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600">En attente</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Gift size={16} /> Codes distribues
          </span>
          <span className="text-sm font-bold text-slate-900">{approvedCount} / {MAX_CODES}</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${Math.min(100, (approvedCount / MAX_CODES) * 100)}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Groupe</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Post</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Code</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shares.map(share => (
              <tr key={share.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {new Date(share.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-slate-800 font-medium">
                  {share.group_name || '—'}
                </td>
                <td className="px-4 py-3">
                  <a href={share.post_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline inline-flex items-center gap-1">
                    Voir <ExternalLink size={12} />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className={clsx(
                    "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold",
                    share.status === 'approved' && "bg-emerald-100 text-emerald-700",
                    share.status === 'pending' && "bg-amber-100 text-amber-700",
                    share.status === 'rejected' && "bg-red-100 text-red-700",
                  )}>
                    {share.status === 'approved' ? 'Approuve' : share.status === 'pending' ? 'En attente' : 'Rejete'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {share.promo_code || '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {share.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(share.id, 'approve')}
                        disabled={actionLoading === share.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        {actionLoading === share.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approuver
                      </button>
                      <button
                        onClick={() => handleAction(share.id, 'reject')}
                        disabled={actionLoading === share.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <XCircle size={12} />
                        Rejeter
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {shares.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Aucun partage soumis pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
