"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnalysisSummaryCard from "@/components/report/AnalysisSummaryCard";
import WarningCard from "@/components/report/WarningCard";
import ReportSection from "@/components/report/ReportSection";
import EmployerQuestionsCard from "@/components/report/EmployerQuestionsCard";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import { useAnalysisStore } from "@/store/analysisStore";
import { saveReport } from "@/lib/reportHistory";
import { CheckCircle2, ArrowLeft, FileText, RefreshCw, History } from "lucide-react";

// Section wrapper réutilisable
function Section({
  id,
  emoji,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { finalReport, resetAll } = useAnalysisStore();
  const savedRef = useRef(false);

  useEffect(() => {
    if (!finalReport) {
      router.replace("/analyze");
      return;
    }
    // Auto-save to history (once per report)
    if (!savedRef.current) {
      savedRef.current = true;
      try {
        saveReport(finalReport);
      } catch {
        // localStorage can be unavailable (private mode), ignore silently
      }
    }
  }, [finalReport, router]);

  if (!finalReport) return null;

  const { summary, extractedData, flags, positiveFindings, employerQuestions, neededDocuments, disclaimer, generatedAt } = finalReport;

  const highFlags   = flags.filter((f) => f.severity === "high");
  const mediumFlags = flags.filter((f) => f.severity === "medium");
  const lowFlags    = flags.filter((f) => f.severity === "low");

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 print:bg-white">
      <Header />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

        {/* ---- Navigation de haut de page ---- */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/analyze" className="btn-ghost text-sm">
            <ArrowLeft size={16} /> Nouvelle analyse
          </Link>
          <div className="flex gap-2">
            <Link
              href="/history"
              className="btn-secondary text-sm py-2 px-4 print:hidden inline-flex items-center gap-1.5"
            >
              <History size={15} /> Mes analyses
            </Link>
            <button
              onClick={handlePrint}
              className="btn-secondary text-sm py-2 px-4 print:hidden"
            >
              <FileText size={15} /> Imprimer / PDF
            </button>
            <button
              onClick={() => { resetAll(); router.push("/analyze"); }}
              className="btn-ghost text-sm print:hidden"
            >
              <RefreshCw size={15} /> Réinitialiser
            </button>
          </div>
        </div>

        {/* ---- Bandeau sauvegarde ---- */}
        <div className="flex items-center gap-2 text-xs text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2 print:hidden">
          <CheckCircle2 size={13} />
          <span>Rapport sauvegardé dans &quot;Mes analyses&quot; — accessible même après fermeture du navigateur.</span>
        </div>

        {/* ---- 1. Résumé global ---- */}
        <Section id="summary" emoji="📋" title="Résumé de l'analyse">
          <AnalysisSummaryCard summary={summary} generatedAt={generatedAt} />
        </Section>

        {/* ---- 2. Ce que la fiche indique ---- */}
        <Section
          id="extracted"
          emoji="🧾"
          title="Ce que votre fiche indique"
          subtitle="Données extraites et traduites de votre bulletin de salaire."
        >
          <ReportSection doc={extractedData} />
        </Section>

        {/* ---- 3. Points positifs ---- */}
        {positiveFindings.length > 0 && (
          <Section
            id="positive"
            emoji="✅"
            title="Points cohérents"
            subtitle="Ces éléments semblent en ordre au premier regard."
          >
            <div className="space-y-2.5">
              {positiveFindings.map((pf) => (
                <div
                  key={pf.id}
                  className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-xl p-3.5"
                >
                  <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{pf.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{pf.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ---- 4. Points à vérifier (flags) ---- */}
        {flags.length > 0 ? (
          <Section
            id="flags"
            emoji="⚠️"
            title="Points à vérifier"
            subtitle={`${flags.length} point${flags.length > 1 ? "s" : ""} nécessite${flags.length > 1 ? "nt" : ""} votre attention. Cliquez pour développer.`}
          >
            <div className="space-y-3">
              {highFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-danger mb-2 px-1">
                    🔴 Alertes importantes ({highFlags.length})
                  </p>
                  <div className="space-y-2.5">
                    {highFlags.map((f) => <WarningCard key={f.id} flag={f} />)}
                  </div>
                </div>
              )}
              {mediumFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-warning mb-2 px-1 mt-4">
                    🟡 À vérifier ({mediumFlags.length})
                  </p>
                  <div className="space-y-2.5">
                    {mediumFlags.map((f) => <WarningCard key={f.id} flag={f} />)}
                  </div>
                </div>
              )}
              {lowFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2 px-1 mt-4">
                    🔵 Points d'attention ({lowFlags.length})
                  </p>
                  <div className="space-y-2.5">
                    {lowFlags.map((f) => <WarningCard key={f.id} flag={f} />)}
                  </div>
                </div>
              )}
            </div>
          </Section>
        ) : (
          <Section id="flags" emoji="🎉" title="Aucune anomalie détectée">
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-neutral-800 mb-1">Tout semble en ordre</p>
              <p className="text-sm text-neutral-500">
                Aucune incohérence détectée selon les informations fournies.
              </p>
            </div>
          </Section>
        )}

        {/* ---- 5. Questions à poser ---- */}
        {employerQuestions.length > 0 && (
          <Section
            id="questions"
            emoji="💬"
            title="Questions à poser à votre employeur"
            subtitle="Rédigées en français, prêtes à envoyer par email."
          >
            <EmployerQuestionsCard questions={employerQuestions} />
          </Section>
        )}

        {/* ---- 6. Documents utiles ---- */}
        {neededDocuments.length > 0 && (
          <Section
            id="documents"
            emoji="📁"
            title="Documents utiles pour aller plus loin"
            subtitle="Ces documents vous aideront à vérifier ou compléter l'analyse."
          >
            <div className="space-y-2.5">
              {neededDocuments.map((d) => (
                <div key={d.id} className="card-sm flex items-start gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{d.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{d.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ---- 7. Disclaimer ---- */}
        <Section id="disclaimer" emoji="ℹ️" title="Remarque importante">
          <DisclaimerBlock text={disclaimer} />
        </Section>

        {/* ---- CTA bas de page ---- */}
        <div className="card bg-gradient-to-r from-brand-50 to-white border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <p className="font-semibold text-neutral-800 text-sm mb-0.5">
              Besoin d'une analyse plus approfondie ?
            </p>
            <p className="text-xs text-neutral-500">
              Consultez un avocat spécialisé en droit du travail israélien ou un expert-comptable.
            </p>
          </div>
          <button
            onClick={() => { resetAll(); router.push("/analyze"); }}
            className="btn-primary text-sm py-2.5 px-5 shrink-0"
          >
            Analyser une autre fiche
          </button>
        </div>

      </div>

      <Footer />
    </main>
  );
}
