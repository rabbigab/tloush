"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnalysisSummaryCard from "@/components/report/AnalysisSummaryCard";
import WarningCard from "@/components/report/WarningCard";
import ReportSection from "@/components/report/ReportSection";
import EmployerQuestionsCard from "@/components/report/EmployerQuestionsCard";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import DirectoryCrossPromo from "@/components/directory/DirectoryCrossPromo";
import { useAnalysisStore } from "@/store/analysisStore";
import { CheckCircle2, ArrowLeft, FileText, RefreshCw, Clock } from "lucide-react";
import type { FinalReport } from "@/types";

const STORAGE_KEY = "tloush_analysis_history";

interface SavedReport {
  id: string;
  savedAt: string;
  report: FinalReport;
}

function Section({
  id,
  emoji,
  title,
  subtitle,
  children,
}: {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
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

  useEffect(() => {
    if (!finalReport) {
      router.replace("/analyze");
    }
  }, [finalReport, router]);

  useEffect(() => {
    if (finalReport) {
      try {
        const existing = localStorage.getItem(STORAGE_KEY);
        const history: SavedReport[] = existing ? (JSON.parse(existing) as SavedReport[]) : [];
        const newEntry: SavedReport = {
          id: Date.now().toString(),
          savedAt: new Date().toISOString(),
          report: finalReport,
        };
        const updated = [newEntry, ...history].slice(0, 20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }, [finalReport]);

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

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/analyze" className="btn-ghost text-sm">
            <ArrowLeft size={16} /> Nouvelle analyse
          </Link>
          <div className="flex gap-2">
            <Link href="/history" className="btn-ghost text-sm print:hidden">
              <Clock size={15} /> Mes analyses
            </Link>
            <button onClick={handlePrint} className="btn-secondary text-sm py-2 px-4 print:hidden">
              <FileText size={15} /> Imprimer / PDF
            </button>
            <button onClick={() => { resetAll(); router.push("/analyze"); }} className="btn-ghost text-sm print:hidden">
              <RefreshCw size={15} /> Reinitialiser
            </button>
          </div>
        </div>

        <Section id="summary" emoji="📋" title="Résumé de l'analyse">
          <AnalysisSummaryCard summary={summary} generatedAt={generatedAt} />
        </Section>

        <Section id="extracted" emoji="🧾" title="Ce que votre fiche indique" subtitle="Donnees extraites et traduites de votre bulletin de salaire.">
          <ReportSection doc={extractedData} />
        </Section>

        {positiveFindings.length > 0 && (
          <Section id="positive" emoji="✅" title="Points coherents" subtitle="Ces elements semblent en ordre au premier regard.">
            <div className="space-y-2.5">
              {positiveFindings.map((pf) => (
                <div key={pf.id} className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-xl p-3.5">
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

        {flags.length > 0 ? (
          <Section id="flags" emoji="⚠️" title="Points a verifier" subtitle={flags.length + " point(s) necessite(nt) votre attention."}>
            <div className="space-y-3">
              {highFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-danger mb-2 px-1">Alertes importantes ({highFlags.length})</p>
                  <div className="space-y-2.5">{highFlags.map((f) => <WarningCard key={f.id} flag={f} />)}</div>
                </div>
              )}
              {mediumFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-warning mb-2 px-1 mt-4">A verifier ({mediumFlags.length})</p>
                  <div className="space-y-2.5">{mediumFlags.map((f) => <WarningCard key={f.id} flag={f} />)}</div>
                </div>
              )}
              {lowFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2 px-1 mt-4">Points d'attention ({lowFlags.length})</p>
                  <div className="space-y-2.5">{lowFlags.map((f) => <WarningCard key={f.id} flag={f} />)}</div>
                </div>
              )}
            </div>
          </Section>
        ) : (
          <Section id="flags" emoji="🎉" title="Aucune anomalie detectee">
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-neutral-800 mb-1">Tout semble en ordre</p>
              <p className="text-sm text-neutral-500">Aucune incoherence detectee selon les informations fournies.</p>
            </div>
          </Section>
        )}

        {employerQuestions.length > 0 && (
          <Section id="questions" emoji="💬" title="Questions à poser à votre employeur" subtitle="Rédigées en français, prêtes à envoyer par email.">
            <EmployerQuestionsCard questions={employerQuestions} />
          </Section>
        )}

        {neededDocuments.length > 0 && (
          <Section id="documents" emoji="📁" title="Documents utiles pour aller plus loin" subtitle="Ces documents vous aideront a verifier ou completer l'analyse.">
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

        <div className="print:hidden">
          <DirectoryCrossPromo context="general" />
        </div>

        <Section id="disclaimer" emoji="ℹ️" title="Remarque importante">
          <DisclaimerBlock text={disclaimer} />
        </Section>

        <div className="card bg-gradient-to-r from-brand-50 to-white border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <p className="font-semibold text-neutral-800 text-sm mb-0.5">Besoin d'une analyse plus approfondie ?</p>
            <p className="text-xs text-neutral-500">Consultez un expert francophone en droit du travail israelien.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/experts" className="btn-secondary text-sm py-2.5 px-5">Trouver un expert</Link>
            <button onClick={() => { resetAll(); router.push("/analyze"); }} className="btn-primary text-sm py-2.5 px-5">
              Analyser une autre fiche
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
