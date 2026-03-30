"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ClockIcon, Menu, X, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Analyser",
    href: "/analyze",
    children: null,
  },
  {
    label: "Mes droits",
    href: "/droits",
    children: [
      { label: "🏖️ Congés payés", href: "/droits/les-conges-payes" },
      { label: "⏰ Heures supplémentaires", href: "/droits/heures-supplementaires" },
      { label: "💰 Indemnités licenciement", href: "/droits/indemnites-licenciement" },
      { label: "🎓 Keren Hishtalmut", href: "/droits/keren-hishtalmut" },
      { label: "🧾 Comprendre sa fiche", href: "/droits/comprendre-sa-fiche" },
    ],
  },
  {
    label: "Calculateurs",
    href: "/calculateurs",
    children: [
      { label: "💰 Brut → Net", href: "/calculateurs/brut-net" },
      { label: "📋 Pitzuim", href: "/calculateurs/indemnites" },
      { label: "🏖️ Congés", href: "/calculateurs/conges" },
    ],
  },
  {
    label: "Modèles",
    href: "/modeles",
    children: null,
  },
  {
    label: "Experts",
    href: "/experts",
    children: null,
  },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-neutral-900 text-base tracking-tight">Tloush</span>
            <span className="text-[10px] text-neutral-400 hidden sm:block">Plateforme RH francophone</span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.href)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-0.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                  pathname?.startsWith(item.href) && item.href !== "/"
                    ? "text-brand-700 bg-brand-50 font-medium"
                    : "text-neutral-600 hover:text-brand-600 hover:bg-neutral-50"
                }`}
              >
                {item.label}
                {item.children && <ChevronDown size={12} className="opacity-50" />}
              </Link>
              {item.children && openDropdown === item.href && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-neutral-100 shadow-lg p-1.5 min-w-[200px] z-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50"
          >
            <ClockIcon size={14} />
            <span>Mes analyses</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50"
          >
            <ShieldCheck size={14} />
          </Link>
          <Link href="/analyze" className="btn-primary text-sm py-2 px-4">
            Analyser ma fiche
          </Link>
        </div>

        {/* Burger mobile */}
        <button
          className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm transition-colors ${
                pathname?.startsWith(item.href) && item.href !== "/"
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-neutral-100 mt-2">
            <Link href="/history" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-600">
              <ClockIcon size={14} /> Mes analyses
            </Link>
            <Link href="/analyze" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center mt-2 py-2.5 text-sm">
              Analyser ma fiche
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
