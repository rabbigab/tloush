'use client'

import { useState } from 'react'
import { Home, Calculator, Lightbulb, FileText, Copy, Check } from 'lucide-react'
import { calculateArnona, generateArnonaAppeal, ARNONA_CITIES, type ArnonaInput, type ArnonaResult, type ArnonaAppealReason } from '@/lib/arnonaCalculator'

export default function ArnonaClient() {
  const [city, setCity] = useState('tel_aviv')
  const [size, setSize] = useState('70')
  const [usage, setUsage] = useState<'residential' | 'office' | 'commercial'>('residential')
  const [isOleh, setIsOleh] = useState(false)
  const [olehMonths, setOlehMonths] = useState('6')
  const [isElderly, setIsElderly] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isSingleParent, setIsSingleParent] = useState(false)
  const [receivesIncome, setReceivesIncome] = useState(false)
  const [result, setResult] = useState<ArnonaResult | null>(null)
  const [showAppeal, setShowAppeal] = useState(false)
  const [appealName, setAppealName] = useState('')
  const [appealAddress, setAppealAddress] = useState('')
  const [appealTz, setAppealTz] = useState('')
  const [appealCurrentAmount, setAppealCurrentAmount] = useState('')
  const [appealReasons, setAppealReasons] = useState<ArnonaAppealReason[]>([])
  const [appealResult, setAppealResult] = useState<{ hebrew: string; french: string } | null>(null)
  const [copied, setCopied] = useState<'he' | 'fr' | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    if (!size || Number(size) <= 0) {
      setError('Veuillez entrer une surface valide')
      return
    }
    setError('')
    const input: ArnonaInput = {
      city,
      propertySizeM2: Number(size),
      usage,
      isOleh,
      olehMonths: isOleh ? Number(olehMonths) : undefined,
      isElderly,
      isDisabled,
      isSingleParent,
      receivesIncomeSupplement: receivesIncome,
    }
    setResult(calculateArnona(input))
  }

  const fmt = (n: number) => n.toLocaleString('he-IL', { maximumFractionDigits: 0 })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/30 rounded-xl flex items-center justify-center">
            <Home size={22} className="text-orange-600" />
          </div>
          Simulateur Arnona
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Estimez votre taxe municipale (arnona) selon votre ville, surface et situation
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ville</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            >
              {ARNONA_CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Surface (m2)</label>
            <input
              type="number"
              name="surface_area"
              inputMode="decimal"
              value={size}
              onChange={e => setSize(e.target.value)}
              placeholder="70"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type d&apos;usage</label>
          <div className="flex gap-2">
            {([['residential', 'Habitation'], ['office', 'Bureau'], ['commercial', 'Commerce']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setUsage(val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  usage === val ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Reductions possibles</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isOleh} onChange={e => setIsOleh(e.target.checked)} className="rounded" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Oleh Hadash</span>
          </label>
          {isOleh && (
            <div className="ml-6">
              <label className="block text-xs text-slate-500 mb-1">Mois depuis l&apos;aliyah</label>
              <input
                type="number"
                value={olehMonths}
                onChange={e => setOlehMonths(e.target.value)}
                className="w-24 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isElderly} onChange={e => setIsElderly(e.target.checked)} className="rounded" />
            <span className="text-sm text-slate-700 dark:text-slate-300">3e age (62+/67+)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isDisabled} onChange={e => setIsDisabled(e.target.checked)} className="rounded" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Invalidite reconnue</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isSingleParent} onChange={e => setIsSingleParent(e.target.checked)} className="rounded" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Parent isole</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={receivesIncome} onChange={e => setReceivesIncome(e.target.checked)} className="rounded" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Hashlamat Hachnasa (complement revenu BL)</span>
          </label>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}
        <button
          onClick={calculate}
          disabled={!size || Number(size) <= 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Calculator size={18} />
          Estimer l&apos;arnona
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-orange-600">{fmt(result.discountedBimonthly)}₪</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">/ 2 mois</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">bimestriel</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-orange-600">{fmt(Math.round(result.discountedAnnual / 12))}₪</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">/ mois</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">estimation</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-orange-600">{fmt(result.discountedAnnual)}₪</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">/ an</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{result.cityLabel}</p>
            </div>
          </div>

          {/* Detail */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Detail</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Ville</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{result.cityLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Surface</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{result.propertySizeM2} m2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Taux / m2 / mois</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{result.ratePerM2}₪</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span className="text-slate-500">Montant brut annuel</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{fmt(result.annualAmount)}₪</span>
              </div>
              {result.discounts.filter(d => d.applied).length > 0 && (
                <>
                  {result.discounts.filter(d => d.applied).map(d => (
                    <div key={d.type} className="flex justify-between">
                      <span className="text-green-600 dark:text-green-400">{d.label_fr}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">-{d.percentage}%</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Apres reduction</span>
                    <span className="font-bold text-orange-600">{fmt(result.discountedAnnual)}₪/an</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-orange-600" />
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 text-sm">Bon a savoir</h3>
            </div>
            {result.tips.map((tip, i) => (
              <p key={i} className="text-xs text-orange-800 dark:text-orange-300 flex items-start gap-2">
                <span className="text-orange-400 shrink-0">&#8226;</span>
                {tip}
              </p>
            ))}
          </div>

          {/* Appeal letter CTA */}
          <button
            onClick={() => setShowAppeal(!showAppeal)}
            className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            {showAppeal ? 'Masquer' : 'Generer une lettre de contestation'}
          </button>

          {showAppeal && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Lettre de contestation arnona</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Remplissez les champs puis generez la lettre en hebreu (a envoyer) et en francais (pour vous).</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nom complet</label>
                  <input type="text" value={appealName} onChange={e => setAppealName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Israel Israeli" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Teudat Zehut</label>
                  <input type="text" value={appealTz} onChange={e => setAppealTz(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="012345678" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Adresse complete</label>
                <input type="text" value={appealAddress} onChange={e => setAppealAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Rehov Herzl 12, Apt 5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Montant facture actuel (annuel ₪)</label>
                <input type="number" value={appealCurrentAmount} onChange={e => setAppealCurrentAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="8000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Motifs de la contestation</label>
                <div className="space-y-2">
                  {([
                    ['oleh_discount_not_applied', 'Reduction oleh non appliquee'],
                    ['wrong_surface', 'Surface incorrecte'],
                    ['elderly_discount', 'Reduction 3e age non appliquee'],
                    ['disabled_discount', 'Reduction handicap non appliquee'],
                    ['single_parent_discount', 'Reduction parent isole non appliquee'],
                    ['income_supplement', 'Reduction complement de revenus'],
                    ['property_classification_error', 'Classification du bien incorrecte'],
                  ] as [ArnonaAppealReason, string][]).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appealReasons.includes(val)}
                        onChange={e => setAppealReasons(prev => e.target.checked ? [...prev, val] : prev.filter(r => r !== val))}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!appealName || !result || appealReasons.length === 0) return
                  setAppealResult(generateArnonaAppeal({
                    fullName: appealName,
                    address: appealAddress,
                    city: result.cityLabel,
                    tz: appealTz,
                    currentAmount: Number(appealCurrentAmount) || result.annualAmount,
                    expectedAmount: result.discountedAnnual,
                    reasons: appealReasons,
                  }))
                }}
                disabled={!appealName || appealReasons.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Generer les lettres
              </button>

              {appealResult && (
                <div className="space-y-4">
                  {/* Hebrew letter */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Version hebreu (a envoyer)</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(appealResult.hebrew); setCopied('he'); setTimeout(() => setCopied(null), 2000) }}
                        className="text-xs text-blue-600 flex items-center gap-1"
                      >
                        {copied === 'he' ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'he' ? 'Copie !' : 'Copier'}
                      </button>
                    </div>
                    <pre dir="rtl" className="text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-lg whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                      {appealResult.hebrew}
                    </pre>
                  </div>
                  {/* French letter */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Version francaise (pour vous)</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(appealResult.french); setCopied('fr'); setTimeout(() => setCopied(null), 2000) }}
                        className="text-xs text-blue-600 flex items-center gap-1"
                      >
                        {copied === 'fr' ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'fr' ? 'Copie !' : 'Copier'}
                      </button>
                    </div>
                    <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-lg whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                      {appealResult.french}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
