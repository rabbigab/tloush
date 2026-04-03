'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, FileText, Calendar, LogOut, Trash2, AlertTriangle, Mail, Bell, Pencil, Check, X } from 'lucide-react'
import Link from 'next/link'
import { track } from '@/lib/analytics'

export default function ProfileClient({
  email,
  displayName: initialDisplayName,
  createdAt,
  documentCount
}: {
  email: string
  displayName: string
  createdAt: string
  documentCount: number
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(initialDisplayName)
  const [nameSaving, setNameSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [digestEnabled, setDigestEnabled] = useState(true)
  const [urgentAlertsEnabled, setUrgentAlertsEnabled] = useState(true)
  const [prefsLoading, setPrefsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/preferences')
      .then(r => r.json())
      .then(data => {
        setDigestEnabled(data.email_digest_enabled ?? true)
        setUrgentAlertsEnabled(data.urgent_alerts_enabled ?? true)
      })
      .finally(() => setPrefsLoading(false))
  }, [])

  async function toggleDigest() {
    const newVal = !digestEnabled
    setDigestEnabled(newVal)
    track(newVal ? 'consent_accepted' : 'consent_declined', { preference: 'email_digest' })
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_digest_enabled: newVal })
    })
  }

  async function toggleUrgentAlerts() {
    const newVal = !urgentAlertsEnabled
    setUrgentAlertsEnabled(newVal)
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urgent_alerts_enabled: newVal })
    })
  }

  async function saveDisplayName() {
    setNameSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { display_name: nameInput.trim() }
      })
      if (!error) {
        setDisplayName(nameInput.trim())
        setEditingName(false)
        track('profile_updated', { field: 'display_name' })
      }
    } finally {
      setNameSaving(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (res.ok) {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/auth/login')
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 w-full">

        {/* Infos compte */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="section-heading mb-4 flex items-center gap-2">
            <User size={18} className="text-brand-600" />
            Mon compte
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Nom d&apos;affichage</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveDisplayName(); if (e.key === 'Escape') { setEditingName(false); setNameInput(displayName) } }}
                  />
                  <button onClick={saveDisplayName} disabled={nameSaving} className="w-9 h-9 flex items-center justify-center text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors" aria-label="Sauvegarder">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setEditingName(false); setNameInput(displayName) }} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors" aria-label="Annuler">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{displayName || 'Non défini'}</span>
                  <button onClick={() => setEditingName(true)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg transition-colors" aria-label="Modifier le nom">
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar size={13} />
                Membre depuis
              </span>
              <span className="text-sm text-slate-800 dark:text-slate-200">{joinDate}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileText size={13} />
                Documents analysés
              </span>
              <span className="text-sm font-semibold text-brand-600">{documentCount}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="section-heading mb-4 flex items-center gap-2">
            <Bell size={18} className="text-brand-600" />
            Notifications
          </h2>

          {prefsLoading ? (
            <div className="space-y-4">
              <div className="h-14 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-xl" />
              <div className="h-14 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Résumé hebdomadaire</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recevez un email chaque lundi avec le résumé de vos documents de la semaine</p>
                  </div>
                </div>
                <button
                  onClick={toggleDigest}
                  role="switch"
                  aria-checked={digestEnabled}
                  aria-label="Activer le resume hebdomadaire"
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${digestEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${digestEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Alertes urgentes</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recevez un email immédiat quand un document urgent est détecté</p>
                  </div>
                </div>
                <button
                  onClick={toggleUrgentAlerts}
                  role="switch"
                  aria-checked={urgentAlertsEnabled}
                  aria-label="Activer les alertes urgentes"
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${urgentAlertsEnabled ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${urgentAlertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="section-heading mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm transition-colors min-h-[44px]"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-sm transition-colors min-h-[44px]"
            >
              <Trash2 size={16} />
              Supprimer mon compte
            </button>
          </div>
        </div>

        {/* Confirmation suppression */}
        {showDeleteConfirm && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Suppression définitive du compte</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Cette action est irréversible. Tous vos documents ({documentCount}), conversations et données seront définitivement supprimés.
                </p>
              </div>
            </div>
            <p className="text-xs text-red-700 dark:text-red-400 mb-3">
              Tapez <strong>SUPPRIMER</strong> pour confirmer :
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="SUPPRIMER"
              aria-label="Tapez SUPPRIMER pour confirmer"
              className="w-full border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm text-red-800 dark:text-red-300 placeholder-red-300 dark:placeholder-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'SUPPRIMER' || deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        )}

    </div>
  )
}
