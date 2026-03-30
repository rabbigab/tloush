"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChevronLeft, Info } from "lucide-react";

// Baremes 2024
const BITUAH_LEUMI_RATE_LOW = 0.035;   // jusqu'au plafond bas
const BITUAH_LEUMI_RATE_HIGH = 0.12;   // au-dessus (part salariale totale)
const BL_PLAFOND_BAS = 7522;           // NIS/mois
const BL_PLAFOND_HAUT = 49030;         // NIS/mois
const POINT_CREDIT_VALUE = 223;        // NIS/mois par point (2024)
const BASE_POINTS = 2.25;             // points de base pour résident

// Tranches impôt 2024 (mensuelles)
const TAX_BRACKETS = [
  { max: 7010,  rate: 0.10 },
  { max: 10060, rate: 0.14 },
  { max: 16150, rate: 0.20 },
  { max: 21920, rate: 0.31 },
  { max: 45180, rate: 0.35 },
  { max: Infinity, rate: 0.47 },
];

function calcBituahLeumi(gross: number): number {
  if (gross <= BL_PLAFOND_BAS) return gross * BITUAH_LEUMI_RATE_LOW;
  if (gross <= BL_PLAFOND_HAUT) return BL_PLAFOND_BAS * BITUAH_LEUMI_RATE_LOW + (gross - BL_PLAFOND_BAS) * BITUAH_LEUMI_RATE_HIGH;
  return BL_PLAFOND_BAS * BITUAH_LEUMI_RATE_LOW + (BL_PLAFOND_HAUT - BL_PLAFOND_BAS) * BITUAH_LEUMI_RATE_HIGH;
}

function calcIncomeTax(gross: number, points: number): number {
  let tax = 0;
  let remaining = gross;
  let prev = 0;
  for (const bracket of TAX_BRACKETS) {
    const slice = Math.min(remaining, bracket.max - prev);
    if (slice <= 0) break;
    tax += slice * bracket.rate;
    remaining -= slice;
    prev = bracket.max;
    if (remaining <= 0) break;
  }
  const credit = points * POINT_CREDIT_VALUE;
  return Math.max(0, tax - credit);
}

function calcPension(gross: number, hasPension: boolean): number {
  return hasPension ? gross * 0.06 : 0;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR") + " ₪";
}

export default function BrutNetPage() {
  const [gross, setGross] = useState("");
  const [points, setPoints] = useState("2.25");
  const [hasPension, setHasPension] = useState(true);
  const [result, setResult] = useState<null | {
    bl: number; tax: number; pension: number; net: number; gross: number;
  }>(null);

  const calculate = () => {
    const g = parseFloat(gross);
    if (!g || g <= 0) return;
    const p = parseFloat(points) || BASE_POINTS;
    const bl = calcBituahLeumi(g);
    const tax = calcIncomeTax(g, p);
    const pen = calcPension(g, hasPension);
    const net = g - bl - tax - pen;
    setResult({ bl, tax, pension: pen, net, gross: g });
  };

  const rate = result ? Math.round((result.net / result.gross) * 100) : null;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/calculateurs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-6">
          <ChevronLeft size={14} /> Calculateurs
        </Link>

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💰</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Simulateur brut → net</h1>
          <p className="text-neutral-500 text-sm">Estimez votre salaire net mensuel selon les barèmes 2024.</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-5">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Salaire brut mensuel (₪) *</label>
              <input
                type="number"
                value={gross}
                onChange={e => setGross(e.target.value)}
                placeholder="Ex : 12000"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-lg font-semibold focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1.5">
                Points de crédit d'impôt
                <span className="text-neutral-400 text-xs font-normal">(2,25 par défaut pour résident)</span>
              </label>
              <input
                type="number"
                step="0.25"
                value={points}
                onChange={e => setPoints(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <p className="text-xs text-neutral-400 mt-1">2,25 (célibataire) • 2,75 (mariée) • +0,5 par enfant • +3,5 pour nouvel immigrant</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pension"
                checked={hasPension}
                onChange={e => setHasPension(e.target.checked)}
                className="w-4 h-4 accent-brand-600"
              />
              <label htmlFor="pension" className="text-sm text-neutral-700">
                J'ai une pension (cotisation salarié 6 %)
              </label>
            </div>

            <button onClick={calculate} className="btn-primary w-full py-3 text-base">
              Calculer mon salaire net
            </button>
          </div>
        </div>

        {/* Résultat */}
        {result && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 mb-5">
            <div className="text-center mb-6">
              <p className="text-sm text-neutral-500 mb-1">Salaire net estimé</p>
              <p className="text-4xl font-bold text-brand-700">{fmt(result.net)}</p>
              <p className="text-sm text-neutral-400 mt-1">soit {rate} % du brut</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-100">
                <span className="text-sm text-neutral-700">Salaire brut</span>
                <span className="font-semibold text-neutral-900">{fmt(result.gross)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 text-danger">
                <span className="text-sm">Bituah Leumi (sécurité sociale)</span>
                <span className="font-semibold">- {fmt(result.bl)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 text-danger">
                <span className="text-sm">Impôt sur le revenu</span>
                <span className="font-semibold">- {fmt(result.tax)}</span>
              </div>
              {result.pension > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 text-warning">
                  <span className="text-sm">Pension (6 % salarié)</span>
                  <span className="font-semibold">- {fmt(result.pension)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2.5 bg-brand-50 rounded-xl px-3 mt-2">
                <span className="font-bold text-neutral-800">Salaire net</span>
                <span className="font-bold text-brand-700 text-lg">{fmt(result.net)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-neutral-50 rounded-xl p-3">
              <Info size={14} className="text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-500">
                Estimation indicative. Les montants réels dépendent de votre convention collective, de vos avantages en nature et de votre situation familiale exacte.
              </p>
            </div>
          </div>
        )}

        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-sm text-neutral-700">Besoin d'une vérification sur votre vraie fiche de paie ?</p>
          <Link href="/analyze" className="btn-primary text-sm py-2 px-4 shrink-0">Analyser ma fiche</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
