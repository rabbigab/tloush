import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

// Note (audit #15) : le disclaimer "pas un cabinet juridique ni
// expert-comptable" a ete retire du footer global car il apparaissait
// hors contexte sur les pages d'annuaire (fiches plombier, etc.).
// Les pages qui en ont besoin (homepage, /scanner, /calculateurs,
// /droits, /droits-olim, /modeles) rendent leur propre
// <DisclaimerBlock /> explicitement.

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-700 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image src="/icon.png" alt="Tloush" width={40} height={40} className="rounded-lg" />
              <span className="font-bold text-neutral-800 dark:text-slate-200">Tloush</span>
            </div>
            <p className="text-xs text-neutral-400 dark:text-slate-500 leading-relaxed">Comprendre sa fiche de paie israélienne, en français, simplement.</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider mb-3">Application</h3>
            <ul className="space-y-2">
              <li><Link href="/scanner" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">Analyser ma fiche</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider mb-3">Légal</h3>
            <ul className="space-y-2">
              <li><Link href="/cgv" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">CGV</Link></li>
              <li><Link href="/privacy" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">Confidentialité</Link></li>
              <li><Link href="/mentions-legales" className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-600 transition-colors">Mentions légales</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-neutral-100 dark:border-slate-700">
          <p className="text-xs text-neutral-400 dark:text-slate-500">&copy; {new Date().getFullYear()} Tloush — Outil d&apos;aide à la compréhension des fiches de paie israéliennes</p>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-slate-500">
            <ShieldCheck size={13} className="text-success" />
            <span>Vos données restent confidentielles</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
