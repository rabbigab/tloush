"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  OLIM_RIGHTS,
  filterRightsByProfile,
  CATEGORY_LABELS,
  URGENCY_LABELS,
  CATEGORY_COLORS,
  type OlimRight,
} from "@/data/olim-rights";
import {
  ChevronDown,
  ChevronUp,
  Share2,
  MessageCircle,
  Printer,
  Download,
  Calendar,
  Briefcase,
  Users,
  Home,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type Step = "questions" | "results" | "summary";

interface Answers {
  arrivalDate: Date | null;
  employmentStatus: string;
  familyStatus: string;
  officialAlya: boolean;
  foreignProperty: boolean;
}

export default function OlimRightsPage() {
  const [step, setStep] = useState<Step>("questions");
  const [answers, setAnswers] = useState<Answers>({
    arrivalDate: null,
    employmentStatus: "",
    familyStatus: "",
    officialAlya: false,
    foreignProperty: false,
  });
  const [expandedRights, setExpandedRights] = useState<Set<string>>(new Set());

  const applicableRights = useMemo(
    () => filterRightsByProfile(answers),
    [answers]
  );

  const totalValue = applicableRights.reduce((sum, right) => {
    if (right.amount && right.currency === "ILS") {
      return sum + right.amount;
    }
    return sum;
  }, 0);

  const handleArrivalDateChange = (value: string) => {
    if (value) {
      setAnswers((prev) => ({
        ...prev,
        arrivalDate: new Date(value),
      }));
    }
  };

  const handleProceedToResults = () => {
    if (answers.arrivalDate && answers.employmentStatus && answers.familyStatus) {
      setStep("results");
    }
  };

  const toggleExpandRight = (rightId: string) => {
    const newSet = new Set(expandedRights);
    if (newSet.has(rightId)) {
      newSet.delete(rightId);
    } else {
      newSet.add(rightId);
    }
    setExpandedRights(newSet);
  };

  const handleShare = () => {
    const text = `Découvrez tous les droits et aides auxquels vous avez droit en tant que nouvel olim en Israël! Utilisez le calculateur Tloush: ${window.location.origin}/droits-olim`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      {/* STEP 1: QUESTIONNAIRE */}
      {step === "questions" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10"
        >
          {/* Hero */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl mb-4"
            >
              🇮🇱
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Découvrez vos droits d'Olim
            </h1>
            <p className="text-neutral-600 max-w-lg mx-auto mb-8">
              En 5 questions, découvrez toutes les aides financières, exonérations d'impôt et
              avantages auxquels vous avez droit.
            </p>
          </div>

          {/* Questionnaire */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-6 sm:p-8">
            {/* Q1: Date d'arrivée */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8 pb-8 border-b border-neutral-100"
            >
              <label className="flex items-start gap-3 mb-4">
                <Calendar className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-900 mb-1">
                    Date d'arrivée en Israël
                  </span>
                  <span className="text-xs text-neutral-500">
                    Quand avez-vous immigré?
                  </span>
                </div>
              </label>
              <input
                type="date"
                value={
                  answers.arrivalDate
                    ? answers.arrivalDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleArrivalDateChange(e.target.value)}
                className="input-field"
              />
            </motion.div>

            {/* Q2: Statut professionnel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 pb-8 border-b border-neutral-100"
            >
              <label className="flex items-start gap-3 mb-4">
                <Briefcase className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-900 mb-1">
                    Statut professionnel
                  </span>
                  <span className="text-xs text-neutral-500">
                    Quelle est votre situation?
                  </span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {["Salarié", "Indépendant", "Étudiant", "Sans emploi", "Retraité"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          employmentStatus: status,
                        }))
                      }
                      className={`p-3 rounded-xl border-2 font-medium transition-all ${
                        answers.employmentStatus === status
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-neutral-200 text-neutral-600 hover:border-brand-200"
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </motion.div>

            {/* Q3: Situation familiale */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8 pb-8 border-b border-neutral-100"
            >
              <label className="flex items-start gap-3 mb-4">
                <Users className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-900 mb-1">
                    Situation familiale
                  </span>
                  <span className="text-xs text-neutral-500">
                    Quel est votre contexte familial?
                  </span>
                </div>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  "Célibataire",
                  "En couple",
                  "En couple avec enfants",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        familyStatus: status,
                      }))
                    }
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      answers.familyStatus === status
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-neutral-200 text-neutral-600 hover:border-brand-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Q4: Alya officielle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 pb-8 border-b border-neutral-100"
            >
              <label className="flex items-start gap-3 mb-4">
                <Home className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-900 mb-1">
                    Alya officielle
                  </span>
                  <span className="text-xs text-neutral-500">
                    Avez-vous effectué votre Alya officiellement?
                  </span>
                </div>
              </label>
              <div className="flex gap-3">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        officialAlya: value,
                      }))
                    }
                    className={`flex-1 p-3 rounded-xl border-2 font-medium transition-all ${
                      answers.officialAlya === value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-neutral-200 text-neutral-600 hover:border-brand-200"
                    }`}
                  >
                    {value ? "Oui" : "Non"}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Q5: Bien immobilier étranger */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="flex items-start gap-3 mb-4">
                <Home className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-900 mb-1">
                    Bien immobilier à l'étranger
                  </span>
                  <span className="text-xs text-neutral-500">
                    Possédez-vous un bien immobilier en dehors d'Israël?
                  </span>
                </div>
              </label>
              <div className="flex gap-3">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        foreignProperty: value,
                      }))
                    }
                    className={`flex-1 p-3 rounded-xl border-2 font-medium transition-all ${
                      answers.foreignProperty === value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-neutral-200 text-neutral-600 hover:border-brand-200"
                    }`}
                  >
                    {value ? "Oui" : "Non"}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <button
                onClick={handleProceedToResults}
                disabled={!answers.arrivalDate || !answers.employmentStatus || !answers.familyStatus}
                className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Découvrir mes droits
              </button>
            </motion.div>
          </div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-8 bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-brand-600 mt-0.5 shrink-0" />
            <p className="text-xs text-brand-900">
              <strong>Information:</strong> Les droits affichés sont basés sur votre profil. Pour une
              liste complète et personnalisée, consultez un expert.
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* STEP 2: RESULTS */}
      {step === "results" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10"
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setStep("questions")}
              className="text-brand-600 font-medium text-sm mb-4 hover:text-brand-700 flex items-center gap-1"
            >
              ← Modifier mes réponses
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
              Vos droits d'Olim
            </h1>
            <p className="text-neutral-600">
              {applicableRights.length} avantages disponibles pour vous
            </p>
          </div>

          {/* Rights Grid */}
          <div className="space-y-4 mb-10">
            {applicableRights.map((right, index) => (
              <motion.div
                key={right.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden hover:shadow-md transition-all"
              >
                {/* Right Card Header */}
                <button
                  onClick={() => toggleExpandRight(right.id)}
                  className="w-full p-5 sm:p-6 flex items-start gap-4 hover:bg-neutral-50 transition-colors text-left"
                >
                  {/* Icon */}
                  <div className="text-3xl shrink-0">{right.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-neutral-900 text-lg">
                        {right.title}
                      </h3>
                      {expandedRights.has(right.id) ? (
                        <ChevronUp size={20} className="text-brand-600 shrink-0" />
                      ) : (
                        <ChevronDown size={20} className="text-neutral-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-neutral-600 text-sm mb-3">
                      {right.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2">
                      {right.amount && (
                        <span className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
                          {right.amount.toLocaleString("fr-FR")} {right.currency}
                        </span>
                      )}
                      {right.duration && (
                        <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 text-xs font-medium px-2.5 py-1 rounded-full">
                          {right.duration}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          CATEGORY_COLORS[right.category].bg
                        } ${CATEGORY_COLORS[right.category].text}`}
                      >
                        {CATEGORY_LABELS[right.category]}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          right.urgency === "immediate"
                            ? "bg-danger/10 text-danger"
                            : right.urgency === "3months"
                              ? "bg-warning/10 text-warning"
                              : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {URGENCY_LABELS[right.urgency]}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedRights.has(right.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-neutral-100 bg-neutral-50 px-5 sm:px-6 py-5"
                  >
                    <div className="space-y-4">
                      {/* Comment en bénéficier */}
                      <div>
                        <h4 className="font-semibold text-neutral-900 text-sm mb-2">
                          Comment en bénéficier
                        </h4>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                          {right.howTo}
                        </p>
                      </div>

                      {/* Conditions */}
                      <div>
                        <h4 className="font-semibold text-neutral-900 text-sm mb-2">
                          Conditions à remplir
                        </h4>
                        <ul className="space-y-1">
                          {right.conditions.map((condition, i) => (
                            <li
                              key={i}
                              className="text-sm text-neutral-600 flex items-start gap-2"
                            >
                              <span className="inline-block w-1.5 h-1.5 bg-brand-600 rounded-full mt-2 shrink-0" />
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {right.eligibleAfterDays && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="text-xs text-blue-900">
                            ℹ️ <strong>À noter:</strong> Cette aide devient disponible{" "}
                            {right.eligibleAfterDays === 0
                              ? "immédiatement"
                              : `après ${right.eligibleAfterDays} jours`}
                            .
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA to Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => setStep("summary")}
              className="btn-primary flex-1 py-3"
            >
              Voir le résumé
            </button>
            <button
              onClick={() => setStep("questions")}
              className="btn-ghost"
            >
              Modifier mes réponses
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* STEP 3: SUMMARY */}
      {step === "summary" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Résumé de vos droits
            </h1>
            <p className="text-neutral-600">
              Un aperçu de tous les avantages disponibles pour vous
            </p>
          </div>

          {/* Total Value Card */}
          {totalValue > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-success via-brand-600 to-brand-700 rounded-2xl p-8 text-white mb-10 shadow-lg"
            >
              <p className="text-sm font-medium opacity-90 mb-2">
                Valeur estimée totale
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-1">
                {totalValue.toLocaleString("fr-FR")} ₪
              </h2>
              <p className="text-sm opacity-80">
                Aides financières directes sur {applicableRights.length} droits
              </p>
            </motion.div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
            {[
              {
                label: "À faire immédiatement",
                count: applicableRights.filter((r) => r.urgency === "immediate").length,
                color: "bg-danger/10 text-danger",
              },
              {
                label: "Dans les 3 mois",
                count: applicableRights.filter((r) => r.urgency === "3months").length,
                color: "bg-warning/10 text-warning",
              },
              {
                label: "Pas urgent",
                count: applicableRights.filter((r) => r.urgency === "noturgent").length,
                color: "bg-neutral-100 text-neutral-600",
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 ${stat.color} text-center`}
              >
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-xs font-medium mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Rights by Category */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6 mb-10">
            <h3 className="font-semibold text-neutral-900 mb-4">
              Répartition par catégorie
            </h3>
            <div className="space-y-3">
              {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                const count = applicableRights.filter(
                  (r) => r.category === category
                ).length;
                if (count === 0) return null;

                const colors = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${colors.text}`}
                      />
                      <span className="text-sm text-neutral-600">{label}</span>
                    </div>
                    <span className="font-semibold text-neutral-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-white text-brand-700 border-2 border-brand-200 font-semibold px-6 py-3 rounded-xl hover:border-brand-400 hover:bg-brand-50 active:scale-95 transition-all"
            >
              <Share2 size={18} />
              <span>Partager via WhatsApp</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-white text-brand-700 border-2 border-brand-200 font-semibold px-6 py-3 rounded-xl hover:border-brand-400 hover:bg-brand-50 active:scale-95 transition-all"
            >
              <Printer size={18} />
              <span>Imprimer / Télécharger</span>
            </motion.button>
          </div>

          {/* Expert CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-50 border border-brand-100 rounded-2xl p-6 sm:p-8 mb-10"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">
                  Besoin de conseils personnalisés?
                </h3>
                <p className="text-sm text-neutral-600">
                  Un expert peut vous aider à maximiser vos droits et simplifier les démarches.
                </p>
              </div>
              <Link href="/experts" className="btn-primary text-sm py-2.5 px-6 shrink-0">
                Consulter un expert
              </Link>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => setStep("results")}
              className="btn-ghost flex-1"
            >
              ← Retour aux détails
            </button>
            <button
              onClick={() => setStep("questions")}
              className="btn-ghost flex-1"
            >
              Recommencer le questionnaire
            </button>
          </motion.div>

          {/* Disclaimer */}
          <div className="mt-10 bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-neutral-400 mt-0.5 shrink-0" />
            <p className="text-xs text-neutral-500 leading-relaxed">
              <strong className="text-neutral-600">Analyse indicative uniquement.</strong>{" "}
              Cette liste est basée sur votre profil et ne remplace pas un conseil d'expert. Les
              conditions d'accès aux droits peuvent varier selon votre situation exacte. Consultez
              un professionnel pour une évaluation complète et à jour.
            </p>
          </div>
        </motion.div>
      )}

      <Footer />
    </main>
  );
}
