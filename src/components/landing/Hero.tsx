"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-200 rounded-full blur-3xl opacity-30 -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            Outil gratuit pour la communauté francophone d'Israël
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl sm:text-6xl font-extrabold text-neutral-900 leading-tight mb-6">
            Vos documents israéliens,{" "}
            <span className="text-brand-600">enfin clairs</span>
          </h1>

          {/* Sous-titre descriptif */}
          <p className="text-xl text-neutral-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Fiche de paie, courrier officiel, avis d'imposition, contrat... Uploadez votre document en hébreu et recevez une explication complète en français en 30 secondes.
          </p>

          {/* Trust badges inline */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <span className="font-semibold">100% en français</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="font-semibold">Gratuit</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="font-semibold">Données sécurisées</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-lg text-base"
              >
                Créer mon compte gratuit
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 text-brand-600 font-semibold px-8 py-4 rounded-xl border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50 transition-all text-base"
              >
                J'ai déjà un compte
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
