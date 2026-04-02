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
      <nav className="hidden md:block bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
        <div className="flex justify-around py-1.5 px-2">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
