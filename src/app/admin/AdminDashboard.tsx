'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Users, FileText, CreditCard, TrendingUp, RefreshCw,
  ArrowLeft, Clock, UserCheck, AlertCircle,
  Crown, UserPlus, Activity, DollarSign, BarChart3,
  MessageSquare, Percent, ArrowUpRight, Check,
} from 'lucide-react'
import {
  AdminData, UserData, Feedback,
  DOC_LABELS, PLAN_LABELS, FEEDBACK_STATUS_LABELS,
  CATEGORY_LABELS,
  timeAgo,
} from './types'
import { UsersTab } from './tabs/UsersTab'
import { FeedbacksTab } from './tabs/FeedbacksTab'
import { PrestatairesTab } from './tabs/PrestatairesTab'
import { VisiteursTab } from './tabs/VisiteursTab'

// ── Local-only constants ──────────────────────────────────────────────────────

const PLAN_DISTRIBUTION_COLORS: Record<string, string> = {
  free: 'bg-slate-300 dark:bg-slate-600',
  solo: 'bg-blue-500',
  family: 'bg-purple-500',
}

const CATEGORY_ICONS_MAP: Record<string, React.ElementType> = {
  bug: () => <span>🐛</span>,
  suggestion: () => <span>💡</span>,
  question: () => <span>❓</span>,
  other: () => <span>💬</span>,
}

// ── Mini sparkline chart ──────────────────────────────────────────────────────

