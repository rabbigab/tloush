'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Plus, Calendar, AlertCircle, Trash2, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react'
import type { MiluimPeriod } from '@/lib/miluim'
import { SERVICE_TYPE_LABELS, validateMiluimLimits } from '@/lib/miluim'
import LegalDisclaimer, { BetaBadge } from '@/components/shared/LegalDisclaimer'

interface MiluimSummary {
  totalDaysAllTime: number
  totalDays12Months: number
  totalDays3Years: number
  totalCompensation: number
}

interface ApiResponse {
  periods: MiluimPeriod[]
  summary: MiluimSummary
}

export default function MiluimClient() {
  const [periods, setPeriods] = useState<MiluimPeriod[]>([])
  const [summary, setSummary] = useState<MiluimSummary>({
    totalDaysAllTime: 0,
    totalDays12Months: 0,
    totalDays3Years: 0,
    totalCompensation: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formServiceType, setFormServiceType] = useState<MiluimPeriod['service_type']>('regular')
  const [formSalary, setFormSalary] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/miluim')
      if (res.ok) {
        const data: ApiResponse = await res.json()
        setPeriods(data.periods)
        setSummary(data.summary)
      }
    } catch {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function addPeriod(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/miluim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: formStartDate,
          end_date: formEndDate,
          unit: formUnit || null,
          service_type: formServiceType,
          notes: formNotes || null,
          monthly_avg_salary: formSalary ? Number(formSalary) : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erreur lors de l\'ajout')
        return
      }
      // Reset form
      setFormStartDate('')
      setFormEndDate('')
      setFormUnit('')
      setFormServiceType('regular')
      setFormSalary('')
      setFormNotes('')
      setShowForm(false)
      fetchData()
    } catch {
      setError('Erreur reseau')
    } finally {
      setSaving(false)
    }
  }

  async function deletePeriod(id: string) {
    if (!confirm('Supprimer cette periode ?')) return
    try {
      const res = await fetch(`/api/miluim?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch {
      setError('Erreur reseau')
    }
  }

  const limits = validateMiluimLimits(summary.totalDays3Years)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={22} className="text-green-600" /> Miluim
            <BetaBadge />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Suivez vos periodes de reserve et estimez votre compensation Bituach Leumi.
          </p>
        </div>
      </div>

      <LegalDisclaimer
        level="beta"
        topic="du miluim en Israel"
        official_url="https://www.btl.gov.il/benefits/Reserves/"
        official_label="Bituach Leumi (officiel)"
        expert_label="Consulter un expert"
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <Calendar size={14} />
            12 derniers mois
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{summary.totalDays12Months}</p>
          <p className="text-xs text-slate-400">jours de miluim</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <TrendingUp size={14} />
            3 derniers ans
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {summary.totalDays3Years} / 270
          </p>
          <p className="text-xs text-slate-400">plafond legal</p>
          {limits.warning && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <AlertCircle size={10} /> {limits.warning}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <DollarSign size={14} />
            Compensation estimee
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {summary.totalCompensation.toLocaleString('fr-IL')} ₪
          </p>
          <p className="text-xs text-slate-400">total tagmoul miluim</p>
        </div>
      </div>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/30 dark:hover:bg-green-950/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span className="font-medium">Ajouter une periode de miluim</span>
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={addPeriod} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Nouvelle periode</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date debut</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date fin</label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type de service</label>
            <select
              value={formServiceType || ''}
              onChange={(e) => setFormServiceType(e.target.value as MiluimPeriod['service_type'])}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Unite (optionnel)</label>
            <input
              type="text"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
              placeholder="Ex: 8200, Givati, etc."
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Salaire mensuel moyen des 3 derniers mois (NIS)
            </label>
            <input
              type="number"
              value={formSalary}
              onChange={(e) => setFormSalary(e.target.value)}
              placeholder="Ex: 15000"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            />
            <p className="text-xs text-slate-400 mt-1">Pour calculer l'estimation de compensation</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (optionnel)</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Periods list */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Historique des periodes
        </h2>
        {periods.length === 0 ? (
          <div className="text-center py-10">
            <Shield size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucune periode enregistree
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map(p => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {new Date(p.start_date).toLocaleDateString('fr-FR')} → {new Date(p.end_date).toLocaleDateString('fr-FR')}
                    </p>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/40 px-2 py-0.5 rounded-full">
                      {p.days_count} j
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {p.service_type && (
                      <span>{SERVICE_TYPE_LABELS[p.service_type]}</span>
                    )}
                    {p.unit && <span>Unite : {p.unit}</span>}
                    {p.total_compensation && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {Number(p.total_compensation).toLocaleString('fr-IL')} ₪
                      </span>
                    )}
                    {p.employer_reimbursed && (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Rembourse
                      </span>
                    )}
                  </div>
                  {p.notes && (
                    <p className="text-xs text-slate-400 mt-1">{p.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => deletePeriod(p.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
        <p className="font-semibold">A propos du tagmoul miluim :</p>
        <p>
          Bituach Leumi rembourse votre employeur sur la base de votre salaire moyen des 3 derniers mois,
          avec un plancher et un plafond journaliers. Les montants sont indicatifs — reference le site officiel BL pour les baremes exacts.
        </p>
        <a
          href="https://www.btl.gov.il/benefits/Reserves/Pages/tagmul.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline inline-block mt-1"
        >
          Site officiel Bituach Leumi →
        </a>
      </div>
    </div>
  )
}
