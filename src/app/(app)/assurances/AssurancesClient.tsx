'use client'

import { useState } from 'react'
import { Shield, ChevronDown, ChevronUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { INSURANCE_TYPES, INSURANCE_CATEGORIES, INSURANCE_TIPS_FR, type InsuranceType } from '@/lib/insuranceGuide'

export default function AssurancesClient() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = activeCategory
    ? INSURANCE_TYPES.filter(i => i.category === activeCategory)
    : INSURANCE_TYPES

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950/30 rounded-xl flex items-center justify-center">
            <Shield size={22} className="text-violet-600" />
          </div>
          Guide Assurances Israel
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tout comprendre sur les assurances en Israel : ce qui est obligatoire, recommande, et comment comparer
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            !activeCategory ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Tout voir
        </button>
        {INSURANCE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === cat.id ? 'bg-violet-600 text-white shadow-md' : `${cat.color}`
            }`}
          >
            {cat.label_fr}
          </button>
        ))}
      </div>

      {/* Insurance cards */}
      <div className="space-y-3">
        {filtered.map(ins => {
          const isExpanded = expandedId === ins.id
          const catConfig = INSURANCE_CATEGORIES.find(c => c.id === ins.category)

          return (
            <div
              key={ins.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : ins.id)}
                className="w-full text-left p-4 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catConfig?.color || ''}`}>
                      {catConfig?.label_fr}
                    </span>
                    <span className="text-xs text-slate-400 font-mono" dir="rtl">{ins.name_he}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{ins.name_fr}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{ins.description_fr}</p>
                </div>
                <div className="shrink-0 ml-3">
                  {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {/* Cost */}
                  <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50">
                    <p className="text-sm font-medium text-violet-800 dark:text-violet-300">
                      Cout typique : <span className="font-bold">{ins.typical_cost_monthly}</span>
                    </p>
                  </div>

                  {/* Key points */}
                  <div>
                    <h4 className="text-sm font-semibold text-green-600 mb-2">Points cles</h4>
                    <ul className="space-y-1.5">
                      {ins.key_points_fr.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Watch out */}
                  <div>
                    <h4 className="text-sm font-semibold text-amber-600 flex items-center gap-1 mb-2">
                      <AlertTriangle size={14} />
                      Attention
                    </h4>
                    <ul className="space-y-1.5">
                      {ins.watch_out_fr.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="text-amber-500 mt-0.5 shrink-0">&#9888;</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* How to compare */}
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-semibold">Comment comparer :</span> {ins.how_to_compare_fr}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* General tips */}
      <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-violet-600" />
          <h3 className="font-semibold text-violet-900 dark:text-violet-200 text-sm">Conseils generaux</h3>
        </div>
        {INSURANCE_TIPS_FR.map((tip, i) => (
          <p key={i} className="text-xs text-violet-800 dark:text-violet-300 flex items-start gap-2">
            <span className="text-violet-400 shrink-0">&#8226;</span>
            {tip}
          </p>
        ))}
      </div>
    </div>
  )
}
