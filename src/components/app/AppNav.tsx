'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Inbox, LayoutDashboard, MessageSquare, Scale, Users, User, MoreHorizontal, X, Wallet, Folder, Gift, HelpCircle, Calculator, Shield, FileText, Building2, Briefcase, Home, Landmark, Wrench, ChevronDown, Search, HeartPulse, GitCompareArrows } from 'lucide-react'

// Desktop: core items always visible + "Outils" dropdown
const CORE_NAV = [
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Dossiers', href: '/folders', icon: Folder },
  { label: 'Depenses', href: '/expenses', icon: Wallet },
  { label: 'Assistant', href: '/assistant', icon: MessageSquare },
]

// Grouped under "Outils" dropdown on desktop
const TOOLS_NAV = [
  { label: 'Simulateur salaire', href: '/calculator', icon: Calculator },
  { label: 'Mes droits', href: '/rights-check', icon: Shield },
  { label: 'Courriers', href: '/letters', icon: FileText },
  { label: 'Bituach Leumi', href: '/bituach-leumi', icon: Building2 },
  { label: 'Freelance', href: '/freelance', icon: Briefcase },
  { label: 'Arnona', href: '/arnona', icon: Home },
  { label: 'Mashkanta', href: '/mashkanta', icon: Landmark },
  { label: 'Verification employeur', href: '/company-check', icon: Search },
  { label: 'Guide assurances', href: '/assurances', icon: HeartPulse },
  { label: 'Droits olim', href: '/droits-olim', icon: Scale },
  { label: 'Comparer tlushs', href: '/compare', icon: GitCompareArrows },
]

const SECONDARY_NAV = [
  { label: 'Experts', href: '/experts', icon: Users },
  { label: 'Parrainage', href: '/referral', icon: Gift },
  { label: 'Aide', href: '/help', icon: HelpCircle },
  { label: 'Profil', href: '/profile', icon: User },
]

// Mobile: show 4 main items + "Plus" for the rest
const MOBILE_MAIN = [
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Assistant', href: '/assistant', icon: MessageSquare },
  { label: 'Profil', href: '/profile', icon: User },
]

// Mobile "Plus" menu: organized with section headers
const MOBILE_SECTIONS = [
  {
    title: 'Documents',
    items: [
      { label: 'Dossiers', href: '/folders', icon: Folder },
      { label: 'Depenses', href: '/expenses', icon: Wallet },
    ],
  },
  {
    title: 'Outils',
    items: [
      { label: 'Simulateur salaire', href: '/calculator', icon: Calculator },
      { label: 'Mes droits', href: '/rights-check', icon: Shield },
      { label: 'Courriers', href: '/letters', icon: FileText },
      { label: 'Bituach Leumi', href: '/bituach-leumi', icon: Building2 },
      { label: 'Freelance', href: '/freelance', icon: Briefcase },
      { label: 'Arnona', href: '/arnona', icon: Home },
      { label: 'Mashkanta', href: '/mashkanta', icon: Landmark },
      { label: 'Verification employeur', href: '/company-check', icon: Search },
      { label: 'Guide assurances', href: '/assurances', icon: HeartPulse },
      { label: 'Droits olim', href: '/droits-olim', icon: Scale },
      { label: 'Comparer tlushs', href: '/compare', icon: GitCompareArrows },
    ],
  },
  {
    title: 'Autres',
    items: [
      { label: 'Recherche', href: '/search', icon: Search },
      { label: 'Experts', href: '/experts', icon: Users },
      { label: 'Parrainage', href: '/referral', icon: Gift },
      { label: 'Aide', href: '/help', icon: HelpCircle },
    ],
  },
]

export default function AppNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)

  // Close tools dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    if (toolsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [toolsOpen])

  const isToolActive = TOOLS_NAV.some(t => pathname === t.href || pathname.startsWith(t.href + '/'))

  return (
    <>
      {/* Desktop: pill-style nav */}
      <nav className="hidden md:block bg-slate-50 dark:bg-slate-950 py-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 shadow-sm">
            {CORE_NAV.map(item => {
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

            {/* Outils dropdown */}
            <div ref={toolsRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isToolActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Wrench size={16} />
                Outils
                <ChevronDown size={14} className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  {TOOLS_NAV.map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Search icon */}
            <Link
              href="/search"
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                pathname === '/search'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Recherche"
            >
              <Search size={16} />
            </Link>

            {SECONDARY_NAV.map(item => {
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
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg px-4 py-3 max-h-[70vh] overflow-y-auto">
            {MOBILE_SECTIONS.map(section => (
              <div key={section.title} className="mb-3">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 py-1">
                  {section.title}
                </p>
                {section.items.map(item => {
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
            ))}
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
              moreOpen || [...TOOLS_NAV, ...SECONDARY_NAV].some(i => pathname === i.href || pathname.startsWith(i.href + '/'))
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
