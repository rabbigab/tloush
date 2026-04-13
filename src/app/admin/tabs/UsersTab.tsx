'use client'

import { Search, ChevronDown, ChevronUp, Trash2, Phone } from 'lucide-react'
import {
  UserData,
  PLAN_LABELS, PLAN_COLORS, STATUS_COLORS,
  timeAgo, formatDate,
} from '../types'

interface UsersTabProps {
  filteredUsers: UserData[]
  search: string
  setSearch: (v: string) => void
  planFilter: string
  setPlanFilter: (v: string) => void
  sortBy: 'created_at' | 'last_sign_in_at' | 'total_documents'
  sortDir: 'asc' | 'desc'
  toggleSort: (field: 'created_at' | 'last_sign_in_at' | 'total_documents') => void
  expandedUser: string | null
  setExpandedUser: (v: string | null) => void
  deleteConfirm: string | null
  setDeleteConfirm: (v: string | null) => void
  deleting: string | null
  changingPlan: string | null
  handleChangePlan: (userId: string, planId: string) => void
  handleDeleteUser: (userId: string) => void
}

function SortIcon({ field, sortBy, sortDir }: {
  field: 'created_at' | 'last_sign_in_at' | 'total_documents'
  sortBy: UsersTabProps['sortBy']
  sortDir: UsersTabProps['sortDir']
}) {
  if (sortBy !== field) return <ChevronDown size={14} className="text-slate-300" />
  return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
}

export function UsersTab({
  filteredUsers, search, setSearch, planFilter, setPlanFilter,
  sortBy, sortDir, toggleSort,
  expandedUser, setExpandedUser,
  deleteConfirm, setDeleteConfirm,
  deleting, changingPlan,
  handleChangePlan, handleDeleteUser,
}: UsersTabProps) {
  return (
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
                <th
                  className="text-center px-4 py-3 font-medium text-slate-500 cursor-pointer select-none"
                  onClick={() => toggleSort('total_documents')}
                  role="button" tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleSort('total_documents')}
                  aria-sort={sortBy === 'total_documents' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="inline-flex items-center gap-1">Docs <SortIcon field="total_documents" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none hidden md:table-cell"
                  onClick={() => toggleSort('created_at')}
                  role="button" tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleSort('created_at')}
                  aria-sort={sortBy === 'created_at' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="inline-flex items-center gap-1">Inscription <SortIcon field="created_at" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none hidden md:table-cell"
                  onClick={() => toggleSort('last_sign_in_at')}
                  role="button" tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleSort('last_sign_in_at')}
                  aria-sort={sortBy === 'last_sign_in_at' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="inline-flex items-center gap-1">Derniere connexion <SortIcon field="last_sign_in_at" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">
                  <Phone size={14} className="inline mr-1" />Telephone
                </th>
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
                      {Object.entries(PLAN_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
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
  )
}
