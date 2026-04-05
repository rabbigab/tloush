import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustBadges from "@/components/landing/TrustBadges";
import FAQ from "@/components/landing/FAQ";
import WhyTloush from "@/components/landing/WhyTloush";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import AuthRedirect from "@/components/auth/AuthRedirect";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tloush — Ne subissez plus vos papiers en Israël",
  description:
    "Uploadez un document en hébreu. Recevez en français : une explication claire, les points à vérifier, les risques éventuels et les actions à faire. Le copilote administratif des francophones en Israël.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <AuthRedirect />
      <Header />
      <div className="flex-1">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Comprendre / Vérifier / Agir */}
        <Features />

        {/* Section 3: Comment ça marche */}
        <HowItWorks />

        {/* Section 4: Pourquoi Tloush */}
        <WhyTloush />

        {/* Section 5: Trust & Credibility */}
        <TrustBadges />

        {/* Section 6: FAQ */}
        <FAQ />

        {/* Section 7: Final CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Reprenez le contrôle de vos documents
              </h2>
              <p className="text-brand-100 mb-8 max-w-lg mx-auto text-base">
                Créez votre compte en 30 secondes et analysez votre premier document gratuitement.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
                >
                  Analyser mon premier document
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
