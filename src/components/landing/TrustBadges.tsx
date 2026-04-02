"use client";

import { ShieldCheck, Scale, Users } from "lucide-react";
import { motion } from "framer-motion";

const BADGES = [
  {
    icon: ShieldCheck,
    title: "Vos données sont en sécurité",
    desc: "Stockage chiffré. Suppression à tout moment. Conforme RGPD.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Scale,
    title: "Législation israélienne 2026",
    desc: "Basé sur les lois et régulations à jour.",
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    icon: Users,
    title: "Par et pour francophones",
    desc: "Créé par des francophones en Israël, pour des francophones.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-700 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <Icon size={22} className={badge.color} />
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
