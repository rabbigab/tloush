"use client";

import Link from "next/link";
import { ArrowRight, FileCheck, AlertTriangle, ListChecks, Receipt } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 dark:bg-brand-900/30 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-200 dark:bg-brand-800/20 rounded-full blur-3xl opacity-30 -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            Le copilote des francophones en Israël
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-slate-100 leading-tight mb-6">
            Ne subissez plus{" "}
            <span className="text-brand-600">vos papiers en Israël</span>
          </h1>

          {/* Sous-titre axé valeur */}
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-slate-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Uploadez un document en hébreu. Recevez en français : une explication claire, les points à vérifier, les risques éventuels et les actions à faire.
          </p>

          {/* Trust badges inline */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm text-neutral-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileCheck size={14} className="text-brand-600" />
              <span className="font-semibold">100% en français</span>
            </span>
            <span className="text-neutral-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="font-semibold">Détection des anomalies</span>
            </span>
            <span className="text-neutral-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <ListChecks size={14} className="text-green-500" />
              <span className="font-semibold">Actions recommandées</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-lg text-base"
              >
                Analyser mon premier document
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 text-brand-600 dark:text-brand-400 font-semibold px-8 py-4 rounded-xl border-2 border-brand-200 dark:border-brand-700 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all text-base"
              >
                J'ai déjà un compte
              </Link>
            </motion.div>
          </div>

          {/* 4 cas d'usage concrets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "📄", label: "Fiches de paie", desc: "Comprendre chaque ligne" },
              { icon: "📋", label: "Contrats", desc: "Repérer les clauses à risque" },
              { icon: "📨", label: "Courriers officiels", desc: "Savoir quoi faire" },
              { icon: "🧾", label: "Factures", desc: "Suivre vos dépenses" },
            ].map((item) => (
              <div key={item.label} className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-neutral-100 dark:border-slate-700 p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-sm font-semibold text-neutral-800 dark:text-slate-200">{item.label}</div>
                <div className="text-xs text-neutral-500 dark:text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
