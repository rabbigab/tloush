'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Folder, FolderOpen, FileText, ChevronRight, AlertCircle, Clock, Pencil, Trash2, Check, X, GitMerge } from 'lucide-react'
import { DOC_LABELS, DOC_COLORS } from '@/lib/docTypes'

interface FolderData {
  id: string
  name: string
  category: string | null
  icon: string | null
  status: string
  auto_generated: boolean
}

interface DocumentSummary {
  id: string
  folder_id: string | null
  document_type: string
  file_name: string
  created_at: string
  is_urgent: boolean
  action_required: boolean
  action_completed_at: string | null
  summary_fr: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  travail: 'Travail',
  securite_sociale: 'Sécurité sociale',
  fiscal: 'Fiscal',
  retraite: 'Retraite',
  logement: 'Logement',
  bancaire: 'Bancaire',
  finance: 'Factures',
  autre: 'Autre',
}

export default function FoldersClient({ folders: initialFolders, documents: initialDocs }: { folders: FolderData[]; documents: DocumentSummary[] }) {
  const [folders, setFolders] = useState(initialFolders)
  const [documents, setDocuments] = useState(initialDocs)
  const [openFolderId, setOpenFolderId] = useState<string | null>(initialFolders[0]?.id || null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [mergeTargetId, setMergeTargetId] = useState<string>('')
  const [merging, setMerging] = useState(false)

  function startEdit(f: FolderData) {
    setEditingId(f.id)
    setEditName(f.name)
  }

  async function saveEdit(id: string) {
    const name = editName.trim()
    if (!name) return
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f))
        setEditingId(null)
      }
    } catch {
      // keep editing
    }
  }

  async function deleteFolder(id: string) {
    if (!confirm('Supprimer ce dossier ? Les documents ne seront pas supprimés, juste détachés.')) return
    try {
      const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFolders(prev => prev.filter(f => f.id !== id))
        setDocuments(prev => prev.map(d => d.folder_id === id ? { ...d, folder_id: null } : d))
        if (openFolderId === id) setOpenFolderId(null)
      }
    } catch {
      // ignore
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function doMerge() {
    if (!mergeTargetId || selectedIds.size < 2) return
    const sourceIds = Array.from(selectedIds).filter(id => id !== mergeTargetId)
    if (sourceIds.length === 0) return
    setMerging(true)
    try {
      const res = await fetch('/api/folders/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceIds, targetId: mergeTargetId }),
      })
      if (res.ok) {
        setFolders(prev => prev.filter(f => !sourceIds.includes(f.id)))
        setDocuments(prev => prev.map(d => sourceIds.includes(d.folder_id || '') ? { ...d, folder_id: mergeTargetId } : d))
        setSelectMode(false)
        setSelectedIds(new Set())
        setMergeTargetId('')
      }
    } finally {
      setMerging(false)
    }
  }

  const docsByFolder = new Map<string, DocumentSummary[]>()
  for (const d of documents) {
    if (!d.folder_id) continue
    const list = docsByFolder.get(d.folder_id) || []
    list.push(d)
    docsByFolder.set(d.folder_id, list)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (folders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div>
          <h1 className="page-title mb-1">Dossiers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Vos documents sont regroupés automatiquement par émetteur.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Folder size={28} className="text-brand-400" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Aucun dossier pour l&apos;instant</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Scannez des documents : ils seront automatiquement regroupés par émetteur (employeur, Bituah Leumi, fournisseur...).
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <FileText size={14} />
            Ajouter un document
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title mb-1">Dossiers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {folders.length} dossier{folders.length > 1 ? 's' : ''} · regroupés automatiquement par émetteur
          </p>
        </div>
        {folders.length > 1 && (
          <button
            onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); setMergeTargetId('') }}
            className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl transition-colors min-h-[36px] ${
              selectMode
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-300'
            }`}
          >
            <GitMerge size={14} /> {selectMode ? 'Annuler' : 'Fusionner'}
          </button>
        )}
      </div>

      {selectMode && selectedIds.size >= 2 && (
        <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-brand-800 dark:text-brand-200">
            {selectedIds.size} dossiers sélectionnés. Dans quel dossier les fusionner ?
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={mergeTargetId}
              onChange={e => setMergeTargetId(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">Choisir le dossier de destination…</option>
              {folders.filter(f => selectedIds.has(f.id)).map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <button
              onClick={doMerge}
              disabled={!mergeTargetId || merging}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors min-h-[40px]"
            >
              {merging ? 'Fusion…' : 'Fusionner'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {folders.map(folder => {
          const docs = docsByFolder.get(folder.id) || []
          const isOpen = openFolderId === folder.id
          const urgentCount = docs.filter(d => d.is_urgent).length
          const pendingCount = docs.filter(d => d.action_required && !d.action_completed_at).length
          return (
            <div
              key={folder.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                {selectMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(folder.id)}
                    onChange={() => toggleSelect(folder.id)}
                    className="w-4 h-4 accent-brand-600 shrink-0"
                  />
                )}
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center shrink-0">
                  {isOpen ? <FolderOpen size={18} className="text-brand-600" /> : <Folder size={18} className="text-brand-600" />}
                </div>
                <button
                  onClick={() => !selectMode && setOpenFolderId(isOpen ? null : folder.id)}
                  disabled={selectMode || editingId === folder.id}
                  className="flex-1 min-w-0 text-left"
                >
                  {editingId === folder.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(folder.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                      className="w-full px-2 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{folder.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {folder.category && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">{CATEGORY_LABELS[folder.category] || folder.category}</span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {docs.length} document{docs.length > 1 ? 's' : ''}
                        </span>
                        {urgentCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                            <AlertCircle size={11} /> {urgentCount} urgent{urgentCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {pendingCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Clock size={11} /> {pendingCount} à traiter
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
                {!selectMode && (
                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === folder.id ? (
                      <>
                        <button onClick={() => saveEdit(folder.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" aria-label="Valider">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Annuler">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(folder)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30" aria-label="Renommer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteFolder(folder.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Supprimer">
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight
                          size={18}
                          className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                  {docs.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
                      Aucun document dans ce dossier.
                    </p>
                  ) : (
                    docs.map(doc => (
                      <Link
                        key={doc.id}
                        href={`/documents/${doc.id}`}
                        className="block px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DOC_COLORS[doc.document_type] || DOC_COLORS.other}`}>
                                {DOC_LABELS[doc.document_type] || 'Document'}
                              </span>
                              {doc.is_urgent && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Urgent</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.file_name}</p>
                            {doc.summary_fr && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{doc.summary_fr}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(doc.created_at)}</span>
                            <ChevronRight size={14} className="text-slate-400" />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
