// ============================================================
// RULE ENGINE — Moteur de règles modulaire et extensible
// ============================================================
// Chaque règle est une fonction pure qui prend le document
// extrait + le contexte utilisateur et retourne soit null
// (pas d'anomalie), soit un AnalysisFlag.
// Pour ajouter une règle, il suffit de l'ajouter à RULES[].
// ============================================================

import type {
  AnalysisFlag,
  PayrollDocument,
  UserContext,
  PositiveFinding,
  FlagSeverity,
  FlagCategory,
} from "@/types";
import { computeSeniorityMonths } from "./questionnaireLogic";

// ---- Utilitaires ----
let flagCounter = 0;
function flag(
  severity: FlagSeverity,
  category: FlagCategory,
  title: string,
  message: string,
  explanation: string,
  recommendation: string
): AnalysisFlag {
  return {
    id: `flag-${++flagCounter}`,
    severity,
    category,
    title,
    message,
    explanation,
    recommendation,
  };
}

function positive(
  category: FlagCategory,
  title: string,
  message: string
): PositiveFinding {
  return {
    id: `ok-${Math.random().toString(36).slice(2, 7)}`,
    category,
    title,
    message,
  };
}

// ---- Type d'une règle ----
type Rule = (
  doc: PayrollDocument,
  ctx: UserContext
) => AnalysisFlag | null;

type PositiveRule = (
  doc: PayrollDocument,
  ctx: UserContext
) => PositiveFinding | null;

