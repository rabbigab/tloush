'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, MessageSquare, Scale, Users, User, MoreHorizontal, X, Wallet, Folder, Gift, HelpCircle, Calculator, Shield, FileText, Briefcase, Landmark, ChevronDown, Search, HeartPulse, GitCompareArrows, FileSpreadsheet, Star, ShieldCheck, Sparkles, TrendingUp, Plane, Baby, FileMinus2, BedDouble } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Desktop : items toujours visibles dans la barre
const CORE_NAV = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes documents', href: '/mes-documents', icon: Folder },
  { label: 'Assistant IA', href: '/assistant-ia', icon: MessageSquare },
]

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface NavDropdown {
  title: string
  icon: LucideIcon
  items: NavItem[]
}

// 3 dropdowns thematiques (P2 — eclatement de l'ancien dropdown "Outils")
const DROPDOWNS: NavDropdown[] = [
  {
    title: 'Calculateurs',
    icon: Calculator,
    items: [
      { label: 'Brut → Net', href: '/calculateurs/brut-net', icon: Calculator },
      { label: 'Freelance', href: '/freelance', icon: Briefcase },
      { label: 'Comparer mes fiches', href: '/comparer-fiches', icon: GitCompareArrows },
      { label: 'Evolution annuelle', href: '/payslips/annual', icon: TrendingUp },
      { label: 'Conge maternite', href: '/calculateurs/maternite', icon: Baby },
      { label: 'Pitzuim', href: '/calculateurs/indemnites', icon: FileMinus2 },
      { label: 'Solde conges', href: '/calculateurs/conges', icon: BedDouble },
    ],
  },
  {
    title: 'Mes droits',
    icon: Shield,
    items: [
      { label: 'Detecter mes aides', href: '/aides', icon: Sparkles },
      { label: 'Droits du travail', href: '/aides?tab=travail', icon: Scale },
      { label: 'Aides olim', href: '/aides/olim', icon: Plane },
      { label: 'Miluim', href: '/miluim', icon: ShieldCheck },
    ],
  },
  {
    title: 'Finances',
    icon: Landmark,
    items: [
      { label: 'Remboursement impots', href: '/aides/tax-refund', icon: Calculator },
      { label: 'Mashkanta', href: '/mashkanta', icon: Landmark },
      { label: 'Import bancaire', href: '/import-bancaire', icon: FileSpreadsheet },
      { label: 'Assurances', href: '/assurances', icon: HeartPulse },
      { label: 'Depenses', href: '/expenses', icon: Wallet },
    ],
  },
]

// Flat list pour active-state detection
const ALL_DROPDOWN_ITEMS = DROPDOWNS.flatMap(d => d.items)

// Items secondaires (a droite) : annuaire + courriers + parrainage + profil
const SECONDARY_NAV: NavItem[] = [
  { label: 'Annuaire', href: '/annuaire', icon: Star },
  { label: 'Courriers', href: '/letters', icon: FileText },
  { label: 'Parrainage', href: '/parrainage', icon: Gift },
  { label: 'Profil', href: '/profile', icon: User },
]

// Mobile : 4 items principaux dans la bottom tab bar
const MOBILE_MAIN = [
  { label: 'Accueil', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes documents', href: '/mes-documents', icon: Folder },
  { label: 'Assistant', href: '/assistant-ia', icon: MessageSquare },
  { label: 'Profil', href: '/profile', icon: User },
]

// Mobile "Plus" menu : sections collapsibles regroupant les 3 dropdowns
// + items secondaires.
const MOBILE_SECTIONS = [
  ...DROPDOWNS,
  {
    title: 'Annuaires & services',
    icon: Star,
    items: [
      { label: 'Annuaire', href: '/annuaire', icon: Star },
      { label: 'Professionnels', href: '/annuaire/professionnels', icon: Users },
      { label: 'Ma famille', href: '/family', icon: Users },
      { label: 'Courriers', href: '/letters', icon: FileText },
    ],
  },
  {
    title: 'Compte',
    icon: User,
    items: [
      { label: 'Recherche', href: '/recherche', icon: Search },
      { label: 'Parrainage', href: '/parrainage', icon: Gift },
      { label: 'Aide', href: '/aide', icon: HelpCircle },
    ],
  },
]

function isActiveHref(pathname: string, href: string): boolean {
  // ignore le tab=... pour l'active-state
  const cleanHref = href.split('?')[0]
  return pathname === cleanHref || pathname.startsWith(cleanHref + '/')
}

export default function AppNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const dropdownsRef = useRef<HTMLDivElement>(null)

  function toggleSection(title: string) {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownsRef.current && !dropdownsRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  return (
    <>
      {/* Desktop : pill-style nav */}
      <nav aria-label="Navigation principale" className="hidden md:block bg-slate-50 dark:bg-slate-950 py-2 relative z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div ref={dropdownsRef} className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 shadow-sm overflow-visible">
            {CORE_NAV.map(item => {
              const isActive = isActiveHref(pathname, item.href)
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

            {/* 3 dropdowns thematiques */}
            {DROPDOWNS.map(dropdown => {
              const isAnyItemActive = dropdown.items.some(i => isActiveHref(pathname, i.href))
              const isOpen = openDropdown === dropdown.title
              const Icon = dropdown.icon
              return (
                <div key={dropdown.title} className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : dropdown.title)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-label={`Menu ${dropdown.title}`}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isAnyItemActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {dropdown.title}
                    <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div role="menu" className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50">
                      {dropdown.items.map(item => {
                        const isActive = isActiveHref(pathname, item.href)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setOpenDropdown(null)}
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
                  )}
                </div>
              )
            })}

            {/* Search icon */}
            <Link
              href="/recherche"
              aria-current={pathname === '/recherche' ? 'page' : undefined}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                pathname === '/recherche'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Recherche"
              aria-label="Recherche"
            >
              <Search size={16} aria-hidden="true" />
            </Link>

            {SECONDARY_NAV.map(item => {
              const isActive = isActiveHref(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={16} aria-hidden="true" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile : bottom tab bar */}
      <nav aria-label="Navigation mobile" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 pb-[env(safe-area-inset-bottom)]">
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
                  const isActive = isActiveHref(pathname, item.href)
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
            const isActive = isActiveHref(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[48px] px-3 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
                  <item.icon size={22} aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold leading-tight">{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-label="Plus d'options"
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[48px] px-3 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              moreOpen || ALL_DROPDOWN_ITEMS.some(i => isActiveHref(pathname, i.href))
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
