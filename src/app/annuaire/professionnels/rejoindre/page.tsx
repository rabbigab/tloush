'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Loader2, Users, TrendingUp, Shield } from 'lucide-react'

const SPECIALTIES = ['Comptabilité', 'Droit du travail']

export default function RejoindreExpertsPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    specialty: '',
    city: '',
    website: '',
    message: '',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          expertSlug: 'inscription',
          expertName: 'INSCRIPTION PRO',
          message: `NOUVELLE INSCRIPTION PRO\n\nNom: ${form.name}\nTitre: ${form.title}\nSpecialite: ${form.specialty}\nVille: ${form.city}\nSite: ${form.website}\nMessage: ${form.message}`,
        }),
      })

      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 w-full">
      <Link
        href="/annuaire/professionnels"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={14} />
        Retour
      </Link>

      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Rejoignez l&apos;annuaire Tloush</h1>
        <p className="text-sm text-slate-500">
          Connectez-vous avec des salariés francophones en Israël qui cherchent votre expertise.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { Icon: Users, title: 'Communauté ciblée', desc: 'Clients francophones' },
          { Icon: TrendingUp, title: 'Leads qualifiés', desc: 'Via l\'analyse de documents' },
          { Icon: Shield, title: 'Profil vérifié', desc: 'Badge de confiance' },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <Icon size={20} className="text-blue-600 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-800">{title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {status === 'success' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-slate-800 mb-2">Demande reçue !</h2>
          <p className="text-sm text-slate-500">
            Nous examinerons votre profil et vous contacterons sous 48h pour finaliser votre inscription.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Votre profil professionnel</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom complet *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Me / Dr. / Prénom Nom"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Titre / Fonction *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Avocat en droit du travail"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Spécialité principale *</label>
                <select
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">Choisir...</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ville *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="Tel Aviv, Haifa..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="05X-XXX-XXXX"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Site web (facultatif)</label>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Présentez-vous brièvement *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Votre expérience, vos spécialités, pourquoi vous souhaitez rejoindre Tloush..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                Une erreur est survenue. Veuillez réessayer.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white font-medium text-sm py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer ma candidature'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
