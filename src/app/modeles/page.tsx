import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Modèles de lettres — Tloush",
  description:
    "Modèles de lettres gratuits pour vos démarches en Israël : réclamation salaire, démission, recours Bituach Leumi, etc.",
};

export default function ModelsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-3">Modèles de lettres</h1>
        <p className="text-neutral-500">Lettres types et modèles à personnaliser.</p>
      </div>
      <Footer />
    </main>
  );
}
