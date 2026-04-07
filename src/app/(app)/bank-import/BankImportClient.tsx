'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { parseBankCSV, CATEGORY_LABELS_FR, type ParseResult } from '@/lib/bankCsvParser'

export default function BankImportClient() {
  const [result, setResult] = useState<ParseResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    const text = await file.text()
    const parsed = parseBankCSV(text)
    setResult(parsed)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // Category summary
  const categoryTotals: Record<string, { income: number; expense: number; count: number }> = {}
  if (result?.success) {
    for (const t of result.transactions) {
      const cat = t.category || 'other'
      if (!categoryTotals[cat]) categoryTotals[cat] = { income: 0, expense: 0, count: 0 }
      categoryTotals[cat].count++
      if (t.amount > 0) categoryTotals[cat].income += t.amount
      else categoryTotals[cat].expense += Math.abs(t.amount)
    }
  }

  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b.expense - a.expense)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950/30 rounded-xl flex items-center justify-center">
            <FileSpreadsheet size={22} className="text-violet-600" />
          </div>
          Import bancaire
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Importez un export CSV de votre banque pour analyser vos transactions
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
          dragOver
            ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/20'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700'
        }`}
      >
        <Upload size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Glissez un fichier CSV ici ou cliquez pour choisir
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Export CSV depuis Hapoalim, Leumi, Discount, Mizrahi ou autre banque israelienne
        </p>
        <input ref={fileRef} type="file" accept=".csv,.txt,.tsv" onChange={onFileChange} className="hidden" />
      </div>

      {/* How to export */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Comment exporter depuis votre banque ?</p>
        <p>Connectez-vous a votre banque en ligne → Allez dans l&apos;historique → Choisissez la periode → Cliquez sur &quot;Export&quot; ou &quot;ייצוא&quot; → Format CSV</p>
      </div>

      {/* Error */}
      {result && !result.success && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">Erreur de parsing</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{result.error}</p>
        </div>
      )}

      {/* Results */}
      {result?.success && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{result.stats.totalTransactions}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Transactions</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-green-600">+{result.stats.totalIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revenus</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-red-600">-{result.stats.totalExpenses.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Depenses</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className={`text-xl font-bold ${result.stats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.stats.netFlow >= 0 ? '+' : ''}{result.stats.netFlow.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Solde net</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Periode: {result.stats.dateRange.from} → {result.stats.dateRange.to} · Banque detectee: {result.bankDetected}
          </p>

          {/* Category breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Depenses par categorie</h3>
            {sortedCategories.filter(([, v]) => v.expense > 0).map(([cat, v]) => {
              const pct = result.stats.totalExpenses > 0 ? (v.expense / result.stats.totalExpenses) * 100 : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{CATEGORY_LABELS_FR[cat] || cat}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {v.expense.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪ ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent transactions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Dernieres transactions</h3>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {result.transactions.slice(-20).reverse().map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-20 shrink-0">{t.date}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{t.description}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{CATEGORY_LABELS_FR[t.category || 'other']}</span>
                  <span className={`text-sm font-semibold shrink-0 ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
