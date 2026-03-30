import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { experts, SPECIALTY_LABELS } from "@/data/experts";
import { MapPin, Globe, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import ContactExpertForm from "@/components/experts/ContactExpertForm";

export async function generateStaticParams() {
  return experts.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const expert = experts.find((e) => e.slug === params.slug);
  if (!expert) return {};
  return {
    title: `${expert.name} — Expert francophone en Israël | Tloush`,
    description: `${expert.title} francophone à ${expert.city}. ${expert.bio.substring(0, 120)}...`,
  };
}

export default function ExpertProfilePage({ params }: { params: { slug: string } }) {
  const expert = experts.find((e) => e.slug === params.slug && e.active);
  if (!expert) notFound();

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/experts" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 transition-colors mb-6">
          <ChevronLeft size={14} /> Retour à l&apos;annuaire
        </Link>

        {/* Carte profil */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0 text-brand-700 font-bold text-2xl">
              {expert.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-neutral-900">{expert.name}</h1>
              <p className="text-neutral-500 text-sm">{expert.title}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {expert.specialties.map((s) => (
                  <span key={s} className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
                    {SPECIALTY_LABELS[s]}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin size={14} className="text-neutral-400 shrink-0" />{expert.city}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="text-neutral-400 text-xs shrink-0">🌐</span>{expert.languages.join(", ")}
            </div>
            {expert.tarif && (
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 text-sm text-neutral-600">
                <span className="text-neutral-400 text-xs shrink-0">💰</span>{expert.tarif}
              </div>
            )}
          </div>
          {expert.website && (
            <div className="mt-4">
              <a href={expert.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
                <Globe size={13} /> Site web
              </a>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <h2 className="font-semibold text-neutral-800 mb-3">À propos</h2>
          <p className="text-neutral-600 text-sm leading-relaxed">{expert.bio}</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h2 className="font-semibold text-neutral-800 mb-1">
            Prendre contact avec {expert.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-neutral-500 mb-5">
            Décrivez votre situation en quelques mots. Vous recevrez une réponse dans les 48h.
          </p>
          <ContactExpertForm expertSlug={expert.slug} expertName={expert.name} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
