import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  UserX,
  Mail,
  Cookie,
  Clock,
  Server,
} from "lucide-react";

const SECTIONS = [
  {
    icon: Database,
    title: "1. Qui collecte vos données ?",
    content:
      "Tloush est un service en ligne qui aide les francophones en Israël à comprendre leurs documents administratifs en hébreu. Le responsable du traitement des données est Tloush. Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l\u2019adresse : contact@tloush.com.",
  },
  {
    icon: Eye,
    title: "2. Quelles données collectons-nous ?",
    content:
      "Nous collectons les données suivantes : votre adresse email (lors de la création de compte), les documents que vous téléversez pour analyse (fiches de paie, courriers administratifs, etc.), les résultats d\u2019analyse générés par l\u2019intelligence artificielle, ainsi que l\u2019historique de vos conversations avec l\u2019assistant. Des données techniques (adresse IP, type de navigateur) peuvent également être collectées à des fins de sécurité et d\u2019amélioration du service.",
  },
  {
    icon: Lock,
    title: "3. Comment vos données sont-elles utilisées ?",
    content:
      "Vos documents sont analysés par une intelligence artificielle (Claude, développé par Anthropic) afin de vous fournir une explication en français. Les résultats sont stockés de manière sécurisée pour que vous puissiez les retrouver. Votre email sert uniquement à l\u2019authentification et à l\u2019envoi de notifications liées au service (confirmation de compte, etc.). Nous n\u2019envoyons jamais de publicité ni ne revendons vos données.",
  },
  {
    icon: Server,
    title: "4. Sous-traitants et services tiers",
    content:
      "Pour fonctionner, Tloush fait appel aux services suivants : Supabase (hébergement de la base de données et stockage sécurisé des documents, serveurs en Europe), Anthropic / Claude (analyse des documents par IA — les documents sont transmis de manière sécurisée et ne sont pas utilisés pour entraîner le modèle), Vercel (hébergement de l\u2019application web), Resend (envoi d\u2019emails transactionnels), PostHog (analytics anonymisées d\u2019utilisation du service) et Sentry (détection et correction d\u2019erreurs techniques). Chacun de ces prestataires est soumis à ses propres obligations en matière de protection des données.",
  },
  {
    icon: ShieldCheck,
    title: "5. Sécurité des données",
    content:
      "Vos documents sont stockés dans un espace privé (bucket privé Supabase Storage) accessible uniquement par vous. L\u2019accès aux données en base est isolé par utilisateur grâce à des règles de sécurité au niveau des lignes (Row Level Security). Toutes les communications sont chiffrées via HTTPS.",
  },
  {
    icon: Clock,
    title: "6. Durée de conservation",
    content:
      "Vos données sont conservées tant que votre compte est actif. Lorsque vous supprimez votre compte, toutes vos données sont définitivement effacées : documents, analyses, conversations et informations de profil. Cette suppression est irréversible.",
  },
  {
    icon: UserX,
    title: "7. Vos droits (RGPD)",
    content:
      "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d\u2019accès à vos données personnelles, droit de rectification, droit à l\u2019effacement (suppression de compte), droit à la portabilité de vos données et droit d\u2019opposition au traitement. Vous pouvez exercer ces droits à tout moment depuis les paramètres de votre compte ou en nous contactant à contact@tloush.com.",
  },
  {
    icon: Cookie,
    title: "8. Cookies et analytics",
    content:
      "Tloush utilise des cookies strictement nécessaires au fonctionnement du service (authentification, session). Nous utilisons PostHog pour collecter des statistiques anonymisées d\u2019utilisation (pages visitées, fonctionnalités utilisées) afin d\u2019améliorer le service. Sentry est utilisé pour détecter les erreurs techniques. Aucun cookie publicitaire n\u2019est utilisé.",
  },
  {
    icon: Mail,
    title: "9. Contact",
    content:
      "Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous à contact@tloush.com. Nous nous engageons à répondre dans un délai de 30 jours.",
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
            Votre vie privée est notre priorité. Voici comment Tloush
            collecte, utilise et protège vos données personnelles.
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
          <p className="text-2xl mb-3">&#128274;</p>
          <p className="font-bold text-neutral-800 text-lg mb-2">
            En résumé : vos données vous appartiennent.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Vos documents sont stockés de manière sécurisée
            et isolée. Vous pouvez supprimer votre compte et toutes vos
            données à tout moment. Nous ne vendons jamais vos
            données.
          </p>
        </div>

        <p className="text-xs text-neutral-400 text-center mt-6">
          Dernière mise à jour : avril 2026
        </p>
      </div>
      <Footer />
    </main>
  );
}
