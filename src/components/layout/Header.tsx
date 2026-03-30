"use client";

import Link from "next/link";
import { ShieldCheck, ClockIcon } from "lucide-react";

export default function Header() {
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
            href="/history"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50"
          >
            <ClockIcon size={14} />
            <span className="hidden sm:inline">Mes analyses</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50"
          >
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">Confidentialité</span>
          </Link>
          <Link href="/analyze" className="btn-primary text-sm py-2 px-4">
            Analyser ma fiche
          </Link>
        </nav>
      </div>
    </header>
  );
}
