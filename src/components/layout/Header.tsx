"use client";
import Link from "next/link";
import { ShieldCheck, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-neutral-900 text-base tracking-tight">Tloush</span>
            <span className="text-[10px] text-neutral-400 hidden sm:block">Analyse de fiche de paie</span>
          </div>
        </Link>
        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50"
          >
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">Confidentialité</span>
          </Link>
          {loggedIn ? (
            <Link
              href="/inbox"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <LayoutDashboard size={15} />
              <span>Mon espace</span>
            </Link>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium text-neutral-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
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
