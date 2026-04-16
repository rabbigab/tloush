"use client";

import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  TrendingDown,
  AlertCircle,
  Calendar,
  Banknote,
  CheckCircle2,
  Info,
  HelpCircle,
} from "lucide-react";

type Article14 = "none" | "partial" | "full";

const ARTICLE_14_LABELS: Record<Article14, string> = {
  none: "Non (pitzuim classique à verser par l'employeur)",
  partial: "Partiel (72% — pitzuim réduit)",
  full: "Complet (100% — aucun pitzuim dû par l'employeur)",
};

const ARTICLE_14_EXPLANATIONS: Record<Article14, string> = {
  none: "Votre pension ne contient pas de Keren Pitzuim. L'employeur doit verser l'intégralité du pitzuim (salaire × années d'ancienneté).",
  partial:
    "Votre pension contient une Keren Pitzuim partielle (6% du salaire sur 8.33% théorique = 72% couverts). Il reste 28% du pitzuim à la charge de l'employeur.",
  full:
    "Votre pension contient une Keren Pitzuim complète (100%). Aucun pitzuim n'est dû par l'employeur : la pension couvre tout et vous a déjà été créditée au fil des années.",
};

type DismissalReason =
  | "dismissal"
  | "health"
  | "family"
  | "naissance"
  | "demenagement"
  | "non_paiement"
  | "aggravation";

const DISMISSAL_REASON_LABELS: Record<DismissalReason, string> = {
  dismissal: "Licenciement par l'employeur",
  health: "Démission pour raison de santé",
  family: "Démission pour raison familiale (parent malade, garde)",
  naissance: "Démission après naissance d'un enfant (dans les 9 mois)",
  demenagement: "Déménagement (plus de 40 km ou suite à mariage)",
  non_paiement: "Démission suite à non-paiement du salaire",
  aggravation: "Démission suite à aggravation des conditions de travail",
};

const DISMISSAL_REASON_NOTES: Record<DismissalReason, string> = {
  dismissal:
    "Licenciement classique : droit automatique au pitzuim après 12 mois d'ancienneté minimum.",
  health:
    "Donne droit au pitzuim si une attestation médicale prouve que les conditions de travail nuisent à votre santé. Doit être documentée.",
  family:
    "Donne droit au pitzuim si vous devez vous occuper d'un parent / enfant malade, sur justificatif médical et démarche auprès de l'employeur.",
  naissance:
    "Donne droit au pitzuim aux mères (et pères dans certains cas) qui démissionnent dans les 9 mois suivant l'accouchement pour s'occuper de l'enfant.",
  demenagement:
    "Donne droit au pitzuim si vous déménagez à plus de 40 km OU si le déménagement est lié à un mariage. Justificatif requis.",
  non_paiement:
    "Donne droit au pitzuim si l'employeur est en retard de plus de 3 mois sur le paiement du salaire. Notification préalable obligatoire.",
  aggravation:
    "Donne droit au pitzuim si l'employeur aggrave significativement vos conditions (réduction de salaire, changement de poste défavorable, etc.). Notification préalable obligatoire.",
};

