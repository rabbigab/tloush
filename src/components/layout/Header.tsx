"use client";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, LayoutDashboard, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-slate-700 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/icon.png" alt="Tloush" width={32} height={32} className="rounded-lg group-hover:scale-105 transition-transform" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-neutral-900 dark:text-slate-100 text-base tracking-tight">Tloush</span>
            <span className="text-[10px] text-neutral-400 dark:text-slate-500 hidden sm:block">Documents israeliens en francais</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30"
          >
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">Confidentialit&eacute;</span>
          </Link>
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
      </div>
    </header>
  );
}
