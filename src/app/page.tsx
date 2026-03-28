import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustBadges from "@/components/landing/TrustBadges";
import DisclaimerBlock from "@/components/shared/DisclaimerBlock";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Hero />
        <TrustBadges />
        <HowItWorks />

        {/* CTA section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Prêt à comprendre votre tloush ?
              </h2>
              <p className="text-brand-100 mb-8 max-w-md mx-auto text-base">
                Analyse gratuite, en français, en quelques minutes. Sans inscription.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/analyze"
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
                >
                  Analyser ma fiche de paie
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/analyze?demo=true"
                  className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  Essayer avec une démo
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
