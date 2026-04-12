'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Calculator, AlertCircle, CheckCircle2, TrendingUp, ExternalLink, FileText, UserPlus } from 'lucide-react'
import LegalDisclaimer, { BetaBadge } from '@/components/shared/LegalDisclaimer'

interface TaxRefundResult {
  taxYear: number
  grossAnnual: number
  taxPaid: number
  creditPointsUsed: number
  creditPointsEligible: number
  creditPointsMissing: number
  creditPointsDetail: {
    residentBase: number
    womanBonus: number
    olehBonus: number
    childrenBonus: number
    singleParentBonus: number
    other: number
    total: number
  }
  computedTax: number
  computedTaxBeforeCredit: number
  estimatedRefund: number
  refundPerMissingPoint: number
  explanation: string[]
}

const CURRENT_YEAR = new Date().getFullYear()

export default function TaxRefundClient({ profileComplete }: { profileComplete: boolean }) {
  const [taxYear, setTaxYear] = useState(CURRENT_YEAR - 1)
  const [grossAnnual, setGrossAnnual] = useState('')
  const [taxPaid, setTaxPaid] = useState('')
  const [creditPoints, setCreditPoints] = useState('')
  const [result, setResult] = useState<TaxRefundResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function calculate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/tax-refund/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tax_year: taxYear,
          gross_annual: Number(grossAnnual),
          tax_paid: Number(taxPaid),
          credit_points_used: Number(creditPoints),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur')
        return
      }
      setResult(data.result)
    } catch {
      setError('Erreur reseau')
    } finally {
      setLoading(false)
    }
  }

  // Si profil non rempli, afficher un CTA
  if (!profileComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Remboursement d'impots</h1>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 text-center">
          <UserPlus size={48} className="text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Profil requis
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Pour estimer votre remboursement d'impots, Tloush a besoin de quelques infos
            personnelles : annee d'alyah, situation familiale, enfants...
          </p>
          <Link
            href="/profile/edit"
            className="inline-flex items-center gap-2 bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Completer mon profil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign size={22} className="text-green-600" /> Remboursement d'impots
            <BetaBadge />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estimez votre החזר מס en quelques clics grace au bareme 2025.
          </p>
        </div>
      </div>

      {/* Disclaimer force */}
      <LegalDisclaimer
        level="estimate"
        topic="de l'impot sur le revenu israelien"
        official_url="https://www.gov.il/he/departments/israel_tax_authority"
        official_label="Rashut HaMisim (officiel)"
        expert_label="Consulter un yoetz mas"
      />

      {/* Form */}
      {!result && (
        <form onSubmit={calculate} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Saisie des donnees du tofes 106</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recopiez les chiffres depuis votre formulaire 106 annuel (recu par votre employeur en janvier/fevrier).
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Annee fiscale
            </label>
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Revenu brut annuel total (NIS)
            </label>
            <input
              type="number"
              value={grossAnnual}
              onChange={(e) => setGrossAnnual(e.target.value)}
              required
              min={0}
              placeholder="Ex: 180000"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            />
            <p className="text-xs text-slate-400 mt-1">
              Ligne 158 / שכר ברוטו du tofes 106
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Impot sur le revenu preleve (NIS)
            </label>
            <input
              type="number"
              value={taxPaid}
              onChange={(e) => setTaxPaid(e.target.value)}
              required
              min={0}
              placeholder="Ex: 25000"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            />
            <p className="text-xs text-slate-400 mt-1">
              Ligne 042 / מס הכנסה du tofes 106
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Points de credit utilises par l'employeur
            </label>
            <input
              type="number"
              step="0.25"
              value={creditPoints}
              onChange={(e) => setCreditPoints(e.target.value)}
              required
              min={0}
              placeholder="Ex: 2.25"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            />
            <p className="text-xs text-slate-400 mt-1">
              Ligne 218 / נקודות זיכוי du tofes 106
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Calcul...' : (
              <>
                <Calculator size={16} />
                Calculer l'estimation
              </>
            )}
          </button>
        </form>
      )}

      {/* Result */}
      {result && (
        <>
          {/* Refund card */}
          <div className={`border rounded-3xl p-8 text-center ${
            result.estimatedRefund > 0
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            {result.estimatedRefund > 0 ? (
              <>
                <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Estimation de votre remboursement</p>
                <p className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {result.estimatedRefund.toLocaleString('fr-IL')} ₪
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Annee fiscale {result.taxYear}</p>
              </>
            ) : (
              <>
                <DollarSign size={48} className="text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pas de remboursement attendu
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  L'impot preleve correspond a l'impot du.
                </p>
              </>
            )}
          </div>

          {/* Credit points missing warning */}
          {result.creditPointsMissing > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    {result.creditPointsMissing} points de credit manquants
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Votre employeur utilise {result.creditPointsUsed} points alors que vous avez droit a {result.creditPointsEligible} points selon votre profil.
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Valeur manquante : <strong>{(result.creditPointsMissing * 2904).toLocaleString('fr-IL')} ₪/an</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detail */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Detail du calcul
            </h2>
            <div className="space-y-3 text-sm">
              {result.explanation.map((line, i) => (
                <p key={i} className="text-slate-700 dark:text-slate-300">{line}</p>
              ))}
            </div>
          </div>

          {/* Credit points breakdown */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Vos points de credit
            </h2>
            <div className="space-y-2 text-sm">
              <Row label="Base resident israelien" value={result.creditPointsDetail.residentBase} />
              {result.creditPointsDetail.womanBonus > 0 && (
                <Row label="Bonus femme" value={result.creditPointsDetail.womanBonus} />
              )}
              {result.creditPointsDetail.olehBonus > 0 && (
                <Row label="Bonus oleh hadash" value={result.creditPointsDetail.olehBonus} />
              )}
              {result.creditPointsDetail.childrenBonus > 0 && (
                <Row label="Bonus enfants" value={result.creditPointsDetail.childrenBonus} />
              )}
              {result.creditPointsDetail.singleParentBonus > 0 && (
                <Row label="Bonus parent isole" value={result.creditPointsDetail.singleParentBonus} />
              )}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <Row label="Total eligible" value={result.creditPointsDetail.total} bold />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setResult(null)
                setGrossAnnual('')
                setTaxPaid('')
                setCreditPoints('')
              }}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
            >
              Nouveau calcul
            </button>
            <Link
              href="/experts"
              className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-sm text-center flex items-center justify-center gap-2"
            >
              <FileText size={14} />
              Consulter un yoetz mas
            </Link>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Pour soumettre une demande officielle de החזר מס, rendez-vous sur le site de Rashut HaMisim.{' '}
            <a
              href="https://www.gov.il/he/departments/israel_tax_authority"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1"
            >
              Voir le site <ExternalLink size={10} />
            </a>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
      <span>{label}</span>
      <span>{value} pts</span>
    </div>
  )
}
