'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Users, FileText, CreditCard, TrendingUp, RefreshCw, Search,
  ArrowLeft, ChevronDown, ChevronUp, Clock, UserCheck, AlertCircle,
  Crown, UserPlus, Activity, DollarSign, BarChart3, Eye, Trash2, Phone,
  MessageSquare, Bug, Lightbulb, HelpCircle, Archive, CheckCircle, Percent, ArrowUpRight, Pencil
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  plan: string
  subscription_status: string
  total_documents: number
  documents_this_month: number
  provider: string
  phone: string | null
}

interface RecentDoc {
  id: string
  user_id: string
  file_name: string
  document_type: string
  status: string
  created_at: string
  summary_fr: string | null
}

interface Feedback {
  id: string
  user_id: string
  email: string | null
  category: string
  message: string
  status: string
  admin_note: string | null
  created_at: string
}

interface AdminData {
  overview: {
    total_users: number
    recent_signups_7d: number
    active_users_7d: number
    active_users_30d: number
    total_documents: number
    mrr: number
    active_solo: number
    active_family: number
    avg_docs_per_user: number
    retention_rate_7d: number
    conversion_rate: number
    users_with_docs: number
    feedback_new: number
  }
  plan_distribution: { free: number; solo: number; family: number }
  signup_trend: { date: string; count: number }[]
  docs_trend: { date: string; count: number }[]
  doc_type_distribution: Record<string, number>
  feedback_stats: {
    total: number
    new: number
    byCategory: { bug: number; suggestion: number; question: number; other: number }
  }
  feedbacks: Feedback[]
  users: UserData[]
  recent_documents: RecentDoc[]
}

