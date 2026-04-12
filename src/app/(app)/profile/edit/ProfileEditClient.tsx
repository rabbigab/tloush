'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Users, Plane, Briefcase, Heart, Home, AlertCircle } from 'lucide-react'
import type {
  UserProfile,
  MaritalStatus,
  EmploymentStatus,
  KupatHolim,
  HousingStatus,
} from '@/types/userProfile'
import {
  MARITAL_STATUS_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  KUPAT_HOLIM_LABELS,
  HOUSING_STATUS_LABELS,
} from '@/types/userProfile'

const INPUT_CLS = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

const CURRENT_YEAR = new Date().getFullYear()
const ALIYAH_YEARS = Array.from({ length: CURRENT_YEAR - 1948 + 1 }, (_, i) => CURRENT_YEAR - i)

export default function ProfileEditClient({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }))
    setSaved(false)

    // Auto-save avec debounce de 800ms
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      save({ [key]: value })
    }, 800)
  }, [])

  async function save(patch: Partial<UserProfile>) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile/user-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Erreur lors de la sauvegarde')
        return
      }
      const data = await res.json()
      if (data.profile) {
        setProfile(prev => ({ ...prev, profile_completion_pct: data.profile.profile_completion_pct }))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Erreur reseau')
    } finally {
      setSaving(false)
    }
  }

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Completer mon profil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Plus votre profil est complet, plus Tloush peut personnaliser ses analyses.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Profil rempli a {profile.profile_completion_pct}%
          </span>
          <div className="flex items-center gap-2">
            {saving && <Loader2 size={16} className="text-blue-500 animate-spin" />}
            {saved && <CheckCircle2 size={16} className="text-green-500" />}
            <span className="text-xs text-slate-400">
              {saving ? 'Sauvegarde...' : saved ? 'Enregistre' : 'Auto-save active'}
            </span>
          </div>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${profile.profile_completion_pct}%` }}
          />
        </div>
        {profile.profile_completion_pct < 60 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
            <AlertCircle size={12} />
            Completez au moins 60% pour debloquer l'estimateur de remboursement d'impots et le detecteur de droits.
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Section: Situation familiale */}
      <Section icon={<Users size={18} className="text-pink-500" />} title="Situation familiale">
        <Field label="Statut matrimonial">
          <select
            value={profile.marital_status || ''}
            onChange={(e) => update('marital_status', (e.target.value || null) as MaritalStatus | null)}
            className={INPUT_CLS}
          >
            <option value="">Non precise</option>
            {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Nombre d'enfants">
          <input
            type="number"
            min={0}
            max={20}
            value={profile.children_count}
            onChange={(e) => update('children_count', Math.max(0, Math.min(20, Number(e.target.value))))}
            className={INPUT_CLS}
          />
        </Field>
      </Section>

      {/* Section: Alyah */}
      <Section icon={<Plane size={18} className="text-blue-500" />} title="Alyah / Immigration">
        <Field label="Annee d'alyah">
          <select
            value={profile.aliyah_year || ''}
            onChange={(e) => update('aliyah_year', e.target.value ? Number(e.target.value) : null)}
            className={INPUT_CLS}
          >
            <option value="">Non precise</option>
            {ALIYAH_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </Field>

        <Field label="Pays d'origine">
          <input
            type="text"
            value={profile.country_of_origin || ''}
            onChange={(e) => update('country_of_origin', e.target.value || null)}
            placeholder="Ex: France, Belgique, Canada..."
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Citoyennete israelienne">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.israeli_citizen}
              onChange={(e) => update('israeli_citizen', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Oui, j'ai la citoyennete israelienne</span>
          </label>
        </Field>
      </Section>

      {/* Section: Situation professionnelle */}
      <Section icon={<Briefcase size={18} className="text-amber-500" />} title="Situation professionnelle">
        <Field label="Statut professionnel">
          <select
            value={profile.employment_status || ''}
            onChange={(e) => update('employment_status', (e.target.value || null) as EmploymentStatus | null)}
            className={INPUT_CLS}
          >
            <option value="">Non precise</option>
            {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Secteur d'activite (optionnel)">
          <input
            type="text"
            value={profile.employer_sector || ''}
            onChange={(e) => update('employer_sector', e.target.value || null)}
            placeholder="Ex: High-tech, restauration, sante..."
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Revenu mensuel approximatif (NIS, optionnel)">
          <input
            type="number"
            min={0}
            value={profile.monthly_income || ''}
            onChange={(e) => update('monthly_income', e.target.value ? Number(e.target.value) : null)}
            placeholder="0"
            className={INPUT_CLS}
          />
        </Field>
      </Section>

      {/* Section: Sante */}
      <Section icon={<Heart size={18} className="text-red-500" />} title="Sante">
        <Field label="Caisse maladie (Kupat Holim)">
          <select
            value={profile.kupat_holim || ''}
            onChange={(e) => update('kupat_holim', (e.target.value || null) as KupatHolim | null)}
            className={INPUT_CLS}
          >
            <option value="">Non precise</option>
            {Object.entries(KUPAT_HOLIM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Taux d'invalidite reconnu (%, si applicable)">
          <input
            type="number"
            min={0}
            max={100}
            value={profile.disability_level ?? ''}
            onChange={(e) => update('disability_level', e.target.value ? Number(e.target.value) : null)}
            placeholder="0"
            className={INPUT_CLS}
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Utilise uniquement pour detecter les droits aux aides. Laissez vide si non concerne.
          </p>
        </Field>
      </Section>

      {/* Section: Logement */}
      <Section icon={<Home size={18} className="text-green-500" />} title="Logement">
        <Field label="Ville">
          <input
            type="text"
            value={profile.city || ''}
            onChange={(e) => update('city', e.target.value || null)}
            placeholder="Ex: Tel Aviv, Jerusalem, Netanya..."
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Statut d'occupation">
          <select
            value={profile.housing_status || ''}
            onChange={(e) => update('housing_status', (e.target.value || null) as HousingStatus | null)}
            className={INPUT_CLS}
          >
            <option value="">Non precise</option>
            {Object.entries(HOUSING_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </Section>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Vos donnees sont privees et stockees de maniere securisee. Elles ne sont jamais partagees.
      </p>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
