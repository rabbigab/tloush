'use client'

import { useState } from 'react'
import { Building2, Search, ExternalLink, AlertTriangle, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import { generateCompanyCheck, EMPLOYER_RED_FLAGS, type CompanyCheckResult } from '@/lib/companyLookup'

export default function CompanyCheckClient() {
  const [companyNumber, setCompanyNumber] = useState('')
  const [result, setResult] = useState<CompanyCheckResult | null>(null)
  const [showRedFlags, setShowRedFlags] = useState(true)

  function check() {
    if (!companyNumber.trim()) return
    setResult(generateCompanyCheck(companyNumber.trim()))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-950/30 rounded-xl flex items-center justify-center">
            <Building2 size={22} className="text-teal-600" />
          </div>
          Verification Employeur
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verifiez une entreprise israelienne et ses obligations legales envers ses employes
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Numero d&apos;entreprise (H.P. / ח.פ.)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={companyNumber}
              onChange={e => setCompanyNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="512345678"
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            />
            <button
              onClick={check}
              disabled={!companyNumber.trim()}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              Verifier
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">9 chiffres pour une societe, 8 pour un Osek/Amuta</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Validation */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            result.isValid
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}>
            {result.isValid ? (
              <CheckCircle size={20} className="text-green-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-semibold ${result.isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                {result.isValid ? `Numero valide : ${result.formatted}` : 'Format de numero invalide'}
              </p>
              <p className={`text-xs ${result.isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                Type : {result.type}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Verifications a effectuer</h3>
            <div className="space-y-3">
              {result.checks.map((check, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      check.status === 'action'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{check.label_fr}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{check.description_fr}</p>
                      {check.url && (
                        <a
                          href={check.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                        >
                          <ExternalLink size={12} />
                          Ouvrir le site
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Ressources utiles</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                >
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <ExternalLink size={12} />
                    {r.label_fr}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.description_fr}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Red flags guide */}
      {showRedFlags && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Signaux d&apos;alerte employeur</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Points a verifier pour s&apos;assurer que votre employeur respecte vos droits
          </p>
          <div className="space-y-2">
            {EMPLOYER_RED_FLAGS.map(flag => (
              <div
                key={flag.id}
                className={`p-3 rounded-lg border ${
                  flag.severity === 'critical'
                    ? 'border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10'
                    : 'border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {flag.severity === 'critical' ? (
                    <AlertCircle size={14} className="text-red-600 shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                  )}
                  <p className={`text-sm font-medium ${
                    flag.severity === 'critical' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {flag.label_fr}
                  </p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 ml-6">{flag.description_fr}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
