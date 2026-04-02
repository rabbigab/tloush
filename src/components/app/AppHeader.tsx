'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function AppHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const { theme, toggle } = useTheme()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 shadow-lg shadow-blue-500/10 dark:shadow-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/inbox" className="flex items-center gap-3 group">
          <Image src="/icon.png" alt="Tloush" width={38} height={38} className="rounded-xl group-hover:scale-105 transition-transform" />
          <span className="text-xl font-extrabold text-white tracking-tight">
            Tloush
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <span className="text-sm text-blue-100 dark:text-slate-400 hidden sm:block mr-2 font-medium">{userEmail}</span>
          <button
            onClick={toggle}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-blue-100 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 min-h-[44px] px-3 text-sm text-blue-100 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Se deconnecter"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Deconnexion</span>
          </button>
        </div>
      </div>
    </header>
  )
}
