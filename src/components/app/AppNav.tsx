'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, LayoutDashboard, MessageSquare, BarChart3, Users, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Assistant', href: '/assistant', icon: MessageSquare },
  { label: 'Comparer', href: '/compare', icon: BarChart3 },
  { label: 'Experts', href: '/experts', icon: Users },
  { label: 'Profil', href: '/profile', icon: User },
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop: horizontal nav under header */}
      <nav className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around px-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[44px] px-2 rounded-lg transition-colors ${
                  isActive ? 'text-brand-600' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
