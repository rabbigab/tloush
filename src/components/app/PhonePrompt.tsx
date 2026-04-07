'use client'

import { useState, useEffect } from 'react'
import { Phone, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PhonePrompt() {
  const [show, setShow] = useState(false)
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const hasPhone = data.user.user_metadata?.phone
        const dismissed = localStorage.getItem('tloush_phone_dismissed')
        if (!hasPhone && !dismissed) {
          setShow(true)
        }
      }
    })
  }, [])

  async function handleSave() {
    if (!phone.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { phone: phone.trim() }
    })
    setSaving(false)
    if (!error) {
      setDone(true)
      setTimeout(() => setShow(false), 1500)
    }
  }

  function handleDismiss() {
    localStorage.setItem('tloush_phone_dismissed', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
            <Phone size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Votre numéro de téléphone</h3>
            <p className="text-xs text-slate-500">Pour vous contacter si besoin</p>
          </div>
        </div>

        {done ? (
          <p className="text-green-600 text-sm font-medium text-center py-2">Merci !</p>
        ) : (
          <>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+972 ou +33..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !phone.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                Plus tard
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Jamais partagé. Israélien, français ou autre.</p>
          </>
        )}
      </div>
    </div>
  )
}
