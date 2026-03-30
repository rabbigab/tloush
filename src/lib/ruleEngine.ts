// ============================================================
// RULE ENGINE -- Moteur de regles modulaire et extensible
// ============================================================
// Version BMAD 1.1 -- +R16 salaire minimum, +R17 Keren Hishtalmut
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
  return { id: `flag-${++flagCounter}`, severity, category, title, message, explanation, recommendation };
}

function positive(category: FlagCategory, title: string, message: string): PositiveFinding {
  return { id: `ok-${Math.random().toString(36).slice(2, 7)}`, category, title, message };
}

type Rule = (doc: PayrollDocument, ctx: UserContext) => AnalysisFlag | null;
type PositiveRule = (doc: PayrollDocument, ctx: UserContext) => PositiveFinding | null;

// ============================================================
// CONSTANTES LEGALES ISRAELIENNES (mise a jour 2024)
// ============================================================
const MIN_WAGE_MONTHLY = 5880;   // Salaire minimum mensuel (01/04/2024)
const MIN_WAGE_HOURLY  = 32.30;  // Taux horaire minimum (01/04/2024)
const INCOME_TAX_THRESHOLD = 6300; // Seuil approximatif de non-imposition

// ============================================================
// REGLES D'ALERTE
// ============================================================
const RULES: Rule[] = [

  // R01 -- Net > Brut (aberration)
  (doc) => {
    if (doc.netSalary !== null && doc.grossSalary !== null && doc.netSalary > doc.grossSalary) {
      return flag("high", "salary",
        "Salaire net superieur au brut",
        "Le montant net semble superieur au brut, ce qui est normalement impossible.",
        "Le salaire net est toujours inferieur au brut, car il faut deduire les cotisations et impots. Cette incoherence peut indiquer une erreur de saisie ou une ligne mal attribuee.",
        "Verifiez les lignes de brut et de net sur votre fiche. Demandez une explication ecrite a votre service RH."
      );
    }
    return null;
  },

  // R02 -- Brut manquant
  (doc) => {
    if (doc.grossSalary === null) {
      return flag("medium", "readability",
        "Salaire brut non identifie",
        "Nous n'avons pas pu lire le montant brut sur la fiche.",
        "Le salaire brut est la base de calcul de toutes vos cotisations. Son absence rend l'analyse incomplete.",
        "Verifiez manuellement la ligne 'bruto' ou 'skhar bruto' sur votre fiche, ou corrigez le champ dans l'ecran de verification."
      );
    }
    return null;
  },

  // R03 -- Net manquant
  (doc) => {
    if (doc.netSalary === null) {
      return flag("medium", "readability",
        "Salaire net non identifie",
        "Nous n'avons pas pu lire le montant net a payer sur la fiche.",
        "Le salaire net est le montant qui doit arriver sur votre compte. Son absence empeche la verification finale.",
        "Cherchez la ligne 'neto' ou 'litshloum' sur votre fiche et corrigez-la manuellement."
      );
    }
    return null;
  },

  // R04 -- Heures sup declarees mais non visibles
  (doc, ctx) => {
    if (ctx.didOvertime && !doc.overtimeHours && doc.overtimeHours !== 0) {
      return flag("medium", "overtime",
        "Heures supplementaires non detectees",
        "Vous avez declare des heures supplementaires, mais aucune ligne correspondante n'est visible sur la fiche.",
        "En Israel, les heures supplementaires (sha'ot nosafot) doivent obligatoirement apparaitre sur la fiche de paie, majorees a 125% pour les 2 premieres heures par jour, puis 150%.",
        "Demandez a votre employeur de vous communiquer le detail du calcul de vos heures supplementaires. Conservez votre releve d'heures."
      );
    }
    return null;
  },

  // R05 -- Maladie declaree mais non visible
  (doc, ctx) => {
    if (ctx.wasSick && ctx.sickDays && ctx.sickDays > 0) {
      const sickLineFound = doc.rawLines.some((l) => l.normalizedKey === "sickPay" && l.value !== null);
      if (!sickLineFound) {
        return flag("medium", "sick",
          "Jours maladie non refletes",
          `Vous declarez ${ctx.sickDays} jour(s) d'absence maladie, mais la fiche ne semble pas l'indiquer clairement.`,
          "Les jours maladie peuvent entrainer une retenue sur salaire ou etre compenses selon les regles israeliennes (a partir du 2e jour avec certificat medical). En l'absence de mention, verifiez qu'aucune retenue n'a ete effectuee incorrectement.",
          ctx.hasMedicalCertificate
            ? "Vous avez un certificat medical. Verifiez que la deduction maladie est correctement appliquee (ou non, selon vos droits)."
            : "Sans certificat medical, l'employeur peut retenir le salaire pour les jours d'absence. Consultez votre contrat."
        );
      }
    }
    return null;
  },

  // R06 -- Pension absente alors qu'attendue
  (doc, ctx) => {
    if (ctx.hasPensionViaEmployer && !doc.pensionDetected) {
      return flag("medium", "pension",
        "Pension non detectee",
        "Vous avez indique cotiser a un fonds de pension, mais nous ne voyons pas de ligne pension sur la fiche.",
        "En Israel, la cotisation pension est obligatoire des 6 mois d'anciennete. Elle doit apparaitre clairement sur la fiche (part salarie + part employeur).",
        "Demandez a votre employeur de confirmer les versements au fonds de pension. Demandez votre releve de fonds (duch keren pensia)."
      );
    }
    return null;
  },

  // R07 -- Impot sur le revenu absent pour salaire eleve
  (doc) => {
    if (doc.grossSalary !== null && doc.grossSalary > INCOME_TAX_THRESHOLD && !doc.incomeTaxDetected) {
      return flag("medium", "deductions",
        "Impot sur le revenu absent",
        "Avec un salaire brut de ce niveau, une retenue d'impot (mas hakhnasa) est generalement attendue.",
        `En Israel, l'impot sur le revenu est precompte chaque mois. Si votre salaire depasse le seuil d'exoneration (environ ${INCOME_TAX_THRESHOLD} NIS/mois en 2024), une retenue devrait figurer sur la fiche.`,
        "Verifiez que vous avez bien fourni votre formulaire de deductions fiscales (tofes 101) a l'employeur. Consultez les lignes de deductions."
      );
    }
    return null;
  },

  // R08 -- Bituah Leumi absent
  (doc) => {
    if (!doc.nationalInsuranceDetected && doc.grossSalary !== null) {
      return flag("high", "deductions",
        "Securite sociale (Bituah Leumi) non detectee",
        "La cotisation Bituah Leumi ne semble pas apparaitre sur la fiche.",
        "Le Bituah Leumi (securite sociale israelienne) est une cotisation obligatoire pour tout salarie. Son absence est une anomalie serieuse.",
        "Verifiez les lignes de deductions. Si elle est vraiment absente, contactez votre service RH immediatement."
      );
    }
    return null;
  },

  // R09 -- Solde conges absent alors que l'utilisateur gere ses conges
  (doc, ctx) => {
    if (doc.leaveBalance === null && ctx.moreThanOneYear) {
      return flag("low", "leave",
        "Solde conges non visible",
        "Le solde de vos jours de conges restants n'apparait pas clairement sur la fiche.",
        "En Israel, le solde de conges (yitrat chofesh) doit generalement figurer sur la fiche de paie. Il permet de verifier l'accumulation et l'utilisation de vos droits.",
        "Demandez a votre employeur un releve de votre solde de conges, ou consultez le portail RH de votre entreprise."
      );
    }
    return null;
  },

  // R10 -- Vacances prises mais non reflectes
  (doc, ctx) => {
    if (ctx.tookVacation && ctx.vacationDays && ctx.vacationDays > 0) {
      const vacationLine = doc.rawLines.some((l) => l.normalizedKey === "vacationPay");
      if (!vacationLine && doc.leaveBalance === null) {
        return flag("medium", "leave",
          "Conges pris non refletes sur la fiche",
          `Vous avez pris ${ctx.vacationDays} jour(s) de conges, mais aucune mention de conges n'est visible.`,
          "Les jours de conges pris doivent apparaitre sur la fiche, soit en deduction, soit en mention de solde mis a jour.",
          "Verifiez que votre solde de conges a ete mis a jour et que les jours pris ont ete correctement enregistres."
        );
      }
    }
    return null;
  },

  // R11 -- Beaucoup de champs non identifies
  (doc) => {
    const unknownLines = doc.rawLines.filter((l) => l.normalizedKey === "unknown").length;
    const totalLines   = doc.rawLines.length;
    if (totalLines > 0 && unknownLines / totalLines > 0.4) {
      return flag("low", "readability",
        "Plusieurs lignes non identifiees",
        `${unknownLines} ligne(s) sur ${totalLines} n'ont pas pu etre identifiees automatiquement.`,
        "Notre systeme n'a pas pu reconnaitre certaines lignes de la fiche. Cela peut etre du a un format inhabituel, une typographie particuliere ou des abreviations non standard.",
        "Verifiez manuellement les lignes non identifiees et corrigez-les dans l'ecran de verification si possible."
      );
    }
    return null;
  },

  // R12 -- Bonus declare mais non visible
  (doc, ctx) => {
    if (ctx.gotBonus) {
      const bonusLine = doc.rawLines.some((l) => l.normalizedKey === "bonus" || l.normalizedKey === "commission");
      if (!bonusLine) {
        return flag("medium", "salary",
          "Prime declaree mais non detectee",
          "Vous avez indique avoir recu une prime ce mois-ci, mais nous ne la voyons pas sur la fiche.",
          "Une prime ou un bonus doit apparaitre comme ligne distincte sur la fiche de paie, avec son montant brut.",
          "Verifiez que la prime est bien incluse dans le brut affiche. Demandez a votre employeur le detail de son calcul."
        );
      }
    }
    return null;
  },

  // R13 -- Anciennete et droits Havraa
  (doc, ctx) => {
    const months = computeSeniorityMonths(ctx.startDate);
    if (months !== null && months >= 24) {
      const havraLine = doc.rawLines.some((l) => l.normalizedKey === "holidayBonus");
      if (!havraLine) {
        return flag("low", "seniority",
          "Prime Havraa non detectee",
          "Avec votre anciennete, vous avez potentiellement droit a la prime de convalescence (dmei havraa).",
          "La prime Havraa est une prime legale annuelle versee generalement en ete. Elle depend de l'anciennete et du secteur. Si vous ne l'avez jamais recue, c'est un point a verifier.",
          "Demandez a votre employeur s'il verse la prime Havraa et a quelle periode. Verifiez votre convention collective (tsav harchava)."
        );
      }
    }
    return null;
  },

  // R14 -- Score de confiance faible
  (doc) => {
    if (doc.confidenceScore < 50) {
      return flag("low", "readability",
        "Qualite d'extraction limitee",
        "La lecture automatique de votre fiche de paie a un niveau de confiance faible.",
        "Cela peut etre du a la qualite du scan, un format de document non standard ou un document peu lisible.",
        "Verifiez et corrigez manuellement les champs importants dans l'ecran de verification. Un document de meilleure qualite ou en couleur ameliorera la precision."
      );
    }
    return null;
  },

  // R15 -- Verification coherence brut/net
  (doc) => {
    if (doc.grossSalary !== null && doc.netSalary !== null && doc.totalDeductions !== null) {
      const expectedNet = doc.grossSalary - Math.abs(doc.totalDeductions);
      const diff = Math.abs(expectedNet - doc.netSalary);
      if (diff > 200) {
        return flag("medium", "salary",
          "Possible incoherence brut / deductions / net",
          `L'ecart entre le brut (${doc.grossSalary} NIS), les deductions et le net (${doc.netSalary} NIS) semble inhabituel.`,
          "Normalement : Net = Brut - Total des deductions. Si cela ne correspond pas, il peut y avoir une ligne non detectee, une erreur de saisie ou une deduction non identifiee.",
          "Additionnez toutes les lignes de deduction et verifiez que brut - deductions = net. Demandez un bulletin de paie recapitulatif a votre RH."
        );
      }
    }
    return null;
  },

  // R16 -- Salaire inferieur au minimum legal (NOUVEAU BMAD S2)
  (doc, ctx) => {
    if (doc.baseSalary !== null && doc.extractionMode !== "mock") {
      const isFullTime = ctx.workTime === "full" || ctx.workTime === "unknown";
      if (isFullTime && doc.baseSalary < MIN_WAGE_MONTHLY) {
        return flag("high", "salary",
          "Salaire potentiellement inferieur au minimum legal",
          `Le salaire de base detecte (${doc.baseSalary.toLocaleString("fr-FR")} NIS) est inferieur au minimum legal (${MIN_WAGE_MONTHLY} NIS/mois).`,
          `Le salaire minimum israelien est de ${MIN_WAGE_MONTHLY} NIS/mois pour un employe a temps plein (depuis le 01/04/2024). Si votre contrat est a temps plein, ce montant semble insuffisant. Note : si vous etes a temps partiel, le minimum se calcule au prorata.`,
          "Verifiez votre contrat et votre temps de travail. Si vous etes a temps plein, vous etes en droit de reclamer la difference retroactivement. Contactez le ministere du travail israelien (misrad ha-avoda) si necessaire."
        );
      }
      if (doc.hourlyRate !== null && doc.hourlyRate < MIN_WAGE_HOURLY) {
        return flag("high", "salary",
          "Taux horaire inferieur au minimum legal",
          `Le taux horaire detecte (${doc.hourlyRate} NIS/h) est inferieur au minimum legal (${MIN_WAGE_HOURLY} NIS/h).`,
          `Le taux horaire minimum israelien est de ${MIN_WAGE_HOURLY} NIS par heure (depuis le 01/04/2024). Tout salarie, meme a temps partiel, doit etre remunere au moins a ce taux.`,
          "Verifiez votre contrat de travail. Si votre taux est bien inferieur au minimum, vous etes en droit de reclamer la difference. Documentez vos heures de travail et consultez un conseiller juridique si necessaire."
        );
      }
    }
    return null;
  },

  // R17 -- Keren Hishtalmut absent pour employes stables (NOUVEAU BMAD S2)
  (doc, ctx) => {
    const months = computeSeniorityMonths(ctx.startDate);
    if (months !== null && months >= 6 && ctx.moreThanOneYear) {
      const hasKeren = doc.rawLines.some((l) => l.normalizedKey === "kerenHishtalmut") || doc.kerenHishtalmutDetected;
      if (!hasKeren) {
        return flag("low", "pension",
          "Keren Hishtalmut non detecte",
          "Avec votre anciennete, vous beneficiez peut-etre d'un Keren Hishtalmut (fonds d'epargne formation).",
          "Le Keren Hishtalmut est un fonds d'epargne tres avantageux fiscalement, oblige dans de nombreux secteurs par la convention collective (tsav harchava). L'employeur verse generalement 7,5% et le salarie 2,5% du salaire.",
          "Demandez a votre employeur si vous beneficiez d'un Keren Hishtalmut. Si votre convention collective le prevoit et qu'il n'est pas verse, c'est un droit que vous pouvez reclamer."
        );
      }
    }
    return null;
  },
];

