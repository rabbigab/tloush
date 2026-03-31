"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CongesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Solde de Congés</h1>
        <p className="text-neutral-600">Calculez vos jours de congés accumulés.</p>
      </div>
      <Footer />
    </main>
  );
}
