"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Oui, Tloush est 100% gratuit. Vous pouvez analyser jusqu'a 5 documents par heure sans aucune carte bancaire.",
  },
  {
    q: "Quels types de documents puis-je analyser ?",
    a: "Fiches de paie, avis d'imposition, courriers du Bituah Leumi, contrats de travail, releves de retraite, assurance sante, courriers officiels, et plus encore. Tout document administratif israelien en hebreu.",
  },
  {
    q: "Mes donnees sont-elles en securite ?",
    a: "Oui. Vos documents sont stockes de facon chiffree et ne sont jamais partages. Vous pouvez supprimer votre compte et toutes vos donnees a tout moment depuis votre profil.",
  },
  {
    q: "Tloush remplace-t-il un comptable ou un avocat ?",
    a: "Non. Tloush est un outil d'aide a la comprehension. Pour des decisions importantes (litige, optimisation fiscale, erreur de paie), nous vous recommandons de consulter un professionnel. Notre annuaire d'experts francophones peut vous aider.",
  },
  {
    q: "Comment fonctionne l'analyse ?",
    a: "Vous uploadez une photo ou un PDF de votre document. Notre IA (Claude) lit le document en hebreu, identifie le type, extrait les informations cles et vous fournit un resume complet en francais en moins de 30 secondes.",
  },
  {
    q: "Je peux utiliser Tloush sur mobile ?",
    a: "Oui, Tloush est concu pour fonctionner parfaitement sur telephone. Vous pouvez meme prendre une photo de votre document directement depuis votre mobile.",
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
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-3">
          Questions frequentes
        </h2>
        <p className="text-neutral-600 max-w-xl mx-auto text-base">
          Tout ce que vous devez savoir avant de commencer
        </p>
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
                className="w-full bg-white rounded-2xl border border-neutral-100 p-5 text-left hover:border-brand-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-neutral-800 text-sm sm:text-base">
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
                      <p className="text-sm text-neutral-600 leading-relaxed mt-3 pt-3 border-t border-neutral-100">
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
