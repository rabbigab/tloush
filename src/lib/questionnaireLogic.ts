import type { Question, UserContext } from "@/types";

export const QUESTIONS: Question[] = [
  { id: "payType", block: "A", type: "select", label: "Comment êtes-vous rémunéré ?", helpText: "Cela influe sur le calcul de votre salaire et de vos droits.", options: [{ value: "monthly", label: "Au mois" }, { value: "hourly", label: "À l'heure" }, { value: "unknown", label: "Je ne suis pas sûr(e)" }], required: true },
  { id: "startDate", block: "A", type: "date", label: "Depuis quelle date travaillez-vous dans cette entreprise ?", helpText: "Votre ancienneté conditionne plusieurs droits.", required: true },
  { id: "workTime", block: "A", type: "select", label: "Vous travaillez à…", options: [{ value: "full", label: "Temps plein (100%)" }, { value: "part", label: "Temps partiel" }, { value: "unknown", label: "Je ne suis pas sûr(e)" }], required: true },
  { id: "salaryType", block: "A", type: "select", label: "Votre salaire est-il fixe ou variable ?", options: [{ value: "fixed", label: "Fixe" }, { value: "variable", label: "Variable" }, { value: "unknown", label: "Un peu des deux" }], required: true },
  { id: "hasContract", block: "A", type: "boolean", label: "Avez-vous un contrat de travail écrit ?", required: false },
  { id: "isFirstPayslip", block: "A", type: "boolean", label: "Est-ce votre première fiche de paie dans cette entreprise ?", required: false },
  { id: "tookVacation", block: "B", type: "boolean", label: "Avez-vous pris des jours de vacances ce mois-ci ?", required: false },
  { id: "vacationDays", block: "B", type: "number", label: "Combien de jours de vacances avez-vous pris ?", showIf: (ctx) => ctx.tookVacation === true, required: false },
  { id: "wasSick", block: "B", type: "boolean", label: "Avez-vous été absent(e) pour maladie ce mois-ci ?", required: false },
  { id: "sickDays", block: "B", type: "number", label: "Combien de jours d'absence maladie ?", showIf: (ctx) => ctx.wasSick === true, required: false },
  { id: "hasMedicalCertificate", block: "B", type: "boolean", label: "Avez-vous remis un certificat médical ?", showIf: (ctx) => ctx.wasSick === true, required: false },
  { id: "hadUnpaidLeave", block: "B", type: "boolean", label: "Avez-vous eu un congé non payé ce mois-ci ?", required: false },
  { id: "didOvertime", block: "B", type: "boolean", label: "Avez-vous effectué des heures supplémentaires ?", helpText: "En Israël, les heures sup sont majorées à 125% puis 150%.", required: false },
  { id: "workedHoliday", block: "B", type: "boolean", label: "Avez-vous travaillé un jour férié ou shabbat ?", required: false },
  { id: "gotBonus", block: "B", type: "boolean", label: "Avez-vous reçu une prime ce mois-ci ?", required: false },
  { id: "moreThanOneYear", block: "C", type: "boolean", label: "Travaillez-vous ici depuis plus d'un an ?", required: false },
  { id: "hasPensionViaEmployer", block: "C", type: "boolean", label: "Cotisez-vous à un fonds de pension via cet employeur ?", required: false },
  { id: "receivesRegularAllowances", block: "C", type: "boolean", label: "Recevez-vous des indemnités habituelles (transport, repas…) ?", required: false },
  { id: "postOrHoursChanged", block: "C", type: "boolean", label: "Votre poste ou volume horaire a-t-il changé récemment ?", required: false },
  { id: "hadIncompleteMonth", block: "C", type: "boolean", label: "Avez-vous eu des mois incomplets récemment ?", required: false },
  { id: "hasTimesheet", block: "D", type: "boolean", label: "Disposez-vous d'un relevé d'heures ?", required: false },
  { id: "hasPreviousPayslips", block: "D", type: "boolean", label: "Avez-vous vos fiches de paie des mois précédents ?", required: false },
  { id: "hasPensionStatement", block: "D", type: "boolean", label: "Disposez-vous d'un relevé de votre fonds de pension ?", required: false },
];

export function getVisibleQuestions(ctx: Partial<UserContext>, block?: "A" | "B" | "C" | "D"): Question[] {
  return QUESTIONS.filter((q) => {
    if (block && q.block !== block) return false;
    if (q.showIf && !q.showIf(ctx)) return false;
    return true;
  });
}

export const QUESTION_BLOCKS: { id: "A" | "B" | "C" | "D"; title: string; description: string }[] = [
  { id: "A", title: "Votre profil", description: "Quelques informations sur votre contrat et votre situation." },
  { id: "B", title: "Le mois concerné", description: "Ce qui s'est passé pendant la période de cette fiche de paie." },
  { id: "C", title: "Vos droits et historique", description: "Votre ancienneté et vos droits habituels." },
  { id: "D", title: "Documents disponibles", description: "Les documents que vous avez sous la main." },
];

export function computeSeniorityMonths(startDateISO: string | null): number | null {
  if (!startDateISO) return null;
  const start = new Date(startDateISO);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
}
