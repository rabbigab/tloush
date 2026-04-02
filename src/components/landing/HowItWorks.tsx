"use client";

import { Upload, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    icon: Upload,
    emoji: "📤",
    number: "1",
    title: "Uploadez",
    desc: "Déposez votre document en hébreu (PDF, photo)",
  },
  {
    icon: Zap,
    emoji: "🤖",
    number: "2",
    title: "On analyse",
    desc: "Notre IA traduit, structure et vérifie chaque ligne",
  },
  {
    icon: CheckCircle2,
    emoji: "✅",
    number: "3",
    title: "Agissez",
    desc: "Recevez un rapport clair avec les actions à mener",
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
        <p className="text-neutral-600 dark:text-slate-400 max-w-xl mx-auto text-base">
          3 étapes simples pour comprendre vos documents en français
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

            <div className="card flex flex-col items-center text-center gap-4">
              {/* Number badge */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-lg">
                {step.number}
              </div>

              {/* Emoji icon */}
              <div className="text-4xl">{step.emoji}</div>

              {/* Content */}
              <div>
                <h3 className="font-bold text-neutral-800 dark:text-slate-200 mb-1 text-base">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-slate-400 leading-relaxed">
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
