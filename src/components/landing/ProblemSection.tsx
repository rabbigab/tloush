"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

const PROBLEMS = [
  "L'hebreu des fiches de paie n'est pas du \"bon hebreu\" — meme les bilingues sont perdus",
  "Les abreviations administratives n'ont pas d'equivalent francais direct",
  "Le salaire brut ne correspond jamais a ce qu'on vous a annonce a l'embauche",
  "Les retenues varient selon votre statut d'olim — un traducteur ne le saura pas",
  "Un avocat facture 500₪ pour vous expliquer une simple fiche de paie",
];

export default function ProblemSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-red-900 dark:text-red-200 mb-5">
            Pourquoi c&apos;est si complique ?
          </h3>
          <ul className="space-y-3">
            {PROBLEMS.map((problem, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex items-start gap-3 text-sm sm:text-base text-red-800 dark:text-red-300"
              >
                <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{problem}</span>
              </motion.li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-red-700 dark:text-red-400 font-medium italic">
            &laquo; Google Translate traduit les mots. Tloush comprend les regles. &raquo;
          </p>
        </div>
      </motion.div>
    </section>
  );
}