function computeSeniorityYears(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  // 365.25 pour absorber les années bissextiles
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

function formatShekel(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " ₪";
}

export default function PitzuimCalculatorPage() {
  const [monthlySalary, setMonthlySalary] = useState("12000");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState<DismissalReason>("dismissal");
  const [article14, setArticle14] = useState<Article14>("none");

  const result = useMemo(() => {
    const salary = parseFloat(monthlySalary);
    if (!salary || salary <= 0 || !startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const years = computeSeniorityYears(start, end);
    const fullYears = Math.floor(years);
    const fractionalMonths = Math.round((years - fullYears) * 12);
    const totalMonths = Math.round(years * 12);

    // Eligibilite: minimum 12 mois chez le meme employeur (Loi 1963 article 1)
    const isEligible = totalMonths >= 12;

    // Pitzuim de base = salaire × années d'ancienneté
    const basePitzuim = salary * years;

    // Application de l'article 14 (Keren Pitzuim dans la pension)
    let employerPitzuim = basePitzuim;
    if (article14 === "full") {
      // Aucun pitzuim du par l'employeur — la pension couvre tout
      employerPitzuim = 0;
    } else if (article14 === "partial") {
      // Depot de 6% sur salaire / 8.33% theorique = 72% couverts par la pension
      // Le reste (28%) reste a la charge de l'employeur
      employerPitzuim = basePitzuim * 0.28;
    }

    // Toutes les raisons listees dans DismissalReason donnent droit au
    // pitzuim : licenciement classique + 6 cas de demission equivalente
    // prevus par la Loi 1963 + jurisprudence. La difference entre les
    // cas est purement pedagogique (condition a remplir, justificatifs).
    const finalAmount = employerPitzuim;

    return {
      years,
      fullYears,
      fractionalMonths,
      totalMonths,
      isEligible,
      basePitzuim,
      employerPitzuim,
      finalAmount,
      salary,
    };
  }, [monthlySalary, startDate, endDate, reason, article14]);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingDown size={28} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Calculateur de Pitzuim
          </h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">
            Estimez vos indemnités de licenciement selon la Loi sur
            l&apos;indemnisation de licenciement (חוק פיצויי פיטורים 1963).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <Calendar size={18} className="text-orange-600" />
              Paramètres
            </h2>

            {/* Monthly salary */}
            <div>
              <label htmlFor="pitzuim-salary" className="block text-sm font-medium text-neutral-700 mb-1">
                Salaire brut mensuel de référence (₪)
              </label>
              <input
                id="pitzuim-salary"
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                min={0}
                step={500}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-lg font-semibold bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Dernier salaire brut, ou moyenne des 12 derniers mois si variable.
              </p>
            </div>

            {/* Start date */}
            <div>
              <label htmlFor="pitzuim-start" className="block text-sm font-medium text-neutral-700 mb-1">
                Date de début chez l&apos;employeur
              </label>
              <input
                id="pitzuim-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* End date */}
            <div>
              <label htmlFor="pitzuim-end" className="block text-sm font-medium text-neutral-700 mb-1">
                Date de fin du contrat
              </label>
              <input
                id="pitzuim-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="pitzuim-reason" className="block text-sm font-medium text-neutral-700 mb-1">
                Motif de fin de contrat
              </label>
              <select
                id="pitzuim-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as DismissalReason)}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              >
                {(Object.keys(DISMISSAL_REASON_LABELS) as DismissalReason[]).map((key) => (
                  <option key={key} value={key}>
                    {DISMISSAL_REASON_LABELS[key]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {DISMISSAL_REASON_NOTES[reason]}
              </p>
            </div>

            {/* Article 14 */}
            <div>
              <label htmlFor="pitzuim-art14" className="block text-sm font-medium text-neutral-700 mb-1">
                Article 14 (Keren Pitzuim dans la pension)
              </label>
              <select
                id="pitzuim-art14"
                value={article14}
                onChange={(e) => setArticle14(e.target.value as Article14)}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="none">{ARTICLE_14_LABELS.none}</option>
                <option value="partial">{ARTICLE_14_LABELS.partial}</option>
                <option value="full">{ARTICLE_14_LABELS.full}</option>
              </select>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {ARTICLE_14_EXPLANATIONS[article14]}
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Eligibility */}
                {!result.isEligible && (
                  <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
                    <div className="text-sm text-neutral-700">
                      <p className="font-semibold mb-1">
                        Non éligible au pitzuim
                      </p>
                      <p className="text-xs">
                        Le pitzuim légal nécessite au minimum 12 mois complets
                        d&apos;ancienneté chez le même employeur. Vous en avez{" "}
                        {result.totalMonths} mois.
                      </p>
                    </div>
                  </div>
                )}

                {/* Main amount */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white text-center">
                  <p className="text-orange-100 text-sm font-medium mb-1">
                    Pitzuim estimé à verser par l&apos;employeur
                  </p>
                  <p className="text-4xl font-extrabold">
                    {result.isEligible ? formatShekel(result.finalAmount) : "—"}
                  </p>
                  <p className="text-orange-100 text-xs mt-1">
                    Sur {result.fullYears} an{result.fullYears > 1 ? "s" : ""}{" "}
                    {result.fractionalMonths > 0 &&
                      `et ${result.fractionalMonths} mois`}{" "}
                    d&apos;ancienneté
                  </p>
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                  <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                    <Banknote size={16} className="text-orange-600" />
                    Détail du calcul
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Salaire mensuel</span>
                      <span className="font-semibold text-neutral-800">
                        {formatShekel(result.salary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Ancienneté</span>
                      <span className="font-semibold text-neutral-800">
                        {result.years.toFixed(2)} ans
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neutral-100">
                      <span className="text-neutral-600">
                        Pitzuim de base (salaire × années)
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {formatShekel(result.basePitzuim)}
                      </span>
                    </div>
                    {article14 !== "none" && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Article 14 ({article14 === "full" ? "100%" : "72%"})
                        </span>
                        <span className="font-semibold text-neutral-800">
                          -{formatShekel(result.basePitzuim - result.employerPitzuim)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-neutral-100 text-base">
                      <span className="font-bold text-neutral-800">
                        Dû par l&apos;employeur
                      </span>
                      <span className="font-extrabold text-orange-600">
                        {formatShekel(result.employerPitzuim)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 leading-relaxed">
                    <p className="font-semibold mb-1">Rappel</p>
                    <p>
                      Le pitzuim est exonéré d&apos;impôt jusqu&apos;à un
                      plafond (en 2026, environ 13 750 ₪ par année
                      d&apos;ancienneté). Au-delà, le montant est imposé comme
                      revenu, sauf étalement fiscal.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                <CheckCircle2 size={24} className="text-neutral-300 mx-auto mb-3" />
                Renseignez les 3 champs (salaire, date début, date fin) pour
                voir le calcul.
              </div>
            )}
          </div>
        </div>

        {/* Expert CTA */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-start gap-4">
            <HelpCircle size={24} className="flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Contestation ou négociation de pitzuim ?
              </h3>
              <p className="text-orange-100 mb-4">
                Un avocat en droit du travail peut vérifier votre calcul et
                vous aider à négocier une indemnité supplémentaire si elle
                vous est due.
              </p>
              <Link
                href="/annuaire/professionnels"
                className="inline-block bg-white text-orange-600 font-semibold px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Consulter un expert →
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-neutral-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-neutral-500">
            ⚠️ Estimation indicative basée sur la Loi 1963. Les montants exacts
            peuvent varier selon votre convention collective, contrat
            individuel, plafond fiscal et situation personnelle. Pour un
            calcul officiel ou un litige, consultez un avocat en droit du
            travail ou un comptable.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
