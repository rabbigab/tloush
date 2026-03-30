"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChevronLeft, Info } from "lucide-react";

function fmt(n: number) { return Math.round(n).toLocaleString("fr-FR") + " ₪"; }

export default function IndemnitesPitzuimPage() {
  const [salary, setSalary] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("0");
  const [leaveBalance, setLeaveBalance] = useState("");
  const [result, setResult] = useState<null | {
    pitzuim: number; preavis: number; conges: number; total: number;
  }>(null);

  const calculate = () => {
    const s = parseFloat(salary);
    const y = parseFloat(years) || 0;
    const m = parseFloat(months) || 0;
    const leave = parseFloat(leaveBalance) || 0;
    if (!s || s <= 0) return;

    const anciennete = y + m / 12;
    const pitzuim = s * anciennete;

    // Préavis légal selon ancienneté (en jours)
    let preavisJours = 0;
    if (anciennete < 1) preavisJours = 0;
    else if (anciennete < 2) preavisJours = 14;
    else if (anciennete < 3) preavisJours = 21;
    else preavisJours = 30;
    const preavis = (s / 30) * preavisJours;

    // Congés non pris
    const conges = (s / 22) * leave;

    setResult({ pitzuim, preavis, conges, total: pitzuim + preavis + conges });
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/calculateurs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-6">
          <ChevronLeft size={14} /> Calculateurs
        </Link>

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Calculateur de Pitzuim</h1>
          <p className="text-neutral-500 text-sm">Estimez vos indemniés de licenciement, préavis et congés non pris.</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Dernier salaire brut mensuel (₪) *</label>
              <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="Ex : 12 000" className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-lg font-semibold focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Années d'ancienneté *</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Ex : 3" className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Mois supplémentaires</label>
                <input type="number" min="0" max="11" value={months} onChange={e => setMonths(e.target.value)} placeholder="0" className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Jours de congés non pris (facultatif)</label>
              <input type="number" value={leaveBalance} onChange={e => setLeaveBalance(e.target.value)} placeholder="Ex : 8" className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <button onClick={calculate} className="btn-primary w-full py-3 text-base">Calculer mes indemniés</button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 mb-5">
            <div className="text-center mb-6">
              <p className="text-sm text-neutral-500 mb-1">Total estimé à recevoir</p>
              <p className="text-4xl font-bold text-brand-700">{fmt(result.total)}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Pitzuim (indemnié de licenciement)</p>
                  <p className="text-xs text-neutral-400">Salaire mensuel × années d'ancienneté</p>
                </div>
                <span className="font-bold text-brand-700">{fmt(result.pitzuim)}</span>
              </div>
              {result.preavis > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-neutral-100">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Préavis légal</p>
                    <p className="text-xs text-neutral-400">Selon ancienneté</p>
                  </div>
                  <span className="font-bold text-neutral-700">{fmt(result.preavis)}</span>
                </div>
              )}
              {result.conges > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-neutral-100">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Congés non pris</p>
                    <p className="text-xs text-neutral-400">Payés à la sortie</p>
                  </div>
                  <span className="font-bold text-neutral-700">{fmt(result.conges)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2.5 bg-brand-50 rounded-xl px-3">
                <span className="font-bold text-neutral-800">Total</span>
                <span className="font-bold text-brand-700 text-lg">{fmt(result.total)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 bg-neutral-50 rounded-xl p-3">
              <Info size={14} className="text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-500">Estimation indicative. Le montant réel dépend de votre contrat, de la convention collective et du mode de calcul de votre salaire de référence.</p>
            </div>
          </div>
        )}

        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-sm text-neutral-700">Un litige sur vos indemniés ? Consultez un avocat.</p>
          <Link href="/experts?specialite=droit-travail" className="btn-primary text-sm py-2 px-4 shrink-0">Trouver un avocat</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
