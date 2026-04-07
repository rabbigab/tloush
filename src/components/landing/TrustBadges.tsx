"use client";

import { ShieldCheck, Scale, Users, Lock } from "lucide-react";
import { motion } from "framer-motion";

const BADGES = [
  {
    icon: Lock,
    title: "Vos documents restent prives",
    desc: "Chiffrement de bout en bout. Nous ne vendons jamais vos donnees. Suppression en 1 clic.",
    color: "text-success",
    bg: "bg-success/10 dark:bg-green-950/30",
  },
  {
    icon: Scale,
    title: "Legislation israelienne 2026",
    desc: "Base sur les lois et regulations a jour. Mis a jour chaque trimestre.",
    color: "text-brand-600 dark:text-brand-400",
    bg: "bg-brand-50 dark:bg-brand-950/30",
  },
  {
    icon: ShieldCheck,
    title: "Conforme RGPD",
    desc: "Droit a l'oubli complet. Aucun tracking publicitaire. Vos donnees, vos regles.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: Users,
    title: "Par et pour francophones",
    desc: "Cree par des francophones en Israel. On connait vos galeres, on les a vecues.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-700 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center gap-3 p-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${badge.bg} flex items-center justify-center`}>
                  <Icon size={22} className={badge.color} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-slate-200 text-sm mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
                    {badge.desc}
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