// ============================================================
// RÈGLES D'ALERTE
// ============================================================
const RULES: Rule[] = [

  // R01 — Net > Brut (aberration)
  (doc) => {
    if (doc.netSalary !== null && doc.grossSalary !== null && doc.netSalary > doc.grossSalary) {
      return flag(
        "high", "salary",
        "Salaire net supérieur au brut",
        "Le montant net semble supérieur au brut, ce qui est normalement impossible.",
        "Le salaire net est toujours inférieur au brut, car il faut déduire les cotisations et impôts. Cette incohérence peut indiquer une erreur de saisie ou une ligne mal attribuée.",
        "Vérifiez les lignes de brut et de net sur votre fiche. Demandez une explication écrite à votre service RH."
      );
    }
    return null;
  },

  // R02 — Brut manquant
  (doc) => {
    if (doc.grossSalary === null) {
      return flag(
        "medium", "readability",
        "Salaire brut non identifié",
        "Nous n'avons pas pu lire le montant brut sur la fiche.",
        "Le salaire brut est la base de calcul de toutes vos cotisations. Son absence rend l'analyse incomplète.",
        "Vérifiez manuellement la ligne 'ברוטו' ou 'שכר ברוטו' sur votre fiche, ou corrigez le champ dans l'écran de vérification."
      );
    }
    return null;
  },

  // R03 — Net manquant
  (doc) => {
    if (doc.netSalary === null) {
      return flag(
        "medium", "readability",
        "Salaire net non identifié",
        "Nous n'avons pas pu lire le montant net à payer sur la fiche.",
        "Le salaire net est le montant qui doit arriver sur votre compte. Son absence empêche la vérification finale.",
        "Cherchez la ligne 'נטו' ou 'לתשלום' sur votre fiche et corrigez-la manuellement."
      );
    }
    return null;
  },

  // R04 — Heures sup déclarées mais non visibles
  (doc, ctx) => {
    if (ctx.didOvertime && !doc.overtimeHours && doc.overtimeHours !== 0) {
      return flag(
        "medium", "overtime",
        "Heures supplémentaires non détectées",
        "Vous avez déclaré des heures supplémentaires, mais aucune ligne correspondante n'est visible sur la fiche.",
        "En Israël, les heures supplémentaires (sha'ot nosafot) doivent obligatoirement apparaître sur la fiche de paie, majorées à 125% pour les 2 premières heures par jour, puis 150%.",
        "Demandez à votre employeur de vous communiquer le détail du calcul de vos heures supplémentaires. Conservez votre relevé d'heures."
      );
    }
    return null;
  },

  // R05 — Maladie déclarée mais non visible
  (doc, ctx) => {
    if (ctx.wasSick && ctx.sickDays && ctx.sickDays > 0) {
      const sickLineFound = doc.rawLines.some(
        (l) => l.normalizedKey === "sickPay" && l.value !== null
      );
      if (!sickLineFound) {
        return flag(
          "medium", "sick",
          "Jours maladie non reflétés",
          `Vous déclarez ${ctx.sickDays} jour(s) d'absence maladie, mais la fiche ne semble pas l'indiquer clairement.`,
          "Les jours maladie peuvent entraîner une retenue sur salaire ou être compensés selon les règles israéliennes (à partir du 2e jour avec certificat médical). En l'absence de mention, vérifiez qu'aucune retenue n'a été effectuée incorrectement.",
          ctx.hasMedicalCertificate
            ? "Vous avez un certificat médical. Vérifiez que la déduction maladie est correctement appliquée (ou non, selon vos droits)."
            : "Sans certificat médical, l'employeur peut retenir le salaire pour les jours d'absence. Consultez votre contrat."
        );
      }
    }
    return null;
  },

  // R06 — Pension absente alors qu'attendue
  (doc, ctx) => {
    if (ctx.hasPensionViaEmployer && !doc.pensionDetected) {
      return flag(
        "medium", "pension",
        "Pension non détectée",
        "Vous avez indiqué cotiser à un fonds de pension, mais nous ne voyons pas de ligne pension sur la fiche.",
        "En Israël, la cotisation pension est obligatoire dès 6 mois d'ancienneté. Elle doit apparaître clairement sur la fiche (part salarié + part employeur).",
        "Demandez à votre employeur de confirmer les versements au fonds de pension. Demandez votre relevé de fonds (duch keren pensia)."
      );
    }
    return null;
  },

  // R07 — Impôt sur le revenu absent pour salaire élevé
  (doc) => {
    if (
      doc.grossSalary !== null &&
      doc.grossSalary > 7000 &&
      !doc.incomeTaxDetected
    ) {
      return flag(
        "medium", "deductions",
        "Impôt sur le revenu absent",
        "Avec un salaire brut de ce niveau, une retenue d'impôt (mas hachnasa) est généralement attendue.",
        "En Israël, l'impôt sur le revenu est précompté chaque mois. Si votre salaire dépasse le seuil d'exonération (environ 6 300 ₪/mois en 2024), une retenue devrait figurer sur la fiche.",
        "Vérifiez que vous avez bien fourni votre formulaire de déductions fiscales (tofes 101) à l'employeur. Consultez les lignes de déductions."
      );
    }
    return null;
  },

  // R08 — Bituah Leumi absent
  (doc) => {
    if (!doc.nationalInsuranceDetected && doc.grossSalary !== null) {
      return flag(
        "high", "deductions",
        "Sécurité sociale (Bituah Leumi) non détectée",
        "La cotisation Bituah Leumi ne semble pas apparaître sur la fiche.",
        "Le Bituah Leumi (sécurité sociale israélienne) est une cotisation obligatoire pour tout salarié. Son absence est une anomalie sérieuse.",
        "Vérifiez les lignes de déductions. Si elle est vraiment absente, contactez votre service RH immédiatement."
      );
    }
    return null;
  },

  // R09 — Solde congés absent alors que l'utilisateur gère ses congés
  (doc, ctx) => {
    if (doc.leaveBalance === null && ctx.moreThanOneYear) {
      return flag(
        "low", "leave",
        "Solde congés non visible",
        "Le solde de vos jours de congés restants n'apparaît pas clairement sur la fiche.",
        "En Israël, le solde de congés (yitrat chofesh) doit généralement figurer sur la fiche de paie. Il permet de vérifier l'accumulation et l'utilisation de vos droits.",
        "Demandez à votre employeur un relevé de votre solde de congés, ou consultez le portail RH de votre entreprise."
      );
    }
    return null;
  },

  // R10 — Vacances prises mais non reflétées
  (doc, ctx) => {
    if (ctx.tookVacation && ctx.vacationDays && ctx.vacationDays > 0) {
      const vacationLine = doc.rawLines.some(
        (l) => l.normalizedKey === "vacationPay"
      );
      if (!vacationLine && doc.leaveBalance === null) {
        return flag(
          "medium", "leave",
          "Congés pris non reflétés sur la fiche",
          `Vous avez pris ${ctx.vacationDays} jour(s) de congés, mais aucune mention de congés n'est visible.`,
          "Les jours de congés pris doivent apparaître sur la fiche, soit en déduction, soit en mention de solde mis à jour.",
          "Vérifiez que votre solde de congés a été mis à jour et que les jours pris ont été correctement enregistrés."
        );
      }
    }
    return null;
  },

  // R11 — Beaucoup de champs non identifiés
  (doc) => {
    const unknownLines = doc.rawLines.filter((l) => l.normalizedKey === "unknown").length;
    const totalLines   = doc.rawLines.length;
    if (totalLines > 0 && unknownLines / totalLines > 0.4) {
      return flag(
        "low", "readability",
        "Plusieurs lignes non identifiées",
        `${unknownLines} ligne(s) sur ${totalLines} n'ont pas pu être identifiées automatiquement.`,
        "Notre système n'a pas pu reconnaître certaines lignes de la fiche. Cela peut être dû à un format inhabituel, une typographie particulière ou des abréviations non standard.",
        "Vérifiez manuellement les lignes non identifiées et corrigez-les dans l'écran de vérification si possible."
      );
    }
    return null;
  },

  // R12 — Bonus déclaré mais non visible
  (doc, ctx) => {
    if (ctx.gotBonus) {
      const bonusLine = doc.rawLines.some(
        (l) => l.normalizedKey === "bonus" || l.normalizedKey === "commission"
      );
      if (!bonusLine) {
        return flag(
          "medium", "salary",
          "Prime déclarée mais non détectée",
          "Vous avez indiqué avoir reçu une prime ce mois-ci, mais nous ne la voyons pas sur la fiche.",
          "Une prime ou un bonus doit apparaître comme ligne distincte sur la fiche de paie, avec son montant brut.",
          "Vérifiez que la prime est bien incluse dans le brut affiché. Demandez à votre employeur le détail de son calcul."
        );
      }
    }
    return null;
  },

  // R13 — Ancienneté et droits Havraa
  (doc, ctx) => {
    const months = computeSeniorityMonths(ctx.startDate);
    if (months !== null && months >= 12) {
      const havraLine = doc.rawLines.some((l) => l.normalizedKey === "holidayBonus");
      if (!havraLine && months >= 24) {
        return flag(
          "low", "seniority",
          "Prime Havraa non détectée",
          "Avec votre ancienneté, vous avez potentiellement droit à la prime de convalescence (dmei havraa).",
          "La prime Havraa est une prime légale annuelle versée généralement en été. Elle dépend de l'ancienneté et du secteur. Si vous ne l'avez jamais reçue, c'est un point à vérifier.",
          "Demandez à votre employeur s'il verse la prime Havraa et à quelle période. Vérifiez votre convention collective (tsav harchava)."
        );
      }
    }
    return null;
  },

  // R14 — Score de confiance faible
  (doc) => {
    if (doc.confidenceScore < 50) {
      return flag(
        "low", "readability",
        "Qualité d'extraction limitée",
        "La lecture automatique de votre fiche de paie a un niveau de confiance faible.",
        "Cela peut être dû à la qualité du scan, un format de document non standard ou un document peu lisible.",
        "Vérifiez et corrigez manuellement les champs importants dans l'écran de vérification. Un document de meilleure qualité ou en couleur améliorera la précision."
      );
    }
    return null;
  },

  // R15 — Vérification cohérence brut/net
  (doc) => {
    if (doc.grossSalary !== null && doc.netSalary !== null && doc.totalDeductions !== null) {
      const expectedNet = doc.grossSalary - Math.abs(doc.totalDeductions);
      const diff = Math.abs(expectedNet - doc.netSalary);
      if (diff > 200) {
        return flag(
          "medium", "salary",
          "Possible incohérence brut / déductions / net",
          `L'écart entre le brut (${doc.grossSalary} ₪), les déductions et le net (${doc.netSalary} ₪) semble inhabituel.`,
          "Normalement : Net = Brut − Total des déductions. Si cela ne correspond pas, il peut y avoir une ligne non détectée, une erreur de saisie ou une déduction non identifiée.",
          "Additionnez toutes les lignes de déduction et vérifiez que brut − déductions = net. Demandez un bulletin de paie récapitulatif à votre RH."
        );
      }
    }
    return null;
  },
];

