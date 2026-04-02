'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function AppHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/inbox" className="text-xl font-extrabold text-brand-600 hover:opacity-80 transition-opacity">
          Tloush
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:block">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 min-h-[44px] px-3 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
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
