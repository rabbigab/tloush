"use client";

import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  CalendarDays,
  Info,
  HelpCircle,
  Briefcase,
  BadgeCheck,
} from "lucide-react";

type WorkWeek = "5days" | "6days";

/**
 * Baremes legaux (Loi 1951 + amendement 15 de 2017).
 * Jours ouvres par an selon anciennete et semaine de travail.
 *
 * Pour une anciennete > 13 ans, le plafond est applique.
 */
const VACATION_TABLE: Record<WorkWeek, number[]> = {
  // Index = annee d'anciennete (0 = premiere annee)
  "5days": [12, 12, 12, 12, 14, 16, 18, 19, 20, 21, 22, 23, 24],
  "6days": [14, 14, 14, 14, 16, 18, 21, 22, 23, 24, 25, 26, 28],
};

function getAnnualEntitlement(years: number, workWeek: WorkWeek): number {
  const table = VACATION_TABLE[workWeek];
  const yearIndex = Math.max(0, Math.floor(years));
  if (yearIndex >= table.length) return table[table.length - 1];
  return table[yearIndex];
}

function computeSeniorityYears(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

function formatShekel(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " ₪";
}

export default function CongesCalculatorPage() {
  const [startDate, setStartDate] = useState("");
  const [workWeek, setWorkWeek] = useState<WorkWeek>("5days");
  const [partTime, setPartTime] = useState("100");
  const [daysTakenThisYear, setDaysTakenThisYear] = useState("0");
  const [monthlySalary, setMonthlySalary] = useState("");

  const result = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;

    const now = new Date();
    const years = computeSeniorityYears(start, now);
    const baseAnnual = getAnnualEntitlement(years, workWeek);

    const partTimeRatio = Math.min(100, Math.max(0, parseFloat(partTime) || 0)) / 100;
    const adjustedAnnual = baseAnnual * partTimeRatio;

    const daysTaken = Math.max(0, parseFloat(daysTakenThisYear) || 0);
    const remaining = Math.max(0, adjustedAnnual - daysTaken);

    // Valeur en shekels: un jour de conge = salaire mensuel / nb jours travailles/mois
    // Pour une semaine de 5 jours: ~21.67 jours/mois
    // Pour une semaine de 6 jours: ~26 jours/mois
    const workDaysPerMonth = workWeek === "5days" ? 21.67 : 26;
    const salary = parseFloat(monthlySalary);
    const dailyValue = salary > 0 ? salary / workDaysPerMonth : 0;
    const annualValue = dailyValue * adjustedAnnual;
    const remainingValue = dailyValue * remaining;

    return {
      years,
      baseAnnual,
      adjustedAnnual,
      daysTaken,
      remaining,
      dailyValue,
      annualValue,
      remainingValue,
    };
  }, [startDate, workWeek, partTime, daysTakenThisYear, monthlySalary]);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={28} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Solde de Congés Payés
          </h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">
            Calculez vos jours de congés annuels selon votre ancienneté, sur
            la base de la Loi sur les congés payés (חוק חופשה שנתית 1951,
            amendement 15 de 2017).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <Briefcase size={18} className="text-green-600" />
              Votre situation
            </h2>

            <div>
              <label htmlFor="conges-start" className="block text-sm font-medium text-neutral-700 mb-1">
                Date de début chez l&apos;employeur
              </label>
              <input
                id="conges-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="conges-workweek" className="block text-sm font-medium text-neutral-700 mb-1">
                Semaine de travail
              </label>
              <select
                id="conges-workweek"
                value={workWeek}
                onChange={(e) => setWorkWeek(e.target.value as WorkWeek)}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="5days">5 jours par semaine (dimanche → jeudi)</option>
                <option value="6days">6 jours par semaine (dimanche → vendredi)</option>
              </select>
            </div>

            <div>
              <label htmlFor="conges-parttime" className="block text-sm font-medium text-neutral-700 mb-1">
                Temps de travail (%)
              </label>
              <input
                id="conges-parttime"
                type="number"
                value={partTime}
                onChange={(e) => setPartTime(e.target.value)}
                min={0}
                max={100}
                step={5}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                100% = temps plein, 50% = mi-temps, etc. Les jours sont
                proratisés selon votre % poste.
              </p>
            </div>

            <div>
              <label htmlFor="conges-taken" className="block text-sm font-medium text-neutral-700 mb-1">
                Jours déjà pris cette année
              </label>
              <input
                id="conges-taken"
                type="number"
                value={daysTakenThisYear}
                onChange={(e) => setDaysTakenThisYear(e.target.value)}
                min={0}
                step={0.5}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="conges-salary" className="block text-sm font-medium text-neutral-700 mb-1">
                Salaire mensuel brut (₪) — optionnel
              </label>
              <input
                id="conges-salary"
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                min={0}
                step={500}
                placeholder="ex: 12000"
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Pour estimer la valeur monétaire de vos congés.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Main card */}
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white text-center">
                  <p className="text-green-100 text-sm font-medium mb-1">
                    Votre droit annuel
                  </p>
                  <p className="text-4xl font-extrabold">
                    {result.adjustedAnnual.toFixed(1).replace(".0", "")} jours
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    Ancienneté : {result.years.toFixed(1)} ans
                    {parseFloat(partTime) < 100 && ` · ${partTime}% du poste`}
                  </p>
                </div>

                {/* Remaining */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                  <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                    <BadgeCheck size={16} className="text-green-600" />
                    Solde et valeur
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Jours dus cette année</span>
                      <span className="font-semibold text-neutral-800">
                        {result.adjustedAnnual.toFixed(1).replace(".0", "")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Jours pris</span>
                      <span className="font-semibold text-neutral-800">
                        -{result.daysTaken.toFixed(1).replace(".0", "")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neutral-100">
                      <span className="font-bold text-neutral-800">
                        Solde restant
                      </span>
                      <span className="font-extrabold text-green-600">
                        {result.remaining.toFixed(1).replace(".0", "")} jours
                      </span>
                    </div>
                    {result.dailyValue > 0 && (
                      <>
                        <div className="flex justify-between pt-2 border-t border-neutral-100">
                          <span className="text-neutral-600">
                            Valeur 1 jour de congé
                          </span>
                          <span className="font-semibold text-neutral-800">
                            {formatShekel(result.dailyValue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">
                            Valeur du solde restant
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatShekel(result.remainingValue)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Legal note */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 leading-relaxed">
                    <p className="font-semibold mb-1">
                      Règles d&apos;utilisation
                    </p>
                    <ul className="space-y-1">
                      <li>
                        • Les jours non pris sont reportables jusqu&apos;à
                        2 années supplémentaires (3 ans cumulés max).
                      </li>
                      <li>
                        • En cas de fin de contrat, l&apos;employeur doit
                        payer les jours de congés non pris avec le solde tout
                        compte.
                      </li>
                      <li>
                        • Certaines conventions collectives prévoient plus
                        que le minimum légal.
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                Renseignez votre date de début pour voir le calcul.
              </div>
            )}

            {/* Bareme card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="font-bold text-neutral-900 mb-3 text-sm">
                Barème légal ({workWeek === "5days" ? "5 jours" : "6 jours"} par semaine)
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {VACATION_TABLE[workWeek].map((days, idx) => {
                  const label =
                    idx === 0
                      ? "1ère année"
                      : idx === VACATION_TABLE[workWeek].length - 1
                        ? `${idx + 1}ème année et +`
                        : `${idx + 1}ème année`;
                  const isCurrent =
                    result && Math.floor(result.years) === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex justify-between py-0.5 ${isCurrent ? "text-green-700 font-bold" : "text-neutral-600"}`}
                    >
                      <span>{label}</span>
                      <span>{days} j</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Expert CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-start gap-4">
            <HelpCircle size={24} className="flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Litige sur les congés payés ?
              </h3>
              <p className="text-green-100 mb-4">
                Si votre employeur refuse de vous verser vos jours non pris en
                fin de contrat, un avocat peut vous accompagner dans votre
                réclamation.
              </p>
              <Link
                href="/experts"
                className="inline-block bg-white text-green-600 font-semibold px-6 py-2 rounded-lg hover:bg-green-50 transition-colors"
              >
                Consulter un expert →
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-neutral-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-neutral-500">
            ⚠️ Estimation basée sur le minimum légal (Loi 1951). Votre
            convention collective ou contrat individuel peut prévoir davantage.
            En cas de doute, consultez votre contrat, le réglement intérieur
            ou un professionnel.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
