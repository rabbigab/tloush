'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wallet, TrendingUp, Trash2, FileText, Calendar, Download, Pencil, Check, X, Plus } from 'lucide-react'

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

interface MonthPoint { key: string; label: string; amount: number }

export default function ExpensesClient({ expenses: initialExpenses, monthly = [] }: { expenses: RecurringExpense[]; monthly?: MonthPoint[] }) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editFrequency, setEditFrequency] = useState('monthly')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newFrequency, setNewFrequency] = useState('monthly')
  const [newCategory, setNewCategory] = useState('logement')
  const [addingExpense, setAddingExpense] = useState(false)

  function startEdit(exp: RecurringExpense) {
    setEditingId(exp.id)
    setEditAmount(exp.amount ? String(exp.amount) : '')
    setEditFrequency(exp.frequency || 'monthly')
  }

  async function saveEdit(id: string) {
    const amount = parseFloat(editAmount)
    try {
      const res = await fetch(`/api/recurring-expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: isNaN(amount) ? null : amount,
          frequency: editFrequency,
        }),
      })
      if (res.ok) {
        const { expense } = await res.json()
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e))
        setEditingId(null)
      }
    } catch {
      // keep edit mode open
    }
  }

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

  async function addExpense() {
    if (!newName.trim()) return
    setAddingExpense(true)
    try {
      const amount = parseFloat(newAmount)
      const res = await fetch('/api/recurring-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_name: newName.trim(),
          amount: isNaN(amount) ? null : amount,
          frequency: newFrequency,
          category: newCategory,
        }),
      })
      if (res.ok) {
        const { expense } = await res.json()
        setExpenses(prev => [...prev, expense])
        setNewName('')
        setNewAmount('')
        setNewFrequency('monthly')
        setNewCategory('logement')
        setShowAddForm(false)
      }
    } catch {
      // keep form open
    } finally {
      setAddingExpense(false)
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
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title mb-1">Mes dépenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dépenses récurrentes détectées automatiquement depuis vos factures scannées.
          </p>
        </div>
        {expenses.length > 0 && (
          <a
            href="/api/recurring-expenses/export"
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-300 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-2 rounded-xl transition-colors min-h-[36px]"
          >
            <Download size={14} /> Exporter CSV
          </a>
        )}
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

      {/* Add expense manually */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full px-6 py-4 flex items-center gap-3 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
          >
            <Plus size={18} />
            Ajouter une dépense manuellement (loyer, assurance, abonnement...)
          </button>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nouvelle dépense récurrente</h3>
              <button onClick={() => setShowAddForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Nom *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Loyer, Harel assurance, Internet..."
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Montant (₪)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="Ex: 3500"
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Fréquence</label>
                <select
                  value={newFrequency}
                  onChange={e => setNewFrequency(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 text-slate-800 dark:text-slate-200"
                >
                  <option value="monthly">Mensuel</option>
                  <option value="bimonthly">Bimestriel</option>
                  <option value="quarterly">Trimestriel</option>
                  <option value="annual">Annuel</option>
                  <option value="one_time">Ponctuel</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Catégorie</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 text-slate-800 dark:text-slate-200"
                >
                  <option value="logement">Logement</option>
                  <option value="finance">Factures</option>
                  <option value="bancaire">Bancaire</option>
                  <option value="securite_sociale">Sécurité sociale</option>
                  <option value="fiscal">Fiscal</option>
                  <option value="retraite">Retraite</option>
                  <option value="travail">Travail</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={addExpense}
                disabled={!newName.trim() || addingExpense}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                {addingExpense ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Ajouter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evolution chart */}
      {monthly.length > 0 && monthly.some(m => m.amount > 0) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Évolution sur 12 mois</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Basé sur les factures scannées</p>
          </div>
          {(() => {
            const maxAmount = Math.max(...monthly.map(m => m.amount), 1)
            return (
              <div className="space-y-2">
                <div className="flex items-end justify-between gap-1 h-40">
                  {monthly.map(m => {
                    const height = maxAmount > 0 ? (m.amount / maxAmount) * 100 : 0
                    return (
                      <div key={m.key} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 group relative">
                        <div
                          className={`w-full rounded-t-md transition-all ${m.amount > 0 ? 'bg-gradient-to-t from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500' : 'bg-slate-100 dark:bg-slate-700'}`}
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${m.label} : ${m.amount.toFixed(0)}₪`}
                        />
                        {m.amount > 0 && (
                          <span className="absolute -top-5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {m.amount.toFixed(0)}₪
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between gap-1">
                  {monthly.map(m => (
                    <span key={m.key} className="flex-1 text-center text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

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
            href="/dashboard"
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
                <div key={exp.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  {editingId === exp.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm flex-1 min-w-[140px] truncate">{exp.provider_name}</p>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value)}
                        placeholder="Montant"
                        className="w-24 px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                      />
                      <select
                        value={editFrequency}
                        onChange={e => setEditFrequency(e.target.value)}
                        className="px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                      >
                        <option value="monthly">Mensuel</option>
                        <option value="bimonthly">Bimestriel</option>
                        <option value="quarterly">Trimestriel</option>
                        <option value="annual">Annuel</option>
                        <option value="one_time">Ponctuel</option>
                      </select>
                      <button
                        onClick={() => saveEdit(exp.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                        aria-label="Valider"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label="Annuler"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
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
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {exp.amount ? `${exp.amount}₪` : '—'}
                        </p>
                        <button
                          onClick={() => startEdit(exp)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                          aria-label="Modifier"
                        >
                          <Pencil size={14} />
                        </button>
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
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
