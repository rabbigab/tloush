const STORAGE_KEY = 'tloush_report_history'
const MAX_REPORTS = 20

interface SavedReport {
  id: string
  documentType: string
  fileName: string
  savedAt: string
  data: unknown
}

export const reportHistory = {
  save: (report: { id?: string; documentType: string; fileName: string; data: unknown }) => {
    if (typeof window === 'undefined') return
    try {
      const existing = reportHistory.loadAll()
      const entry: SavedReport = {
        id: report.id || crypto.randomUUID(),
        documentType: report.documentType,
        fileName: report.fileName,
        savedAt: new Date().toISOString(),
        data: report.data,
      }
      const updated = [entry, ...existing.filter(r => r.id !== entry.id)].slice(0, MAX_REPORTS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      console.warn('[reportHistory] Failed to save report')
    }
  },

  loadAll: (): SavedReport[] => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  load: (id: string): SavedReport | null => {
    return reportHistory.loadAll().find(r => r.id === id) || null
  },

  remove: (id: string) => {
    if (typeof window === 'undefined') return
    try {
      const existing = reportHistory.loadAll().filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    } catch {
      console.warn('[reportHistory] Failed to remove report')
    }
  },
}
