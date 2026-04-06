'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Users, FileText, CreditCard, TrendingUp, RefreshCw, Search,
  ArrowLeft, ChevronDown, ChevronUp, Clock, UserCheck, AlertCircle,
  Crown, UserPlus, Activity, DollarSign, BarChart3, Eye
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

interface AdminData {
  overview: {
    total_users: number
    recent_signups_7d: number
    active_users_7d: number
    total_documents: number
    mrr: number
    active_solo: number
    active_family: number
  }
  plan_distribution: { free: number; solo: number; family: number }
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

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'last_sign_in_at' | 'total_documents'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [tab, setTab] = useState<'users' | 'documents'>('users')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

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

  const { overview, plan_distribution, users, recent_documents } = data

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

  // Map user_id to email for recent docs
  const emailMap: Record<string, string> = {}
  for (const u of users) emailMap[u.id] = u.email

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
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="Utilisateurs" value={overview.total_users} sub={`+${overview.recent_signups_7d} cette semaine`} color="blue" />
          <KpiCard icon={UserCheck} label="Actifs (7j)" value={overview.active_users_7d} sub={`${overview.total_users > 0 ? Math.round(overview.active_users_7d / overview.total_users * 100) : 0}% du total`} color="green" />
          <KpiCard icon={FileText} label="Documents" value={overview.total_documents} sub="analysés au total" color="indigo" />
          <KpiCard icon={DollarSign} label="MRR" value={`${overview.mrr}₪`} sub={`${overview.active_solo} Solo · ${overview.active_family} Famille`} color="amber" />
        </div>

        {/* Plan Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={16} />
            Répartition des plans
          </h2>
          <div className="flex gap-4 items-end h-32">
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

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setTab('users')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Users size={14} className="inline mr-1.5" />
            Utilisateurs ({users.length})
          </button>
          <button onClick={() => setTab('documents')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <FileText size={14} className="inline mr-1.5" />
            Documents récents ({recent_documents.length})
          </button>
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Filters */}
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

            {/* Users Table */}
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
                        <span className="inline-flex items-center gap-1">Dernière connexion <SortIcon field="last_sign_in_at" /></span>
                      </th>
                      <th className="text-center px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Connexion</th>
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
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[u.plan] || PLAN_COLORS.free}`}>
                            {PLAN_LABELS[u.plan] || 'Gratuit'}
                          </span>
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
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.provider === 'google' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            {u.provider === 'google' ? 'Google' : 'Email'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-400">Aucun utilisateur trouvé</div>
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
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Résumé</th>
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
      </div>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType, label: string, value: string | number, sub: string, color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
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
