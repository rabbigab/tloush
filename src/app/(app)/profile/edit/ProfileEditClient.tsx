'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Users, Plane, Briefcase, Heart, Home, AlertCircle, Shield, GraduationCap, UserCheck, Baby, Save, Sparkles } from 'lucide-react'
import type {
  UserProfile,
  UserProfileUpdate,
  Gender,
  MaritalStatus,
  EmploymentStatus,
  KupatHolim,
  HousingStatus,
  EducationLevel,
} from '@/types/userProfile'
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  KUPAT_HOLIM_LABELS,
  HOUSING_STATUS_LABELS,
  EDUCATION_LEVEL_LABELS,
} from '@/types/userProfile'

const INPUT_CLS = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const CHECKBOX_LABEL_CLS = 'flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg'

const CURRENT_YEAR = new Date().getFullYear()
const ALIYAH_YEARS = Array.from({ length: CURRENT_YEAR - 1948 + 1 }, (_, i) => CURRENT_YEAR - i)
const DISCHARGE_YEARS = Array.from({ length: CURRENT_YEAR - 1980 + 1 }, (_, i) => CURRENT_YEAR - i)

// Liste des champs editables — sert au "Sauvegarder tout" pour envoyer
// l'integralite du profil en un seul PATCH (ne contient pas user_id,
// created_at, updated_at, profile_completion_pct qui sont geres par l'API).
const EDITABLE_FIELDS: (keyof UserProfileUpdate)[] = [
  'gender', 'birth_date', 'marital_status',
  'children_count', 'children_with_disabilities', 'children_in_daycare',
  'aliyah_year', 'country_of_origin', 'israeli_citizen',
  'employment_status', 'employer_sector', 'monthly_income', 'household_income_monthly',
  'served_in_idf', 'military_discharge_year', 'is_combat_veteran',
  'is_active_reservist', 'is_bereaved_family',
  'education_level', 'is_current_student', 'institution_name',
  'kupat_holim', 'disability_level',
  'is_holocaust_survivor', 'is_caregiver', 'chronic_illness',
  'has_mobility_limitation', 'has_disabled_child',
  'city', 'municipality', 'housing_status', 'home_size_sqm', 'has_mortgage',
  'receives_kitsbat_yeladim', 'receives_old_age_pension', 'receives_disability_pension',
  'receives_income_support', 'receives_rental_assistance', 'receives_ulpan',
  'receives_shoah_benefits',
]

