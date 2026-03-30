import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { experts, SPECIALTY_LABELS, ExpertSpecialty } from "@/data/experts";
import { MapPin, Star, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experts francophones en Israël — Tloush",
  description: "Trouvez un avocat, comptable ou conseiller RH francophone en Israël. Des professionnels qualifiés qui parlent votre langue.",
};

const SPECIALTY_OPTIONS: { value: ExpertSpecialty | "all"; label: string }[] = [
  { value: "all", label: "Toutes spécialités" },
  { value: "droit-travail", label: "Droit du travail" },
  { value: "comptabilite", label: "Comptabilité" },
  { value: "fiscalite", label: "Fiscalité" },
  { value: "rh", label: "Ressources humaines" },
  { value: "creation-entreprise", label: "Création d'entreprise" },
];

export default function ExpertsPage({
  searchParams,
}: {
  searchParams: { specialite?: string; ville?: string };
}) {
  const selectedSpecialty = searchParams.specialite as ExpertSpecialty | undefined;
  const selectedCity = searchParams.ville;

  const filtered = experts.filter((e) => {
    if (!e.active) return false;
    if (selectedSpecialty && selectedSpecialty !== "all") {
      if (!e.specialties.includes(selectedSpecialty)) return false;
    }
    if (selectedCity && selectedCity !== "all") {
      if (e.city !== selectedCity) return false;
    }
    return true;
  });

  const cities = Array.from(new Set(experts.map((e) => e.city)));

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Star size={12} />
            Professionnels vérifiés
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Trouvez un expert francophone
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Des avocats, comptables et conseillers RH qui parlent français et
            connaissent parfaitement le droit du travail israélien.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 mb-8 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-neutral-600 mr-1">Filtrer :</span>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((opt) => {
              const isActive = (!selectedSpecialty && opt.value === "all") || selectedSpecialty === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={opt.value === "all" ? "/experts" : `/experts?specialite=${opt.value}`}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isActive ? "bg-brand-600 text-white border-brand-600" : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300"}`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
          {cities.length > 1 && (
            <div className="flex flex-wrap gap-2 ml-auto">
              {["all", ...cities].map((city) => (
                <Link
                  key={city}
                  href={city === "all" ? (selectedSpecialty ? `/experts?specialite=${selectedSpecialty}` : "/experts") : (selectedSpecialty ? `/experts?specialite=${selectedSpecialty}&ville=${city}` : `/experts?ville=${city}`)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${(!selectedCity && city === "all") || selectedCity === city ? "bg-neutral-800 text-white border-neutral-800" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}
                >
                  {city === "all" ? "Toutes villes" : city}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-neutral-700 mb-1">Aucun expert trouvé</p>
            <p className="text-sm text-neutral-500 mb-4">
              Essayez de modifier vos filtres ou{" "}
              <Link href="/experts" className="text-brand-600 underline">voir tous les experts</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((expert) => (
              <Link
                key={expert.slug}
                href={`/experts/${expert.slug}`}
                className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-brand-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 text-brand-700 font-bold text-lg">
                    {expert.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm group-hover:text-brand-700 transition-colors">{expert.name}</p>
                    <p className="text-xs text-neutral-500">{expert.title}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {expert.specialties.map((s) => (
                    <span key={s} className="text-[10px] font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                      {SPECIALTY_LABELS[s]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={11} />{expert.city}</span>
                  <span>{expert.languages.join(", ")}</span>
                </div>
                {expert.tarif && <p className="text-xs text-neutral-400 mb-3">{expert.tarif}</p>}
                <div className="flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:gap-2 transition-all">
                  Voir le profil <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA pro */}
        <div className="mt-12 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white text-center">
          <h2 className="font-bold text-lg mb-1">Vous êtes professionnel francophone ?</h2>
          <p className="text-brand-100 text-sm mb-4">Rejoignez notre annuaire et connectez-vous avec des clients francophones en Israël.</p>
          <Link href="/experts/rejoindre" className="inline-block bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
            Rejoindre le répertoire
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
