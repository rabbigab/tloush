'use client'

import { useState } from 'react'
import { Building, FileCheck, AlertTriangle, CheckCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { analyzeRentalContract, PURCHASE_STEPS, type RentalContractInput, type RentalAnalysisResult } from '@/lib/rentalAnalysis'

export default function RealEstateClient() {
  const [tab, setTab] = useState<'rental' | 'purchase'>('rental')

  // Rental form
  const [rent, setRent] = useState('4500')
  const [startDate, setStartDate] = useState('2026-05-01')
  const [endDate, setEndDate] = useState('2027-04-30')
  const [deposit, setDeposit] = useState('13500')
  const [depositType, setDepositType] = useState<'cash' | 'bank_guarantee' | 'check' | 'other'>('check')
  const [indexLinked, setIndexLinked] = useState(false)
  const [optionToExtend, setOptionToExtend] = useState(true)
  const [maintenance, setMaintenance] = useState(false)
  const [vaad, setVaad] = useState(false)
  const [arnona, setArnona] = useState(false)
  const [breakDays, setBreakDays] = useState('60')
  const [rentalResult, setRentalResult] = useState<RentalAnalysisResult | null>(null)

  const [showPurchaseStep, setShowPurchaseStep] = useState<number | null>(null)

  function analyzeRental() {
    const input: RentalContractInput = {
      monthlyRent: Number(rent),
      startDate,
      endDate,
      depositAmount: Number(deposit),
      depositType,
      indexLinked,
      optionToExtend,
      maintenanceIncluded: maintenance,
      vaadBayitIncluded: vaad,
      arnonaIncluded: arnona,
      breakClauseDays: breakDays ? Number(breakDays) : undefined,
    }
    setRentalResult(analyzeRentalContract(input))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
            <Building size={22} className="text-emerald-600" />
          </div>
          Immobilier
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Analysez votre bail, verifiez vos droits de locataire, ou suivez les etapes d&apos;un achat
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('rental')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'rental' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          Location / Bail
        </button>
        <button onClick={() => setTab('purchase')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'purchase' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          Achat immobilier
        </button>
      </div>

      {tab === 'rental' && (
        <div className="space-y-4">
          {/* Rental form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Analyse de bail</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Loyer mensuel (₪)</label>
                <input type="number" value={rent} onChange={e => setRent(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Depot / Garantie (₪)</label>
                <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Debut du bail</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fin du bail</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Type de depot</label>
                <select value={depositType} onChange={e => setDepositType(e.target.value as typeof depositType)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm">
                  <option value="bank_guarantee">Garantie bancaire</option>
                  <option value="check">Cheque(s)</option>
                  <option value="cash">Especes</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Preavis sortie (jours)</label>
                <input type="number" value={breakDays} onChange={e => setBreakDays(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm" placeholder="60" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={indexLinked} onChange={e => setIndexLinked(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Loyer indexe au Madad (CPI)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={optionToExtend} onChange={e => setOptionToExtend(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Option de renouvellement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={maintenance} onChange={e => setMaintenance(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Maintenance incluse</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={vaad} onChange={e => setVaad(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Vaad bayit inclus</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={arnona} onChange={e => setArnona(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Arnona incluse</span>
              </label>
            </div>
            <button onClick={analyzeRental} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <FileCheck size={16} />
              Analyser le bail
            </button>
          </div>

          {/* Rental results */}
          {rentalResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-emerald-600">{rentalResult.contractDurationMonths} mois</p>
                  <p className="text-xs text-slate-500">Duree du bail</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-emerald-600">{rentalResult.totalRentOverContract.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</p>
                  <p className="text-xs text-slate-500">Loyer total</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${rentalResult.depositAnalysis.isLegal ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'}`}>
                  <p className={`text-xl font-bold ${rentalResult.depositAnalysis.isLegal ? 'text-green-600' : 'text-red-600'}`}>
                    {rentalResult.depositAnalysis.isLegal ? 'OK' : 'Excessif'}
                  </p>
                  <p className="text-xs text-slate-500">Depot</p>
                </div>
              </div>

              {/* Red flags */}
              {rentalResult.redFlags.length > 0 && (
                <div className="space-y-2">
                  {rentalResult.redFlags.map(f => (
                    <div key={f.id} className={`p-3 rounded-xl border flex items-start gap-2 ${
                      f.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800'
                    }`}>
                      <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${f.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                      <div>
                        <p className={`text-sm font-semibold ${f.severity === 'critical' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>{f.title_fr}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{f.description_fr}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Green flags */}
              {rentalResult.greenFlags.length > 0 && (
                <div className="space-y-1">
                  {rentalResult.greenFlags.map(f => (
                    <div key={f.id} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                      <CheckCircle size={14} />
                      {f.title_fr}
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={14} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Conseils</span>
                </div>
                {rentalResult.tips.map((t, i) => (
                  <p key={i} className="text-xs text-emerald-700 dark:text-emerald-300">• {t}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'purchase' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">Les 7 etapes d&apos;un achat immobilier en Israel :</p>
          {PURCHASE_STEPS.map(step => (
            <div key={step.step} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowPurchaseStep(showPurchaseStep === step.step ? null : step.step)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{step.title_fr}</p>
                  <p className="text-xs text-slate-400">{step.timeline_fr}</p>
                </div>
                {showPurchaseStep === step.step ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {showPurchaseStep === step.step && (
                <div className="px-4 pb-4 pt-0 space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{step.description_fr}</p>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Documents necessaires :</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      {step.documents_fr.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
