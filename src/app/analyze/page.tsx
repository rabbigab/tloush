"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

type LocalStep = "upload" | "extracting" | "review" | "questionnaire";

// Messages affichés en rotation pendant l'analyse IA
const LOADING_MESSAGES = [
  { text: "Lecture du document...", done: false },
  { text: "Identification des caracteres hebraiques...", done: false },
  { text: "Traduction des lignes de salaire...", done: false },
  { text: "Analyse des cotisations sociales...", done: false },
  { text: "Verification des conges et absences...", done: false },
  { text: "Calcul du score de confiance...", done: false },
  { text: "Preparation de votre rapport...", done: false },
];

function LoadingState() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedIdx, setCompletedIdx] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCompletedIdx((prev) => prev + 1);
      setCurrentIdx((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 1800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="card flex flex-col items-center justify-center gap-6 py-16 animate-fade-in-up">
      {/* Spinner principal */}
      <div className="relative">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
          <Loader2 size={36} className="text-brand-600 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{Math.min(currentIdx + 1, LOADING_MESSAGES.length)}</span>
        </div>
      </div>

      {/* Titre */}
      <div className="text-center">
        <h3 className="font-bold text-neutral-800 text-lg mb-1">Analyse IA en cours</h3>
        <p className="text-sm text-neutral-500 max-w-xs">
          Notre IA lit et analyse votre fiche de paie hebraique. Cela prend quelques secondes.
        </p>
      </div>

      {/* Messages rotatifs */}
      <div className="w-full max-w-xs space-y-2">
        {LOADING_MESSAGES.map((msg, idx) => {
          const isComplete = idx <= completedIdx;
          const isCurrent = idx === currentIdx && idx > completedIdx;
          const isFuture = idx > currentIdx;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 transition-all duration-300 ${isFuture ? "opacity-30" : "opacity-100"}`}
            >
              {isComplete ? (
                <CheckCircle2 size={14} className="text-success shrink-0" />
              ) : isCurrent ? (
                <span className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-neutral-200 shrink-0" />
              )}
              <span className={`text-xs ${isComplete ? "text-success font-medium" : isCurrent ? "text-brand-700 font-semibold" : "text-neutral-400"}`}>
                {msg.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Barre de progression */}
      <div className="w-full max-w-xs bg-neutral-100 rounded-full h-1.5">
        <div
          className="bg-brand-500 h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${((currentIdx + 1) / LOADING_MESSAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (isDemo) {
      Object.entries(DEMO_USER_CONTEXT).forEach(([k, v]) => {
        updateUserContext({ [k]: v } as Partial<UserContext>);
      });
    }
  }, [isDemo, updateUserContext]);

  // Scroll to top on every step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [localStep]);

  const stepperStep =
    localStep === "upload"     ? 1 :
    localStep === "extracting" ? 1 :
    localStep === "review"     ? 2 : 3;

  const handleFileAccepted = async (file: File) => {
    setExtractionError(null);
    setLocalStep("extracting");
    try {
      const doc = await simulateOcrExtraction(file);
      setExtractedDoc(doc);
      setLocalStep("review");
    } catch {
      setExtractionError(
        "Une erreur est survenue lors de l'analyse. Vérifiez que votre fichier est lisible et réessayez. Si le problème persiste, contactez le support."
      );
      setLocalStep("upload");
    }
  };

  const handleExtractionConfirm = (doc: PayrollDocument) => {
    setPayrollDocument(doc);
    setExtractedDoc(doc);
    setLocalStep("questionnaire");
  };

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

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
          <Sparkles size={15} className="shrink-0" />
          <span>
            <strong>Nouveau :</strong> Créez un compte gratuit pour accéder à l'inbox, l'assistant IA et le suivi de vos documents.{' '}
            <a href="/auth/register" className="underline font-semibold hover:text-blue-800">Créer mon compte</a>
          </span>
        </div>

        {isDemo && (
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-6 text-sm text-brand-700">
            <Sparkles size={15} className="shrink-0" />
            <span><strong>Mode demo</strong> — Vous visualisez une fiche de paie fictive representative.</span>
          </div>
        )}

        <div className="mb-8">
          <ProgressStepper steps={ANALYZE_STEPS} currentStep={stepperStep} />
        </div>

        {localStep === "upload" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="section-title">Importez votre fiche de paie</h2>
              <p className="section-subtitle">
                Glissez-déposez votre tloush (bulletin de salaire) ou sélectionnez-le.
                Formats acceptés : PDF, JPG, PNG.
              </p>
            </div>
            <UploadZone onFileAccepted={handleFileAccepted} />
            {extractionError && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
                <p className="font-semibold mb-1">Erreur d'analyse</p>
                <p>{extractionError}</p>
              </div>
            )}
            <DisclaimerBlock compact />
          </div>
        )}

        {localStep === "extracting" && <LoadingState />}

        {localStep === "review" && extractedDoc && (
          <div className="animate-fade-in-up">
            <ExtractionReviewForm document={extractedDoc} onConfirm={handleExtractionConfirm} />
          </div>
        )}

        {localStep === "questionnaire" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="section-title">Quelques questions sur votre situation</h2>
              <p className="section-subtitle">
                Ces informations nous permettent de personaliser votre analyse
                et de detecter des anomalies specifiques a votre contexte.
              </p>
            </div>
            <SmartQuestionnaire initialContext={userContext} onComplete={handleQuestionnaireComplete} />
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
