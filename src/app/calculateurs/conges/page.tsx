"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChevronLeft } from "lucide-react";

// Jours de congé annuels selon ancienneté
function getLegalLeaveDays(years: number): number {
  if (years < 1) return 14; // prorata
  if (years < 5) return 14;
  if (years < 6) return 16;
  if (years < 7) return 18;
  return 21;
}

function fmt(n: number) { return Math.round(n).toLocaleString("fr-FR") + " ₪"; }

export default function CongesPage() {
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [daysTaken, setDaysTaken] = useState("0");
  const [result, setResult] = useState<null | {
    anciennete: number; legalDays: number; accumulated: number; remaining: number; value: number;
  }>(null);

  const calculate = () => {
    const s = parseFloat(salary);
    if (!s || !startDate) return;

    const start = new Date(startDate);
    const now = new Date();
    const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
    const anciennete = (now.getTime() - start.getTime()) / msPerYear;
    const ancienneteYears = Math.floor(anciennete);

    const legalDays = getLegalLeaveDays(ancienneteYears);
    // Accumulation proportionnelle à l'année en cours
    const yearFraction = anciennete % 1;
    const accumulated = Math.floor(legalDays * yearFraction + ancienneteYears * legalDays - parseFloat(daysTaken || "0"));
    const remaining = Math.max(0, accumulated);

    // Valeur monétaire : salaire journalier (salaire mensuel / 22 jours ouvrables)
    const dailyRate = s / 22;
    const value = remaining * dailyRate;

    setResult({ anciennete, legalDays, accumulated, remaining, value });
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/calculateurs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-6">
          <ChevronLeft size={14} /> Calculateurs
        </Link>

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏖️</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Solde de congés payés</h1>
          <p className="text-neutral-500 text-sm">Calculez vos jours acquis et leur valeur monétaire.</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Salaire brut mensuel (₪) *</label>
              <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="Ex : 10 000" className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-lg font-semibold focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date d'entrée dans l'entreprise *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Jours de congé déjà pris cette année</label>
              <input type="number" min="0" value={daysTaken} onChange={e => setDaysTaken(e.target.value)} placeholder="0" className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <button onClick={calculate} className="btn-primary w-full py-3 text-base">Calculer mon solde</button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 mb-5">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-brand-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-brand-700">{result.remaining}</p>
                <p className="text-xs text-neutral-500 mt-1">jours restants</p>
              </div>
              <div className="bg-success/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-success">{fmt(result.value)}</p>
                <p className="text-xs text-neutral-500 mt-1">valeur monétaire</p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Ancienneté</span>
                <span className="font-medium">{result.anciennete.toFixed(1)} ans</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Droit annuel légal</span>
                <span className="font-medium">{result.legalDays} jours</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Jours accumulés</span>
                <span className="font-medium">{result.accumulated} jours</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Taux journalier (brut / 22)</span>
                <span className="font-medium">{fmt(parseFloat(salary || "0") / 22)} / jour</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-sm text-neutral-700">Vérifiez le solde sur votre fiche de paie.</p>
          <Link href="/analyze" className="btn-primary text-sm py-2 px-4 shrink-0">Analyser ma fiche</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
