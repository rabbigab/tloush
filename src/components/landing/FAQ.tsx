"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Oui, vous pouvez analyser jusqu'à 3 documents gratuitement pour découvrir le service. Ensuite, passez au plan Solo à 49₪/mois pour un accès complet.",
  },
  {
    q: "Quels types de documents puis-je analyser ?",
    a: "Fiches de paie, avis d'imposition, courriers du Bituah Leumi, contrats de travail ou de location, factures (arnona, électricité, internet...), relevés de retraite, assurance santé, et tout document administratif israélien en hébreu.",
  },
  {
    q: "Est-ce que Tloush est juste un traducteur ?",
    a: "Non. Tloush va bien au-delà de la traduction : il analyse le contenu, repère les anomalies potentielles, détecte les échéances importantes et vous recommande les actions à mener. C'est un véritable copilote administratif.",
  },
  {
    q: "Mes données sont-elles en sécurité ?",
    a: "Oui. Vos documents sont stockés de façon chiffrée et ne sont jamais partagés. Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis votre profil.",
  },
  {
    q: "Tloush remplace-t-il un comptable ou un avocat ?",
    a: "Non. Tloush est un outil d'aide a la comprehension et a la verification. Pour des decisions importantes, nous vous orientons vers le bon professionnel via notre annuaire d'experts francophones.",
  },
  {
    q: "C'est quoi le plan Famille ?",
    a: "Le plan Famille permet de partager un abonnement avec jusqu'a 5 membres de votre famille. Chacun a son propre espace et ses propres documents, le quota est partage. Ideal pour les couples ou les familles avec des enfants adultes.",
  },
  {
    q: "Je suis independant / freelance, ca marche aussi ?",
    a: "Oui ! Analysez vos factures, documents de l'administration fiscale, courriers de Bituach Leumi. Tloush repere les anomalies qui pourraient vous couter cher.",
  },
  {
    q: "Que fait Tloush avec mes donnees dans 5 ans ?",
    a: "Vous pouvez exporter votre historique complet a tout moment et tout supprimer en un clic. Vos donnees, vos regles. On ne garde rien apres suppression.",
  },
  {
    q: "Pourquoi pas juste Google Translate ?",
    a: "Google Translate traduit les mots. Tloush comprend les regles. Bituach Leumi n'est pas juste un mot, c'est un systeme de retenues qui varie selon votre statut d'olim. Un traducteur le manquerait. Pas Tloush.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
          Questions fréquentes
        </h2>
      </motion.div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = open === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-5 text-left hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-neutral-800 dark:text-slate-200 text-sm sm:text-base">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    size={18}
                    className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed mt-3 pt-3 border-t border-neutral-100 dark:border-slate-700">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
