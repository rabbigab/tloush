"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { calculateNetSalary, type PayrollResult } from "@/lib/israeliPayroll";
import { Banknote, ArrowDown, TrendingDown, Building2, PiggyBank } from "lucide-react";
import type { Metadata } from "next";

export default function BrutNetPage() {
  const [gross, setGross] = useState(12000);
  const [creditPoints, setCreditPoints] = useState(2.25);
  const [isWoman, setIsWoman] = useState(false);
  const [isOleh, setIsOleh] = useState(false);
  const [olehYear, setOlehYear] = useState(1);
  const [includePension, setIncludePension] = useState(true);
  const [includeKeren, setIncludeKeren] = useState(false);

  const effectiveCredits = useMemo(() => {
    let pts = 2.25;
    if (isWoman) pts += 0.5;
    if (isOleh) {
      if (olehYear === 1) pts += 3;
      else if (olehYear === 2) pts += 2;
      else if (olehYear === 3) pts += 1;
    }
    return pts;
  }, [isWoman, isOleh, olehYear]);

  const result: PayrollResult = useMemo(() => {
    return calculateNetSalary({
      grossMonthlySalary: gross,
      creditPoints: effectiveCredits,
      pensionEmployeeRate: includePension ? 0.06 : 0,
      pensionEmployerRate: includePension ? 0.065 : 0,
      includeSeverance: includePension,
      kerenHishtalmutEmployee: includeKeren ? 0.025 : 0,
      kerenHishtalmutEmployer: includeKeren ? 0.075 : 0,
    });
  }, [gross, effectiveCredits, includePension, includeKeren]);

  const pct = gross > 0 ? ((result.net / gross) * 100).toFixed(1) : "0";

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Banknote size={28} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Simulateur Brut → Net
          </h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">
            Calculez votre salaire net en Israel. Basé sur les barèmes 2025 (impôt, Bituah Leumi, santé, pension).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
            <h2 className="font-bold text-neutral-900">Paramètres</h2>

            {/* Gross salary */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Salaire brut mensuel (₪)
              </label>
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(Number(e.target.value) || 0)}
                min={0}
                step={500}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-lg font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <input
                type="range"
                min={0}
                max={80000}
                step={500}
                value={gross}
                onChange={(e) => setGross(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-0.5">
                <span>0₪</span>
                <span>80 000₪</span>
              </div>
            </div>

            {/* Situation */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-700">Situation</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWoman}
                  onChange={(e) => setIsWoman(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-700">Femme (+0.5 point de crédit)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOleh}
                  onChange={(e) => setIsOleh(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-700">Nouvel oleh/a (points bonus)</span>
              </label>
              {isOleh && (
                <div className="ml-7">
                  <label className="text-xs text-neutral-500 mb-1 block">Année d&apos;alyah</label>
                  <select
                    value={olehYear}
                    onChange={(e) => setOlehYear(Number(e.target.value))}
                    className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm bg-white"
                  >
                    <option value={1}>1ère année (+3 pts)</option>
                    <option value={2}>2ème année (+2 pts)</option>
                    <option value={3}>3ème année (+1 pt)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Pension & Keren */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-700">Cotisations</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePension}
                  onChange={(e) => setIncludePension(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-700">Pension obligatoire (6%)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeKeren}
                  onChange={(e) => setIncludeKeren(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-700">Keren Hishtalmut (2.5%)</span>
              </label>
            </div>

            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xs text-neutral-500">
                Points de crédit total : <span className="font-bold text-neutral-700">{effectiveCredits}</span>
                {" "}= {effectiveCredits * 242}₪/mois de réduction d&apos;impôt
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Net hero */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
              <p className="text-blue-200 text-sm font-medium mb-1">Salaire net estimé</p>
              <p className="text-4xl font-extrabold">{result.net.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}₪</p>
              <p className="text-blue-200 text-sm mt-1">{pct}% du brut</p>
            </div>

            {/* Deductions breakdown */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <TrendingDown size={16} className="text-red-500" />
                Retenues salarié
              </h3>
              {[
                { label: "Impôt sur le revenu", amount: result.incomeTax, color: "bg-red-500" },
                { label: "Bituah Leumi", amount: result.bituahLeumi, color: "bg-orange-500" },
                { label: "Assurance santé", amount: result.healthInsurance, color: "bg-amber-500" },
                { label: "Pension (salarié)", amount: result.pensionEmployee, color: "bg-blue-500" },
                { label: "Keren Hishtalmut", amount: result.kerenHishtalmutEmployee, color: "bg-indigo-500" },
              ]
                .filter((d) => d.amount > 0)
                .map((d) => {
                  const pctBar = gross > 0 ? (d.amount / gross) * 100 : 0;
                  return (
                    <div key={d.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">{d.label}</span>
                        <span className="font-semibold text-neutral-800">
                          -{d.amount.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}₪
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className={`h-full ${d.color} rounded-full`} style={{ width: `${pctBar}%` }} />
                      </div>
                    </div>
                  );
                })}
              <div className="pt-2 border-t border-neutral-100 flex justify-between text-sm font-bold">
                <span className="text-neutral-700">Total retenues</span>
                <span className="text-red-600">
                  -{result.totalDeductions.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}₪
                </span>
              </div>
            </div>

            {/* Employer cost */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <Building2 size={16} className="text-teal-600" />
                Coût employeur
              </h3>
              {[
                { label: "Pension (employeur)", amount: result.pensionEmployer },
                { label: "Pitzuim (indemnités)", amount: result.severance },
                { label: "Keren Hishtalmut (empl.)", amount: result.kerenHishtalmutEmployer },
                { label: "Bituah Leumi (employeur)", amount: result.bituahLeumiEmployer },
              ]
                .filter((d) => d.amount > 0)
                .map((d) => (
                  <div key={d.label} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{d.label}</span>
                    <span className="font-medium text-neutral-700">
                      +{d.amount.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}₪
                    </span>
                  </div>
                ))}
              <div className="pt-2 border-t border-neutral-100 flex justify-between text-sm font-bold">
                <span className="text-neutral-700">Coût total employeur</span>
                <span className="text-teal-700">
                  {result.totalEmployerCost.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}₪
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-neutral-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-neutral-500">
            ⚠️ Estimation basée sur les barèmes 2025. Les montants exacts peuvent varier selon votre convention collective,
            votre ancienneté et votre situation personnelle. Consultez un comptable pour un calcul exact.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
