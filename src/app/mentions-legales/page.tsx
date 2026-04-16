import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Mentions légales",
  description: "Mentions légales du service Tloush.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale size={30} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
            Mentions légales
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-sm">
            Informations légales relatives au site tloush.com
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
              Éditeur du site
            </h2>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
              Le site tloush.com est édité par <strong>Tloush</strong>.
              <br />
              Pour toute question, écrivez-nous à :{" "}
              <a
                href="mailto:contact@tloush.com"
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                contact@tloush.com
              </a>
              .
            </p>
            <p className="text-xs text-neutral-400 dark:text-slate-500 mt-3 italic">
              (Raison sociale, numéro d&apos;enregistrement, adresse du siège social et
              identité du représentant légal à compléter selon la forme juridique
              retenue.)
            </p>
          </section>

          <section className="pt-5 border-t border-neutral-100 dark:border-slate-700">
            <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
              Directeur de la publication
            </h2>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
              Le directeur de la publication est le représentant légal de Tloush.
            </p>
          </section>

          <section className="pt-5 border-t border-neutral-100 dark:border-slate-700">
            <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
              Hébergement
            </h2>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
              Le site est hébergé par <strong>Vercel Inc.</strong>
              <br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
              <br />
              Site :{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                vercel.com
              </a>
            </p>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed mt-3">
              La base de données et le stockage des documents sont assurés par{" "}
              <strong>Supabase</strong> (infrastructure en Europe — Irlande).
            </p>
          </section>

          <section className="pt-5 border-t border-neutral-100 dark:border-slate-700">
            <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
              Propriété intellectuelle
            </h2>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
              L&apos;ensemble des éléments du site (marque, logo, textes, interface,
              code source, charte graphique) est protégé par le droit d&apos;auteur et
              le droit des marques. Toute reproduction, représentation, adaptation ou
              exploitation, totale ou partielle, sans autorisation écrite préalable,
              est strictement interdite.
            </p>
          </section>

          <section className="pt-5 border-t border-neutral-100 dark:border-slate-700">
            <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
              Responsabilité
            </h2>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
              Tloush est un outil d&apos;aide à la compréhension de documents
              administratifs. Les analyses générées par l&apos;intelligence
              artificielle sont fournies à titre indicatif et ne constituent en aucun
              cas un conseil juridique, fiscal ou comptable. Pour toute décision
              importante, consultez un professionnel qualifié.
            </p>
          </section>

          <section className="pt-5 border-t border-neutral-100 dark:border-slate-700">
            <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
              Données personnelles
            </h2>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
              Le traitement des données personnelles est détaillé dans notre{" "}
              <a
                href="/privacy"
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                Politique de confidentialité
              </a>
              . Les conditions générales d&apos;utilisation sont consultables dans nos{" "}
              <a
                href="/cgv"
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                CGV
              </a>
              .
            </p>
          </section>

          <section className="pt-5 border-t border-neutral-100 dark:border-slate-700">
            <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
              Cookies
            </h2>
            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
              Le site utilise uniquement des cookies strictement nécessaires
              (authentification, session) et des cookies analytiques anonymisés
              (PostHog). Aucun cookie publicitaire n&apos;est déposé.
            </p>
          </section>
        </div>

        <p className="text-xs text-neutral-400 dark:text-slate-500 text-center mt-6">
          Dernière mise à jour : avril 2026
        </p>
      </div>
      <Footer />
    </main>
  );
}
