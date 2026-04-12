'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { track } from '@/lib/analytics'

/**
 * Widget d'upload de document reutilisable.
 * Affiche un bouton d'upload avec progression et redirige vers le document
 * analyse a la fin.
 */
export default function DocumentUploadWidget() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  async function handleUpload(file: File) {
    setUploading(true)
    setError('')
    setStep(1)

    // Etapes de progression calibrees sur les ~60s reelles
    const stepTimers = [
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 7000),
      setTimeout(() => setStep(4), 20_000),
      setTimeout(() => setStep(5), 40_000),
    ]

    const formData = new FormData()
    formData.append('file', file)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 330_000)

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = res.status === 429 ? 'Limite atteinte. Reessayez plus tard.'
          : res.status === 401 ? 'Session expiree. Veuillez vous reconnecter.'
          : res.status === 403 ? (data.error || 'Quota depasse. Passez a un plan superieur.')
          : res.status === 413 ? 'Fichier trop volumineux (max 25 Mo).'
          : res.status === 504 || res.status === 408 ? "L'analyse a pris trop de temps. Reessayez avec un document plus petit."
          : (data.error || "Une erreur est survenue lors de l'analyse.")
        setError(msg)
        track('extraction_failed', { error: data.error, status: res.status })
        return
      }

      track('file_uploaded', {
        document_type: data.document?.document_type,
        is_urgent: data.document?.is_urgent,
      })

      // Rediriger vers le document analyse
      if (data.document?.id) {
        router.push(`/documents/${data.document.id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError("Le delai d'analyse a ete depasse.")
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Erreur de connexion reseau.')
      } else {
        setError(`Erreur : ${err instanceof Error ? err.message : 'inconnue'}`)
      }
    } finally {
      clearTimeout(timeoutId)
      stepTimers.forEach(clearTimeout)
      setStep(0)
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 25 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 25 Mo).')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    handleUpload(file)
  }

  const steps = [
    { label: 'Envoi du fichier', done: step >= 2 },
    { label: 'Lecture du document', done: step >= 3 },
    { label: 'Extraction des donnees', done: step >= 4 },
    { label: 'Analyse intelligente', done: step >= 5 },
    { label: 'Verification et droits', done: false },
  ]
  const activeIdx = Math.min(step - 1, 4)

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onFileChange}
        aria-label="Televerser un document"
      />

      {!uploading ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full bg-white dark:bg-slate-800/90 backdrop-blur-sm border-2 border-dashed border-white/40 dark:border-slate-600 hover:border-white/70 dark:hover:border-slate-500 hover:bg-white/10 dark:hover:bg-slate-800 rounded-2xl p-6 transition-all text-center group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Upload size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 dark:text-white">Uploader un document</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fiche de paie, facture, amende, contrat... (PDF, JPG, PNG, max 25 Mo)
              </p>
            </div>
          </div>
        </button>
      ) : (
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-xs">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(step * 20, 95)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    i === activeIdx
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : s.done
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  {s.done ? (
                    <CheckCircle2 size={14} />
                  ) : i === activeIdx ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-30" />
                  )}
                  {s.label}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              L&apos;analyse prend environ 60 secondes
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