function MiniChart({ data, color = 'blue' }: { data: { date: string; count: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', indigo: 'bg-indigo-500',
  }
  return (
    <div className="flex items-end gap-px h-16">
      {data.map((d, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-sm ${colorMap[color] || colorMap.blue} opacity-70 hover:opacity-100 transition-opacity`}
          style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
          title={`${d.date}: ${d.count}`}
        />
      ))}
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color, badge }: {
  icon: React.ElementType, label: string, value: string | number, sub: string, color: string, badge?: number
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 relative">
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'last_sign_in_at' | 'total_documents'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [tab, setTab] = useState<'overview' | 'users' | 'documents' | 'feedbacks' | 'prestataires' | 'visiteurs'>('overview')

  // Visitor stats state
  const [visitorStats, setVisitorStats] = useState<any>(null)
  const [visitorLoading, setVisitorLoading] = useState(false)

  const fetchVisitorStats = useCallback(async () => {
    setVisitorLoading(true)
    try {
      const res = await fetch('/api/admin/visitor-stats')
      if (res.ok) setVisitorStats(await res.json())
    } catch { /* ignore */ }
    setVisitorLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'visiteurs') fetchVisitorStats()
  }, [tab, fetchVisitorStats])

  // Prestataires state
  const [providers, setProviders] = useState<any[]>([])
  const [providerApplications, setProviderApplications] = useState<any[]>([])
  const [providerTab, setProviderTab] = useState<'active' | 'pending' | 'applications' | 'reviews'>('active')
  const [providerLoading, setProviderLoading] = useState(false)
  const [showProviderForm, setShowProviderForm] = useState(false)
  const [providerForm, setProviderForm] = useState({
    first_name: '', last_name: '', phone: '', email: '', slug: '',
    category: 'plombier', specialties: '', service_areas: '',
    languages: 'fr,he', description: '', years_experience: '',
    osek_number: '', is_referenced: false, status: 'active',
  })
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null)
  const [annuaireStats, setAnnuaireStats] = useState<any>(null)
  const [providerError, setProviderError] = useState('')

  const fetchProviders = useCallback(async () => {
    setProviderLoading(true)
    try {
      const [activeRes, pendingRes, statsRes] = await Promise.all([
        fetch('/api/admin/prestataires?status=active'),
        fetch('/api/admin/prestataires?status=applications'),
        fetch('/api/admin/annuaire-stats'),
      ])
      if (activeRes.ok) setProviders((await activeRes.json()).providers || [])
      if (pendingRes.ok) setProviderApplications((await pendingRes.json()).providers || [])
      if (statsRes.ok) setAnnuaireStats(await statsRes.json())
    } catch { /* ignore */ }
    setProviderLoading(false)
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])
  useEffect(() => { if (tab === 'prestataires') fetchProviders() }, [tab, fetchProviders])

  const handleSaveProvider = async () => {
    setProviderError('')
    const required: Array<[string, string]> = [
      [providerForm.first_name, 'Prenom'], [providerForm.last_name, 'Nom'],
      [providerForm.phone, 'Telephone'], [providerForm.slug, 'Slug'],
      [providerForm.category, 'Catégorie'],
    ]
    const missing = required.filter(([v]) => !v.trim()).map(([, label]) => label)
    if (missing.length > 0) { setProviderError(`Champs obligatoires manquants : ${missing.join(', ')}`); return }

    const body = {
      ...providerForm,
      specialties: providerForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
      service_areas: providerForm.service_areas.split(',').map(s => s.trim()).filter(Boolean),
      languages: providerForm.languages.split(',').map(s => s.trim()).filter(Boolean),
      years_experience: providerForm.years_experience ? parseInt(providerForm.years_experience) : null,
    }
    const url = editingProviderId ? `/api/admin/prestataires/${editingProviderId}` : '/api/admin/prestataires'
    const res = await fetch(url, {
      method: editingProviderId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) { resetProviderForm(); fetchProviders() }
    else {
      const d = await res.json().catch(() => ({}))
      setProviderError(d.error || 'Erreur lors de la sauvegarde')
    }
  }

  const resetProviderForm = () => {
    setShowProviderForm(false)
    setEditingProviderId(null)
    setProviderError('')
    setProviderForm({ first_name: '', last_name: '', phone: '', email: '', slug: '', category: 'plombier', specialties: '', service_areas: '', languages: 'fr,he', description: '', years_experience: '', osek_number: '', is_referenced: false, status: 'active' })
  }

  const handleEditProvider = (p: any) => {
    setEditingProviderId(p.id)
    setProviderError('')
    setProviderForm({
      first_name: p.first_name || '', last_name: p.last_name || '',
      phone: p.phone || '', email: p.email || '', slug: p.slug || '',
      category: p.category || 'plombier',
      specialties: Array.isArray(p.specialties) ? p.specialties.join(', ') : '',
      service_areas: Array.isArray(p.service_areas) ? p.service_areas.join(', ') : '',
      languages: Array.isArray(p.languages) ? p.languages.join(', ') : 'fr,he',
      description: p.description || '',
      years_experience: p.years_experience ? String(p.years_experience) : '',
      osek_number: p.osek_number || '',
      is_referenced: !!p.is_referenced,
      status: p.status || 'active',
    })
    setShowProviderForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelistProvider = async (id: string) => {
    if (!confirm('Delister ce prestataire ?')) return
    await fetch(`/api/admin/prestataires/${id}`, { method: 'DELETE' })
    fetchProviders()
  }

  const handleToggleReferenced = async (id: string, current: boolean) => {
    await fetch(`/api/admin/prestataires/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_referenced: !current }),
    })
    fetchProviders()
  }

  const handleApproveApplication = async (app: any) => {
    if (!confirm(`Valider ${app.first_name} ${app.last_name} (${app.category}) ?`)) return
    const res = await fetch(`/api/admin/applications/${app.id}`, { method: 'POST' })
    if (res.ok) { fetchProviders() }
    else { const d = await res.json().catch(() => ({})); alert(d.error || 'Erreur lors de la validation') }
  }

  const handleRejectApplication = async (app: any) => {
    if (!confirm(`Rejeter la candidature de ${app.first_name} ${app.last_name} ?`)) return
    const res = await fetch(`/api/admin/applications/${app.id}`, { method: 'DELETE' })
    if (res.ok) { fetchProviders() }
    else { const d = await res.json().catch(() => ({})); alert(d.error || 'Erreur lors du rejet') }
  }

  // Users state
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [changingPlan, setChangingPlan] = useState<string | null>(null)

  async function handleChangePlan(userId: string, planId: string) {
    setChangingPlan(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })
      if (!res.ok) { alert((await res.json()).error || 'Erreur'); return }
      fetchData()
    } catch { alert('Erreur réseau') }
    finally { setChangingPlan(null) }
  }

  async function handleDeleteUser(userId: string) {
    setDeleting(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) { alert((await res.json()).error || 'Erreur lors de la suppression'); return }
      setDeleteConfirm(null)
      fetchData()
    } catch { alert('Erreur réseau') }
    finally { setDeleting(null) }
  }

  // Feedback state
  const [updatingFeedback, setUpdatingFeedback] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  async function handleFeedbackStatus(feedbackId: string, newStatus: string) {
    setUpdatingFeedback(feedbackId)
    try {
      const res = await fetch('/api/admin/feedbacks', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feedbackId, status: newStatus }),
      })
      if (!res.ok) { alert('Erreur mise à jour'); return }
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          feedbacks: prev.feedbacks.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f),
          overview: {
            ...prev.overview,
            feedback_new: prev.feedbacks.filter(f => f.id === feedbackId ? newStatus === 'new' : f.status === 'new').length,
          },
        }
      })
    } catch { alert('Erreur réseau') }
    finally { setUpdatingFeedback(null) }
  }

  async function handleReplyFeedback(feedbackId: string) {
    if (!replyText.trim() || replyText.trim().length < 2) return
    setSendingReply(true)
    try {
      const res = await fetch('/api/admin/feedbacks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feedbackId, reply: replyText.trim() }),
      })
      if (!res.ok) { alert((await res.json().catch(() => ({}))).error || 'Erreur envoi'); return }
      setData(prev => {
        if (!prev) return prev
        return { ...prev, feedbacks: prev.feedbacks.map(f => f.id === feedbackId ? { ...f, status: 'resolved', admin_note: replyText.trim() } : f) }
      })
      setReplyingTo(null)
      setReplyText('')
    } catch { alert('Erreur réseau') }
    finally { setSendingReply(false) }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error(await res.text())
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw size={20} className="animate-spin" />
          <span>Chargement du dashboard admin...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Réessayer</button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { overview, plan_distribution, signup_trend, docs_trend, doc_type_distribution, feedback_stats, feedbacks, users, recent_documents } = data

  // Filter & sort users
  const filteredUsers = users
    .filter(u => {
      if (search && !u.email.toLowerCase().includes(search.toLowerCase())) return false
      if (planFilter !== 'all' && u.plan !== planFilter) return false
      return true
    })
    .sort((a, b) => {
      let aVal: number, bVal: number
      if (sortBy === 'total_documents') { aVal = a.total_documents; bVal = b.total_documents }
      else if (sortBy === 'last_sign_in_at') {
        aVal = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
        bVal = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
      } else {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })

  function toggleSort(field: typeof sortBy) {
    if (sortBy === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const emailMap: Record<string, string> = {}
  for (const u of users) emailMap[u.id] = u.email

  const sortedDocTypes = Object.entries(doc_type_distribution).sort(([, a], [, b]) => b - a).slice(0, 8)
  const maxDocTypeCount = Math.max(...sortedDocTypes.map(([, c]) => c), 1)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/inbox" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown size={20} className="text-amber-500" />
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="Utilisateurs" value={overview.total_users} sub={`+${overview.recent_signups_7d} cette semaine`} color="blue" />
          <KpiCard icon={UserCheck} label="Actifs (7j)" value={overview.active_users_7d} sub={`${overview.active_users_30d} actifs 30j`} color="green" />
          <KpiCard icon={FileText} label="Documents" value={overview.total_documents} sub={`${overview.avg_docs_per_user} moy/user`} color="indigo" />
          <KpiCard icon={DollarSign} label="MRR" value={`${overview.mrr}₪`} sub={`${overview.active_solo} Solo · ${overview.active_family} Famille`} color="amber" />
        </div>

        {/* KPI Cards row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Activity} label="Retention 7j" value={`${overview.retention_rate_7d}%`} sub="users anciens revenus" color="green" />
          <KpiCard icon={Percent} label="Conversion" value={`${overview.conversion_rate}%`} sub="free → payant" color="amber" />
          <KpiCard icon={ArrowUpRight} label="Ont upload" value={overview.users_with_docs} sub={`${overview.total_users > 0 ? Math.round(overview.users_with_docs / overview.total_users * 100) : 0}% activation`} color="indigo" />
          <KpiCard icon={MessageSquare} label="Feedbacks" value={feedback_stats.total} sub={`${feedback_stats.new} non lus`} color="blue" badge={feedback_stats.new > 0 ? feedback_stats.new : undefined} />
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2">
              <UserPlus size={16} />
              Inscriptions (30j)
            </h2>
            <p className="text-xs text-slate-400 mb-3">Total: {signup_trend.reduce((a, d) => a + d.count, 0)}</p>
            <MiniChart data={signup_trend} color="blue" />
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>{signup_trend[0]?.date.slice(5)}</span>
              <span>{signup_trend[signup_trend.length - 1]?.date.slice(5)}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2">
              <FileText size={16} />
              Documents analysés (30j)
            </h2>
            <p className="text-xs text-slate-400 mb-3">Total: {docs_trend.reduce((a, d) => a + d.count, 0)}</p>
            <MiniChart data={docs_trend} color="indigo" />
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>{docs_trend[0]?.date.slice(5)}</span>
              <span>{docs_trend[docs_trend.length - 1]?.date.slice(5)}</span>
            </div>
          </div>
        </div>

        {/* Plan distribution + doc type distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={16} />
              Répartition des plans
            </h2>
            <div className="flex gap-4 items-end h-28">
              {(['free', 'solo', 'family'] as const).map(plan => {
                const count = plan_distribution[plan]
                const maxCount = Math.max(...Object.values(plan_distribution), 1)
                const height = Math.max((count / maxCount) * 100, 8)
                return (
                  <div key={plan} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                    <div style={{ height: `${height}%` }} className={`w-full rounded-t-lg transition-all ${PLAN_DISTRIBUTION_COLORS[plan]}`} />
                    <span className="text-xs font-medium text-slate-500">{PLAN_LABELS[plan]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <FileText size={16} />
              Types de documents
            </h2>
            <div className="space-y-2">
              {sortedDocTypes.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 truncate">{DOC_LABELS[type] || type}</span>
                  <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(count / maxDocTypeCount) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {([
            { key: 'overview', label: 'Vue d\'ensemble', Icon: TrendingUp },
            { key: 'users', label: `Utilisateurs (${users.length})`, Icon: Users },
            { key: 'documents', label: `Documents (${recent_documents.length})`, Icon: FileText },
            { key: 'feedbacks', label: 'Feedbacks', Icon: MessageSquare, badge: feedback_stats.new },
            { key: 'prestataires', label: 'Prestataires', Icon: UserCheck, badge: providerApplications.length },
            { key: 'visiteurs', label: 'Visiteurs', Icon: Activity },
          ] as const).map(({ key, label, Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={14} className="inline mr-1.5" />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Feedback par catégorie</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['bug', 'suggestion', 'question', 'other'] as const).map(cat => {
                const Icon = CATEGORY_ICONS_MAP[cat] || (() => <span>•</span>)
                return (
                  <div key={cat} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Icon />
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{feedback_stats.byCategory[cat]}</p>
                      <p className="text-xs text-slate-500">{CATEGORY_LABELS[cat]}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <UsersTab
            filteredUsers={filteredUsers}
            search={search} setSearch={setSearch}
            planFilter={planFilter} setPlanFilter={setPlanFilter}
            sortBy={sortBy} sortDir={sortDir} toggleSort={toggleSort}
            expandedUser={expandedUser} setExpandedUser={setExpandedUser}
            deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
            deleting={deleting} changingPlan={changingPlan}
            handleChangePlan={handleChangePlan} handleDeleteUser={handleDeleteUser}
          />
        )}

        {/* Documents Tab */}
        {tab === 'documents' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Document</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Utilisateur</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Resume</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {recent_documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{doc.file_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[180px]">
                        {emailMap[doc.user_id] || doc.user_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {DOC_LABELS[doc.document_type] || doc.document_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                        <p className="truncate max-w-[300px]">{doc.summary_fr || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {timeAgo(doc.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feedbacks Tab */}
        {tab === 'feedbacks' && (
          <FeedbacksTab
            feedbacks={feedbacks}
            updatingFeedback={updatingFeedback}
            replyingTo={replyingTo} setReplyingTo={setReplyingTo}
            replyText={replyText} setReplyText={setReplyText}
            sendingReply={sendingReply}
            handleFeedbackStatus={handleFeedbackStatus}
            handleReplyFeedback={handleReplyFeedback}
          />
        )}

        {/* Prestataires Tab */}
        {tab === 'prestataires' && (
          <PrestatairesTab
            providers={providers} providerApplications={providerApplications}
            providerTab={providerTab} setProviderTab={setProviderTab}
            providerLoading={providerLoading} showProviderForm={showProviderForm}
            providerForm={providerForm} setProviderForm={setProviderForm}
            editingProviderId={editingProviderId} setEditingProviderId={setEditingProviderId}
            providerError={providerError} setProviderError={setProviderError}
            setShowProviderForm={setShowProviderForm}
            annuaireStats={annuaireStats}
            handleSaveProvider={handleSaveProvider} resetProviderForm={resetProviderForm}
            handleEditProvider={handleEditProvider} handleDelistProvider={handleDelistProvider}
            handleToggleReferenced={handleToggleReferenced}
            handleApproveApplication={handleApproveApplication} handleRejectApplication={handleRejectApplication}
          />
        )}

        {/* Visiteurs Tab */}
        {tab === 'visiteurs' && (
          <VisiteursTab visitorStats={visitorStats} visitorLoading={visitorLoading} />
        )}
      </div>
    </div>
  )
}
