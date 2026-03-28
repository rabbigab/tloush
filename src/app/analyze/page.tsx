"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProgressStepper, { ANALYZE_STEPS } from "@/components/shared/ProgressStepper";
import UploadZone from "@/components/upload/UploadZone";
import ExtractionReviewForm from "@/components/extraction/ExtractionReviewForm";
import SmartQuestionnaire from "@/components/questionnaire/SmartQuestionnaire";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import { useAnalysisStore } from "@/store/analysisStore";
import { simulateOcrExtraction, DEMO_PAYROLL_DOCUMENT, DEMO_USER_CONTEXT } from "@/data/mockPayroll";
import { buildReport } from "@/lib/reportBuilder";
import type { PayrollDocument, UserContext } from "@/types";
import { Loader2, Sparkles } from "lucide-react";

type LocalStep = "upload" | "extracting" | "review" | "questionnaire";

function AnalyzeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const isDemo = params.get("demo") === "true";

  const { setPayrollDocument, setFinalReport, updateUserContext, userContext } = useAnalysisStore();

  const [localStep, setLocalStep] = useState<LocalStep>(isDemo ? "review" : "upload");
  const [extractedDoc, setExtractedDoc] = useState<PayrollDocument | null>(
    isDemo ? DEMO_PAYROLL_DOCUMENT : null
  );
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Si mode démo, on prépare aussi le contexte
  useEffect(() => {
    if (isDemo) {
      Object.entries(DEMO_USER_CONTEXT).forEach(([k, v]) => {
        updateUserContext({ [k]: v } as Partial<UserContext>);
      });
    }
  }, [isDemo, updateUserContext]);

  // Step du stepper (1-based)
  const stepperStep =
    localStep === "upload"        ? 1 :
    localStep === "extracting"    ? 1 :
    localStep === "review"        ? 2 :
    /* questionnaire */             3;

  // ---- Gestion upload ----
  const handleFileAccepted = async (file: File) => {
    setExtractionError(null);
    setLocalStep("extracting");
    try {
      const doc = await simulateOcrExtraction(file);
      setExtractedDoc(doc);
      setLocalStep("review");
    } catch {
      setExtractionError("Une erreur est survenue lors de la lecture du document. Réessayez avec un fichier de meilleure qualité.");
      setLocalStep("upload");
    }
  };

  // ---- Validation de l'extraction ----
  const handleExtractionConfirm = (doc: PayrollDocument) => {
    setPayrollDocument(doc);
    setExtractedDoc(doc);
    setLocalStep("questionnaire");
  };

  // ---- Fin du questionnaire → génération du rapport ----
  const handleQuestionnaireComplete = (ctx: UserContext) => {
    if (!extractedDoc) return;
    const report = buildReport(extractedDoc, ctx);
    setFinalReport(report);
    router.push("/results");
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Bandeau démo */}
        {isDemo && (
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-6 text-sm text-brand-700">
            <Sparkles size={15} className="shrink-0" />
            <span>
              <strong>Mode démo</strong> — Vous visualisez une fiche de paie fictive représentative.
            </span>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8">
          <ProgressStepper steps={ANALYZE_STEPS} currentStep={stepperStep} />
        </div>

        {/* ===== STEP 1 — UPLOAD ===== */}
        {localStep === "upload" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="section-title">Téléversez votre fiche de paie</h2>
              <p className="section-subtitle">
                Glissez-déposez votre tloush (bulletin de salaire) ou sélectionnez-le.
                Formats acceptés : PDF, JPG, PNG.
              </p>
            </div>
            <UploadZone onFileAccepted={handleFileAccepted} />
            {extractionError && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
                {extractionError}
              </div>
            )}
            <DisclaimerBlock compact />
          </div>
        )}

        {/* ===== STEP 1b — EXTRACTION EN COURS ===== */}
        {localStep === "extracting" && (
          <div className="card flex flex-col items-center justify-center gap-6 py-16 animate-fade-in-up">
            <div className="relative">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
                <Loader2 size={36} className="text-brand-600 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-neutral-800 text-lg mb-2">
                Analyse en cours…
              </h3>
              <p className="text-sm text-neutral-500 max-w-sm">
                Nous lisons et identifions les lignes de votre fiche de paie.
                Cela prend quelques secondes.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 items-start">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                Lecture du document…
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse animation-delay-100" />
                Identification des lignes hébraïques…
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                Traduction et normalisation…
              </span>
            </div>
          </div>
        )}

        {/* ===== STEP 2 — REVIEW ===== */}
        {localStep === "review" && extractedDoc && (
          <div className="animate-fade-in-up">
            <ExtractionReviewForm
              document={extractedDoc}
              onConfirm={handleExtractionConfirm}
            />
          </div>
        )}

        {/* ===== STEP 3 — QUESTIONNAIRE ===== */}
        {localStep === "questionnaire" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="section-title">Quelques questions sur votre situation</h2>
              <p className="section-subtitle">
                Ces informations nous permettent de personnaliser votre analyse
                et de détecter des anomalies spécifiques à votre contexte.
              </p>
            </div>
            <SmartQuestionnaire
              initialContext={userContext}
              onComplete={handleQuestionnaireComplete}
            />
            <DisclaimerBlock compact />
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-brand-500 animate-spin" />
      </main>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
