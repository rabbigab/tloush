"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProgressStepper from "@/components/shared/ProgressStepper";
import UploadZone from "@/components/upload/UploadZone";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import { Loader2, ChevronRight, AlertCircle, CheckCircle, Eye } from "lucide-react";
import clsx from "clsx";
import type { DocumentType, DocumentAnalysis, ScanApiResponse, DocumentTypeCard, ContractAnalysis, OfficialLetterAnalysis, TaxNoticeAnalysis, LeaseAnalysis, TerminationAnalysis } from "@/types/scanner";
import { DOCUMENT_TYPES } from "@/types/scanner";

const SCANNER_STEPS: import("@/components/shared/ProgressStepper").Step[] = [
  { id: 1, label: "Type de document", shortLabel: "Type" },
  { id: 2, label: "Téléversement", shortLabel: "Upload" },
  { id: 3, label: "Résultats", shortLabel: "Résultats" },
];

type LocalStep = "selectType" | "upload" | "analyzing" | "results";

function ScannerContent() {
  const router = useRouter();

  const [localStep, setLocalStep] = useState<LocalStep>("selectType");
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScanApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Scroll to top on every step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [localStep]);

  // Determine stepper step (1-based)
  const stepperStep =
    localStep === "selectType" ? 1 :
    localStep === "upload" ? 2 :
    localStep === "analyzing" ? 2 :
    /* results */ 3;

  // ---- Handle document type selection ----
  const handleSelectDocType = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setLocalStep("upload");
    setError(null);
  };

  // ---- Handle back from upload to type selection ----
  const handleBackToTypes = () => {
    setLocalStep("selectType");
    setUploadedFile(null);
    setError(null);
  };

  // ---- Handle file upload ----
  const handleFileAccepted = async (file: File) => {
    setError(null);
    setUploadedFile(file);
    setIsAnalyzing(true);
    setLocalStep("analyzing");

    if (!selectedDocType) {
      setError("Veuillez sélectionner un type de document.");
      setLocalStep("selectType");
      setIsAnalyzing(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 330_000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", selectedDocType);

      console.log("[scanner] POST /api/scan", { docType: selectedDocType, fileName: file.name, size: file.size });
      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      console.log("[scanner] response status:", response.status);

      if (!response.ok) {
        const status = response.status;
        const data = await response.json().catch(() => ({}));
        console.warn("[scanner] error response:", status, data);
        const msg = status === 429
          ? "Limite atteinte : 10 analyses par heure. Réessayez plus tard."
          : status === 401
          ? "Vous devez être connecté pour utiliser le scanner. Connectez-vous puis réessayez."
          : status === 403
          ? (data.error || "Accès refusé. Vérifiez votre abonnement ou votre quota.")
          : status === 413
          ? "Fichier trop volumineux (max 25 Mo)."
          : status === 504 || status === 408
          ? "L'analyse a pris trop de temps. Réessayez avec un document plus petit ou contactez le support."
          : (data.error || `Une erreur est survenue lors de l'analyse (code ${status}). Réessayez ou contactez le support.`);
        throw new Error(msg);
      }

      const result: ScanApiResponse = await response.json();
      console.log("[scanner] result received", { documentType: result.documentType, confidence: result.confidenceScore });

      // Defensive: make sure the response has the expected shape
      if (!result.data || !result.documentType) {
        throw new Error("Réponse du serveur invalide. Réessayez ou contactez le support.");
      }

      setAnalysisResult(result);
      setLocalStep("results");
    } catch (err) {
      console.error("[scanner] handleFileAccepted error:", err);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Le délai d'analyse a été dépassé. Réessayez avec un document plus petit ou contactez le support.");
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Erreur de connexion réseau. Vérifiez votre connexion internet.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de l'analyse du document."
        );
      }
      setLocalStep("upload");
    } finally {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    }
  };

  // ---- Handle back from results ----
  const handleBackToUpload = () => {
    setLocalStep("upload");
    setAnalysisResult(null);
    setUploadedFile(null);
    setError(null);
  };

  // ---- Handle consulting expert ----
  const handleConsultExpert = () => {
    // Store scan result in sessionStorage or route to experts
    sessionStorage.setItem("lastScanResult", JSON.stringify(analysisResult));
    router.push("/experts");
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Stepper */}
        <div className="mb-8">
          <ProgressStepper steps={SCANNER_STEPS} currentStep={stepperStep} />
        </div>

        {/* ===== STEP 1 — SELECT DOCUMENT TYPE ===== */}
        {localStep === "selectType" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="section-title">Quel type de document analysez-vous ?</h2>
              <p className="section-subtitle">
                Sélectionnez le type de document hébraïque que vous souhaitez analyser.
              </p>
            </div>

            {/* Document type cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DOCUMENT_TYPES.map((docType) => (
                <button
                  key={docType.id}
                  onClick={() => handleSelectDocType(docType.id)}
                  className={clsx(
                    "card p-4 text-left transition-all duration-200",
                    "border-2 hover:border-brand-400 hover:shadow-md",
                    "active:scale-[0.98]",
                    selectedDocType === docType.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-neutral-200"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{docType.icon}</span>
                        <h3 className="font-semibold text-neutral-900">{docType.label}</h3>
                      </div>
                      <p className="text-sm text-neutral-600">{docType.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-brand-400 shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>

            <DisclaimerBlock compact />
          </div>
        )}

        {/* ===== STEP 2 — UPLOAD ===== */}
        {localStep === "upload" && selectedDocType && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleBackToTypes}
                className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1"
              >
                ← Retour
              </button>
            </div>

            <div>
              <h2 className="section-title">Téléversez votre document</h2>
              <p className="section-subtitle">
                Glissez-déposez votre fichier ou sélectionnez-le.
                Formats acceptés : PDF, JPG, PNG.
              </p>
            </div>

            <UploadZone onFileAccepted={handleFileAccepted} />

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <DisclaimerBlock compact />
          </div>
        )}

        {/* ===== STEP 2b — ANALYZING ===== */}
        {localStep === "analyzing" && (
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
                Nous lisons et analysons votre document hébraïque.
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
                Identification du contenu…
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                Extraction des données…
              </span>
            </div>
          </div>
        )}

        {/* ===== STEP 3 — RESULTS ===== */}
        {localStep === "results" && analysisResult && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleBackToUpload}
                className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1"
              >
                ← Modifier
              </button>
            </div>

            {/* Document type badge */}
            <div>
              <h2 className="section-title">Résultats de l'analyse</h2>
              <p className="section-subtitle">
                Voici les informations extraites de votre document.
              </p>
            </div>

            {/* Document type badge */}
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2">
              <span className="text-xl">
                {DOCUMENT_TYPES.find((d) => d.id === analysisResult.documentType)?.icon}
              </span>
              <span className="text-sm font-semibold text-brand-700">
                {DOCUMENT_TYPES.find((d) => d.id === analysisResult.documentType)?.label}
              </span>
            </div>

            {/* Confidence score */}
            <div className="card p-4 bg-neutral-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-neutral-700">
                  Confiance dans l'extraction
                </span>
                <span className={clsx(
                  "text-sm font-bold",
                  analysisResult.confidenceScore >= 80 ? "text-success" :
                  analysisResult.confidenceScore >= 60 ? "text-warning" :
                  "text-danger"
                )}>
                  {analysisResult.confidenceScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full transition-all duration-300",
                    analysisResult.confidenceScore >= 80 ? "bg-success" :
                    analysisResult.confidenceScore >= 60 ? "bg-warning" :
                    "bg-danger"
                  )}
                  style={{ width: `${analysisResult.confidenceScore}%` }}
                />
              </div>
            </div>

            {/* Results by document type */}
            <ScanResultsDisplay result={analysisResult} />

            {/* Alerts section */}
            {hasAlerts(analysisResult.data) && (
              <div className="space-y-3">
                <h3 className="font-semibold text-neutral-800">Alertes détectées</h3>
                {getAlerts(analysisResult.data).map((alert, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "card p-4 border-l-4",
                      alert.severity === "high" && "border-l-danger bg-danger/5",
                      alert.severity === "medium" && "border-l-warning bg-warning/5",
                      alert.severity === "low" && "border-l-info bg-info/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={18}
                        className={clsx(
                          "shrink-0 mt-0.5",
                          alert.severity === "high" && "text-danger",
                          alert.severity === "medium" && "text-warning",
                          alert.severity === "low" && "text-info"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm mb-1">
                          {alert.message}
                        </p>
                        {alert.recommendation && (
                          <p className="text-xs text-neutral-600">
                            Recommandation : {alert.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleConsultExpert}
                className={clsx(
                  "btn btn-primary w-full",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Eye size={18} />
                Consulter un expert
              </button>
              <button
                onClick={handleBackToTypes}
                className="btn btn-secondary w-full"
              >
                Analyser un autre document
              </button>
            </div>

            <DisclaimerBlock compact />
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-brand-500 animate-spin" />
      </main>
    }>
      <ScannerContent />
    </Suspense>
  );
}

// ============================================================
// Helper Components & Functions
// ============================================================

interface ScanResultsDisplayProps {
  result: ScanApiResponse;
}

function ScanResultsDisplay({ result }: ScanResultsDisplayProps) {
  const { documentType, data } = result;

  switch (documentType) {
    case "contract":
      return <ContractResults data={data as ContractAnalysis} />;
    case "officialLetter":
      return <OfficialLetterResults data={data as OfficialLetterAnalysis} />;
    case "taxNotice":
      return <TaxNoticeResults data={data as TaxNoticeAnalysis} />;
    case "lease":
      return <LeaseResults data={data as LeaseAnalysis} />;
    case "termination":
      return <TerminationResults data={data as TerminationAnalysis} />;
    default:
      return null;
  }
}

function ContractResults({ data }: { data: ContractAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.employerName && (
          <ResultField label="Employeur" value={data.employerName} />
        )}
        {data.employeeName && (
          <ResultField label="Salarié" value={data.employeeName} />
        )}
        {data.salary && (
          <ResultField label="Salaire mensuel" value={`${data.salary.toLocaleString()} ₪`} />
        )}
        {data.workHours && (
          <ResultField label="Heures/semaine" value={`${data.workHours} h`} />
        )}
        {data.startDate && (
          <ResultField label="Date de début" value={new Date(data.startDate).toLocaleDateString("fr-FR")} />
        )}
        {data.endDate && (
          <ResultField label="Date de fin" value={new Date(data.endDate).toLocaleDateString("fr-FR")} />
        )}
      </div>

      {data.benefits && (
        <div className="card p-4 bg-neutral-50">
          <h4 className="font-semibold text-neutral-900 mb-3">Avantages</h4>
          <div className="flex flex-wrap gap-2">
            {data.benefits.pension && <Badge label="Pension" color="success" />}
            {data.benefits.kerenHishtalmut && <Badge label="Keren Hishtalmut" color="success" />}
            {data.benefits.healthInsurance && <Badge label="Assurance santé" color="success" />}
            {data.benefits.other?.map((b: string) => (
              <Badge key={b} label={b} color="info" />
            ))}
          </div>
        </div>
      )}

      {data.overallAssessment && (
        <div className={clsx(
          "card p-4",
          data.overallAssessment === "standard" && "bg-success/5 border-l-4 border-l-success",
          data.overallAssessment === "attention_needed" && "bg-warning/5 border-l-4 border-l-warning",
          data.overallAssessment === "problematic" && "bg-danger/5 border-l-4 border-l-danger"
        )}>
          <h4 className="font-semibold text-neutral-900">Évaluation</h4>
          <p className={clsx(
            "text-sm mt-1",
            data.overallAssessment === "standard" && "text-success-700",
            data.overallAssessment === "attention_needed" && "text-warning-700",
            data.overallAssessment === "problematic" && "text-danger-700"
          )}>
            {data.overallAssessment === "standard" ? "Contrat standard" :
             data.overallAssessment === "attention_needed" ? "Attention requise" :
             "Contrat problématique"}
          </p>
        </div>
      )}
    </div>
  );
}

function OfficialLetterResults({ data }: { data: OfficialLetterAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.sender && <ResultField label="Expéditeur" value={data.sender} />}
        {data.subject && <ResultField label="Sujet" value={data.subject} />}
        {data.deadline && (
          <ResultField label="Date limite" value={new Date(data.deadline).toLocaleDateString("fr-FR")} />
        )}
      </div>

      {data.urgencyLevel && (
        <div className="card p-4 bg-neutral-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-700">Urgence</span>
            <Badge
              label={
                data.urgencyLevel === "urgent" ? "Urgent" :
                data.urgencyLevel === "action_required" ? "Action requise" :
                data.urgencyLevel === "informational" ? "Informatif" :
                "À archiver"
              }
              color={
                data.urgencyLevel === "urgent" ? "danger" :
                data.urgencyLevel === "action_required" ? "warning" :
                data.urgencyLevel === "informational" ? "info" :
                "neutral"
              }
            />
          </div>
        </div>
      )}

      {data.summary && (
        <div className="card p-4 bg-brand-50">
          <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Résumé</h4>
          <p className="text-sm text-neutral-700">{data.summary}</p>
        </div>
      )}

      {data.actionRequired && (
        <div className="card p-4 bg-warning/5 border-l-4 border-l-warning">
          <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Action requise</h4>
          <p className="text-sm text-neutral-700">{data.actionRequired}</p>
        </div>
      )}
    </div>
  );
}

function TaxNoticeResults({ data }: { data: TaxNoticeAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.taxYear && <ResultField label="Année fiscale" value={data.taxYear} />}
        {data.totalIncome && (
          <ResultField label="Revenu total" value={`${data.totalIncome.toLocaleString()} ₪`} />
        )}
        {data.totalTax && (
          <ResultField label="Impôt total" value={`${data.totalTax.toLocaleString()} ₪`} />
        )}
      </div>

      {data.refundAmount !== undefined && data.refundAmount !== null && (
        <div className={clsx(
          "card p-4",
          data.refundAmount > 0 ? "bg-success/5 border-l-4 border-l-success" : "bg-warning/5 border-l-4 border-l-warning"
        )}>
          <h4 className="font-semibold text-neutral-900 text-sm mb-1">
            {data.refundAmount > 0 ? "Remboursement prévu" : "Montant dû"}
          </h4>
          <p className={clsx(
            "text-lg font-bold",
            data.refundAmount > 0 ? "text-success" : "text-warning"
          )}>
            {Math.abs(data.refundAmount).toLocaleString()} ₪
          </p>
        </div>
      )}

      {data.olimBenefitsApplied && (
        <div className="card p-4 bg-info/5 border-l-4 border-l-info">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-info" />
            <p className="text-sm font-semibold text-neutral-900">Avantages olim appliqués</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaseResults({ data }: { data: LeaseAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.landlordName && <ResultField label="Propriétaire" value={data.landlordName} />}
        {data.tenantName && <ResultField label="Locataire" value={data.tenantName} />}
        {data.monthlyRent && (
          <ResultField label="Loyer mensuel" value={`${data.monthlyRent.toLocaleString()} ₪`} />
        )}
        {data.deposit && (
          <ResultField label="Dépôt" value={`${data.deposit.toLocaleString()} ₪`} />
        )}
        {data.address && <ResultField label="Adresse" value={data.address} />}
        {data.duration && <ResultField label="Durée" value={data.duration} />}
      </div>

      {data.abusiveClauses && data.abusiveClauses.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-neutral-900 text-sm">Clauses problématiques</h4>
          {data.abusiveClauses.map((clause, idx) => (
            <div
              key={idx}
              className="card p-3 bg-danger/5 border-l-4 border-l-danger"
            >
              <p className="text-xs font-semibold text-danger mb-1">{clause.issue}</p>
              <p className="text-xs text-neutral-700">{clause.clause}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TerminationResults({ data }: { data: TerminationAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.employerName && <ResultField label="Employeur" value={data.employerName} />}
        {data.employeeName && <ResultField label="Salarié" value={data.employeeName} />}
        {data.terminationDate && (
          <ResultField label="Date de licenciement" value={new Date(data.terminationDate).toLocaleDateString("fr-FR")} />
        )}
        {data.lastWorkDay && (
          <ResultField label="Dernier jour" value={new Date(data.lastWorkDay).toLocaleDateString("fr-FR")} />
        )}
      </div>

      {data.severanceMentioned?.present && (
        <div className="card p-4 bg-brand-50">
          <h4 className="font-semibold text-neutral-900 text-sm mb-1">Indemnité de fin de contrat</h4>
          <p className="text-lg font-bold text-brand-700">
            {data.severanceMentioned.amount?.toLocaleString()} ₪
          </p>
        </div>
      )}

      {data.pitzuimCalculation && (
        <div className={clsx(
          "card p-4",
          data.pitzuimCalculation.matches ? "bg-success/5 border-l-4 border-l-success" : "bg-danger/5 border-l-4 border-l-danger"
        )}>
          <h4 className="font-semibold text-neutral-900 text-sm mb-2">Vérification du pitzuim</h4>
          <div className="space-y-1 text-xs">
            <p className="text-neutral-700">
              Montant attendu : <span className="font-semibold">{data.pitzuimCalculation.expected?.toLocaleString()} ₪</span>
            </p>
            <p className="text-neutral-700">
              Montant mentionné : <span className="font-semibold">{data.pitzuimCalculation.mentioned?.toLocaleString()} ₪</span>
            </p>
            {data.pitzuimCalculation.matches === false && (
              <p className="text-danger font-semibold mt-2">⚠️ Les montants ne correspondent pas</p>
            )}
          </div>
        </div>
      )}

      {data.legalComplianceIssues && data.legalComplianceIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-neutral-900 text-sm">Problèmes légaux</h4>
          {data.legalComplianceIssues.map((issue, idx) => (
            <div
              key={idx}
              className={clsx(
                "card p-3",
                issue.severity === "high" && "bg-danger/5 border-l-4 border-l-danger",
                issue.severity === "medium" && "bg-warning/5 border-l-4 border-l-warning",
                issue.severity === "low" && "bg-info/5 border-l-4 border-l-info"
              )}
            >
              <p className="text-xs font-semibold text-neutral-900 mb-1">{issue.issue}</p>
              <p className="text-xs text-neutral-600">→ {issue.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Utility Components
// ============================================================

function ResultField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-3 bg-neutral-50">
      <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-neutral-900 truncate">{value}</p>
    </div>
  );
}

interface BadgeProps {
  label: string;
  color: "success" | "warning" | "danger" | "info" | "brand" | "neutral";
}

function Badge({ label, color }: BadgeProps) {
  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
      color === "success" && "bg-success/20 text-success",
      color === "warning" && "bg-warning/20 text-warning",
      color === "danger" && "bg-danger/20 text-danger",
      color === "info" && "bg-info/20 text-info",
      color === "brand" && "bg-brand/20 text-brand",
      color === "neutral" && "bg-neutral-200 text-neutral-700"
    )}>
      {label}
    </span>
  );
}

// ============================================================
// Helpers for extracting alerts
// ============================================================

interface Alert {
  message: string
  severity: "high" | "medium" | "low"
  recommendation?: string
}

function hasAlerts(data: DocumentAnalysis): boolean {
  if ("alerts" in data && Array.isArray(data.alerts) && data.alerts.length > 0) {
    return true;
  }
  return false;
}

function getAlerts(data: DocumentAnalysis): Alert[] {
  if ("alerts" in data && Array.isArray(data.alerts)) {
    return data.alerts as Alert[];
  }
  return [];
}
