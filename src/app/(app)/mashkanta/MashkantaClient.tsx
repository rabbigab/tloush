'use client'

import { useState } from 'react'
import { Home, Calculator, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { calculateMashkanta, compareMashkantaOffers, type MashkantaInput, type MashkantaResult, type MashkantaOffer, type MashkantaComparison } from '@/lib/mashkantaCalculator'

export default function MashkantaClient() {
  const [propertyPrice, setPropertyPrice] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [loanTermYears, setLoanTermYears] = useState('25')
  const [interestRate, setInterestRate] = useState('4.5')
  const [isFirstApartment, setIsFirstApartment] = useState(true)
  const [isOleh, setIsOleh] = useState(false)
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [result, setResult] = useState<MashkantaResult | null>(null)
  const [showAmortization, setShowAmortization] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [offers, setOffers] = useState<MashkantaOffer[]>([
    { id: '1', bankName: 'Banque A', interestRate: 4.5, loanTermYears: 25, trackType: 'prime' },
    { id: '2', bankName: 'Banque B', interestRate: 4.2, loanTermYears: 25, trackType: 'fixed' },
  ])
  const [comparison, setComparison] = useState<MashkantaComparison | null>(null)

  function calculate() {
    if (!propertyPrice || !downPayment || Number(propertyPrice) <= 0) return
    const input: MashkantaInput = {
      propertyPrice: Number(propertyPrice),
      downPayment: Number(downPayment),
      loanTermYears: Number(loanTermYears),
      interestRate: Number(interestRate),
      isFirstApartment,
      isOleh,
      monthlyIncome: Number(monthlyIncome) || 0,
    }
    setResult(calculateMashkanta(input))
  }

  const fmt = (n: number) => n.toLocaleString('he-IL', { maximumFractionDigits: 0 })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-950/30 rounded-xl flex items-center justify-center">
            <Home size={22} className="text-cyan-600" />
          </div>
          Simulateur Mashkanta
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Simulez votre pret immobilier en Israel : mensualites, mas rechisha, et couts totaux
        </p>
      </div>

      {/* Form */}
      {!result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prix du bien</label>
              <div className="relative">
                <input
                  type="number"
                  value={propertyPrice}
                  onChange={e => setPropertyPrice(e.target.value)}
                  placeholder="2000000"
                  className="w-full px-3 py-2 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apport personnel</label>
              <div className="relative">
                <input
                  type="number"
                  value={downPayment}
                  onChange={e => setDownPayment(e.target.value)}
                  placeholder="500000"
                  className="w-full px-3 py-2 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
              </div>
              {propertyPrice && downPayment && (
                <p className="text-xs text-slate-400 mt-1">
                  LTV : {(((Number(propertyPrice) - Number(downPayment)) / Number(propertyPrice)) * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duree (annees)</label>
              <select
                value={loanTermYears}
                onChange={e => setLoanTermYears(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                {[10, 15, 20, 25, 30].map(y => (
                  <option key={y} value={y}>{y} ans</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Taux d&apos;interet moyen (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Revenu mensuel du foyer (pour ratio endettement)</label>
            <div className="relative">
              <input
                type="number"
                value={monthlyIncome}
                onChange={e => setMonthlyIncome(e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFirstApartment} onChange={e => setIsFirstApartment(e.target.checked)} className="rounded" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Premier achat (dira rishona)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isOleh} onChange={e => setIsOleh(e.target.checked)} className="rounded" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Oleh Hadash</span>
            </label>
          </div>

          <button
            onClick={calculate}
            disabled={!propertyPrice || !downPayment}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Calculator size={18} />
            Simuler
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resultats</h2>
            <button onClick={() => setResult(null)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Modifier
            </button>
          </div>

          {/* Warnings */}
          {(result.ltvWarning || result.dtiWarning) && (
            <div className="space-y-2">
              {result.ltvWarning && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-300">{result.ltvWarning}</p>
                </div>
              )}
              {result.dtiWarning && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">{result.dtiWarning}</p>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card label="Mensualite" value={`${fmt(result.monthlyPayment)}₪`} sub="/mois" color="text-cyan-600" />
            <Card label="Montant pret" value={`${fmt(result.loanAmount)}₪`} sub={`LTV ${result.ltv}%`} color="text-blue-600" />
            <Card label="Total interets" value={`${fmt(result.totalInterest)}₪`} sub={`sur ${loanTermYears} ans`} color="text-red-600" />
            <Card label="Cout total" value={`${fmt(result.totalPayments)}₪`} sub="pret + interets" color="text-slate-700 dark:text-slate-200" />
          </div>

          {result.dti > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ratio d&apos;endettement</span>
                <span className={`text-sm font-bold ${result.dti > 40 ? 'text-red-600' : result.dti > 33 ? 'text-amber-600' : 'text-green-600'}`}>
                  {result.dti}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${result.dti > 40 ? 'bg-red-500' : result.dti > 33 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(result.dti, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0%</span>
                <span className="text-green-500">33%</span>
                <span className="text-red-500">40%</span>
              </div>
            </div>
          )}

          {/* Purchase tax (Mas Rechisha) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Mas Rechisha (taxe d&apos;achat)</h3>
            <p className="text-2xl font-bold text-cyan-600">{fmt(result.purchaseTax)}₪</p>
            <div className="space-y-1.5">
              {result.purchaseTaxBrackets.map((b, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-500">{fmt(b.from)}₪ - {fmt(b.to)}₪ ({(b.rate * 100).toFixed(1)}%)</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{fmt(b.tax)}₪</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional costs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Frais supplementaires estimes</h3>
            <div className="space-y-2">
              {result.additionalCosts.map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    {c.label_fr}
                    {c.note && <span className="text-xs text-slate-400 ml-1">({c.note})</span>}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{fmt(c.amount)}₪</span>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Total frais</span>
                <span className="font-bold text-cyan-600">{fmt(result.totalUpfrontCosts)}₪</span>
              </div>
            </div>
          </div>

          {/* Amortization */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAmortization(!showAmortization)}
              className="w-full flex items-center justify-between p-5"
            >
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tableau d&apos;amortissement</h3>
              {showAmortization ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {showAmortization && (
              <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs">
                        <th className="text-left py-2">Annee</th>
                        <th className="text-right py-2">Capital</th>
                        <th className="text-right py-2">Interets</th>
                        <th className="text-right py-2">Solde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.amortizationSample.map(row => (
                        <tr key={row.year} className="border-t border-slate-50 dark:border-slate-800">
                          <td className="py-1.5 text-slate-700 dark:text-slate-300">{row.year}</td>
                          <td className="py-1.5 text-right text-slate-600 dark:text-slate-300">{fmt(row.principal)}₪</td>
                          <td className="py-1.5 text-right text-red-500">{fmt(row.interest)}₪</td>
                          <td className="py-1.5 text-right font-medium text-slate-800 dark:text-slate-200">{fmt(row.balance)}₪</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-cyan-600" />
              <h3 className="font-semibold text-cyan-900 dark:text-cyan-200 text-sm">Conseils</h3>
            </div>
            {result.tips.map((tip, i) => (
              <p key={i} className="text-xs text-cyan-800 dark:text-cyan-300 flex items-start gap-2">
                <span className="text-cyan-400 shrink-0">&#8226;</span>
                {tip}
              </p>
            ))}
          </div>

          {/* Compare offers */}
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors flex items-center justify-center gap-2"
          >
            {showCompare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Comparer plusieurs offres
          </button>

          {showCompare && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Comparateur d&apos;offres</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Entrez les offres de differentes banques pour les comparer. Le montant du pret est calcule a partir des champs ci-dessus.
              </p>
              {offers.map((offer, i) => (
                <div key={offer.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Offre {i + 1}</span>
                    {offers.length > 2 && (
                      <button onClick={() => setOffers(prev => prev.filter(o => o.id !== offer.id))} className="text-xs text-red-500 hover:underline">Supprimer</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={offer.bankName}
                      onChange={e => setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, bankName: e.target.value } : o))}
                      placeholder="Nom banque"
                      className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                    />
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        value={offer.interestRate}
                        onChange={e => setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, interestRate: Number(e.target.value) } : o))}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                      />
                      <span className="text-[10px] text-slate-400">Taux %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={offer.loanTermYears}
                        onChange={e => setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, loanTermYears: Number(e.target.value) } : o))}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                      />
                      <span className="text-[10px] text-slate-400">Duree (ans)</span>
                    </div>
                    <select
                      value={offer.trackType}
                      onChange={e => setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, trackType: e.target.value as MashkantaOffer['trackType'] } : o))}
                      className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                    >
                      <option value="prime">Prime</option>
                      <option value="fixed">Fixe</option>
                      <option value="variable">Variable</option>
                      <option value="cpi_linked">Lie au Madad</option>
                    </select>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={() => setOffers(prev => [...prev, { id: String(Date.now()), bankName: `Banque ${String.fromCharCode(65 + prev.length)}`, interestRate: 4.0, loanTermYears: 25, trackType: 'prime' }])}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  + Ajouter une offre
                </button>
              </div>
              <button
                onClick={() => {
                  const loanAmount = Number(propertyPrice) - Number(downPayment)
                  if (loanAmount <= 0) return
                  setComparison(compareMashkantaOffers(loanAmount, offers))
                }}
                disabled={!propertyPrice || !downPayment}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Comparer
              </button>

              {comparison && (
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Economie potentielle : {comparison.savingsVsWorst.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">entre la meilleure et la moins bonne offre</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <th className="text-left py-2 font-medium">Banque</th>
                          <th className="text-right py-2 font-medium">Taux</th>
                          <th className="text-right py-2 font-medium">Duree</th>
                          <th className="text-right py-2 font-medium">Mensualite</th>
                          <th className="text-right py-2 font-medium">Total interet</th>
                          <th className="text-right py-2 font-medium">Cout total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.offers.map(o => (
                          <tr key={o.id} className={`border-b border-slate-50 dark:border-slate-800 ${o.id === comparison.cheapestId ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}>
                            <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                              {o.bankName}
                              {o.id === comparison.cheapestId && <span className="ml-1 text-[10px] text-green-600 font-bold">BEST</span>}
                            </td>
                            <td className="py-2 text-right text-slate-600 dark:text-slate-300">{o.interestRate}%</td>
                            <td className="py-2 text-right text-slate-600 dark:text-slate-300">{o.loanTermYears} ans</td>
                            <td className="py-2 text-right font-semibold text-slate-800 dark:text-slate-200">{o.monthlyPayment.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</td>
                            <td className="py-2 text-right text-slate-600 dark:text-slate-300">{o.totalInterest.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</td>
                            <td className="py-2 text-right font-semibold text-slate-800 dark:text-slate-200">{o.totalPayments.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}₪</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

function Card({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
    </div>
  )
}
