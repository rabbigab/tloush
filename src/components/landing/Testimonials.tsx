"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Je pensais que je gagnais 11K₪, mais Tloush m'a montre que je perdais 1 500₪ en retenues anormales. J'ai envoye une reclamation et mon employeur m'a rembourse.",
    name: "Maud C.",
    location: "Jerusalem",
    plan: "Plan Solo",
  },
  {
    quote: "Chaque mois je recevais mon tlush et je le rangeais sans comprendre. Maintenant en 30 secondes je sais exactement ce qu'on me retient et pourquoi. C'est devenu un reflexe.",
    name: "David L.",
    location: "Tel Aviv",
    plan: "Plan Solo",
  },
  {
    quote: "On a pris le plan famille. Mon mari et moi on uploade nos fiches de paie chacun. On a decouvert qu'on payait trop de Bituach Leumi depuis 2 ans. Merci Tloush !",
    name: "Sarah B.",
    location: "Netanya",
    plan: "Plan Famille",
  },
  {
    quote: "J'ai scanne mon contrat de travail avec le scanner de documents. Il a detecte une clause de non-concurrence abusive que je n'avais meme pas remarquee. Mon avocat a confirme.",
    name: "Jonathan M.",
    location: "Herzliya",
    plan: "Plan Pro",
  },
  {
    quote: "En tant que freelance, je ne savais jamais combien mettre de cote pour les impots. Le simulateur freelance m'a tout calcule : Bituach Leumi, mas akhnasa, TVA. Plus de mauvaises surprises.",
    name: "Lea R.",
    location: "Raanana",
    plan: "Plan Solo",
  },
  {
    quote: "L'assistant m'a aide a comprendre un courrier du Bituach Leumi que je n'arrivais pas a dechiffrer. En 2 minutes j'avais la traduction et les actions a faire. Indispensable pour tout ole.",
    name: "Marc T.",
    location: "Ashdod",
    plan: "Plan Famille",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-neutral-600 dark:text-slate-400 text-base">
            Ils ont repris le controle de leurs documents
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-neutral-700 dark:text-slate-300 leading-relaxed flex-1 mb-4">
                &laquo; {t.quote} &raquo;
              </p>

              {/* Author */}
              <div className="border-t border-neutral-100 dark:border-slate-700 pt-4">
                <p className="text-sm font-semibold text-neutral-900 dark:text-slate-200">{t.name}</p>
                <p className="text-xs text-neutral-500 dark:text-slate-400">{t.location} &bull; {t.plan}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { value: '5', label: 'Types de documents supportes' },
            { value: '15+', label: 'Outils integres' },
            { value: '30 sec', label: 'Pour une analyse complete' },
            { value: '100%', label: 'En francais' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-neutral-100 dark:border-slate-700 p-4">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</p>
              <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
