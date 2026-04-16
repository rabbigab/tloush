'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, MessageSquare, Scale, Users, User, MoreHorizontal, X, Wallet, Folder, Gift, HelpCircle, Calculator, Shield, FileText, Building2, Briefcase, Landmark, Wrench, ChevronDown, Search, HeartPulse, GitCompareArrows, FileSpreadsheet, Star, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'

// Desktop: core items always visible + "Outils" dropdown
const CORE_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes documents', href: '/folders', icon: Folder },
  { label: 'Depenses', href: '/expenses', icon: Wallet },
  { label: 'Assistant', href: '/assistant', icon: MessageSquare },
]

// Grouped under "Outils" dropdown on desktop — organized by category
const TOOLS_SECTIONS = [
  {
    title: 'Calculateurs',
    items: [
      { label: 'Simulateur salaire', href: '/calculateurs/brut-net', icon: Calculator },
      { label: 'Freelance', href: '/freelance', icon: Briefcase },
      { label: 'Comparer tlushs', href: '/compare', icon: GitCompareArrows },
      { label: 'Evolution annuelle', href: '/payslips/annual', icon: TrendingUp },
    ],
  },
  {
    title: 'Droits & Infos',
    items: [
      { label: 'Detecter mes aides', href: '/rights-detector', icon: Sparkles },
      { label: 'Droits du salarie', href: '/rights-check', icon: Shield },
      { label: 'Droits olim', href: '/droits-olim', icon: Scale },
      { label: 'Miluim', href: '/miluim', icon: ShieldCheck },
      { label: 'Bituach Leumi', href: '/bituach-leumi', icon: Building2 },
      { label: 'Guide assurances', href: '/assurances', icon: HeartPulse },
      { label: 'Courriers', href: '/letters', icon: FileText },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Remboursement impots', href: '/tax-refund', icon: Calculator },
      { label: 'Mashkanta', href: '/mashkanta', icon: Landmark },
      { label: 'Import bancaire', href: '/bank-import', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Autres',
    items: [
      { label: 'Parrainage', href: '/referral', icon: Gift },
      { label: 'Aide', href: '/aide', icon: HelpCircle },
    ],
  },
]

// Flat list of all tools for active state detection
const ALL_TOOLS = TOOLS_SECTIONS.flatMap(s => s.items)

const SECONDARY_NAV = [
  { label: 'Annuaire', href: '/annuaire', icon: Star },
  { label: 'Experts', href: '/experts', icon: Users },
  { label: 'Profil', href: '/profile', icon: User },
]

// Mobile: show 4 main items + "Plus" for the rest
const MOBILE_MAIN = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes documents', href: '/folders', icon: Folder },
  { label: 'Assistant', href: '/assistant', icon: MessageSquare },
  { label: 'Profil', href: '/profile', icon: User },
]

// Mobile "Plus" menu: organized with section headers
const MOBILE_SECTIONS = [
  {
    title: 'Services',
    items: [
      { label: 'Annuaire', href: '/annuaire', icon: Star },
    ],
  },
  {
    title: 'Documents',
    items: [
      { label: 'Depenses', href: '/expenses', icon: Wallet },
      { label: 'Ma famille', href: '/family', icon: Users },
    ],
  },
  {
    title: 'Calculateurs',
    items: [
      { label: 'Simulateur salaire', href: '/calculateurs/brut-net', icon: Calculator },
      { label: 'Freelance', href: '/freelance', icon: Briefcase },
      { label: 'Comparer tlushs', href: '/compare', icon: GitCompareArrows },
      { label: 'Evolution annuelle', href: '/payslips/annual', icon: TrendingUp },
    ],
  },
  {
    title: 'Droits & Infos',
    items: [
      { label: 'Detecter mes aides', href: '/rights-detector', icon: Sparkles },
      { label: 'Droits du salarie', href: '/rights-check', icon: Shield },
      { label: 'Droits olim', href: '/droits-olim', icon: Scale },
      { label: 'Bituach Leumi', href: '/bituach-leumi', icon: Building2 },
      { label: 'Guide assurances', href: '/assurances', icon: HeartPulse },
      { label: 'Courriers', href: '/letters', icon: FileText },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Remboursement impots', href: '/tax-refund', icon: Calculator },
      { label: 'Mashkanta', href: '/mashkanta', icon: Landmark },
      { label: 'Import bancaire', href: '/bank-import', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Autres',
    items: [
      { label: 'Recherche', href: '/search', icon: Search },
      { label: 'Experts', href: '/experts', icon: Users },
      { label: 'Parrainage', href: '/referral', icon: Gift },
      { label: 'Aide', href: '/aide', icon: HelpCircle },
    ],
  },
]

export default function AppNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const toolsRef = useRef<HTMLDivElement>(null)

  function toggleSection(title: string) {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

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

  const isToolActive = ALL_TOOLS.some(t => pathname === t.href || pathname.startsWith(t.href + '/'))

  return (
    <>
      {/* Desktop: pill-style nav */}
      <nav aria-label="Navigation principale" className="hidden md:block bg-slate-50 dark:bg-slate-950 py-2 relative z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 shadow-sm overflow-visible">
            {CORE_NAV.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}

            {/* Outils dropdown */}
            <div ref={toolsRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                aria-expanded={toolsOpen}
                aria-haspopup="true"
                aria-label="Menu Outils"
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isToolActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Wrench size={16} aria-hidden="true" />
                Outils
                <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div role="menu" className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  {TOOLS_SECTIONS.map((section, idx) => (
                    <div key={section.title}>
                      {idx > 0 && <div className="border-t border-slate-100 dark:border-slate-800 my-1" />}
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 pt-2 pb-1">
                        {section.title}
                      </p>
                      {section.items.map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setToolsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <item.icon size={16} aria-hidden="true" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search icon */}
            <Link
              href="/search"
              aria-current={pathname === '/search' ? 'page' : undefined}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                pathname === '/search'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Recherche"
              aria-label="Recherche"
            >
              <Search size={16} aria-hidden="true" />
            </Link>

            {SECONDARY_NAV.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile: bottom tab bar (4 items + Plus) */}
      <nav aria-label="Navigation mobile" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 pb-[env(safe-area-inset-bottom)]">
        {/* More menu popup */}
        {moreOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg px-4 py-3 max-h-[65vh] overflow-y-auto">
            {MOBILE_SECTIONS.map(section => (
              <div key={section.title} className="mb-2">
                <button
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={!collapsedSections[section.title]}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  {section.title}
                  <ChevronDown size={12} aria-hidden="true" className={`transition-transform ${collapsedSections[section.title] ? '' : 'rotate-180'}`} />
                </button>
                {!collapsedSections[section.title] && section.items.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <item.icon size={18} aria-hidden="true" />
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
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[48px] px-3 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
                  <item.icon size={22} aria-hidden="true" />
                </div>
                <span className={`text-xs font-semibold leading-tight ${isActive ? '' : 'font-medium'}`}>{item.label}</span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-label="Plus d'options"
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[48px] px-3 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              moreOpen || [...ALL_TOOLS, ...SECONDARY_NAV].some(i => pathname === i.href || pathname.startsWith(i.href + '/'))
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${moreOpen ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              {moreOpen ? <X size={22} aria-hidden="true" /> : <MoreHorizontal size={22} aria-hidden="true" />}
            </div>
            <span className="text-xs font-medium leading-tight">Plus</span>
          </button>
        </div>
      </nav>
    </>
  )
}
