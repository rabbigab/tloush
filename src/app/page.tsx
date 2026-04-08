import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import WhyTloush from "@/components/landing/WhyTloush";
import TrustBadges from "@/components/landing/TrustBadges";
import FAQ from "@/components/landing/FAQ";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import AuthRedirect from "@/components/auth/AuthRedirect";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tloush — Votre fiche de paie israelienne expliquee en francais",
  description:
    "Tloush explique vos documents israeliens en hebreu, en francais. Analysez gratuitement votre fiche de paie, contrat ou courrier officiel en 30 secondes.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <AuthRedirect />
      <Header />
      <div className="flex-1">
        {/* 1. Hero — accroche + social proof + CTA */}
        <Hero />

        {/* 2. Pourquoi c'est complique — valider la douleur */}
        <ProblemSection />

        {/* 3. Comment ca marche — 3 etapes */}
        <HowItWorks />

        {/* 4. Comprendre / Verifier / Agir */}
        <Features />

        {/* 5. Temoignages */}
        <Testimonials />

        {/* 6. Pourquoi Tloush — benefices */}
        <WhyTloush />

        {/* 7. Trust & Credibilite */}
        <TrustBadges />

        {/* 8. FAQ */}
        <FAQ />

        {/* 9. Final CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Arretez de subir, commencez a comprendre
              </h2>
              <p className="text-brand-100 mb-4 max-w-lg mx-auto text-base">
                Creez votre compte en 30 secondes. Vos 3 premieres analyses sont gratuites.
              </p>
              <p className="text-brand-200 mb-8 text-sm">
                Ensuite 49₪/mois &bull; Sans engagement &bull; Annulez quand vous voulez
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
                >
                  Analyser mon 1er document gratuitement
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl border-2 border-white/30 hover:bg-white/10 transition-colors"
                >
                  Voir les plans
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <DisclaimerBlock />
        </div>
      </div>
      <Footer />
    </main>
  );
}
