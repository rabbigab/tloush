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
              <span className="text-sm text-slate-500">Nom d&apos;affichage</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveDisplayName(); if (e.key === 'Escape') { setEditingName(false); setNameInput(displayName) } }}
                  />
                  <button onClick={saveDisplayName} disabled={nameSaving} className="text-green-600 hover:text-green-700">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setEditingName(false); setNameInput(displayName) }} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{displayName || 'Non défini'}</span>
                  <button onClick={() => setEditingName(true)} className="text-slate-400 hover:text-blue-600">
                    <Pencil size={14} />
                  </button>
                </div>
              )}
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

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            Notifications
          </h2>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-800">Résumé hebdomadaire</p>
                <p className="text-xs text-slate-500">Recevez un email chaque lundi avec le résumé de vos documents</p>
              </div>
            </div>
            <button
              onClick={toggleDigest}
              disabled={prefsLoading}
              role="switch"
              aria-checked={digestEnabled}
              aria-label="Activer le résumé hebdomadaire"
              className={`relative w-11 h-6 rounded-full transition-colors ${digestEnabled ? 'bg-blue-600' : 'bg-slate-300'} ${prefsLoading ? 'opacity-50' : ''}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${digestEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-800">Alertes urgentes</p>
                <p className="text-xs text-slate-500">Recevez un email immédiat quand un document urgent est détecté</p>
              </div>
            </div>
            <button
              onClick={toggleUrgentAlerts}
              disabled={prefsLoading}
              role="switch"
              aria-checked={urgentAlertsEnabled}
              aria-label="Activer les alertes urgentes"
              className={`relative w-11 h-6 rounded-full transition-colors ${urgentAlertsEnabled ? 'bg-red-500' : 'bg-slate-300'} ${prefsLoading ? 'opacity-50' : ''}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${urgentAlertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
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
              aria-label="Tapez SUPPRIMER pour confirmer"
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
  )
}