// ============================================================
// REGLES POSITIVES (points coherents)
// ============================================================
const POSITIVE_RULES: PositiveRule[] = [
  (doc) => {
    if (doc.pensionDetected) return positive("pension", "Pension detectee", "Une cotisation retraite semble bien presente sur la fiche.");
    return null;
  },
  (doc) => {
    if (doc.nationalInsuranceDetected) return positive("deductions", "Bituah Leumi present", "La cotisation a la securite sociale (Bituah Leumi) est detectee.");
    return null;
  },
  (doc) => {
    if (doc.incomeTaxDetected) return positive("deductions", "Impot sur le revenu present", "La retenue d'impot sur le revenu (mas hakhnasa) est visible.");
    return null;
  },
  (doc) => {
    if (doc.grossSalary !== null && doc.netSalary !== null && doc.netSalary < doc.grossSalary) return positive("salary", "Brut/Net coherents", "Le salaire net est bien inferieur au brut, ce qui est normal.");
    return null;
  },
  (doc) => {
    if (doc.leaveBalance !== null) return positive("leave", "Solde conges visible", "Le solde de vos jours de conges est mentionne sur la fiche.");
    return null;
  },
  (doc) => {
    if (doc.sickBalance !== null) return positive("sick", "Solde maladie visible", "Le solde de vos jours de maladie est mentionne sur la fiche.");
    return null;
  },
  (doc, ctx) => {
    if (ctx.didOvertime && doc.overtimeHours && doc.overtimeHours > 0) return positive("overtime", "Heures supplementaires reflectees", "Vos heures supplementaires semblent bien apparaitre sur la fiche.");
    return null;
  },
  (doc) => {
    if (doc.kerenHishtalmutDetected || doc.rawLines.some(l => l.normalizedKey === "kerenHishtalmut")) {
      return positive("pension", "Keren Hishtalmut detecte", "Un fonds d'epargne formation (Keren Hishtalmut) est present sur votre fiche.");
    }
    return null;
  },
  (doc, ctx) => {
    if (doc.baseSalary !== null && ctx.workTime === "full" && doc.baseSalary >= MIN_WAGE_MONTHLY) {
      return positive("salary", "Salaire au-dessus du minimum legal", `Le salaire detecte (${doc.baseSalary.toLocaleString("fr-FR")} NIS) est superieur au minimum legal (${MIN_WAGE_MONTHLY} NIS).`);
    }
    return null;
  },
];

// ============================================================
// POINT D'ENTREE PRINCIPAL
// ============================================================
export interface RuleEngineResult {
  flags: AnalysisFlag[];
  positiveFindings: PositiveFinding[];
  alertLevel: "none" | "low" | "medium" | "high";
}

export function runRuleEngine(doc: PayrollDocument, ctx: UserContext): RuleEngineResult {
  flagCounter = 0;

  const flags: AnalysisFlag[] = RULES
    .map((rule) => rule(doc, ctx))
    .filter((f): f is AnalysisFlag => f !== null);

  const positiveFindings: PositiveFinding[] = POSITIVE_RULES
    .map((rule) => rule(doc, ctx))
    .filter((f): f is PositiveFinding => f !== null);

  let alertLevel: "none" | "low" | "medium" | "high" = "none";
  if (flags.some((f) => f.severity === "high"))        alertLevel = "high";
  else if (flags.some((f) => f.severity === "medium")) alertLevel = "medium";
  else if (flags.some((f) => f.severity === "low"))    alertLevel = "low";

  return { flags, positiveFindings, alertLevel };
}
