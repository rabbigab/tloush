'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Inbox, LayoutDashboard, MessageSquare, BarChart3, Scale, Users, User, MoreHorizontal, X, Wallet, Folder, Gift, HelpCircle, Calculator, Shield } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Dossiers', href: '/folders', icon: Folder },
  { label: 'Dépenses', href: '/expenses', icon: Wallet },
  { label: 'Simulateur', href: '/calculator', icon: Calculator },
  { label: 'Mes droits', href: '/rights-check', icon: Shield },
  { label: 'Assistant', href: '/assistant', icon: MessageSquare },
  { label: 'Droits olim', href: '/droits-olim', icon: Scale },
  { label: 'Experts', href: '/experts', icon: Users },
  { label: 'Parrainage', href: '/referral', icon: Gift },
  { label: 'Aide', href: '/help', icon: HelpCircle },
  { label: 'Profil', href: '/profile', icon: User },
]

// Mobile: show only 4 main items + "Plus" menu for the rest
const MOBILE_MAIN = [
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Assistant', href: '/assistant', icon: MessageSquare },
  { label: 'Profil', href: '/profile', icon: User },
]

const MOBILE_MORE = [
  { label: 'Dossiers', href: '/folders', icon: Folder },
  { label: 'Dépenses', href: '/expenses', icon: Wallet },
  { label: 'Simulateur', href: '/calculator', icon: Calculator },
  { label: 'Mes droits', href: '/rights-check', icon: Shield },
  { label: 'Comparer', href: '/compare', icon: BarChart3 },
  { label: 'Droits des olim', href: '/droits-olim', icon: Scale },
  { label: 'Experts', href: '/experts', icon: Users },
  { label: 'Parrainage', href: '/referral', icon: Gift },
  { label: 'Aide', href: '/help', icon: HelpCircle },
]

export default function AppNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      {/* Desktop: pill-style nav */}
      <nav className="hidden md:block bg-slate-50 dark:bg-slate-950 py-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 shadow-sm">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile: bottom tab bar (4 items + Plus) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 pb-[env(safe-area-inset-bottom)]">
        {/* More menu popup */}
        {moreOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg px-4 py-3 space-y-1">
            {MOBILE_MORE.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}

        <div className="flex justify-around px-2">
          {MOBILE_MAIN.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[48px] px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <div className={`p-1 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
                  <item.icon size={22} />
                </div>
                <span className={`text-xs font-semibold leading-tight ${isActive ? '' : 'font-medium'}`}>{item.label}</span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[48px] px-3 rounded-lg transition-all duration-200 ${
              moreOpen || MOBILE_MORE.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all duration-200 ${moreOpen ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              {moreOpen ? <X size={22} /> : <MoreHorizontal size={22} />}
            </div>
            <span className="text-xs font-medium leading-tight">Plus</span>
          </button>
        </div>
      </nav>
    </>
  )
}
