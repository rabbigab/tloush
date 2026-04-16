"use client";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Moon, Sun, CreditCard, Scale, Menu, X, Star, Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-slate-700 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo: icon+text on mobile, full logo on desktop */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image src="/icon.png" alt="Tloush" width={40} height={40} className="w-9 h-9 sm:hidden rounded-lg" unoptimized />
          <span className="font-bold text-lg text-neutral-900 dark:text-white sm:hidden">Tloush</span>
          <Image src="/logo.png" alt="Tloush" width={200} height={200} className="hidden sm:block h-14 lg:h-16 w-auto group-hover:scale-105 transition-transform" priority unoptimized />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 lg:gap-2">
          {/* /immobilier retire de la nav tant que la feature est en
              construction (audit #11). Reactiver quand la DB listings
              est populate et le rendu fix. */}
          <Link
            href="/annuaire"
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30"
          >
            <Star size={14} />
            <span className="hidden lg:inline">Annuaire</span>
          </Link>
          <Link
            href="/droits"
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30"
          >
            <Scale size={14} />
            <span className="hidden lg:inline">Droits</span>
          </Link>
          <Link
            href="/calculateurs"
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30"
          >
            <Calculator size={14} />
            <span className="hidden lg:inline">Calculateurs</span>
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30"
          >
            <CreditCard size={14} />
            <span className="hidden lg:inline">Tarifs</span>
          </Link>
          {/* /privacy retire de la nav principale (Chantier 1 P0) — reste
              accessible depuis le Footer. */}
          <button
            onClick={toggle}
            className="flex items-center justify-center w-9 h-9 text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {loggedIn ? (
            <Link
              href="/inbox"
              className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
            >
              <LayoutDashboard size={15} />
              <span>Mon espace</span>
            </Link>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors">
              Connexion
            </Link>
          )}
          <Link href="/inbox" className="btn-primary text-sm py-2 px-4">
            Analyser un document
          </Link>
        </nav>

        {/* Mobile: CTA + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/inbox" className="btn-primary text-xs py-2 px-3">
            Analyser
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-10 h-10 text-neutral-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-700 px-4 py-4 space-y-1">
          {/* /immobilier retire du menu mobile tant que la feature
              est en construction (audit #11) */}
          <Link href="/annuaire" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 rounded-lg">
            <Star size={16} />
            Annuaire
          </Link>
          <Link href="/droits" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 rounded-lg">
            <Scale size={16} />
            Droits
          </Link>
          <Link href="/calculateurs" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 rounded-lg">
            <Calculator size={16} />
            Calculateurs
          </Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 rounded-lg">
            <CreditCard size={16} />
            Tarifs
          </Link>
          {/* /privacy retire du menu mobile (Chantier 1 P0) — reste
              accessible depuis le Footer. */}
          <div className="border-t border-neutral-100 dark:border-slate-700 pt-2 mt-2">
            <button
              onClick={() => { toggle(); setMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 rounded-lg w-full"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </button>
          </div>
          <div className="border-t border-neutral-100 dark:border-slate-700 pt-2 mt-2">
            {loggedIn ? (
              <Link href="/inbox" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg">
                <LayoutDashboard size={16} />
                Mon espace
              </Link>
            ) : (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg">
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
