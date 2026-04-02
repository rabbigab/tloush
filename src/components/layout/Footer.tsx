import Link from "next/link";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-700 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-start gap-3 bg-neutral-50 dark:bg-slate-800 rounded-xl p-4 mb-8 border border-neutral-200 dark:border-slate-700">
          <AlertCircle size={18} className="text-neutral-400 dark:text-slate-500 mt-0.5 shrink-0" />
          <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-neutral-600 dark:text-slate-300">Analyse indicative uniquement.</strong>{" "}
            Tloush est un outil d&apos;aide &agrave; la compr&eacute;hension, pas un cabinet juridique ni un expert-comptable.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="font-bold text-neutral-800 dark:text-slate-200">Tloush</span>
            </div>
            <p className="text-xs text-neutral-400 dark:text-slate-500 leading-relaxed">Comprendre sa fiche de paie isra&eacute;lienne, en fran&ccedil;ais, simplement.</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider mb-3">Application</h3>
            <ul className="space-y-2">
              <li><Link href="/analyze" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">Analyser ma fiche</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">Comment &ccedil;a marche</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider mb-3">L&eacute;gal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">Confidentialit&eacute;</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-neutral-100 dark:border-slate-700">
          <p className="text-xs text-neutral-400 dark:text-slate-500">&copy; {new Date().getFullYear()} Tloush — Outil d&apos;aide &agrave; la compr&eacute;hension des fiches de paie isra&eacute;liennes</p>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-slate-500">
            <ShieldCheck size={13} className="text-success" />
            <span>Vos donn&eacute;es restent confidentielles</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
