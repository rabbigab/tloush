'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, FileText, Calendar, LogOut, Trash2, AlertTriangle, Mail, Bell, Pencil, Check, X } from 'lucide-react'
import Link from 'next/link'
import { track } from '@/lib/analytics'
import FamilySection from '@/components/app/FamilySection'

export default function ProfileClient({
  email,
  displayName: initialDisplayName,
  firstName: initialFirstName,
  lastName: initialLastName,
  employerName: initialEmployerName,
  phone: initialPhone,
  createdAt,
  documentCount
}: {
  email: string
  displayName: string
  firstName: string
  lastName: string
  employerName: string
  phone: string
  createdAt: string
  documentCount: number
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(initialDisplayName)
  const [nameSaving, setNameSaving] = useState(false)
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [employerName, setEmployerName] = useState(initialEmployerName)
  const [phone, setPhone] = useState(initialPhone)
  const [editingIdentity, setEditingIdentity] = useState(false)
  const [identitySaving, setIdentitySaving] = useState(false)
  const [firstNameInput, setFirstNameInput] = useState(initialFirstName)
  const [lastNameInput, setLastNameInput] = useState(initialLastName)
  const [employerInput, setEmployerInput] = useState(initialEmployerName)
  const [phoneInput, setPhoneInput] = useState(initialPhone)
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

  async function saveIdentity() {
    setIdentitySaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstNameInput.trim(),
          last_name: lastNameInput.trim(),
          employer_name: employerInput.trim(),
          phone: phoneInput.trim(),
        }
      })
      if (!error) {
        setFirstName(firstNameInput.trim())
        setLastName(lastNameInput.trim())
        setEmployerName(employerInput.trim())
        setPhone(phoneInput.trim())
        setEditingIdentity(false)
        track('profile_updated', { field: 'identity' })
      }
    } finally {
      setIdentitySaving(false)
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

        {/* Identité pour analyse */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading flex items-center gap-2">
              <FileText size={18} className="text-brand-600" />
              Informations pour l&apos;analyse
            </h2>
            {!editingIdentity && (
              <button
                onClick={() => setEditingIdentity(true)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Modifier
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Ces informations aident Tloush à mieux reconnaître votre nom et celui de votre employeur sur vos documents en hébreu, au lieu de les traduire incorrectement.
          </p>

          {editingIdentity ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstNameInput}
                    onChange={e => setFirstNameInput(e.target.value)}
                    placeholder="Gabriel"
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nom de famille</label>
                  <input
                    type="text"
                    value={lastNameInput}
                    onChange={e => setLastNameInput(e.target.value)}
                    placeholder="Cohen"
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Employeur / entreprise</label>
                  <input
                    type="text"
                    value={employerInput}
                    onChange={e => setEmployerInput(e.target.value)}
                    placeholder="Check Point Software"
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="05X-XXX-XXXX"
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={saveIdentity}
                  disabled={identitySaving}
                  className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2 rounded-xl transition-colors"
                >
                  {identitySaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => {
                    setEditingIdentity(false)
                    setFirstNameInput(firstName)
                    setLastNameInput(lastName)
                    setEmployerInput(employerName)
                  }}
                  className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Prénom</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{firstName || <span className="text-slate-400 dark:text-slate-500 italic">Non renseigné</span>}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Nom de famille</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{lastName || <span className="text-slate-400 dark:text-slate-500 italic">Non renseigné</span>}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Employeur</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{employerName || <span className="text-slate-400 dark:text-slate-500 italic">Non renseigné</span>}</span>
              </div>
            </div>
          )}
        </div>

        {/* Famille */}
        <FamilySection userEmail={email} />

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