// ============================================================
// RÈGLES POSITIVES (points cohérents)
// ============================================================
const POSITIVE_RULES: PositiveRule[] = [
  (doc) => {
    if (doc.pensionDetected) {
      return positive("pension", "Pension détectée", "Une cotisation retraite semble bien présente sur la fiche.");
    }
    return null;
  },
  (doc) => {
    if (doc.nationalInsuranceDetected) {
      return positive("deductions", "Bituah Leumi présent", "La cotisation à la sécurité sociale (Bituah Leumi) est détectée.");
    }
    return null;
  },
  (doc) => {
    if (doc.incomeTaxDetected) {
      return positive("deductions", "Impôt sur le revenu présent", "La retenue d'impôt sur le revenu (mas hachnasa) est visible.");
    }
    return null;
  },
  (doc) => {
    if (doc.grossSalary !== null && doc.netSalary !== null && doc.netSalary < doc.grossSalary) {
      return positive("salary", "Brut/Net cohérents", "Le salaire net est bien inférieur au brut, ce qui est normal.");
    }
    return null;
  },
  (doc) => {
    if (doc.leaveBalance !== null) {
      return positive("leave", "Solde congés visible", "Le solde de vos jours de congés est mentionné sur la fiche.");
    }
    return null;
  },
  (doc) => {
    if (doc.sickBalance !== null) {
      return positive("sick", "Solde maladie visible", "Le solde de vos jours de maladie est mentionné sur la fiche.");
    }
    return null;
  },
  (doc, ctx) => {
    if (ctx.didOvertime && doc.overtimeHours && doc.overtimeHours > 0) {
      return positive("overtime", "Heures supplémentaires reflétées", "Vos heures supplémentaires semblent bien apparaître sur la fiche.");
    }
    return null;
  },
];

// ============================================================
// POINT D'ENTRÉE PRINCIPAL
// ============================================================
export interface RuleEngineResult {
  flags: AnalysisFlag[];
  positiveFindings: PositiveFinding[];
  alertLevel: "none" | "low" | "medium" | "high";
}

export function runRuleEngine(
  doc: PayrollDocument,
  ctx: UserContext
): RuleEngineResult {
  flagCounter = 0; // reset pour les IDs

  const flags: AnalysisFlag[] = RULES
    .map((rule) => rule(doc, ctx))
    .filter((f): f is AnalysisFlag => f !== null);

  const positiveFindings: PositiveFinding[] = POSITIVE_RULES
    .map((rule) => rule(doc, ctx))
    .filter((f): f is PositiveFinding => f !== null);

  // Niveau d'alerte global
  let alertLevel: "none" | "low" | "medium" | "high" = "none";
  if (flags.some((f) => f.severity === "high"))   alertLevel = "high";
  else if (flags.some((f) => f.severity === "medium")) alertLevel = "medium";
  else if (flags.some((f) => f.severity === "low"))    alertLevel = "low";

  return { flags, positiveFindings, alertLevel };
}
