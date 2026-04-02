'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, User, FileText, Calendar, LogOut, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ProfileClient({
  email,
  createdAt,
  documentCount
}: {
  email: string
  createdAt: string
  documentCount: number
}) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (res.ok) {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
      }
    } finally {
      setDeleting(false)
    }
  }

  const joinDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/inbox" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-xl font-extrabold text-blue-600">Tloush</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500 font-medium">Mon profil</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Infos compte */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Mon compte
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-800">{email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar size={13} />
                Membre depuis
              </span>
              <span className="text-sm text-slate-800">{joinDate}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <FileText size={13} />
                Documents analysés
              </span>
              <span className="text-sm font-semibold text-blue-600">{documentCount}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm transition-colors"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-sm transition-colors"
            >
              <Trash2 size={16} />
              Supprimer mon compte
            </button>
          </div>
        </div>

        {/* Confirmation suppression */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Suppression définitive du compte</p>
                <p className="text-xs text-red-600 mt-1">
                  Cette action est irréversible. Tous vos documents ({documentCount}), conversations et données seront définitivement supprimés.
                </p>
              </div>
            </div>
            <p className="text-xs text-red-700 mb-3">
              Tapez <strong>SUPPRIMER</strong> pour confirmer :
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm text-red-800 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'SUPPRIMER' || deleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
