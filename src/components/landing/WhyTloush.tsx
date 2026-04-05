"use client";

import { motion } from "framer-motion";
import { FileText, TrendingUp, Bell, MessageSquare, FolderOpen, Users } from "lucide-react";

const BENEFITS = [
  {
    icon: FileText,
    title: "Comprendre tous vos documents",
    desc: "Fiches de paie, contrats, courriers, factures... tout expliqué clairement en français.",
  },
  {
    icon: TrendingUp,
    title: "Repérer les anomalies",
    desc: "Points suspects, variations inhabituelles, clauses à risque : Tloush vous alerte.",
  },
  {
    icon: Bell,
    title: "Ne rien oublier",
    desc: "Rappels automatiques avant les échéances. Résumé hebdomadaire par email.",
  },
  {
    icon: FolderOpen,
    title: "Suivre vos dépenses",
    desc: "Scannez vos factures et suivez vos charges récurrentes sans saisie manuelle.",
  },
  {
    icon: MessageSquare,
    title: "Poser vos questions",
    desc: "Un assistant IA qui connaît vos documents et répond en français.",
  },
  {
    icon: Users,
    title: "Protéger toute la famille",
    desc: "Plan famille jusqu'à 5 membres. Chacun son espace, un seul abonnement.",
  },
];

export default function WhyTloush() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
            Pourquoi Tloush ?
          </h2>
          <p className="text-neutral-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
            Tloush n'est pas juste un traducteur. C'est votre système personnel pour ne plus subir vos papiers en Israël.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-neutral-100 dark:border-slate-700 p-5 flex gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                  <Icon size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-slate-200 text-sm mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
