'use client'

import { useState } from 'react'
import { FileText, Copy, Check, ChevronDown, ChevronUp, Briefcase, Building2, Home, Receipt, Mail } from 'lucide-react'
import { LETTER_TEMPLATES, type LetterTemplate } from '@/lib/letterTemplates'

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Briefcase; color: string }> = {
  employer: { label: 'Employeur', icon: Briefcase, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  bituach_leumi: { label: 'Bituach Leumi', icon: Building2, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  tax: { label: 'Impots', icon: Receipt, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  landlord: { label: 'Proprietaire', icon: Home, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  general: { label: 'General', icon: Mail, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
}

export default function LettersClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [generatedHe, setGeneratedHe] = useState('')
  const [generatedFr, setGeneratedFr] = useState('')
  const [copiedHe, setCopiedHe] = useState(false)
  const [copiedFr, setCopiedFr] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [showAllTemplates, setShowAllTemplates] = useState(false)

  const filtered = filterCategory
    ? LETTER_TEMPLATES.filter(t => t.category === filterCategory)
    : LETTER_TEMPLATES

  function selectTemplate(t: LetterTemplate) {
    setSelectedTemplate(t)
    const defaults: Record<string, string> = {}
    t.fields.forEach(f => { defaults[f.key] = '' })
    setFieldValues(defaults)
    setGeneratedHe('')
    setGeneratedFr('')
  }

  function generate() {
    if (!selectedTemplate) return
    const missing = selectedTemplate.fields.filter(f => f.required && !fieldValues[f.key]?.trim())
    if (missing.length > 0) return
    setGeneratedHe(selectedTemplate.generateHebrew(fieldValues))
    setGeneratedFr(selectedTemplate.generateFrench(fieldValues))
  }

  async function copyText(text: string, lang: 'he' | 'fr') {
    await navigator.clipboard.writeText(text)
    if (lang === 'he') { setCopiedHe(true); setTimeout(() => setCopiedHe(false), 2000) }
    else { setCopiedFr(true); setTimeout(() => setCopiedFr(false), 2000) }
  }

  const allFieldsFilled = selectedTemplate?.fields
    .filter(f => f.required)
    .every(f => fieldValues[f.key]?.trim()) ?? false

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
            <FileText size={22} className="text-blue-600" />
          </div>
          Generateur de courriers
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Modeles de lettres en hebreu pour vos demarches administratives en Israel
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !filterCategory ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Tous
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key === filterCategory ? null : key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filterCategory === key ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <cfg.icon size={14} />
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Template list */}
      {!selectedTemplate && (
        <div className="grid gap-3">
          {(showAllTemplates ? filtered : filtered.slice(0, 6)).map(t => {
            const cat = CATEGORY_CONFIG[t.category]
            return (
              <button
                key={t.id}
                onClick={() => selectTemplate(t)}
                className="text-left p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 px-2 py-1 rounded-md text-xs font-medium ${cat?.color || ''}`}>
                    {cat?.label || t.category}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.title_fr}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.description_fr}</p>
                  </div>
                </div>
              </button>
            )
          })}
          {!showAllTemplates && filtered.length > 6 && (
            <button
              onClick={() => setShowAllTemplates(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 justify-center py-2"
            >
              Voir tous les modeles ({filtered.length})
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}

      {/* Selected template form */}
      {selectedTemplate && !generatedHe && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedTemplate.title_fr}</h2>
            <button
              onClick={() => { setSelectedTemplate(null); setFieldValues({}) }}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Changer de modele
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTemplate.description_fr}</p>

          <div className="space-y-4">
            {selectedTemplate.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {field.label_fr}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={fieldValues[field.key] || ''}
                    onChange={e => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={fieldValues[field.key] || ''}
                    onChange={e => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={!allFieldsFilled}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
          >
            Generer la lettre
          </button>
        </div>
      )}

      {/* Generated output */}
      {generatedHe && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Lettre generee</h2>
            <button
              onClick={() => { setSelectedTemplate(null); setFieldValues({}); setGeneratedHe(''); setGeneratedFr('') }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Nouveau courrier
            </button>
          </div>

          {/* Hebrew version */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Version hebreu</span>
              <button
                onClick={() => copyText(generatedHe, 'he')}
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                {copiedHe ? <Check size={14} /> : <Copy size={14} />}
                {copiedHe ? 'Copie !' : 'Copier'}
              </button>
            </div>
            <pre
              dir="rtl"
              className="p-4 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed"
            >{generatedHe}</pre>
          </div>

          {/* French version */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Version francaise (pour vos archives)</span>
              <button
                onClick={() => copyText(generatedFr, 'fr')}
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                {copiedFr ? <Check size={14} /> : <Copy size={14} />}
                {copiedFr ? 'Copie !' : 'Copier'}
              </button>
            </div>
            <pre className="p-4 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{generatedFr}</pre>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Copiez la version hebreu et envoyez-la par email ou WhatsApp. Gardez la version francaise pour vos archives.
          </p>
        </div>
      )}
    </div>
  )
}
