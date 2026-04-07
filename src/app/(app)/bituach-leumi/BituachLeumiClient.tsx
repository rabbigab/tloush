'use client'

import { useState } from 'react'
import { Shield, Briefcase, Heart, Clock, Star, ChevronDown, ChevronUp, FileText, CheckCircle, ExternalLink } from 'lucide-react'
import { BL_BENEFITS, BL_CATEGORIES, type BLBenefit } from '@/lib/bituachLeumi'

const ICON_MAP: Record<string, typeof Briefcase> = {
  Briefcase,
  Heart,
  Shield,
  Clock,
  Star,
}

export default function BituachLeumiClient() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null)

  const filtered = activeCategory
    ? BL_BENEFITS.filter(b => b.category === activeCategory)
    : BL_BENEFITS

  function toggleBenefit(id: string) {
    setExpandedBenefit(expandedBenefit === id ? null : id)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center">
            <Shield size={22} className="text-purple-600" />
          </div>
          Bituach Leumi — Vos droits
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Guide complet des allocations et prestations du Bituach Leumi (securite sociale israelienne)
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            !activeCategory ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Tout voir
        </button>
        {BL_CATEGORIES.map(cat => {
          const Icon = ICON_MAP[cat.icon] || Shield
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === cat.id ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={14} />
              {cat.label_fr}
            </button>
          )
        })}
      </div>

      {/* Benefits list */}
      <div className="space-y-3">
        {filtered.map(benefit => {
          const isExpanded = expandedBenefit === benefit.id
          return (
            <div
              key={benefit.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Collapsed header */}
              <button
                onClick={() => toggleBenefit(benefit.id)}
                className="w-full text-left p-4 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{benefit.name_fr}</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono" dir="rtl">{benefit.name_he}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{benefit.description_fr}</p>
                </div>
                <div className="shrink-0 ml-3">
                  {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {/* Eligibility */}
                  <Section title="Conditions d'eligibilite" icon={CheckCircle} color="text-green-600">
                    <ul className="space-y-1.5">
                      {benefit.eligibility_fr.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Amounts */}
                  <Section title="Montants" icon={FileText} color="text-blue-600">
                    <ul className="space-y-1.5">
                      {benefit.amounts_fr.map((item, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5 shrink-0">&#8226;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* How to apply */}
                  <Section title="Comment faire la demande" icon={FileText} color="text-purple-600">
                    <ol className="space-y-1.5">
                      {benefit.howToApply_fr.map((item, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-purple-500 font-semibold shrink-0">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </Section>

                  {/* Documents needed */}
                  <Section title="Documents necessaires" icon={FileText} color="text-amber-600">
                    <ul className="space-y-1.5">
                      {benefit.documents_needed.map((item, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5 shrink-0">&#9679;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Processing time */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Clock size={14} />
                    Delai de traitement : <span className="font-medium text-slate-700 dark:text-slate-300">{benefit.processing_time}</span>
                  </div>

                  {benefit.link && (
                    <a
                      href={benefit.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink size={14} />
                      Voir sur le site du Bituach Leumi
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Les montants sont indicatifs et peuvent varier. Consultez le site officiel du Bituach Leumi pour les informations les plus recentes.
      </p>
    </div>
  )
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: typeof CheckCircle; color: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className={`text-sm font-semibold ${color} mb-2 flex items-center gap-1.5`}>
        <Icon size={14} />
        {title}
      </h4>
      {children}
    </div>
  )
}
