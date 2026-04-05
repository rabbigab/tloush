"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ShieldAlert, ListChecks, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Eye,
    number: "1",
    title: "Comprendre",
    subtitle: "Ce que dit vraiment le document",
    description:
      "Fiche de paie, contrat, courrier administratif, facture : Tloush vous explique clairement chaque élément en français. Plus besoin de deviner ce que signifient ces lignes en hébreu.",
    highlights: [
      "Traduction et explication de chaque ligne",
      "Identification du type de document",
      "Extraction des montants et dates clés",
    ],
    cta: "Analyser un document",
    href: "/auth/register",
    gradient: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    accent: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: ShieldAlert,
    number: "2",
    title: "Vérifier",
    subtitle: "Ce qui mérite votre attention",
    description:
      "Tloush repère les points suspects, les anomalies potentielles, les clauses à risque et les échéances importantes. Vous savez immédiatement ce qui nécessite votre vigilance.",
    highlights: [
      "Points d'attention avec niveau de gravité",
      "Détection d'anomalies et incohérences",
      "Alertes sur les échéances et délais",
    ],
    cta: "Voir un exemple",
    href: "/auth/register",
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
    accent: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: ListChecks,
    number: "3",
    title: "Agir",
    subtitle: "Ce que vous devez faire ensuite",
    description:
      "Recevez un plan d'action clair : répondre à un courrier, demander une précision, préparer des pièces ou consulter le bon professionnel. Plus de doutes sur la marche à suivre.",
    highlights: [
      "Actions recommandées étape par étape",
      "Orientation vers le bon professionnel si besoin",
      "Rappels automatiques avant les échéances",
    ],
    cta: "Commencer maintenant",
    href: "/auth/register",
    gradient: "from-green-500 to-emerald-500",
    lightBg: "bg-green-50 dark:bg-green-950/30",
    accent: "text-green-600 dark:text-green-400",
  },
];

export default function Features() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
          Plus qu'une traduction. Un copilote.
        </h2>
        <p className="text-neutral-600 dark:text-slate-400 max-w-xl mx-auto text-base">
          Tloush ne se contente pas d'expliquer vos documents. Il vous aide à comprendre, vérifier et agir.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group h-full bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6 flex flex-col gap-5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-brand-200 dark:hover:border-brand-700">
                  {/* Icon + Number */}
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} items-center justify-center text-white shadow-sm`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-slate-400">{feature.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 flex-grow">
                    {feature.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${feature.gradient} shrink-0`} />
                        <span className="text-neutral-700 dark:text-slate-300">{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className={`flex items-center gap-2 ${feature.accent} font-semibold text-sm group-hover:gap-3 transition-all`}>
                    {feature.cta}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
