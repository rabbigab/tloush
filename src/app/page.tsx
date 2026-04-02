import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustBadges from "@/components/landing/TrustBadges";
import FAQ from "@/components/landing/FAQ";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tloush — Comprenez vos documents israéliens, en français",
  description:
    "Uploadez votre fiche de paie en hébreu. En 30 secondes, comprenez chaque ligne, détectez les erreurs, et sachez exactement quoi demander à votre employeur. 100% gratuit, en français.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <div className="flex-1">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Feature Cards (3 columns) */}
        <Features />

        {/* Section 3: How It Works (simplified, 3 steps) */}
        <HowItWorks />

        {/* Section 4: Trust & Credibility */}
        <TrustBadges />

        {/* Section 5: FAQ */}
        <FAQ />

        {/* Section 6: Final CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Prêt à comprendre vos documents ?
              </h2>
              <p className="text-brand-100 mb-8 max-w-md mx-auto text-base">
                Créez votre compte en 30 secondes. C'est gratuit.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
              >
                Créer mon compte gratuit
                <ArrowRight size={18} />
              </Link>
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
