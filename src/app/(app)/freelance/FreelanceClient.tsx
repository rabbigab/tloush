'use client'

import { useState } from 'react'
import { Briefcase, Calculator, Calendar, ChevronDown, ChevronUp, Lightbulb, AlertTriangle, Check, X } from 'lucide-react'
import { calculateFreelanceTax, FREELANCE_TYPES, type FreelanceProfile, type FreelanceResult } from '@/lib/freelanceMode'

export default function FreelanceClient() {
  const [type, setType] = useState<'osek_patur' | 'osek_murshe'>('osek_patur')
  const [annualRevenue, setAnnualRevenue] = useState('')
  const [annualExpenses, setAnnualExpenses] = useState('')
  const [isNewOleh, setIsNewOleh] = useState(false)
  const [aliyahYear, setAliyahYear] = useState(String(new Date().getFullYear()))
  const [isWoman, setIsWoman] = useState(false)
  const [hasChildren, setHasChildren] = useState(false)
  const [numChildren, setNumChildren] = useState('0')
  const [age, setAge] = useState('30')
  const [result, setResult] = useState<FreelanceResult | null>(null)
  const [showComparison, setShowComparison] = useState(true)
  const [showDeadlines, setShowDeadlines] = useState(false)
  const [error, setError] = useState('')

  function calculate() {
    if (!annualRevenue || Number(annualRevenue) <= 0) {
      setError("Veuillez entrer un chiffre d'affaires valide")
      return
    }
    setError('')
    const profile: FreelanceProfile = {
      type,
      annualRevenue: Number(annualRevenue),
      annualExpenses: Number(annualExpenses) || 0,
      isNewOleh,
      aliyahYear: isNewOleh ? Number(aliyahYear) : undefined,
      isWoman,
      hasChildren,
      numberOfChildren: hasChildren ? Number(numChildren) : undefined,
      age: Number(age),
    }
    setResult(calculateFreelanceTax(profile))
    setShowComparison(false)
  }

  const fmt = (n: number) => n.toLocaleString('he-IL', { maximumFractionDigits: 0 })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
            <Briefcase size={22} className="text-emerald-600" />
          </div>
          Mode Freelance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Simulateur fiscal pour independants en Israel — Osek Patur ou Osek Murshe
        </p>
      </div>

      {/* Type comparison */}
      {showComparison && (
        <div className="grid sm:grid-cols-2 gap-4">
          {FREELANCE_TYPES.map(ft => (
            <button
              key={ft.id}
              onClick={() => { setType(ft.id); setShowComparison(false) }}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                type === ft.id
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{ft.name_fr}</h3>
                <span className="text-xs text-slate-400 font-mono" dir="rtl">{ft.name_he}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{ft.description_fr}</p>
              <div className="space-y-1.5">
                {ft.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-green-700 dark:text-green-400">
                    <Check size={12} className="shrink-0 mt-0.5" />
                    {p}
                  </div>
                ))}
                {ft.cons.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <X size={12} className="shrink-0 mt-0.5" />
                    {c}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Calculator form */}
      {!showComparison && !result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {FREELANCE_TYPES.find(f => f.id === type)?.name_fr}
              </h2>
              <p className="text-xs text-slate-400">{FREELANCE_TYPES.find(f => f.id === type)?.name_he}</p>
            </div>
            <button onClick={() => setShowComparison(true)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Changer de statut
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Chiffre d&apos;affaires annuel (CA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={e => setAnnualRevenue(e.target.value)}
                  placeholder="150000"
                  className="w-full px-3 py-2 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Depenses professionnelles
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={annualExpenses}
                  onChange={e => setAnnualExpenses(e.target.value)}
                  placeholder="30000"
                  className="w-full px-3 py-2 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isWoman} onChange={e => setIsWoman(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Femme</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isNewOleh} onChange={e => setIsNewOleh(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Oleh Hadash</span>
              </label>
            </div>
          </div>

          {isNewOleh && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Annee d&apos;aliyah</label>
              <input
                type="number"
                value={aliyahYear}
                onChange={e => setAliyahYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasChildren} onChange={e => setHasChildren(e.target.checked)} className="rounded" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Enfants</span>
            </label>
            {hasChildren && (
              <input
                type="number"
                min="1"
                value={numChildren}
                onChange={e => setNumChildren(e.target.value)}
                placeholder="Nombre"
                className="w-20 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          )}
          <button
            onClick={calculate}
            disabled={!annualRevenue || Number(annualRevenue) <= 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Calculator size={18} />
            Calculer
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resultats</h2>
            <button
              onClick={() => { setResult(null); setShowComparison(false) }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Modifier
            </button>
          </div>

          {/* Warning if near threshold */}
          {result.shouldSwitchToMurshe && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Attention : seuil Osek Patur</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Votre CA ({fmt(result.annualRevenue)}₪) approche le seuil de {fmt(result.osekPaturThreshold)}₪.
                  Pensez a passer en Osek Murshe.
                </p>
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Revenu net" value={`${fmt(result.netIncome)}₪`} sub="apres toutes charges" color="text-emerald-600" />
            <SummaryCard label="Taux effectif" value={`${result.effectiveRate.toFixed(1)}%`} sub="charges totales / revenu" color="text-blue-600" />
            <SummaryCard label="Impot" value={`${fmt(result.incomeTax)}₪`} sub="mas hachnasa" color="text-red-600" />
            <SummaryCard label="BL + Sante" value={`${fmt(result.bituachLeumi + result.healthTax)}₪`} sub="cotisations sociales" color="text-purple-600" />
          </div>

          {/* Detailed breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Detail des charges annuelles</h3>
            <div className="space-y-2">
              <Row label="Chiffre d'affaires" value={`${fmt(result.annualRevenue)}₪`} />
              <Row label="Depenses deductibles" value={`-${fmt(result.annualExpenses)}₪`} muted />
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                <Row label="Revenu imposable" value={`${fmt(result.taxableIncome)}₪`} bold />
              </div>
              <Row label={`Points de credit (${result.creditPoints.toFixed(2)} pts)`} value={`-${fmt(result.creditValue)}₪`} muted />
              <Row label="Impot sur le revenu" value={`${fmt(result.incomeTax)}₪`} />
              <Row label="Bituach Leumi" value={`${fmt(result.bituachLeumi)}₪`} />
              <Row label="Assurance sante" value={`${fmt(result.healthTax)}₪`} />
              {result.type === 'osek_murshe' && (
                <Row label="TVA collectee (17%)" value={`${fmt(result.vat)}₪`} sub="a reverser" />
              )}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                <Row label="Total charges" value={`${fmt(result.totalObligations)}₪`} bold />
                <Row label="Revenu net" value={`${fmt(result.netIncome)}₪`} bold color="text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{result.vatNote}</p>
          </div>

          {/* Visual bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Repartition</h3>
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div className="bg-emerald-500" style={{ width: `${(result.netIncome / result.taxableIncome) * 100}%` }} title={`Net: ${fmt(result.netIncome)}₪`} />
              <div className="bg-red-400" style={{ width: `${(result.incomeTax / result.taxableIncome) * 100}%` }} title={`Impot: ${fmt(result.incomeTax)}₪`} />
              <div className="bg-purple-400" style={{ width: `${(result.bituachLeumi / result.taxableIncome) * 100}%` }} title={`BL: ${fmt(result.bituachLeumi)}₪`} />
              <div className="bg-blue-400" style={{ width: `${(result.healthTax / result.taxableIncome) * 100}%` }} title={`Sante: ${fmt(result.healthTax)}₪`} />
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded" /> Net ({((result.netIncome / result.taxableIncome) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded" /> Impot</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-400 rounded" /> BL</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded" /> Sante</span>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Par mois (estimation)</h3>
            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="Net mensuel" value={`${fmt(Math.round(result.netIncome / 12))}₪`} />
              <MiniCard label="Charges mensuelles" value={`${fmt(Math.round(result.totalObligations / 12))}₪`} />
            </div>
          </div>

          {/* Deadlines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowDeadlines(!showDeadlines)}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-amber-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Echeances et obligations</h3>
              </div>
              {showDeadlines ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {showDeadlines && (
              <div className="px-5 pb-5 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                {result.deadlines.map(d => (
                  <div key={d.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        {d.frequency === 'monthly' ? 'Mensuel' : d.frequency === 'bimonthly' ? 'Bimestriel' : 'Annuel'}
                      </span>
                      <span className="text-xs text-slate-400">le {d.day} du mois</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{d.title_fr}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.description_fr}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-200">Conseils</h3>
              </div>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 shrink-0">&#8226;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
    </div>
  )
}

function Row({ label, value, bold, muted, color, sub }: { label: string; value: string; bold?: boolean; muted?: boolean; color?: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-semibold text-slate-900 dark:text-slate-100' : muted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
        {label}
      </span>
      <span className={`text-sm font-medium ${color || (bold ? 'text-slate-900 dark:text-slate-100' : muted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200')}`}>
        {value}
        {sub && <span className="text-xs text-slate-400 ml-1">({sub})</span>}
      </span>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}
