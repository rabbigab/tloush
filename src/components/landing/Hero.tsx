"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";

const BENEFITS = [
  "Traduction en français des lignes hébraïques",
  "Détection d'anomalies et incohérences",
  "Questions à poser à votre employeur",
  "Rapport pédagogique clair et actionnable",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white -z-10" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
              Outil gratuit pour la communauté francophone d'Israël
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 leading-tight mb-4">
              Comprenez enfin votre{" "}<span className="text-brand-600">fiche de paie</span>{" "}israélienne
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed mb-8">
              Tloush traduit et analyse votre fiche de paie hébreu en français simple. Repérez les anomalies, vérifiez vos droits.
            </p>
            <ul className="space-y-3 mb-8">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-success shrink-0" />
                  <span className="text-sm text-neutral-700">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/analyze" className="btn-primary text-base px-8 py-3.5 shadow-card">
                Analyser ma fiche de paie<ArrowRight size={18} />
              </Link>
              <Link href="/analyze?demo=true" className="btn-secondary text-base px-8 py-3.5">Voir une démo</Link>
            </div>
            <p className="mt-4 text-xs text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-success" />
              Aucune donnée personnelle conservée • Analyse informative uniquement
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-200 rounded-3xl rotate-3 opacity-30" />
              <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-card p-6 space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">Employeur</p>
                    <p className="font-semibold text-neutral-800 text-sm">חברת הדוגמה</p>
                    <p className="text-xs text-brand-500">→ Société Exemple</p>
                  </div>
                  <div className="text-right"><p className="text-xs text-neutral-400">Période</p><p className="font-semibold text-sm">Avril 2024</p></div>
                </div>
                {[
                  { he: "שכר יסוד", fr: "Salaire de base", val: "8 500 ₪" },
                  { he: "ביטוח לאומי", fr: "Sécurité sociale", val: "−352 ₪" },
                  { he: "מס הכנסה", fr: "Impôt sur le revenu", val: "−620 ₪" },
                ].map((line) => (
                  <div key={line.he} className="flex items-center justify-between">
                    <div><p className="text-xs text-neutral-500" dir="rtl">{line.he}</p><p className="text-xs text-brand-600 font-semibold">{line.fr}</p></div>
                    <span className={`text-sm font-bold ${line.val.startsWith("−") ? "text-danger" : "text-neutral-800"}`}>{line.val}</span>
                  </div>
                ))}
                <div className="bg-brand-50 rounded-xl p-3 flex justify-between items-center border border-brand-100">
                  <div><p className="text-xs text-neutral-500">נטו → Salaire net</p></div>
                  <span className="text-lg font-extrabold text-brand-700">8 216 ₪</span>
                </div>
                <div className="flex items-start gap-2 bg-warning/10 rounded-xl p-3 border border-warning/20">
                  <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-warning font-medium">Heures supplémentaires déclarées mais ligne à vérifier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
