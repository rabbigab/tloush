'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, UserPlus, Mail, Clock, CheckCircle2, Trash2, AlertCircle, FileText, Share2, Lock } from 'lucide-react'
import { DOC_LABELS, DOC_ICONS } from '@/lib/docTypes'

interface FamilyMember {
  id: string
  member_email: string
  member_id: string | null
  status: 'pending' | 'active' | 'removed'
  invited_at: string
  accepted_at: string | null
}

interface SharedDoc {
  id: string
  document_id: string
  shared_by: string
  shared_at: string
  documents: {
    id: string
    file_name: string
    document_type: string
    period: string | null
    is_urgent: boolean
    action_required: boolean
    summary_fr: string | null
    created_at: string
  } | null
}

interface MembersResponse {
  members: FamilyMember[]
  maxMembers: number
  planId: string
}

interface DocsResponse {
  family_owner_id: string
  is_owner: boolean
  shared_documents: SharedDoc[]
}

export default function FamilyClient({ userEmail }: { userEmail: string }) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [maxMembers, setMaxMembers] = useState(1)
  const [planId, setPlanId] = useState('free')
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([])
  const [isOwner, setIsOwner] = useState(true)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [membersRes, docsRes] = await Promise.all([
        fetch('/api/family/members'),
        fetch('/api/family/documents'),
      ])
      if (membersRes.ok) {
        const data: MembersResponse = await membersRes.json()
        setMembers(data.members)
        setMaxMembers(data.maxMembers)
        setPlanId(data.planId)
      }
      if (docsRes.ok) {
        const data: DocsResponse = await docsRes.json()
        setSharedDocs(data.shared_documents)
        setIsOwner(data.is_owner)
      }
    } catch {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'invitation')
        return
      }
      setSuccess(`Invitation envoyee a ${inviteEmail}`)
      setInviteEmail('')
      fetchData()
    } catch {
      setError('Erreur reseau')
    } finally {
      setInviting(false)
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm('Supprimer ce membre du foyer ? Il perdra l\'acces aux documents partages.')) return
    try {
      const res = await fetch('/api/family/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  async function unshareDoc(documentId: string) {
    try {
      const res = await fetch(`/api/family/documents?document_id=${documentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchData()
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  // Non-family plan : afficher un CTA pour upgrader
  if (planId !== 'family') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ma famille</h1>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-3xl p-8 text-center">
          <Users size={48} className="text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Plan Famille requis
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Invitez jusqu&apos;a 5 membres de votre foyer pour partager vos documents, centraliser les echeances et beneficier des analyses pour toute la famille.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Voir les plans
          </Link>
        </div>
      </div>
    )
  }

  const pendingMembers = members.filter(m => m.status === 'pending')
  const activeMembers = members.filter(m => m.status === 'active')
  const remainingSlots = Math.max(0, maxMembers - 1 - members.filter(m => m.status !== 'removed').length)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ma famille</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isOwner
              ? `Foyer de ${userEmail} · ${activeMembers.length + 1}/${maxMembers} membres`
              : `Membre du foyer`}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
          <CheckCircle2 size={14} />
          {success}
        </div>
      )}

      {/* Invite form (owner only) */}
      {isOwner && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            <UserPlus size={16} className="text-blue-500" />
            Inviter un membre
          </h2>
          {remainingSlots > 0 ? (
            <form onSubmit={invite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemple.com"
                required
                className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {inviting ? 'Envoi...' : 'Inviter'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">
              Limite atteinte : {maxMembers - 1} membres maximum sur votre plan.
            </p>
          )}
        </div>
      )}

      {/* Members list */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          <Users size={16} className="text-pink-500" />
          Membres du foyer
        </h2>
        <div className="space-y-2">
          {/* Owner */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-sm">
              {userEmail.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{userEmail}</p>
              <p className="text-xs text-slate-400">Proprietaire du foyer</p>
            </div>
          </div>

          {/* Active members */}
          {activeMembers.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center font-semibold text-sm">
                {m.member_email.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{m.member_email}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Actif
                </p>
              </div>
              {isOwner && (
                <button onClick={() => removeMember(m.id)} className="text-slate-400 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {/* Pending invites */}
          {pendingMembers.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{m.member_email}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock size={12} /> En attente
                </p>
              </div>
              {isOwner && (
                <button onClick={() => removeMember(m.id)} className="text-slate-400 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shared documents */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          <Share2 size={16} className="text-green-500" />
          Documents partages du foyer
        </h2>
        {sharedDocs.length === 0 ? (
          <div className="text-center py-10">
            <Lock size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucun document partage pour le moment.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Pour partager un document avec votre famille, allez sur la fiche du document et activez le partage.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sharedDocs.map(s => s.documents && (
              <Link
                key={s.id}
                href={`/documents/${s.documents.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0 text-lg">
                  {DOC_ICONS[s.documents.document_type] || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {DOC_LABELS[s.documents.document_type] || s.documents.document_type}
                    </p>
                    {s.documents.period && (
                      <span className="text-xs text-slate-400">{s.documents.period}</span>
                    )}
                  </div>
                  {s.documents.summary_fr && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {s.documents.summary_fr}
                    </p>
                  )}
                </div>
                {s.shared_by && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      unshareDoc(s.document_id)
                    }}
                    className="text-slate-400 hover:text-red-500 p-1 shrink-0"
                    title="Arreter le partage"
                  >
                    <Lock size={14} />
                  </button>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Les documents partages sont visibles par tous les membres actifs du foyer.
        Vous pouvez arreter de partager a tout moment.
      </p>
    </div>
  )
}
