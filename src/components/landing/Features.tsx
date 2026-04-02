"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Lightbulb, Calculator, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    emoji: "🔍",
    title: "Inbox intelligent",
    description:
      "Uploadez vos documents en hébreu — fiches de paie, courriers, contrats, avis d'imposition. Recevez une analyse complète en français avec alertes visuelles pour les urgences.",
    cta: "Accéder à mon inbox",
    href: "/inbox",
    color: "from-blue-50 to-blue-100",
    accentColor: "text-blue-600",
  },
  {
    icon: Lightbulb,
    emoji: "🤖",
    title: "Assistant IA personnel",
    description:
      "Posez vos questions en français sur n'importe quel document. L'assistant connaît le contenu de vos documents et vous répond avec des conseils concrets.",
    cta: "Parler à l'assistant",
    href: "/assistant",
    color: "from-amber-50 to-amber-100",
    accentColor: "text-amber-600",
  },
  {
    icon: Calculator,
    emoji: "📊",
    title: "Dashboard & alertes",
    description:
      "Vue d'ensemble de tous vos documents, alertes urgentes, actions en attente. Plus un résumé hebdomadaire par email pour ne rien oublier.",
    cta: "Voir mon dashboard",
    href: "/dashboard",
    color: "from-green-50 to-green-100",
    accentColor: "text-green-600",
  },
];

export default function Features() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-3">
          Tout ce dont vous avez besoin
        </h2>
        <p className="text-neutral-600 max-w-xl mx-auto text-base">
          Des outils complets pour comprendre, analyser et optimiser votre situation en Israël
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group h-full card flex flex-col gap-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                  {/* Icon */}
                  <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-800 group-hover:text-brand-600 transition-colors">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm group-hover:gap-3 transition-all">
                    {feature.cta}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