export default function ProfileEditClient({ initialProfile }: { initialProfile: UserProfile }) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fullySaved, setFullySaved] = useState(false)  // apres bouton "Sauvegarder tout"
  const [error, setError] = useState('')
  const [dbError, setDbError] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async (patch: Partial<UserProfile>) => {
    setSaving(true)
    setError('')
    setDbError('')
    try {
      const res = await fetch('/api/profile/user-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('[profile save] failed:', { status: res.status, data, patch })
        setError(data.error || `Erreur ${res.status} lors de la sauvegarde`)
        setDbError(data.db_error || '')
        return false
      }
      const data = await res.json()
      if (data.profile) {
        setProfile(prev => ({ ...prev, profile_completion_pct: data.profile.profile_completion_pct }))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return true
    } catch (err) {
      console.error('[profile save] network error:', err)
      setError(`Erreur reseau : ${err instanceof Error ? err.message : String(err)}`)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  // Sauvegarde complete : envoie TOUS les champs editables d'un coup
  // (au cas ou l'auto-save aurait rate quelque chose ou que l'utilisateur
  // veuille une confirmation explicite avant de quitter la page).
  const saveAll = useCallback(async () => {
    // Cancel auto-save en cours pour eviter race condition
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    const fullPatch: Partial<UserProfile> = {}
    for (const field of EDITABLE_FIELDS) {
      const value = profile[field as keyof UserProfile]
      if (value !== undefined) {
        // eslint-disable-next-line
        ;(fullPatch as any)[field] = value
      }
    }
    const ok = await save(fullPatch)
    if (ok) {
      setFullySaved(true)
      setTimeout(() => setFullySaved(false), 3500)
    }
  }, [profile, save])

  const saveAndGoToRights = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    const fullPatch: Partial<UserProfile> = {}
    for (const field of EDITABLE_FIELDS) {
      const value = profile[field as keyof UserProfile]
      if (value !== undefined) {
        // eslint-disable-next-line
        ;(fullPatch as any)[field] = value
      }
    }
    const ok = await save(fullPatch)
    if (ok) {
      router.push('/rights-detector')
    }
  }, [profile, save, router])

  const update = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }))
    setSaved(false)
    setFullySaved(false)

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      save({ [key]: value })
    }, 800)
  }, [save])

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
            Plus votre profil est complet, plus Tloush peut detecter d&apos;aides auxquelles vous avez droit.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sticky top-0 z-10">
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
        {profile.profile_completion_pct < 70 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
            <AlertCircle size={12} />
            Completez au moins 70% pour debloquer toutes les detections de droits.
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300" role="alert" aria-live="polite">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1">Echec de la sauvegarde</p>
              <p className="text-sm">{error}</p>
              {dbError && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer opacity-60 hover:opacity-100">Detail technique</summary>
                  <pre className="text-xs whitespace-pre-wrap break-words font-mono mt-1 opacity-70">{dbError}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section: Identite de base */}
      <Section icon={<UserCheck size={18} className="text-slate-600" />} title="Identite de base">
        <Field label="Genre (affecte les points de credit fiscaux)">
          <select
            value={profile.gender || ''}
            onChange={(e) => update('gender', (e.target.value || null) as Gender | null)}
            className={INPUT_CLS}
          >
            <option value="">Non precise</option>
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Important : une femme beneficie de 0.5 point de credit supplementaire.
          </p>
        </Field>

        <Field label="Date de naissance">
          <input
            type="date"
            value={profile.birth_date || ''}
            onChange={(e) => update('birth_date', e.target.value || null)}
            className={INPUT_CLS}
          />
          <p className="text-xs text-slate-400 mt-1">
            Utilise pour detecter votre eligibilite a la retraite (67 ans H / 62-65 F).
          </p>
        </Field>
      </Section>

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
          <p className="text-xs text-slate-400 mt-1">
            Debloque : allocation enfants BL, points credit enfants, aides garderie.
          </p>
        </Field>

        {profile.children_count > 0 && (
          <>
            <Field label="Enfants en situation de handicap">
              <input
                type="number"
                min={0}
                max={profile.children_count}
                value={profile.children_with_disabilities || 0}
                onChange={(e) => update('children_with_disabilities', Math.max(0, Number(e.target.value)))}
                className={INPUT_CLS}
              />
              <p className="text-xs text-slate-400 mt-1">
                Chaque enfant handicape ouvre droit a +2 points de credit + allocation speciale BL.
              </p>
            </Field>

            <Field label="Enfants en creche / garderie agreee">
              <input
                type="number"
                min={0}
                max={profile.children_count}
                value={profile.children_in_daycare || 0}
                onChange={(e) => update('children_in_daycare', Math.max(0, Number(e.target.value)))}
                className={INPUT_CLS}
              />
            </Field>
          </>
        )}
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
          <p className="text-xs text-slate-400 mt-1">
            Debloque : sal klita, ulpan, points credit oleh, reduction arnona 70-90%, mashkanta olim.
          </p>
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
          <label className={CHECKBOX_LABEL_CLS}>
            <input
              type="checkbox"
              checked={profile.israeli_citizen}
              onChange={(e) => update('israeli_citizen', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Oui, j&apos;ai la citoyennete israelienne</span>
          </label>
        </Field>
      </Section>

      {/* Section: Service militaire */}
      <Section icon={<Shield size={18} className="text-green-600" />} title="Service militaire">
        <Field label="J'ai servi dans Tsahal">
          <label className={CHECKBOX_LABEL_CLS}>
            <input
              type="checkbox"
              checked={profile.served_in_idf}
              onChange={(e) => update('served_in_idf', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Oui, j&apos;ai fait mon service militaire</span>
          </label>
        </Field>

        {profile.served_in_idf && (
          <>
            <Field label="Annee de liberation">
              <select
                value={profile.military_discharge_year || ''}
                onChange={(e) => update('military_discharge_year', e.target.value ? Number(e.target.value) : null)}
                className={INPUT_CLS}
              >
                <option value="">Non precise</option>
                {DISCHARGE_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </Field>

            <Field label="Situations particulieres">
              <div className="space-y-1">
                <label className={CHECKBOX_LABEL_CLS}>
                  <input
                    type="checkbox"
                    checked={profile.is_combat_veteran}
                    onChange={(e) => update('is_combat_veteran', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">J'ai ete combattant (lohem)</span>
                </label>
                <label className={CHECKBOX_LABEL_CLS}>
                  <input
                    type="checkbox"
                    checked={profile.is_active_reservist}
                    onChange={(e) => update('is_active_reservist', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Je suis actuellement reserviste (miluim)</span>
                </label>
                <label className={CHECKBOX_LABEL_CLS}>
                  <input
                    type="checkbox"
                    checked={profile.is_bereaved_family}
                    onChange={(e) => update('is_bereaved_family', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Famille endeuillee (IDF/terrorisme)</span>
                </label>
              </div>
            </Field>
          </>
        )}
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

        <Field label="Revenu mensuel approximatif (NIS brut, optionnel)">
          <input
            type="number"
            min={0}
            value={profile.monthly_income || ''}
            onChange={(e) => update('monthly_income', e.target.value ? Number(e.target.value) : null)}
            placeholder="0"
            className={INPUT_CLS}
          />
          <p className="text-xs text-slate-400 mt-1">
            Utilise pour detecter : remboursement impot, exemption BL freelance, havtachat hakhnasa.
          </p>
        </Field>

        <Field label="Revenu mensuel total du foyer (NIS, optionnel)">
          <input
            type="number"
            min={0}
            value={profile.household_income_monthly || ''}
            onChange={(e) => update('household_income_monthly', e.target.value ? Number(e.target.value) : null)}
            placeholder="0"
            className={INPUT_CLS}
          />
          <p className="text-xs text-slate-400 mt-1">
            Permet de detecter les aides conditionnees au revenu (havtachat hakhnasa, arnona, etc.).
          </p>
        </Field>
      </Section>

      {/* Section: Education */}
      <Section icon={<GraduationCap size={18} className="text-purple-500" />} title="Education">
        <Field label="Niveau d'etudes">
          <select
            value={profile.education_level || ''}
            onChange={(e) => update('education_level', (e.target.value || null) as EducationLevel | null)}
            className={INPUT_CLS}
          >
            <option value="">Non precise</option>
            {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Un diplome BA/MA ouvre droit a 1 point de credit fiscal pendant plusieurs annees.
          </p>
        </Field>

        <Field label="Je suis etudiant actuellement">
          <label className={CHECKBOX_LABEL_CLS}>
            <input
              type="checkbox"
              checked={profile.is_current_student}
              onChange={(e) => update('is_current_student', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Oui, inscrit dans un etablissement superieur</span>
          </label>
        </Field>

        {profile.is_current_student && (
          <Field label="Etablissement">
            <input
              type="text"
              value={profile.institution_name || ''}
              onChange={(e) => update('institution_name', e.target.value || null)}
              placeholder="Ex: Universite hebraique de Jerusalem"
              className={INPUT_CLS}
            />
          </Field>
        )}
      </Section>

      {/* Section: Sante */}
      <Section icon={<Heart size={18} className="text-red-500" />} title="Sante et situations speciales">
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
          <p className="text-xs text-slate-400 mt-1">
            Confidentiel. Debloque : allocation invalidite BL, reduction arnona, exemption mas, mobilite.
          </p>
        </Field>

        <Field label="Situations particulieres">
          <div className="space-y-1">
            <label className={CHECKBOX_LABEL_CLS}>
              <input
                type="checkbox"
                checked={profile.is_holocaust_survivor}
                onChange={(e) => update('is_holocaust_survivor', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Survivant de la Shoah (ou conjoint)</span>
            </label>
            <label className={CHECKBOX_LABEL_CLS}>
              <input
                type="checkbox"
                checked={profile.is_caregiver}
                onChange={(e) => update('is_caregiver', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Je m'occupe d'un proche dependant</span>
            </label>
            <label className={CHECKBOX_LABEL_CLS}>
              <input
                type="checkbox"
                checked={profile.chronic_illness}
                onChange={(e) => update('chronic_illness', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Maladie chronique reconnue</span>
            </label>
            <label className={CHECKBOX_LABEL_CLS}>
              <input
                type="checkbox"
                checked={profile.has_mobility_limitation}
                onChange={(e) => update('has_mobility_limitation', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Limitation de mobilite</span>
            </label>
            <label className={CHECKBOX_LABEL_CLS}>
              <input
                type="checkbox"
                checked={profile.has_disabled_child}
                onChange={(e) => update('has_disabled_child', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">J'ai un enfant handicape</span>
            </label>
          </div>
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

        <Field label="Mairie / Municipalite (si differente)">
          <input
            type="text"
            value={profile.municipality || ''}
            onChange={(e) => update('municipality', e.target.value || null)}
            placeholder="Ex: Iria de Tel Aviv-Yafo"
            className={INPUT_CLS}
          />
          <p className="text-xs text-slate-400 mt-1">
            Chaque commune a ses propres baremes de reduction d'arnona.
          </p>
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

        <Field label="Surface du logement (m², pour calcul arnona)">
          <input
            type="number"
            min={0}
            value={profile.home_size_sqm || ''}
            onChange={(e) => update('home_size_sqm', e.target.value ? Number(e.target.value) : null)}
            placeholder="0"
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Financier">
          <div className="space-y-1">
            <label className={CHECKBOX_LABEL_CLS}>
              <input
                type="checkbox"
                checked={profile.has_mortgage}
                onChange={(e) => update('has_mortgage', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">J'ai un mashkanta (pret immobilier)</span>
            </label>
          </div>
        </Field>
      </Section>

      {/* Section: Allocations en cours */}
      <Section icon={<Baby size={18} className="text-indigo-500" />} title="Allocations deja percues">
        <p className="text-xs text-slate-400 mb-2">
          Indiquez ce que vous recevez deja pour eviter les doublons dans le detecteur.
        </p>
        <div className="space-y-1">
          {([
            { key: 'receives_kitsbat_yeladim', label: 'Allocation enfants (kitsbat yeladim)' },
            { key: 'receives_old_age_pension', label: 'Pension vieillesse (zikna)' },
            { key: 'receives_disability_pension', label: 'Allocation invalidite (nekhout)' },
            { key: 'receives_income_support', label: 'Revenu minimum garanti (havtachat hakhnasa)' },
            { key: 'receives_rental_assistance', label: 'Aide au loyer (siuah sechar dira)' },
            { key: 'receives_ulpan', label: 'Ulpan en cours' },
            { key: 'receives_shoah_benefits', label: 'Aide aux survivants de la Shoah' },
          ] as const).map(item => (
            <label key={item.key} className={CHECKBOX_LABEL_CLS}>
              <input
                type="checkbox"
                checked={profile[item.key] === true}
                onChange={(e) => update(item.key, e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Confirmation "tout sauvegarde" */}
      {fullySaved && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Profil sauvegarde integralement !</p>
            <p className="text-xs mt-0.5 text-green-600 dark:text-green-400">
              Vous pouvez maintenant aller voir vos droits detectes.
            </p>
          </div>
        </div>
      )}

      {/* Actions finales */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder tout'}
          </button>
          <button
            onClick={saveAndGoToRights}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder & voir mes droits'}
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Les modifications sont aussi sauvegardees automatiquement apres chaque champ.
        </p>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-4 pb-6">
        Vos donnees sont privees et stockees de maniere securisee.
        Elles ne sont jamais partagees et servent uniquement a detecter vos droits.
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
