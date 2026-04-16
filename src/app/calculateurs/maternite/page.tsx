"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Baby,
  Calendar,
  Shield,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type Parent = "mère" | "père";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Seuils d'eligibilite Bituah Leumi pour les indemnites maternite.
// Sources : Loi sur l'Assurance Nationale 1995 (חוק הביטוח הלאומי)
// article 50 + Loi sur le travail des femmes 1954 (חוק עבודת נשים).
// https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx
const BL_MATERNITY_THRESHOLDS = {
  full: {
    // Allocation pleine 15 semaines : 10 mois consecutifs sur 14
    // chez le meme employeur, OU 15 mois cumules sur 22 mois.
    minConsecutiveMonths: 10,
    lookbackWindow: 14,
    minCumulativeMonths: 15,
    weeksEligible: 15,
  },
  partial: {
    // Allocation partielle 7 semaines : 6 mois sur 14.
    minConsecutiveMonths: 6,
    lookbackWindow: 14,
    weeksEligible: 7,
  },
}

type BlEligibility = 'full' | 'partial' | 'none'

export default function MaterniteLeaveCalculator() {
  const [parentType, setParentType] = useState<Parent>("mère");
  const [dueDate, setDueDate] = useState("");
  const [employmentStartDate, setEmploymentStartDate] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  // Mois cotises BL. Si vide, on estime depuis employmentStartDate (max 14).
  const [contributedMonths, setContributedMonths] = useState("");
  const [isMultipleBirth, setIsMultipleBirth] = useState(false);
  const [numberOfBabies, setNumberOfBabies] = useState(2);

  const calculations = useMemo(() => {
    if (!dueDate || !employmentStartDate || !monthlySalary) {
      return null;
    }

    const due = new Date(dueDate);
    const empStart = new Date(employmentStartDate);
    const salary = parseFloat(monthlySalary);

    // Duree d'emploi chez l'employeur actuel en mois.
    const monthsDiff =
      (due.getFullYear() - empStart.getFullYear()) * 12 +
      (due.getMonth() - empStart.getMonth());

    // Mois cotises Bituah Leumi. Si l'utilisateur a rempli le champ
    // dedie, on l'utilise. Sinon on estime depuis la duree d'emploi
    // (capee a 14 pour rester dans la fenetre legale).
    const declaredContributed = contributedMonths ? parseInt(contributedMonths) : null;
    const contributedInLast14 = declaredContributed !== null
      ? Math.min(14, Math.max(0, declaredContributed))
      : Math.min(14, Math.max(0, monthsDiff));

    // Eligibilite BL selon les seuils legaux (cf. BL_MATERNITY_THRESHOLDS)
    let blEligibility: BlEligibility = 'none';
    if (contributedInLast14 >= BL_MATERNITY_THRESHOLDS.full.minConsecutiveMonths) {
      blEligibility = 'full';
    } else if (contributedInLast14 >= BL_MATERNITY_THRESHOLDS.partial.minConsecutiveMonths) {
      blEligibility = 'partial';
    }
    const isEligibleBituach = blEligibility !== 'none';

    // Maternity leave calculation
    let maternityWeeks = 15;
    if (isMultipleBirth) {
      maternityWeeks += (numberOfBabies - 1) * 3;
    }

    // Paternity leave is fixed at 1 week
    const paternityDays = 7;

    // Calculate dates
    // Le conge peut commencer jusqu'a 6 semaines (42 jours) avant la date
    // prevue d'accouchement. C'est la date "Debut recommande" affichee a
    // l'utilisatrice dans la carte "Periode de conge maternite".
    const leaveStartDate = new Date(due);
    leaveStartDate.setDate(leaveStartDate.getDate() - 42);

    const mandatoryStartDate = new Date(due); // Mandatory 6 weeks after birth
    const mandatoryEndDate = new Date(mandatoryStartDate);
    mandatoryEndDate.setDate(mandatoryEndDate.getDate() + 42); // 6 weeks = 42 days

    const optionalEndDate = new Date(mandatoryStartDate);
    optionalEndDate.setDate(optionalEndDate.getDate() + maternityWeeks * 7 - 1);

    const returnToWorkDate = new Date(optionalEndDate);
    returnToWorkDate.setDate(returnToWorkDate.getDate() + 1);

    const protectionEndDate = new Date(returnToWorkDate);
    protectionEndDate.setDate(protectionEndDate.getDate() + 60); // 60 days protection

    // Nombre de semaines reellement indemnisees par Bituah Leumi
    // selon l'eligibilite. Le conge maternite legal (maternityWeeks)
    // peut etre superieur aux semaines indemnisees : dans ce cas,
    // la difference n'est pas couverte par l'allocation.
    const blPaidWeeks = blEligibility === 'full'
      ? maternityWeeks
      : blEligibility === 'partial'
        ? BL_MATERNITY_THRESHOLDS.partial.weeksEligible
        : 0;

    // Bituah Leumi — allocation journaliere (plafond 2026 : 1711.33 NIS/j).
    // Source : btl.gov.il, a verifier chaque annee (finding #18 covers #19).
    const maxDailyAllowance = 1711.33;
    const dailyAllowance = Math.min(salary / 30, maxDailyAllowance);
    const totalPaidDays = blPaidWeeks * 7;
    const totalAllowance = dailyAllowance * totalPaidDays;
    const salaryLoss = salary * (maternityWeeks / 4.3) - totalAllowance;

    return {
      isEligibleBituach,
      blEligibility,
      contributedInLast14,
      maternityWeeks,
      blPaidWeeks,
      paternityDays,
      leaveStartDate,
      mandatoryStartDate,
      mandatoryEndDate,
      optionalEndDate,
      returnToWorkDate,
      protectionEndDate,
      dailyAllowance: Math.round(dailyAllowance * 100) / 100,
      totalAllowance: Math.round(totalAllowance * 100) / 100,
      salaryLoss: Math.round(salaryLoss * 100) / 100,
      totalDaysLeave: totalPaidDays,
    };
  }, [dueDate, employmentStartDate, monthlySalary, contributedMonths, isMultipleBirth, numberOfBabies]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const checklist = [
    "Informer l'employeur au moins 30 jours avant",
    "Obtenir certificat médical",
    "S'inscrire au Bituach Leumi",
    "Préparer le formulaire de demande d'allocation",
    "Vérifier vos droits Keren Hishtalmut",
  ];

  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    Array(checklist.length).fill(false)
  );

  const toggleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center">
              <Baby size={24} className="text-brand-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              {parentType === "mère"
                ? "Calculateur de Congé Maternité"
                : "Calculateur de Congé Paternité"}
            </h1>
          </div>
          <p className="text-neutral-600 text-sm">
            Estimez la durée de votre congé et vos allocations Bituach Leumi en Israël.
          </p>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8 mb-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Parent Type */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Qui êtes-vous ?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["mère", "père"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setParentType(type as Parent)}
                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                      parentType === type
                        ? "bg-brand-600 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {type === "mère" ? "Mère" : "Père/Conjoint"}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Due Date */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Date prévue d'accouchement
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </motion.div>

            {/* Employment Start Date */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Date de début d'emploi chez l'employeur actuel
              </label>
              <input
                type="date"
                value={employmentStartDate}
                onChange={(e) => setEmploymentStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </motion.div>

            {/* Monthly Salary */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Salaire mensuel brut (₪)
              </label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                placeholder="15000"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </motion.div>

            {/* Contributed months Bituah Leumi (optional) */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Mois cotisés Bituah Leumi (sur les 14 derniers)
                <span className="font-normal text-neutral-500"> — optionnel</span>
              </label>
              <input
                type="number"
                min={0}
                max={14}
                value={contributedMonths}
                onChange={(e) => setContributedMonths(e.target.value)}
                placeholder="Ex : 12"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Laissez vide pour estimer depuis la date de début d&apos;emploi. Les seuils d&apos;éligibilité BL sont détaillés dans le résultat.
              </p>
            </motion.div>

            {/* Multiple Birth */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Grossesse multiple ?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Non", "Oui"].map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => setIsMultipleBirth(idx === 1)}
                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                      isMultipleBirth === (idx === 1)
                        ? "bg-brand-600 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Number of Babies */}
            {isMultipleBirth && (
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  Nombre de bébés
                </label>
                <select
                  value={numberOfBabies}
                  onChange={(e) => setNumberOfBabies(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  {[2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} bébés
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

          </div>
        </motion.div>

        {/* Results Section */}
        {calculations && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 mb-8"
          >
            {/* Leave Duration Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Durée du congé
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                  <span className="text-neutral-700">
                    {parentType === "mère"
                      ? "Congé maternité légal"
                      : "Congé paternité légal"}
                  </span>
                  <span className="font-bold text-brand-600">
                    {parentType === "mère"
                      ? `${calculations.maternityWeeks} semaines`
                      : `${calculations.paternityDays} jours`}
                  </span>
                </div>

                {parentType === "mère" && (
                  <>
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                      <span className="text-neutral-700">
                        Dont obligatoire après accouchement
                      </span>
                      <span className="font-bold text-brand-600">6 semaines</span>
                    </div>

                    <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                      <p className="text-sm text-neutral-700 mb-3">
                        <strong>Période de congé maternité:</strong>
                      </p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-neutral-600">Début recommandée:</span>
                          <p className="font-semibold text-neutral-900">
                            {formatDate(calculations.leaveStartDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-neutral-600">Fin du congé:</span>
                          <p className="font-semibold text-neutral-900">
                            {formatDate(calculations.optionalEndDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-neutral-600">Retour au travail:</span>
                          <p className="font-semibold text-neutral-900">
                            {formatDate(calculations.returnToWorkDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Bituach Leumi Card */}
            {parentType === "mère" && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Allocation Bituach Leumi
                  </h2>
                </div>

                {/* Tableau recapitulatif des 3 seuils legaux BL */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-4 text-xs text-neutral-700 space-y-1">
                  <p className="font-semibold text-neutral-900">Seuils d&apos;éligibilité (Bituah Leumi)</p>
                  <p>
                    <strong>Allocation pleine (15 semaines)</strong> : 10 mois consécutifs de cotisation sur les 14 derniers, OU 15 mois cumulés sur 22.
                  </p>
                  <p>
                    <strong>Allocation partielle (7 semaines)</strong> : 6 mois consécutifs de cotisation sur les 14 derniers.
                  </p>
                  <p>
                    <strong>Aucune allocation</strong> : moins de 6 mois de cotisation.
                  </p>
                  <p className="pt-1 text-neutral-500">
                    Votre situation estimée : <strong>{calculations.contributedInLast14}</strong> mois cotisés sur les 14 derniers.
                  </p>
                </div>

                {calculations.blEligibility === 'none' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle size={20} className="text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-neutral-900 mb-1">
                          Vous ne remplissez pas les conditions BL
                        </p>
                        <p className="text-sm text-neutral-700">
                          Avec {calculations.contributedInLast14} mois cotisés sur les 14 derniers (seuil minimum : 6 mois), vous n&apos;avez pas droit aux indemnités maternité de Bituah Leumi. Consultez votre centre BL local ou un expert pour confirmer votre situation exacte.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {calculations.blEligibility === 'partial' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                        <strong>Allocation partielle :</strong> vous avez droit à 7 semaines d&apos;indemnisation au lieu de 15. Les semaines restantes du congé légal ne sont pas couvertes par BL.
                      </div>
                    )}

                    <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                      <span className="text-neutral-700">Semaines indemnisées BL</span>
                      <span className="font-bold text-green-600">
                        {calculations.blPaidWeeks} semaines
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                      <span className="text-neutral-700">Montant estimé par jour</span>
                      <span className="font-bold text-green-600">
                        ₪{calculations.dailyAllowance.toLocaleString("fr-FR")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                      <span className="text-neutral-700">
                        Total alloué ({calculations.totalDaysLeave} jours)
                      </span>
                      <span className="font-bold text-green-600">
                        ₪{calculations.totalAllowance.toLocaleString("fr-FR")}
                      </span>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-neutral-700 mb-2">
                        Différence avec votre salaire normal:
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        -₪{Math.abs(calculations.salaryLoss).toLocaleString("fr-FR")}
                      </p>
                      <p className="text-xs text-neutral-600 mt-2">
                        (Ce montant représente la partie non couverte par Bituach Leumi)
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Job Protection Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Protection de l'emploi
                </h2>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral-900 mb-1">
                        Période protégée: 60 jours après le retour
                      </p>
                      <p className="text-sm text-neutral-700">
                        Du {formatDate(calculations.returnToWorkDate)} au{" "}
                        {formatDate(calculations.protectionEndDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-neutral-900">
                    L'employeur ne peut pas:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Vous licencier pendant la période protégée",
                      "Modifier vos conditions de travail de manière défavorable",
                      "Réduire votre salaire",
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-neutral-700">
                        <span className="text-brand-600 font-bold">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <p className="font-semibold text-neutral-900 mb-2">
                    Vos droits sont maintenus:
                  </p>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    {[
                      "Ancienneté continue à augmenter",
                      "Congés payés continuent à s'accumuler",
                      "Keren Hishtalmut continue à être versée",
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Timeline Card */}
            {parentType === "mère" && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Timeline du congé
                  </h2>
                </div>

                <div className="relative">
                  {/* Timeline container */}
                  <div className="space-y-6">
                    {[
                      {
                        label: "Grossesse",
                        date: "Jusqu'au congé",
                        color: "bg-blue-100",
                        textColor: "text-blue-700",
                      },
                      {
                        label: "Congé optionnel pré-natal",
                        date: `${6} semaines avant`,
                        color: "bg-yellow-100",
                        textColor: "text-yellow-700",
                      },
                      {
                        label: "Accouchement",
                        date: formatDate(new Date(dueDate)),
                        color: "bg-red-100",
                        textColor: "text-red-700",
                      },
                      {
                        label: "Congé obligatoire",
                        date: `${6} semaines (42 jours)`,
                        color: "bg-green-100",
                        textColor: "text-green-700",
                      },
                      {
                        label: "Congé optionnel",
                        date: `${calculations.maternityWeeks - 6} semaines`,
                        color: "bg-green-100",
                        textColor: "text-green-700",
                      },
                      {
                        label: "Retour au travail + Protection",
                        date: `${60} jours protégés`,
                        color: "bg-indigo-100",
                        textColor: "text-indigo-700",
                      },
                    ].map((phase, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 ${phase.color} rounded-full flex items-center justify-center font-bold text-sm ${phase.textColor}`}>
                            {idx + 1}
                          </div>
                          {idx < 5 && (
                            <div className={`w-1 h-8 ${phase.color.replace("100", "300")} mt-1`} />
                          )}
                        </div>
                        <div className="pb-2">
                          <p className="font-semibold text-neutral-900">
                            {phase.label}
                          </p>
                          <p className="text-sm text-neutral-600">{phase.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Checklist Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} className="text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">À préparer</h2>
          </div>

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedItems[idx]}
                  onChange={() => toggleCheck(idx)}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-2 focus:ring-brand-500"
                />
                <span
                  className={`text-sm ${
                    checkedItems[idx]
                      ? "line-through text-neutral-400"
                      : "text-neutral-700"
                  }`}
                >
                  {item}
                </span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 sm:p-8 text-white mb-8"
        >
          <div className="flex items-start gap-4">
            <HelpCircle size={24} className="flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Besoin d'aide ?</h3>
              <p className="text-brand-100 mb-4">
                Un expert peut vous guider pour optimiser votre congé et vos allocations.
              </p>
              <Link
                href="/annuaire/professionnels"
                className="inline-block bg-white text-brand-600 font-semibold px-6 py-2 rounded-lg hover:bg-brand-50 transition-colors"
              >
                Consultez un expert →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-neutral-100 rounded-2xl p-5 text-center mb-8"
        >
          <p className="text-xs text-neutral-600">
            ⚠️ Ce calculateur est fourni à titre indicatif. Les montants exacts peuvent varier
            selon votre convention collective, contrat individuel et situation personnelle.
            En cas de doute, consultez un expert ou contactez Bituach Leumi directement.
          </p>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
