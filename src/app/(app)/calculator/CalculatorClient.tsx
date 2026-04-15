'use client'

import { useState } from 'react'
import { Calculator, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Building2, User } from 'lucide-react'

interface PayrollBreakdown {
  label: string
  amount: number
  type: 'earning' | 'deduction' | 'employer'
  rate?: string
}

interface CalcResult {
  gross: number
  incomeTax: number
  bituahLeumi: number
  healthInsurance: number
  pensionEmployee: number
  kerenHishtalmutEmployee: number
  totalDeductions: number
  net: number
  pensionEmployer: number
  severance: number
  kerenHishtalmutEmployer: number
  bituahLeumiEmployer: number
  totalEmployerCost: number
  effectiveTaxRate: number
  effectiveDeductionRate: number
  breakdown: PayrollBreakdown[]
}

export default function CalculatorClient() {
  const [gross, setGross] = useState('')
  const [creditPoints, setCreditPoints] = useState('2.25')
  const [pensionRate, setPensionRate] = useState('6')
  const [kerenEmployee, setKerenEmployee] = useState('0')
  const [kerenEmployer, setKerenEmployer] = useState('0')
  const [includeSeverance, setIncludeSeverance] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function calculate() {
    if (!gross || Number(gross) <= 0) {
      setError('Veuillez entrer un salaire brut valide')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossMonthlySalary: Number(gross),
          creditPoints: Number(creditPoints),
          pensionEmployeeRate: Number(pensionRate),
          includeSeverance,
          kerenHishtalmutEmployee: Number(kerenEmployee),
          kerenHishtalmutEmployer: Number(kerenEmployer),
        }),
      })
      const data = await res.json()
      if (res.ok) setResult(data)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/30 rounded-xl flex items-center justify-center">
            <Calculator size={22} className="text-brand-600" />
          </div>
          Simulateur salaire Israel
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Calculez votre net a partir du brut — impot, Bituah Leumi, pension, tout est inclus.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="gross_salary" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Salaire brut mensuel
          </label>
          <div className="relative">
            <input
              id="gross_salary"
              type="number"
              name="gross_salary"
              inputMode="decimal"
              value={gross}
              onChange={e => setGross(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && calculate()}
              placeholder="Ex: 12000…"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-900 dark:text-slate-100 text-lg font-semibold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₪</span>
          </div>
        </div>

        <div>
          <label htmlFor="credit_points" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Points de credit fiscal (נקודות זיכוי)
          </label>
          <select
            id="credit_points"
            value={creditPoints}
            onChange={e => setCreditPoints(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
          >
            <option value="2.25">2.25 — Resident israelien (homme)</option>
            <option value="2.75">2.75 — Residente israelienne (femme)</option>
            <option value="5.25">5.25 — Nouvel oleh (1ere annee)</option>
            <option value="4.25">4.25 — Oleh 2eme annee</option>
            <option value="3.25">3.25 — Oleh 3eme annee</option>
            <option value="2.75">2.75 — Oleh 4eme annee+</option>
          </select>
        </div>

        {/* Advanced options toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Options avancees
        </button>

        {showAdvanced && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pension_rate" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Pension employe (%)</label>
                <input
                  id="pension_rate"
                  type="number"
                  value={pensionRate}
                  onChange={e => setPensionRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="keren_employee" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Keren Hishtalmut employe (%)</label>
                <input
                  id="keren_employee"
                  type="number"
                  value={kerenEmployee}
                  onChange={e => setKerenEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="keren_employer" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Keren Hishtalmut employeur (%)</label>
                <input
                  id="keren_employer"
                  type="number"
                  value={kerenEmployer}
                  onChange={e => setKerenEmployer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="severance"
                  checked={includeSeverance}
                  onChange={e => setIncludeSeverance(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="severance" className="text-xs text-slate-600 dark:text-slate-400">Section 14 (pitzouim)</label>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}
        <button
          onClick={calculate}
          disabled={loading || !gross}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.99]"
        >
          {loading ? 'Calcul en cours...' : 'Calculer mon net'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slideUp">
          {/* Big numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Salaire net</p>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{fmt(result.net)}₪</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">par mois</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total retenues</p>
              <p className="text-3xl font-extrabold text-red-500 dark:text-red-400">{fmt(result.totalDeductions)}₪</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{result.effectiveDeductionRate}% du brut</p>
            </div>
          </div>

          {/* Deductions breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Vos retenues (employe)</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {result.breakdown
                .filter(b => b.type === 'deduction')
                .map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{item.label}</p>
                      {item.rate && <p className="text-xs text-slate-500 dark:text-slate-400">{item.rate}</p>}
                    </div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <TrendingDown size={14} />
                      {fmt(Math.abs(item.amount))}₪
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Employer cost */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Cout employeur</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {result.breakdown
                .filter(b => b.type === 'employer' && b.label !== 'Coût total employeur')
                .map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{item.label}</p>
                      {item.rate && <p className="text-xs text-slate-500 dark:text-slate-400">{item.rate}</p>}
                    </div>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <TrendingUp size={14} />
                      {fmt(item.amount)}₪
                    </p>
                  </div>
                ))}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-900/50">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Cout total employeur</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{fmt(result.totalEmployerCost)}₪</p>
              </div>
            </div>
          </div>

          {/* Visual bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Repartition du brut</p>
            <div className="h-6 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${(result.net / result.gross) * 100}%` }}
                title={`Net: ${fmt(result.net)}₪`}
              />
              <div
                className="bg-red-400 transition-all"
                style={{ width: `${(result.incomeTax / result.gross) * 100}%` }}
                title={`Impôt: ${fmt(result.incomeTax)}₪`}
              />
              <div
                className="bg-orange-400 transition-all"
                style={{ width: `${(result.bituahLeumi / result.gross) * 100}%` }}
                title={`BL: ${fmt(result.bituahLeumi)}₪`}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${(result.healthInsurance / result.gross) * 100}%` }}
                title={`Santé: ${fmt(result.healthInsurance)}₪`}
              />
              <div
                className="bg-blue-400 transition-all"
                style={{ width: `${(result.pensionEmployee / result.gross) * 100}%` }}
                title={`Pension: ${fmt(result.pensionEmployee)}₪`}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Net</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Impot</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> BL</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Sante</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Pension</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Calcul indicatif base sur les taux 2026 (brackets geles jusqu'a 2027). Des ecarts sont possibles selon votre situation personnelle. Consultez un expert-comptable pour un calcul exact.
          </p>
        </div>
      )}
    </div>
  )
}
