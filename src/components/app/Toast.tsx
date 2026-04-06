'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const icons = {
    success: <CheckCircle size={16} className="text-green-500 shrink-0" />,
    error: <AlertTriangle size={16} className="text-red-500 shrink-0" />,
    info: <Info size={16} className="text-blue-500 shrink-0" />,
  }

  const bg = {
    success: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in-right ${bg[t.type]}`}
          >
            {icons[t.type]}
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
