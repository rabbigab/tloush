'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Trash2, Clock, CheckCircle, LogOut, Loader2 } from 'lucide-react'

interface FamilyMember {
  id: string
  member_email: string
  member_id: string | null
  status: 'pending' | 'active'
  invited_at: string
  accepted_at: string | null
}

interface FamilyData {
  members: FamilyMember[]
  maxMembers: number
  planId: string
}

export default function FamilySection({ userEmail }: { userEmail: string }) {
  const [data, setData] = useState<FamilyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [pendingInvite, setPendingInvite] = useState(false)
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, joinRes] = await Promise.all([
        fetch('/api/family/members'),
        fetch('/api/family/join'),
      ])
      const membersData = await membersRes.json()
      const joinData = await joinRes.json()

      setData(membersData)
      setPendingInvite(joinData.hasPendingInvite)

      // Check if user is a family member (not owner)
      if (membersData.planId !== 'family' && joinData.hasPendingInvite) {
        setIsMember(false)
      }
    } catch {
      // Tables might not exist yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Also check if user is already a member of someone's family
    fetch('/api/stripe/subscription')
      .then(r => r.json())
      .then(subData => {
        if (subData.subscription?.isFamilyMember) {
          setIsMember(true)
        }
      })
      .catch((err) => console.error('[FamilySection] Failed to check subscription:', err))
  }, [fetchData])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/family/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    const result = await res.json()

    if (!res.ok) {
      setError(result.error)
    } else {
      setSuccess(`Invitation envoyee a ${inviteEmail}`)
      setInviteEmail('')
      fetchData()
    }
    setInviting(false)
  }

  async function handleRemove(memberId: string) {
    setError('')
    const res = await fetch('/api/family/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    if (res.ok) {
      fetchData()
    } else {
      const result = await res.json()
      setError(result.error)
    }
  }

  async function handleJoin() {
    setJoining(true)
    setError('')
    const res = await fetch('/api/family/join', { method: 'POST' })
    if (res.ok) {
      setPendingInvite(false)
      setIsMember(true)
      setSuccess('Vous avez rejoint le plan Famille !')
    } else {
      const result = await res.json()
      setError(result.error)
    }
    setJoining(false)
  }

  async function handleLeave() {
    setLeaving(true)
    setError('')
    const res = await fetch('/api/family/leave', { method: 'POST' })
    if (res.ok) {
      setIsMember(false)
      setSuccess('Vous avez quitte le plan Famille.')
      fetchData()
    } else {
      const result = await res.json()
      setError(result.error)
    }
    setLeaving(false)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="h-20 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-xl" />
      </div>
    )
  }

  // User has a pending invitation to join someone's family
  if (pendingInvite && !isMember) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="section-heading mb-4 flex items-center gap-2">
          <Users size={18} className="text-brand-600" />
          Plan Famille
        </h2>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            Vous avez ete invite a rejoindre un plan Famille ! En acceptant, vous beneficierez du plan Famille sans frais supplementaires.
          </p>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors inline-flex items-center gap-2"
          >
            {joining ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Accepter l&apos;invitation
          </button>
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-3">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400 text-sm mt-3">{success}</p>}
      </div>
    )
  }

  // User is a family member (not owner)
  if (isMember) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="section-heading mb-4 flex items-center gap-2">
          <Users size={18} className="text-brand-600" />
          Plan Famille
        </h2>
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
            <CheckCircle size={14} />
            Vous faites partie d&apos;un plan Famille
          </p>
        </div>
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors inline-flex items-center gap-2"
        >
          {leaving ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          Quitter le plan Famille
        </button>
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-3">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400 text-sm mt-3">{success}</p>}
      </div>
    )
  }

  // Not a family plan owner — don't show this section
  if (!data || data.planId !== 'family') {
    return null
  }

  const members = data.members || []
  const maxInvites = data.maxMembers - 1 // -1 for owner
  const spotsLeft = maxInvites - members.length

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <h2 className="section-heading mb-4 flex items-center gap-2">
        <Users size={18} className="text-brand-600" />
        Membres de la famille
        <span className="text-xs font-normal text-slate-400 ml-auto">
          {members.length}/{maxInvites} membres
        </span>
      </h2>

      {/* Member list */}
      {members.length > 0 ? (
        <div className="space-y-2 mb-4">
          {members.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                {member.status === 'active' ? (
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                ) : (
                  <Clock size={14} className="text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {member.member_email}
                  </p>
                  <p className="text-xs text-slate-400">
                    {member.status === 'active' ? 'Actif' : 'En attente'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(member.id)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                aria-label="Supprimer le membre"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 mb-4">
          Aucun membre pour l&apos;instant. Invitez jusqu&apos;a {maxInvites} personnes.
        </p>
      )}

      {/* Invite form */}
      {spotsLeft > 0 && (
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="email@exemple.com"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={inviting}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors inline-flex items-center gap-2 shrink-0"
          >
            {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Inviter
          </button>
        </form>
      )}

      {spotsLeft === 0 && (
        <p className="text-xs text-slate-400">
          Toutes les places sont prises ({maxInvites}/{maxInvites}).
        </p>
      )}

      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-3">{error}</p>}
      {success && <p className="text-green-600 dark:text-green-400 text-sm mt-3">{success}</p>}
    </div>
  )
}
