'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle, CheckCircle, Clock, MessageSquare, ChevronRight, Trash2, Search, X, Download, UserCheck, Eye } from 'lucide-react'
import Link from 'next/link'
import { getExpertRecommendation, getExpertUrl } from '@/lib/expertMatcher'
import { track } from '@/lib/analytics'
import { DOC_LABELS, DOC_COLORS, DOC_CATEGORIES } from '@/lib/docTypes'
import type { AppDocument } from '@/types'


const CATEGORY_TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'travail', label: 'Travail' },
  { key: 'securite_sociale', label: 'Secu sociale' },
  { key: 'fiscal', label: 'Fiscal' },
  { key: 'finance', label: 'Factures' },
  { key: 'retraite', label: 'Retraite' },
  { key: 'logement', label: 'Logement' },
  { key: 'bancaire', label: 'Bancaire' },
  { key: 'autre', label: 'Autre' },
]

interface FolderOption { id: string; name: string }

export default function InboxClient({ documents, folders = [], userEmail }: { documents: AppDocument[]; folders?: FolderOption[]; userEmail: string }) {
  void userEmail
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [docs, setDocs] = useState<AppDocument[]>(documents)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeFolderId, setActiveFolderId] = useState<string>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const folderFilteredDocs = activeFolderId === 'all'
    ? docs
    : docs.filter(d => d.folder_id === activeFolderId)

  const categoryDocs = activeCategory === 'all'
    ? folderFilteredDocs
    : folderFilteredDocs.filter(d => DOC_CATEGORIES[d.document_type] === activeCategory)

  const filteredDocs = search.trim()
    ? categoryDocs.filter(d =>
        d.file_name.toLowerCase().includes(search.toLowerCase()) ||
        (d.summary_fr || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.period || '').toLowerCase().includes(search.toLowerCase()) ||
        (DOC_LABELS[d.document_type] || '').toLowerCase().includes(search.toLowerCase())
      )
    : categoryDocs

  const urgentDocs = docs.filter(d => d.is_urgent)
  const actionDocs = docs.filter(d => d.action_required && !d.is_urgent)

  const categoryCounts = CATEGORY_TABS.reduce((acc, tab) => {
    if (tab.key === 'all') {
      acc[tab.key] = folderFilteredDocs.length
    } else {
      acc[tab.key] = folderFilteredDocs.filter(d => DOC_CATEGORIES[d.document_type] === tab.key).length
    }
    return acc
  }, {} as Record<string, number>)

  async function handleDelete(docId: string) {
    setDeletingId(docId)
    setDeleteConfirmId(null)
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== docId))
        // Refresh server data (folders dropdown, counts, etc.)
        router.refresh()
      }
    } catch {
      // Document stays in list
    } finally {
      setDeletingId(null)
    }
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        const userMsg = res.status === 429
          ? 'Limite atteinte : 5 documents par heure. Réessayez plus tard.'
          : res.status === 401
          ? 'Session expirée. Veuillez vous reconnecter.'
          : res.status === 403
          ? (data.error || 'Quota dépassé. Passez à un plan supérieur.')
          : (data.error || 'Une erreur est survenue lors de l\'analyse. Réessayez ou contactez le support.')
        setUploadError(userMsg)
        track('extraction_failed', { error: data.error, status: res.status })
        return
      }

      setDocs(prev => [data.document, ...prev])
      track('file_uploaded', { document_type: data.document?.document_type, is_urgent: data.document?.is_urgent })
    } catch {
      setUploadError('Erreur de connexion. Reessayez.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 w-full">

        {/* Alertes urgentes */}
        {urgentDocs.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
              <h2 className="font-bold text-red-800 dark:text-red-300 text-sm">
                {urgentDocs.length} document{urgentDocs.length > 1 ? 's' : ''} urgent{urgentDocs.length > 1 ? 's' : ''}
              </h2>
            </div>
            <div className="space-y-2">
              {urgentDocs.map(doc => (
                <Link
                  key={doc.id}
                  href={`/assistant?doc=${doc.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl p-3 border border-red-100 dark:border-red-900 hover:border-red-300 dark:hover:border-red-700 hover:shadow-sm transition-all min-h-[44px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{doc.file_name}</span>
                    <ChevronRight size={14} className="text-red-400" />
                  </div>
                  {doc.action_description && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{doc.action_description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions requises */}
        {actionDocs.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-amber-600 dark:text-amber-400" />
              <h2 className="font-bold text-amber-800 dark:text-amber-300 text-sm">A traiter</h2>
            </div>
            <div className="space-y-2">
              {actionDocs.map(doc => (
                <Link
                  key={doc.id}
                  href={`/assistant?doc=${doc.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl p-3 border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm transition-all min-h-[44px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{doc.file_name}</span>
                    <ChevronRight size={14} className="text-amber-400" />
                  </div>
                  {doc.action_description && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{doc.action_description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Zone d'upload */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="section-heading mb-4">Envoyer un document</h2>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={onFileChange}
            aria-label="Televerser un document"
          />

          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 rounded-xl p-8 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-brand-600">Analyse en cours...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Claude lit votre document</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/30 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 rounded-xl flex items-center justify-center transition-colors">
                  <Upload size={22} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Fiche de paie, courrier, contrat...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">PDF, JPG, PNG</p>
                </div>
              </div>
            )}
          </button>

          {uploadError && (
            <div className="mt-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
              <span>{uploadError}</span>
              <button onClick={() => setUploadError('')} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-red-400 hover:text-red-600" aria-label="Fermer">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Recherche + liste */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="page-title shrink-0">
              Vos documents
              {docs.length > 0 && <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-2">({filteredDocs.length})</span>}
            </h2>
            {docs.length > 0 && (
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  aria-label="Rechercher un document"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg" aria-label="Effacer la recherche">
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Folder filter */}
          {folders.length > 0 && (
            <div className="mb-3">
              <select
                value={activeFolderId}
                onChange={e => setActiveFolderId(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-300"
                aria-label="Filtrer par dossier"
              >
                <option value="all">Tous les dossiers</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category filter tabs */}
          {docs.length > 3 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              {CATEGORY_TABS.map(tab => {
                const count = categoryCounts[tab.key] || 0
                if (tab.key !== 'all' && count === 0) return null
                const isActive = activeCategory === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-600'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] ${isActive ? 'text-brand-200' : 'text-slate-400 dark:text-slate-500'}`}>{count}</span>
                  </button>
                )
              })}
            </div>
          )}

          {filteredDocs.length === 0 && docs.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
              <Search size={24} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucun document ne correspond a &quot;{search}&quot;</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-brand-300" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Aucun document pour l&apos;instant</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Envoyez votre premier document ci-dessus pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="card-interactive"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${DOC_COLORS[doc.document_type] || DOC_COLORS.other}`}>
                          {DOC_LABELS[doc.document_type] || DOC_LABELS.other}
                        </span>
                        {doc.is_urgent && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                            Urgent
                          </span>
                        )}
                        {doc.action_required && !doc.is_urgent && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                            Action requise
                          </span>
                        )}
                        {!doc.action_required && !doc.is_urgent && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                            <CheckCircle size={10} className="inline mr-1" />Traite
                          </span>
                        )}
                      </div>

                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{doc.file_name}</p>
                      {doc.period && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doc.period}</p>}
                      {doc.summary_fr && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{doc.summary_fr}</p>
                      )}
                      {(() => {
                        const rec = getExpertRecommendation(doc.document_type, doc.is_urgent, doc.action_required, doc.action_description, doc.summary_fr)
                        if (!rec) return null
                        return (
                          <Link
                            href={getExpertUrl(rec.specialties[0])}
                            className="flex items-center gap-1.5 mt-2 text-xs text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium min-h-[28px]"
                          >
                            <UserCheck size={12} />
                            Consulter un expert
                          </Link>
                        )
                      })()}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{formatDate(doc.created_at)}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium px-3 py-2 rounded-xl transition-colors min-h-[36px]"
                        aria-label="Voir le détail du document"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:block">Voir</span>
                      </Link>
                      <Link
                        href={`/assistant?doc=${doc.id}`}
                        className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-950/30 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium px-3 py-2 rounded-xl transition-colors min-h-[36px]"
                        aria-label="Poser une question sur ce document"
                      >
                        <MessageSquare size={14} />
                        <span className="hidden sm:block">Demander</span>
                      </Link>
                      <a
                        href={`/api/documents/${doc.id}/export`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                        title="Exporter l'analyse"
                        aria-label="Exporter l'analyse"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => setDeleteConfirmId(doc.id)}
                        disabled={deletingId === doc.id}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                        title="Supprimer"
                        aria-label="Supprimer le document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Delete confirmation inline */}
                  {deleteConfirmId === doc.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Supprimer ce document ?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors min-h-[32px]"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors min-h-[32px]"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
