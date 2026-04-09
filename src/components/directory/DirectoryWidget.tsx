'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ContactedProvider {
  provider_id: string
  created_at: string
  provider_name: string
  provider_category: string
}

export default function DirectoryWidget() {
  const [contacts, setContacts] = useState<ContactedProvider[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/annuaire/mes-contacts')
        if (res.ok) {
          const data = await res.json()
          setContacts(data.contacts || [])
        }
      } catch { /* ignore */ }
      setLoaded(true)
    }
    load()
  }, [])

  if (!loaded) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-amber-400 fill-amber-400" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tloush Recommande</h3>
      </div>

      {contacts.length > 0 ? (
        <div className="space-y-2.5 mb-3">
          {contacts.slice(0, 3).map(c => (
            <div key={c.provider_id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-700 dark:text-slate-300">{c.provider_name}</span>
                <span className="text-slate-400 dark:text-slate-500 text-xs ml-1.5">({c.provider_category})</span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Trouvez un prestataire francophone de confiance pres de chez vous.
        </p>
      )}

      <Link
        href="/annuaire"
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
      >
        {contacts.length > 0 ? "Voir l'annuaire" : 'Decouvrir nos prestataires'}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