const PLAN_LABELS: Record<string, string> = { free: 'Gratuit', solo: 'Solo', family: 'Famille' }
const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  solo: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  family: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
}
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  past_due: 'bg-yellow-100 text-yellow-700',
  canceled: 'bg-red-100 text-red-700',
  none: 'bg-slate-100 text-slate-500',
}
const DOC_LABELS: Record<string, string> = {
  payslip: 'Fiche de paie', bituah_leumi: 'Bituah Leumi', tax_notice: 'Fiscal',
  work_contract: 'Contrat', invoice: 'Facture', other: 'Autre',
  pension: 'Retraite', health_insurance: 'Santé', rental: 'Location',
  bank: 'Bancaire', official_letter: 'Courrier', receipt: 'Reçu',
  utility_bill: 'Facture', insurance: 'Assurance', contract: 'Contrat',
}
const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau', read: 'Lu', resolved: 'Résolu', archived: 'Archivé',
}
const FEEDBACK_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  read: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  archived: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  bug: Bug, suggestion: Lightbulb, question: HelpCircle, other: MessageSquare,
}
const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug', suggestion: 'Suggestion', question: 'Question', other: 'Autre',
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  const months = Math.floor(days / 30)
  return `il y a ${months} mois`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Mini sparkline chart component
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visitorStats, setVisitorStats] = useState<any>(null)
  const [visitorLoading, setVisitorLoading] = useState(false)

  const fetchVisitorStats = useCallback(async () => {
    setVisitorLoading(true)
    try {
      const res = await fetch('/api/admin/visitor-stats')
      if (res.ok) {
        const data = await res.json()
        setVisitorStats(data)
      }
    } catch { /* ignore */ }
    setVisitorLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'visiteurs') fetchVisitorStats()
  }, [tab, fetchVisitorStats])

  // Prestataires state
  const [providers, setProviders] = useState<any[]>([])
  const [providerApplications, setProviderApplications] = useState<any[]>([])
  const [pendingReviews, setPendingReviews] = useState<any[]>([])
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [annuaireStats, setAnnuaireStats] = useState<any>(null)

  const fetchProviders = useCallback(async () => {
    setProviderLoading(true)
    try {
      const [activeRes, pendingRes, statsRes] = await Promise.all([
        fetch('/api/admin/prestataires?status=active'),
        fetch('/api/admin/prestataires?status=pending'),
        fetch('/api/admin/annuaire-stats'),
      ])
      if (activeRes.ok) {
        const data = await activeRes.json()
        setProviders(data.providers || [])
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json()
        setProviderApplications(data.providers || [])
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setAnnuaireStats(data)
      }
    } catch { /* ignore */ }
    setProviderLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'prestataires') fetchProviders()
  }, [tab, fetchProviders])

  const [providerError, setProviderError] = useState('')

  const handleSaveProvider = async () => {
    setProviderError('')
    // Client-side validation
    const required: Array<[string, string]> = [
      [providerForm.first_name, 'Prenom'],
      [providerForm.last_name, 'Nom'],
      [providerForm.phone, 'Telephone'],
      [providerForm.slug, 'Slug'],
      [providerForm.category, 'Categorie'],
    ]
    const missing = required.filter(([v]) => !v.trim()).map(([, label]) => label)
    if (missing.length > 0) {
      setProviderError(`Champs obligatoires manquants : ${missing.join(', ')}`)
      return
    }

    const body = {
      ...providerForm,
      specialties: providerForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
      service_areas: providerForm.service_areas.split(',').map(s => s.trim()).filter(Boolean),
      languages: providerForm.languages.split(',').map(s => s.trim()).filter(Boolean),
      years_experience: providerForm.years_experience ? parseInt(providerForm.years_experience) : null,
    }
    const url = editingProviderId
      ? `/api/admin/prestataires/${editingProviderId}`
      : '/api/admin/prestataires'
    const method = editingProviderId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      resetProviderForm()
      fetchProviders()
    } else {
      const data = await res.json().catch(() => ({}))
      setProviderError(data.error || 'Erreur lors de la sauvegarde')
    }
  }

  const resetProviderForm = () => {
    setShowProviderForm(false)
    setEditingProviderId(null)
    setProviderError('')
    setProviderForm({ first_name: '', last_name: '', phone: '', email: '', slug: '', category: 'plombier', specialties: '', service_areas: '', languages: 'fr,he', description: '', years_experience: '', osek_number: '', is_referenced: false, status: 'active' })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditProvider = (p: any) => {
    setEditingProviderId(p.id)
    setProviderError('')
    setProviderForm({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      phone: p.phone || '',
      email: p.email || '',
      slug: p.slug || '',
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
    // Scroll to top so the form is visible
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelistProvider = async (id: string) => {
    if (!confirm('Delister ce prestataire ?')) return
    await fetch(`/api/admin/prestataires/${id}`, { method: 'DELETE' })
    fetchProviders()
  }

  const handleToggleReferenced = async (id: string, current: boolean) => {
    await fetch(`/api/admin/prestataires/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_referenced: !current }),
    })
    fetchProviders()
  }
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [changingPlan, setChangingPlan] = useState<string | null>(null)
  const [updatingFeedback, setUpdatingFeedback] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  async function handleChangePlan(userId: string, planId: string) {
    setChangingPlan(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Erreur')
        return
      }
      fetchData()
    } catch {
      alert('Erreur réseau')
    } finally {
      setChangingPlan(null)
    }
  }

  async function handleDeleteUser(userId: string) {
    setDeleting(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
        return
      }
      setDeleteConfirm(null)
      fetchData()
    } catch {
      alert('Erreur réseau')
    } finally {
      setDeleting(null)
    }
  }

  async function handleFeedbackStatus(feedbackId: string, newStatus: string) {
    setUpdatingFeedback(feedbackId)
    try {
      const res = await fetch('/api/admin/feedbacks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feedbackId, status: newStatus }),
      })
      if (!res.ok) {
        alert('Erreur mise à jour')
        return
      }
      // Update local state
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          feedbacks: prev.feedbacks.map(f =>
            f.id === feedbackId ? { ...f, status: newStatus } : f
          ),
          overview: {
            ...prev.overview,
            feedback_new: prev.feedbacks.filter(f =>
              f.id === feedbackId ? newStatus === 'new' : f.status === 'new'
            ).length,
          },
        }
      })
    } catch {
      alert('Erreur réseau')
    } finally {
      setUpdatingFeedback(null)
    }
  }

  async function handleReplyFeedback(feedbackId: string) {
    if (!replyText.trim() || replyText.trim().length < 2) return
    setSendingReply(true)
    try {
      const res = await fetch('/api/admin/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feedbackId, reply: replyText.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.error || 'Erreur envoi')
        return
      }
      // Update local state
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          feedbacks: prev.feedbacks.map(f =>
            f.id === feedbackId ? { ...f, status: 'resolved', admin_note: replyText.trim() } : f
          ),
        }
      })
      setReplyingTo(null)
      setReplyText('')
    } catch {
      alert('Erreur réseau')
    } finally {
      setSendingReply(false)
    }
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
  let filteredUsers = users.filter(u => {
    if (search && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (planFilter !== 'all' && u.plan !== planFilter) return false
    return true
  })

  filteredUsers.sort((a, b) => {
    let aVal: number, bVal: number
    if (sortBy === 'total_documents') {
      aVal = a.total_documents
      bVal = b.total_documents
    } else if (sortBy === 'last_sign_in_at') {
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

  const SortIcon = ({ field }: { field: typeof sortBy }) => {
    if (sortBy !== field) return <ChevronDown size={14} className="text-slate-300" />
    return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
  }

  const emailMap: Record<string, string> = {}
  for (const u of users) emailMap[u.id] = u.email

  // Top doc types sorted
  const sortedDocTypes = Object.entries(doc_type_distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
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
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown size={20} className="text-amber-500" />
                Admin Dashboard
              </h1>
            </div>
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
        {/* KPI Cards — row 1: core metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="Utilisateurs" value={overview.total_users} sub={`+${overview.recent_signups_7d} cette semaine`} color="blue" />
          <KpiCard icon={UserCheck} label="Actifs (7j)" value={overview.active_users_7d} sub={`${overview.active_users_30d} actifs 30j`} color="green" />
          <KpiCard icon={FileText} label="Documents" value={overview.total_documents} sub={`${overview.avg_docs_per_user} moy/user`} color="indigo" />
          <KpiCard icon={DollarSign} label="MRR" value={`${overview.mrr}₪`} sub={`${overview.active_solo} Solo · ${overview.active_family} Famille`} color="amber" />
        </div>

        {/* KPI Cards — row 2: engagement metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Activity} label="Retention 7j" value={`${overview.retention_rate_7d}%`} sub="users anciens revenus" color="green" />
          <KpiCard icon={Percent} label="Conversion" value={`${overview.conversion_rate}%`} sub="free → payant" color="amber" />
          <KpiCard icon={ArrowUpRight} label="Ont upload" value={overview.users_with_docs} sub={`${overview.total_users > 0 ? Math.round(overview.users_with_docs / overview.total_users * 100) : 0}% activation`} color="indigo" />
          <KpiCard icon={MessageSquare} label="Feedbacks" value={feedback_stats.total} sub={`${feedback_stats.new} non lus`} color="blue" badge={feedback_stats.new > 0 ? feedback_stats.new : undefined} />
        </div>

        {/* Trends charts */}
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
              Documents analyses (30j)
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
              Repartition des plans
            </h2>
            <div className="flex gap-4 items-end h-28">
              {(['free', 'solo', 'family'] as const).map(plan => {
                const count = plan_distribution[plan]
                const maxCount = Math.max(...Object.values(plan_distribution), 1)
                const height = Math.max((count / maxCount) * 100, 8)
                return (
                  <div key={plan} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-t-lg transition-all ${plan === 'free' ? 'bg-slate-300 dark:bg-slate-600' : plan === 'solo' ? 'bg-blue-500' : 'bg-purple-500'}`}
                    />
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
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(count / maxDocTypeCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button onClick={() => setTab('overview')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <TrendingUp size={14} className="inline mr-1.5" />
            Vue d&apos;ensemble
          </button>
          <button onClick={() => setTab('users')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Users size={14} className="inline mr-1.5" />
            Utilisateurs ({users.length})
          </button>
          <button onClick={() => setTab('documents')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <FileText size={14} className="inline mr-1.5" />
            Documents ({recent_documents.length})
          </button>
          <button onClick={() => setTab('feedbacks')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'feedbacks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <MessageSquare size={14} className="inline mr-1.5" />
            Feedbacks
            {feedback_stats.new > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {feedback_stats.new}
              </span>
            )}
          </button>
          <button onClick={() => setTab('prestataires')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'prestataires' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <UserCheck size={14} className="inline mr-1.5" />
            Prestataires ({providers.length})
          </button>
          <button onClick={() => setTab('visiteurs')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'visiteurs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Activity size={14} className="inline mr-1.5" />
            Visiteurs
          </button>
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Feedback par categorie</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['bug', 'suggestion', 'question', 'other'] as const).map(cat => {
                const Icon = CATEGORY_ICONS[cat]
                return (
                  <div key={cat} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Icon size={18} className="text-slate-400" />
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
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="all">Tous les plans</option>
                <option value="free">Gratuit</option>
                <option value="solo">Solo</option>
                <option value="family">Famille</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Plan</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-500 cursor-pointer select-none" onClick={() => toggleSort('total_documents')}>
                        <span className="inline-flex items-center gap-1">Docs <SortIcon field="total_documents" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('created_at')}>
                        <span className="inline-flex items-center gap-1">Inscription <SortIcon field="created_at" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('last_sign_in_at')}>
                        <span className="inline-flex items-center gap-1">Derniere connexion <SortIcon field="last_sign_in_at" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Telephone</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-500 hidden xl:table-cell">Connexion</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-500 w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredUsers.map(u => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors"
                        onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-xs">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{u.email}</p>
                              {expandedUser === u.id && (
                                <p className="text-xs text-slate-400 mt-0.5 font-mono">{u.id.slice(0, 8)}...</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <select
                            value={u.plan}
                            onChange={e => handleChangePlan(u.id, e.target.value)}
                            disabled={changingPlan === u.id}
                            className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer disabled:opacity-50 ${PLAN_COLORS[u.plan] || PLAN_COLORS.free}`}
                          >
                            <option value="free">Gratuit</option>
                            <option value="solo">Solo</option>
                            <option value="family">Famille</option>
                          </select>
                          {u.subscription_status !== 'none' && u.subscription_status !== 'active' && (
                            <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[u.subscription_status]}`}>
                              {u.subscription_status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-slate-900 dark:text-white">{u.total_documents}</span>
                          {u.documents_this_month > 0 && (
                            <span className="text-xs text-slate-400 ml-1">({u.documents_this_month} ce mois)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          <span title={formatDate(u.created_at)}>{timeAgo(u.created_at)}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {u.last_sign_in_at ? (
                            <span title={formatDate(u.last_sign_in_at)}>{timeAgo(u.last_sign_in_at)}</span>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {u.phone ? (
                            <a href={`tel:${u.phone}`} className="text-blue-600 hover:underline font-mono text-xs">
                              {u.phone}
                            </a>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.provider === 'google' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            {u.provider === 'google' ? 'Google' : 'Email'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                          {deleteConfirm === u.id ? (
                            <div className="flex items-center gap-1 justify-center">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={deleting === u.id}
                                className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                              >
                                {deleting === u.id ? '...' : 'Oui'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(u.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer ce compte"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-400">Aucun utilisateur trouve</div>
              )}
            </div>
          </div>
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
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <MessageSquare size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aucun feedback pour le moment</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Les feedbacks des utilisateurs apparaitront ici</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedbacks.map(fb => {
                  const CatIcon = CATEGORY_ICONS[fb.category] || MessageSquare
                  return (
                    <div key={fb.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <CatIcon size={18} className="text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                {fb.email || 'Anonyme'}
                              </span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${FEEDBACK_STATUS_COLORS[fb.status] || FEEDBACK_STATUS_COLORS.new}`}>
                                {FEEDBACK_STATUS_LABELS[fb.status] || fb.status}
                              </span>
                              <span className="text-[10px] text-slate-400">{CATEGORY_LABELS[fb.category]}</span>
                              <span className="text-[10px] text-slate-400">{timeAgo(fb.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{fb.message}</p>
                            {fb.admin_note && (
                              <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-2.5">
                                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-0.5">Votre reponse :</p>
                                <p className="text-xs text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{fb.admin_note}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          {fb.email && fb.status !== 'archived' && (
                            <button
                              onClick={() => { setReplyingTo(replyingTo === fb.id ? null : fb.id); setReplyText(fb.admin_note || '') }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Repondre par email"
                            >
                              <MessageSquare size={15} />
                            </button>
                          )}
                          {fb.status === 'new' && (
                            <button
                              onClick={() => handleFeedbackStatus(fb.id, 'read')}
                              disabled={updatingFeedback === fb.id}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Marquer comme lu"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          {(fb.status === 'new' || fb.status === 'read') && (
                            <button
                              onClick={() => handleFeedbackStatus(fb.id, 'resolved')}
                              disabled={updatingFeedback === fb.id}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Marquer comme resolu"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleFeedbackStatus(fb.id, 'archived')}
                            disabled={updatingFeedback === fb.id}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Archiver"
                          >
                            <Archive size={15} />
                          </button>
                        </div>
                      </div>
                      {replyingTo === fb.id && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows={3}
                            placeholder="Votre reponse..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-slate-400">Un email sera envoye a {fb.email}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setReplyingTo(null); setReplyText('') }}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => handleReplyFeedback(fb.id)}
                                disabled={sendingReply || replyText.trim().length < 2}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                {sendingReply ? 'Envoi...' : 'Envoyer'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Prestataires Tab */}
        {tab === 'prestataires' && (
          <div className="space-y-4">
            {/* Stats cards */}
            {annuaireStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Prestataires actifs</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{annuaireStats.providers.active}</p>
                  <p className="text-xs text-slate-400 mt-1">{annuaireStats.providers.pending_applications} en attente</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Contacts demandes</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{annuaireStats.contacts.total}</p>
                  <p className="text-xs text-slate-400 mt-1">{annuaireStats.contacts.today} aujourd&apos;hui</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ce mois-ci</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{annuaireStats.contacts.this_month}</p>
                  <p className="text-xs text-slate-400 mt-1">{annuaireStats.contacts.this_week} sur 7 jours</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avis publies</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{annuaireStats.reviews.published}</p>
                  <p className="text-xs text-slate-400 mt-1">{annuaireStats.reviews.pending} en attente · {annuaireStats.reviews.conversion_rate}% taux</p>
                </div>
              </div>
            )}

            {/* Top contacted this month */}
            {annuaireStats && annuaireStats.top_contacted_this_month.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Top contactes ce mois</h3>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {annuaireStats.top_contacted_this_month.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{p.first_name} {p.last_name?.charAt(0)}.</span>
                        <span className="text-slate-400 ml-2 text-xs">({p.category})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium">{p.contacts} contact{p.contacts > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category breakdown */}
            {annuaireStats && Object.keys(annuaireStats.providers.by_category).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Repartition par categorie</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(annuaireStats.providers.by_category).map(([cat, count]) => (
                    <span key={cat} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {cat} : {count as number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex gap-2 flex-wrap">
              {([
                { key: 'active' as const, label: `Actifs (${providers.length})` },
                { key: 'pending' as const, label: `En attente (${providerApplications.length})` },
              ]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setProviderTab(t.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${providerTab === t.key ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => {
                  if (showProviderForm) {
                    resetProviderForm()
                  } else {
                    setEditingProviderId(null)
                    setProviderError('')
                    setProviderForm({ first_name: '', last_name: '', phone: '', email: '', slug: '', category: 'plombier', specialties: '', service_areas: '', languages: 'fr,he', description: '', years_experience: '', osek_number: '', is_referenced: false, status: 'active' })
                    setShowProviderForm(true)
                  }
                }}
                className="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                + Ajouter un prestataire
              </button>
            </div>

            {/* Add/Edit provider form */}
            {showProviderForm && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
                  {editingProviderId ? 'Modifier le prestataire' : 'Nouveau prestataire'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Prenom *" value={providerForm.first_name} onChange={e => setProviderForm(f => ({ ...f, first_name: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="Nom *" value={providerForm.last_name} onChange={e => setProviderForm(f => ({ ...f, last_name: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="Telephone *" value={providerForm.phone} onChange={e => setProviderForm(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="Email" value={providerForm.email} onChange={e => setProviderForm(f => ({ ...f, email: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="Slug * (ex: david-m)" value={providerForm.slug} onChange={e => setProviderForm(f => ({ ...f, slug: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <select value={providerForm.category} onChange={e => setProviderForm(f => ({ ...f, category: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm">
                    <option value="plombier">Plombier</option>
                    <option value="electricien">Electricien</option>
                    <option value="peintre">Peintre</option>
                    <option value="serrurier">Serrurier</option>
                    <option value="climatisation">Climatisation</option>
                    <option value="bricoleur">Bricoleur</option>
                  </select>
                  <input placeholder="Specialites (virgules)" value={providerForm.specialties} onChange={e => setProviderForm(f => ({ ...f, specialties: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="Villes (virgules)" value={providerForm.service_areas} onChange={e => setProviderForm(f => ({ ...f, service_areas: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="Langues (virgules)" value={providerForm.languages} onChange={e => setProviderForm(f => ({ ...f, languages: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="Annees d'experience" type="number" value={providerForm.years_experience} onChange={e => setProviderForm(f => ({ ...f, years_experience: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <input placeholder="N° Osek" value={providerForm.osek_number} onChange={e => setProviderForm(f => ({ ...f, osek_number: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={providerForm.is_referenced} onChange={e => setProviderForm(f => ({ ...f, is_referenced: e.target.checked }))} />
                    Reference par Tloush
                  </label>
                </div>
                <textarea placeholder="Description" value={providerForm.description} onChange={e => setProviderForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" rows={3} />
                {providerError && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                    {providerError}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveProvider} className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">Enregistrer</button>
                  <button onClick={resetProviderForm} className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">Annuler</button>
                </div>
              </div>
            )}

            {/* Provider list */}
            {providerLoading ? (
              <div className="text-center py-8 text-slate-400"><RefreshCw size={20} className="animate-spin mx-auto" /></div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Prestataire</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Categorie</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Villes</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Note</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Statut</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {(providerTab === 'active' ? providers : providerApplications).map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 dark:text-white">{p.first_name} {p.last_name?.charAt(0)}.</div>
                          <div className="text-xs text-slate-400">{p.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{(p.service_areas || []).join(', ')}</td>
                        <td className="px-4 py-3">
                          {p.total_reviews > 0 ? (
                            <span className="font-medium">{Number(p.average_rating).toFixed(1)} <span className="text-slate-400">({p.total_reviews})</span></span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_referenced ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-600'}`}>
                            {p.is_referenced ? 'Reference' : 'Non ref.'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditProvider(p)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 dark:hover:bg-amber-900/30"
                              title="Modifier"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleReferenced(p.id, p.is_referenced)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/30"
                              title={p.is_referenced ? 'Retirer le badge' : 'Ajouter le badge'}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <a
                              href={`/annuaire/${p.category}/${p.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-700"
                              title="Voir la fiche"
                            >
                              <Eye size={14} />
                            </a>
                            <button
                              onClick={() => handleDelistProvider(p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 dark:hover:bg-red-900/30"
                              title="Delister"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(providerTab === 'active' ? providers : providerApplications).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          Aucun prestataire {providerTab === 'active' ? 'actif' : 'en attente'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Visiteurs Tab */}
        {tab === 'visiteurs' && (
          <div className="space-y-4">
            {visitorLoading && !visitorStats ? (
              <div className="text-center py-16 text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
                <p className="text-sm">Chargement des statistiques...</p>
              </div>
            ) : !visitorStats ? (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-2">Aucune donnee de visiteur</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Assurez-vous que la table <code>page_views</code> a ete creee dans Supabase (migration <code>analytics.sql</code>).
                </p>
              </div>
            ) : (
              <>
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Visiteurs aujourd&apos;hui</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.today_visitors}</p>
                    <p className="text-xs text-slate-400 mt-1">{visitorStats.totals.today_views} pages vues</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Visiteurs 7 jours</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.week_visitors}</p>
                    <p className="text-xs text-slate-400 mt-1">{visitorStats.totals.week_views} pages vues</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Visiteurs ce mois</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.month_visitors}</p>
                    <p className="text-xs text-slate-400 mt-1">{visitorStats.totals.month_views} pages vues</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total (depuis le debut)</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{visitorStats.totals.all_time_views}</p>
                    <p className="text-xs text-slate-400 mt-1">pages vues</p>
                  </div>
                </div>

                {/* Daily trend chart (simple bars) */}
                {visitorStats.daily_trend.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Evolution (30 derniers jours)</h3>
                    <div className="flex items-end gap-1 h-32">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {visitorStats.daily_trend.map((d: any) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const maxViews = Math.max(...visitorStats.daily_trend.map((x: any) => x.views), 1)
                        const height = (d.views / maxViews) * 100
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                            <div
                              className="w-full bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                              style={{ height: `${height}%` }}
                            />
                            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                              {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}: {d.views} vues / {d.visitors} visiteurs
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Top pages */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Pages les plus visitees</h3>
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {visitorStats.top_pages.slice(0, 10).map((p: any) => (
                        <div key={p.path} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[70%]" title={p.path}>{p.path}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-200 ml-2">{p.count}</span>
                        </div>
                      ))}
                      {visitorStats.top_pages.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">Aucune donnee</p>
                      )}
                    </div>
                  </div>

                  {/* Top sources */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Sources de trafic</h3>
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {visitorStats.top_referrers.slice(0, 10).map((r: any) => (
                        <div key={r.source} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-300">{r.source}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-200">{r.count}</span>
                        </div>
                      ))}
                      {visitorStats.top_referrers.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">Aucune donnee</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Countries */}
                {visitorStats.top_countries.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Top pays</h3>
                    <div className="flex flex-wrap gap-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {visitorStats.top_countries.map((c: any) => (
                        <span key={c.country} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {c.country} : {c.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

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
