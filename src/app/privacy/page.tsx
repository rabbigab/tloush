import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, Lock, Database, Eye, UserX } from "lucide-react";

const SECTIONS = [
  {
    icon: Database,
    title: "Quelles données traitons-nous ?",
    content:
      "Dans le cadre de l'analyse, votre fiche de paie (PDF ou image) est lue uniquement en mémoire pour en extraire les informations visibles. Elle n'est pas envoyée à un serveur externe ni stockée sur nos systèmes.",
  },
  {
    icon: Lock,
    title: "Comment vos données sont-elles protégées ?",
    content:
      "Le traitement s'effectue entièrement dans votre navigateur (côté client). Aucune information personnelle, aucun document et aucun rapport n'est conservé après la fermeture de votre onglet. Nous n'utilisons pas de cookies de suivi.",
  },
  {
    icon: Eye,
    title: "Qui peut voir vos données ?",
    content:
      "Personne. Ni Tloush, ni un tiers, ni un algorithme d'apprentissage automatique n'accède à votre fiche de paie. L'analyse est produite localement pour vous seul.",
  },
  {
    icon: UserX,
    title: "Aucun compte, aucun profil",
    content:
      "Tloush ne vous demande pas de créer un compte, de fournir votre email ni votre identité. Vous pouvez utiliser l'outil de manière totalement anonyme.",
  },
  {
    icon: ShieldCheck,
    title: "Analyse informative uniquement",
    content:
      "Les résultats produits par Tloush sont fournis à titre indicatif et pédagogique. Ils ne constituent pas un avis juridique, comptable ou professionnel. En cas de litige ou de doute sérieux, consultez un avocat spécialisé en droit du travail israélien.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={30} className="text-success" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed">
            Votre vie privée est notre priorité. Voici tout ce que vous devez savoir
            sur la façon dont Tloush traite vos données.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-neutral-800 text-base mb-2">
                      {section.title}
                    </h2>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Résumé visuel */}
        <div className="mt-8 bg-success/10 border border-success/20 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-3">🔒</p>
          <p className="font-bold text-neutral-800 text-lg mb-2">
            En résumé : rien n'est conservé.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Votre fiche de paie reste sur votre appareil. L'analyse se fait dans votre navigateur.
            Aucune donnée ne quitte votre machine.
          </p>
        </div>

        <p className="text-xs text-neutral-400 text-center mt-6">
          Dernière mise à jour : mars 2024 · Version MVP
        </p>
      </div>
      <Footer />
    </main>
  );
}
