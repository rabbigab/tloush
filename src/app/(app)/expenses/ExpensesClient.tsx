'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wallet, TrendingUp, Trash2, FileText, Calendar } from 'lucide-react'

interface RecurringExpense {
  id: string
  provider_name: string
  category: string | null
  amount: number | null
  currency: string
  frequency: string | null
  last_seen_date: string | null
  document_ids: string[] | null
  status: string
}

const FREQ_LABELS: Record<string, string> = {
  monthly: 'Mensuel',
  bimonthly: 'Bimestriel',
  quarterly: 'Trimestriel',
  annual: 'Annuel',
  one_time: 'Ponctuel',
}

const FREQ_MONTHLY_MULTIPLIER: Record<string, number> = {
  monthly: 1,
  bimonthly: 0.5,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
}

const CATEGORY_LABELS: Record<string, string> = {
  travail: 'Travail',
  securite_sociale: 'Sécurité sociale',
  fiscal: 'Fiscal',
  retraite: 'Retraite',
  logement: 'Logement',
  bancaire: 'Bancaire',
  finance: 'Factures',
  autre: 'Autre',
}

export default function ExpensesClient({ expenses: initialExpenses }: { expenses: RecurringExpense[] }) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const monthlyTotal = expenses.reduce((sum, e) => {
    const mult = FREQ_MONTHLY_MULTIPLIER[e.frequency || 'monthly'] ?? 1
    return sum + (e.amount || 0) * mult
  }, 0)

  const annualTotal = monthlyTotal * 12

  async function handleRemove(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/recurring-expenses/${id}`, { method: 'DELETE' })
      if (res.ok) setExpenses(prev => prev.filter(e => e.id !== id))
    } catch {
      // stays in list
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Group by category
  const byCategory = new Map<string, RecurringExpense[]>()
  for (const e of expenses) {
    const key = e.category || 'autre'
    const list = byCategory.get(key) || []
    list.push(e)
    byCategory.set(key, list)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="page-title mb-1">Mes dépenses</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Dépenses récurrentes détectées automatiquement depuis vos factures scannées.
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/30 dark:to-slate-800 rounded-2xl border border-brand-200 dark:border-brand-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/40 rounded-xl flex items-center justify-center">
              <Wallet size={18} className="text-brand-600" />
            </div>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Budget mensuel</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {monthlyTotal.toFixed(0)}<span className="text-lg ml-1 text-slate-500">₪</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{expenses.length} dépense{expenses.length > 1 ? 's' : ''} suivie{expenses.length > 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-800 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-indigo-600" />
            </div>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Projection annuelle</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {annualTotal.toFixed(0)}<span className="text-lg ml-1 text-slate-500">₪</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sur 12 mois</p>
        </div>
      </div>

      {/* Empty state */}
      {expenses.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet size={28} className="text-brand-400" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Aucune dépense récurrente détectée</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Scannez vos factures (arnona, électricité, eau, internet, assurance...) pour suivre votre budget automatiquement.
          </p>
          <Link
            href="/inbox"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <FileText size={14} />
            Ajouter une facture
          </Link>
        </div>
      )}

      {/* Expenses grouped by category */}
      {Array.from(byCategory.entries()).map(([category, items]) => {
        const catTotal = items.reduce((sum, e) => {
          const mult = FREQ_MONTHLY_MULTIPLIER[e.frequency || 'monthly'] ?? 1
          return sum + (e.amount || 0) * mult
        }, 0)
        return (
          <div key={category} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {catTotal.toFixed(0)}₪ / mois
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map(exp => (
                <div key={exp.id} className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{exp.provider_name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                        <Calendar size={11} /> {FREQ_LABELS[exp.frequency || 'monthly'] || exp.frequency}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Dernière : {formatDate(exp.last_seen_date)}
                      </span>
                      {Array.isArray(exp.document_ids) && exp.document_ids.length > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {exp.document_ids.length} document{exp.document_ids.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {exp.amount ? `${exp.amount}₪` : '—'}
                    </p>
                    <button
                      onClick={() => handleRemove(exp.id)}
                      disabled={deletingId === exp.id}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                      aria-label="Retirer cette dépense du suivi"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
