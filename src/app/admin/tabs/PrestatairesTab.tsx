'use client'

import { RefreshCw, Check, UserX, Pencil, CheckCircle, Eye, Trash2 } from 'lucide-react'

interface ProviderForm {
  first_name: string
  last_name: string
  phone: string
  email: string
  slug: string
  category: string
  specialties: string
  service_areas: string
  languages: string
  description: string
  years_experience: string
  osek_number: string
  is_referenced: boolean
  status: string
}

interface PrestatairesTabProps {
  providers: any[]
  providerApplications: any[]
  providerTab: 'active' | 'pending' | 'applications' | 'reviews'
  setProviderTab: (v: 'active' | 'pending' | 'applications' | 'reviews') => void
  providerLoading: boolean
  showProviderForm: boolean
  providerForm: ProviderForm
  setProviderForm: (fn: (prev: ProviderForm) => ProviderForm) => void
  editingProviderId: string | null
  setEditingProviderId: (v: string | null) => void
  providerError: string
  setProviderError: (v: string) => void
  setShowProviderForm: (v: boolean) => void
  annuaireStats: any
  handleSaveProvider: () => void
  resetProviderForm: () => void
  handleEditProvider: (p: any) => void
  handleDelistProvider: (id: string) => void
  handleToggleReferenced: (id: string, current: boolean) => void
  handleApproveApplication: (app: any) => void
  handleRejectApplication: (app: any) => void
}

export function PrestatairesTab({
  providers, providerApplications,
  providerTab, setProviderTab,
  providerLoading, showProviderForm,
  providerForm, setProviderForm,
  editingProviderId,
  providerError, setProviderError,
  annuaireStats,
  setShowProviderForm,
  handleSaveProvider, resetProviderForm,
  handleEditProvider, handleDelistProvider,
  handleToggleReferenced, handleApproveApplication, handleRejectApplication,
}: PrestatairesTabProps) {
  return (
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Contacts demandés</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{annuaireStats.contacts.total}</p>
            <p className="text-xs text-slate-400 mt-1">{annuaireStats.contacts.today} aujourd&apos;hui</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Ce mois-ci</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{annuaireStats.contacts.this_month}</p>
            <p className="text-xs text-slate-400 mt-1">{annuaireStats.contacts.this_week} sur 7 jours</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Avis publiés</p>
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
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Répartition par catégorie</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(annuaireStats.providers.by_category).map(([cat, count]) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                {cat} : {count as number}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tabs + Add button */}
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
              setProviderForm(() => ({ first_name: '', last_name: '', phone: '', email: '', slug: '', category: 'plombier', specialties: '', service_areas: '', languages: 'fr,he', description: '', years_experience: '', osek_number: '', is_referenced: false, status: 'active' }))
              setProviderError('')
              setShowProviderForm(true)
            }
          }}
          className="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          {showProviderForm ? 'Annuler' : '+ Ajouter un prestataire'}
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
            <input placeholder="Annees d&apos;experience" type="number" value={providerForm.years_experience} onChange={e => setProviderForm(f => ({ ...f, years_experience: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
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
                <th className="text-left px-4 py-3 font-medium text-slate-500">Catégorie</th>
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
                    {providerTab === 'pending' && p.email && (
                      <div className="text-xs text-slate-400">{p.email}</div>
                    )}
                    {providerTab === 'pending' && p.description && (
                      <div className="text-xs text-blue-500 dark:text-blue-400 mt-1 max-w-xs truncate" title={p.description}>{p.description}</div>
                    )}
                    {providerTab === 'pending' && p.created_at && (
                      <div className="text-xs text-slate-300 mt-0.5">{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                    )}
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
                      {providerTab === 'pending' ? (
                        <>
                          <button onClick={() => handleApproveApplication(p)} className="px-2.5 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-300 text-xs font-medium flex items-center gap-1" title="Valider cette candidature"><Check size={13} /> Valider</button>
                          <button onClick={() => handleRejectApplication(p)} className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300 text-xs font-medium flex items-center gap-1" title="Rejeter cette candidature"><UserX size={13} /> Rejeter</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditProvider(p)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 dark:hover:bg-amber-900/30" title="Modifier"><Pencil size={14} /></button>
                          <button onClick={() => handleToggleReferenced(p.id, p.is_referenced)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/30" title={p.is_referenced ? 'Retirer le badge' : 'Ajouter le badge'}><CheckCircle size={14} /></button>
                          <a href={`/annuaire/${p.category}/${p.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-700" title="Voir la fiche"><Eye size={14} /></a>
                          <button onClick={() => handleDelistProvider(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 dark:hover:bg-red-900/30" title="Delister"><Trash2 size={14} /></button>
                        </>
                      )}
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
  )
}
