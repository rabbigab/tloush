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

      {/* Mobile: bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around px-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[44px] px-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <div className={`p-1 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
                  <item.icon size={22} />
                </div>
                <span className={`text-[10px] font-semibold leading-tight ${isActive ? '' : 'font-medium'}`}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
