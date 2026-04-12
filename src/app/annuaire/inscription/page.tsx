'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Users, Star, Globe, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { PROVIDER_CATEGORIES, PROVIDER_CITIES } from '@/types/directory'
import { track } from '@/lib/analytics'

const STEPS = ['Identit\u00e9', 'Activit\u00e9', 'V\u00e9rification', 'Confirmation']

function isValidPhone(phone: string): boolean {
  // Accept Israeli formats: 05X, +972, 972, or international
  const cleaned = phone.replace(/[\s\-().]/g, '')
  return /^(\+?972|0)\d{8,9}$/.test(cleaned) || /^\+?\d{8,15}$/.test(cleaned)
}

export default function InscriptionPrestatairePage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [triedNext, setTriedNext] = useState(false)

  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    category: '', specialties: [] as string[], service_areas: [] as string[],
    description: '', years_experience: '',
    osek_number: '', reference_name: '', reference_phone: '',
  })

  function update(field: string, value: string | string[]) {
    setForm(f => ({ ...f, [field]: value }))
    setTouched(t => ({ ...t, [field]: true }))
  }

  function toggleArray(field: 'specialties' | 'service_areas', value: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : f[field].length < (field === 'specialties' ? 5 : 10) ? [...f[field], value] : f[field],
    }))
    setTouched(t => ({ ...t, [field]: true }))
  }

  // Validation per step
  function getStepErrors(): string[] {
    const errors: string[] = []
    if (step === 0) {
      if (!form.first_name.trim()) errors.push('Pr\u00e9nom requis')
      if (!form.last_name.trim()) errors.push('Nom requis')
      if (!form.phone.trim()) errors.push('T\u00e9l\u00e9phone requis')
      else if (!isValidPhone(form.phone)) errors.push('Format de t\u00e9l\u00e9phone invalide (ex: 054-1234567 ou +972541234567)')
    }
    if (step === 1) {
      if (!form.category) errors.push('Cat\u00e9gorie requise')
      if (form.service_areas.length === 0) errors.push('S\u00e9lectionnez au moins une ville')
    }
    return errors
  }

  function isFieldInvalid(field: string): boolean {
    if (!triedNext && !touched[field]) return false
    if (field === 'first_name') return !form.first_name.trim()
    if (field === 'last_name') return !form.last_name.trim()
    if (field === 'phone') return !form.phone.trim() || !isValidPhone(form.phone)
    if (field === 'category') return !form.category
    if (field === 'service_areas') return form.service_areas.length === 0
    return false
  }

  const inputClass = (field: string) =>
    `px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-colors ${
      isFieldInvalid(field)
        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/20'
        : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800'
    }`

  function handleNext() {
    setTriedNext(true)
    const errors = getStepErrors()
    if (errors.length > 0) return
    setTriedNext(false)
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/annuaire/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          years_experience: form.years_experience ? parseInt(form.years_experience) : null,
        }),
      })
      if (res.ok) {
        track('directory_provider_signup_completed', { category: form.category })
        setDone(true)
        setStep(3)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Erreur r\u00e9seau. R\u00e9essayez.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-3">Merci !</h1>
        <p className="text-neutral-500 dark:text-slate-400 mb-8">
          Votre demande est en cours de v\u00e9rification. Notre \u00e9quipe vous contactera sous 48h pour un bref appel en fran\u00e7ais.
        </p>
        <div className="bg-neutral-50 dark:bg-slate-900 rounded-2xl p-5 text-left text-sm text-neutral-600 dark:text-slate-300 space-y-2 mb-8">
          <p className="font-medium">Que se passe-t-il ensuite ?</p>
          <ol className="list-decimal list-inside space-y-1 text-neutral-500 dark:text-slate-400">
            <li>V\u00e9rification de vos documents (24-48h)</li>
            <li>Appel t\u00e9l\u00e9phonique en fran\u00e7ais (~5 min)</li>
            <li>Publication de votre fiche sur l&apos;annuaire</li>
            <li>Vous recevez vos premiers contacts !</li>
          </ol>
        </div>
        <Link href="/annuaire" className="text-brand-600 hover:underline text-sm">
          Retour \u00e0 l&apos;annuaire
        </Link>
      </div>
    )
  }

  const stepErrors = triedNext ? getStepErrors() : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link href="/annuaire" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-600 mb-8">
        <ArrowLeft size={14} /> Retour \u00e0 l&apos;annuaire
      </Link>

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-3">
          Recevez des clients francophones qualifi\u00e9s
        </h1>
        <p className="text-neutral-500 dark:text-slate-400">Sans commission. Sans abonnement. 100% gratuit.</p>
        <div className="flex justify-center gap-6 mt-5 text-xs text-neutral-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Users size={14} /> Clients inscrits</span>
          <span className="flex items-center gap-1"><Globe size={14} /> Visible sur Google</span>
          <span className="flex items-center gap-1"><Star size={14} /> Badge R\u00e9f\u00e9renc\u00e9</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-neutral-200 dark:bg-slate-700 text-neutral-400'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:inline ${i === step ? 'text-neutral-800 dark:text-white font-medium' : 'text-neutral-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 sm:w-12 h-0.5 bg-neutral-200 dark:bg-slate-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 0: Identity */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Vos coordonn\u00e9es</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                placeholder="Pr\u00e9nom *"
                required
                value={form.first_name}
                onChange={e => update('first_name', e.target.value)}
                className={inputClass('first_name')}
                style={{ width: '100%' }}
              />
              {isFieldInvalid('first_name') && <p className="text-xs text-red-500 mt-1">Pr\u00e9nom requis</p>}
            </div>
            <div>
              <input
                placeholder="Nom *"
                required
                value={form.last_name}
                onChange={e => update('last_name', e.target.value)}
                className={inputClass('last_name')}
                style={{ width: '100%' }}
              />
              {isFieldInvalid('last_name') && <p className="text-xs text-red-500 mt-1">Nom requis</p>}
            </div>
          </div>
          <div>
            <input
              placeholder="T\u00e9l\u00e9phone * (+972...)"
              required
              type="tel"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              className={`w-full ${inputClass('phone')}`}
            />
            {isFieldInvalid('phone') && (
              <p className="text-xs text-red-500 mt-1">
                {!form.phone.trim() ? 'T\u00e9l\u00e9phone requis' : 'Format invalide (ex: 054-1234567 ou +972541234567)'}
              </p>
            )}
          </div>
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      )}

      {/* Step 1: Activity */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Votre activit\u00e9</h2>
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2 block">Cat\u00e9gorie *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDER_CATEGORIES.map(cat => {
                const Icon = cat.icon
                return (
                  <button key={cat.slug} onClick={() => update('category', cat.slug)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${form.category === cat.slug ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700' : isFieldInvalid('category') ? 'border-red-300 dark:border-red-700' : 'border-neutral-200 dark:border-slate-700 hover:border-neutral-300'}`}>
                    <Icon size={16} className={cat.iconColor} />
                    {cat.label}
                  </button>
                )
              })}
            </div>
            {isFieldInvalid('category') && <p className="text-xs text-red-500 mt-2">S\u00e9lectionnez une cat\u00e9gorie</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2 block">Zones d&apos;intervention * (s\u00e9lectionnez vos villes)</label>
            <div className="flex flex-wrap gap-2">
              {PROVIDER_CITIES.map(city => (
                <button key={city.slug} onClick={() => toggleArray('service_areas', city.label)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.service_areas.includes(city.label) ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400 hover:bg-neutral-200'}`}>
                  {city.label}
                </button>
              ))}
            </div>
            {isFieldInvalid('service_areas') && <p className="text-xs text-red-500 mt-2">S\u00e9lectionnez au moins une ville</p>}
          </div>
          <textarea placeholder="Pr\u00e9sentez votre activit\u00e9 en quelques mots (500 car. max)" maxLength={500} value={form.description} onChange={e => update('description', e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
          <input placeholder="Ann\u00e9es d&apos;exp\u00e9rience" type="number" value={form.years_experience} onChange={e => update('years_experience', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
      )}

      {/* Step 2: Verification */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">V\u00e9rification</h2>
          <p className="text-sm text-neutral-500 dark:text-slate-400 mb-4">Ces informations nous aident \u00e0 r\u00e9f\u00e9rencer votre profil. Elles ne sont pas affich\u00e9es publiquement.</p>
          <input placeholder="Num\u00e9ro d&apos;Osek (osek patur ou murshe)" value={form.osek_number} onChange={e => update('osek_number', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
          <div className="bg-neutral-50 dark:bg-slate-900 rounded-xl p-4">
            <p className="text-sm font-medium text-neutral-700 dark:text-slate-300 mb-3">R\u00e9f\u00e9rence client (optionnel)</p>
            <p className="text-xs text-neutral-400 mb-3">Donnez-nous le contact d&apos;un ancien client satisfait. Nous l&apos;appellerons pour confirmer.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Nom du client" value={form.reference_name} onChange={e => update('reference_name', e.target.value)} className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              <input placeholder="T\u00e9l\u00e9phone du client" value={form.reference_phone} onChange={e => update('reference_phone', e.target.value)} className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* Validation errors summary */}
      {stepErrors.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Veuillez corriger les erreurs :</p>
              <ul className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-0.5">
                {stepErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Server error */}
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button onClick={() => { setTriedNext(false); setStep(s => s - 1) }} className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-medium text-neutral-600 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800">
            Retour
          </button>
        )}
        {step < 2 ? (
          <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors">
            Continuer <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 disabled:opacity-50 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>
        )}
      </div>
    </div>
  )
}
