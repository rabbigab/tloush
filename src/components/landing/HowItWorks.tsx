"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    emoji: "📤",
    number: "1",
    title: "Uploadez",
    desc: "Déposez votre document en hébreu : fiche de paie, contrat, facture, courrier officiel (PDF ou photo)",
  },
  {
    emoji: "🔍",
    number: "2",
    title: "Tloush analyse",
    desc: "Notre IA lit, traduit et vérifie votre document. Elle repère les anomalies et les points importants.",
  },
  {
    emoji: "✅",
    number: "3",
    title: "Comprenez et agissez",
    desc: "Recevez un résumé clair, les points à vérifier et les actions à mener. Tloush vous rappelle les échéances.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
          Comment ça marche ?
        </h2>
        <p className="text-neutral-600 dark:text-slate-300 max-w-xl mx-auto text-base">
          3 étapes simples pour reprendre le contrôle de vos documents
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {STEPS.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="relative"
          >
            {/* Connector line (hidden on mobile) */}
            {idx < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-brand-200 to-transparent -z-10 transform translate-x-1/2" />
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6 flex flex-col items-center text-center gap-4">
              {/* Number badge */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-lg">
                {step.number}
              </div>

              {/* Emoji icon */}
              <div className="text-4xl" aria-hidden="true">{step.emoji}</div>

              {/* Content */}
              <div>
                <h3 className="font-bold text-neutral-800 dark:text-slate-200 mb-2 text-base">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
