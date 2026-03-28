import type { FinalReport, PayrollDocument, UserContext, EmployerQuestion, NeededDocument, ReportSummary } from "@/types";
import { runRuleEngine } from "./ruleEngine";
import { computeSeniorityMonths } from "./questionnaireLogic";

const DISCLAIMER = "Ce rapport est fourni à titre indicatif et pédagogique uniquement. Il ne constitue pas un avis juridique, comptable ou professionnel. En cas de doute, consultez un conseiller juridique spécialisé en droit du travail israélien.";

function buildEmployerQuestions(doc: PayrollDocument, ctx: UserContext): EmployerQuestion[] {
  const questions: EmployerQuestion[] = [];
  if (ctx.didOvertime && !doc.overtimeHours) questions.push({ id: "q-overtime", question: "Pouvez-vous me fournir le détail du calcul de mes heures supplémentaires pour ce mois ?", context: "Vous avez effectué des heures supplémentaires qui ne semblent pas clairement apparaître sur la fiche." });
  if (!doc.pensionDetected && ctx.hasPensionViaEmployer) questions.push({ id: "q-pension", question: "Pouvez-vous me confirmer que les versements à mon fonds de pension sont bien effectués ce mois-ci ?", context: "La cotisation pension n'est pas clairement visible sur la fiche." });
  if (!doc.incomeTaxDetected && doc.grossSalary && doc.grossSalary > 7000) questions.push({ id: "q-tax", question: "Pourquoi l'impôt sur le revenu (mas hachnasa) n'apparaît-il pas sur cette fiche ?", context: "Avec votre niveau de salaire, une retenue fiscale est habituellement appliquée." });
  if (ctx.tookVacation && ctx.vacationDays && doc.leaveBalance === null) questions.push({ id: "q-leave", question: `J'ai pris ${ctx.vacationDays} jour(s) de congés ce mois-ci. Pouvez-vous confirmer que mon solde est à jour ?`, context: "Le solde de congés n'est pas visible et vous avez pris des jours ce mois-ci." });
  const months = computeSeniorityMonths(ctx.startDate);
  if (months && months >= 24) questions.push({ id: "q-seniority", question: "Quelle ancienneté avez-vous retenue pour le calcul de mes droits (congés, prime Havraa, pension) ?", context: "Avec plus de 2 ans d'ancienneté, certains droits évoluent." });
  if (ctx.wasSick && ctx.sickDays) questions.push({ id: "q-sick", question: `Pouvez-vous m'expliquer comment mes ${ctx.sickDays} jour(s) d'absence maladie ont été traités ?`, context: "Vous avez été absent(e) pour maladie ce mois-ci." });
  if (ctx.gotBonus) questions.push({ id: "q-bonus", question: "Pouvez-vous me détailler le calcul de la prime versée ce mois-ci ?", context: "Vous avez indiqué avoir reçu une prime ce mois-ci." });
  questions.push({ id: "q-explain", question: "Pourriez-vous m'expliquer les principales déductions de cette fiche ?", context: "Demander une explication écrite permet de comprendre et d'archiver les informations." });
  return questions;
}

function buildNeededDocuments(doc: PayrollDocument, ctx: UserContext): NeededDocument[] {
  const docs: NeededDocument[] = [];
  if (!ctx.hasContract) docs.push({ id: "d-contract", name: "Contrat de travail (hozé avoda)", reason: "Permet de vérifier les conditions convenues : salaire, heures, avantages et droits." });
  if (ctx.didOvertime && !ctx.hasTimesheet) docs.push({ id: "d-timesheet", name: "Relevé d'heures (duch sha'ot)", reason: "Indispensable pour vérifier le calcul des heures supplémentaires." });
  if (!ctx.hasPreviousPayslips) docs.push({ id: "d-prev-payslips", name: "Fiches de paie des mois précédents", reason: "Permettent de repérer des variations inhabituelles." });
  if (!doc.pensionDetected || !ctx.hasPensionStatement) docs.push({ id: "d-pension", name: "Relevé du fonds de pension", reason: "Permet de vérifier que les versements sont bien effectués." });
  if (ctx.wasSick && !ctx.hasMedicalCertificate) docs.push({ id: "d-medical", name: "Certificat médical (te'udat holim)", reason: "Nécessaire pour valider les droits aux indemnités maladie." });
  return docs;
}

function buildSummary(doc: PayrollDocument, ctx: UserContext, alertLevel: "none" | "low" | "medium" | "high", flagCount: number): ReportSummary {
  return {
    period: doc.period ?? "Période non identifiée",
    employer: doc.employerName ?? "Employeur non identifié",
    payType: ctx.payType === "monthly" ? "Mensuel" : ctx.payType === "hourly" ? "Horaire" : "Non précisé",
    confidenceLevel: doc.confidenceScore >= 70 ? "high" : doc.confidenceScore >= 45 ? "medium" : "low",
    alertLevel,
    alertCount: flagCount,
  };
}

export function buildReport(doc: PayrollDocument, ctx: UserContext): FinalReport {
  const { flags, positiveFindings, alertLevel } = runRuleEngine(doc, ctx);
  return {
    generatedAt: new Date().toISOString(),
    summary: buildSummary(doc, ctx, alertLevel, flags.length),
    extractedData: doc,
    userContext: ctx,
    positiveFindings,
    flags,
    employerQuestions: buildEmployerQuestions(doc, ctx),
    neededDocuments: buildNeededDocuments(doc, ctx),
    disclaimer: DISCLAIMER,
  };
}
