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
      "Tloush est un service en ligne qui aide les francophones en Isra\u00ebl \u00e0 comprendre leurs documents administratifs en h\u00e9breu. Le responsable du traitement des donn\u00e9es est Tloush. Pour toute question relative \u00e0 vos donn\u00e9es personnelles, vous pouvez nous contacter \u00e0 l\u2019adresse : contact@tloush.com.",
  },
  {
    icon: Eye,
    title: "2. Quelles donn\u00e9es collectons-nous ?",
    content:
      "Nous collectons les donn\u00e9es suivantes : votre adresse email (lors de la cr\u00e9ation de compte), les documents que vous t\u00e9l\u00e9versez pour analyse (fiches de paie, courriers administratifs, etc.), les r\u00e9sultats d\u2019analyse g\u00e9n\u00e9r\u00e9s par l\u2019intelligence artificielle, ainsi que l\u2019historique de vos conversations avec l\u2019assistant. Des donn\u00e9es techniques (adresse IP, type de navigateur) peuvent \u00e9galement \u00eatre collect\u00e9es \u00e0 des fins de s\u00e9curit\u00e9 et d\u2019am\u00e9lioration du service.",
  },
  {
    icon: Lock,
    title: "3. Comment vos donn\u00e9es sont-elles utilis\u00e9es ?",
    content:
      "Vos documents sont analys\u00e9s par une intelligence artificielle (Claude, d\u00e9velopp\u00e9 par Anthropic) afin de vous fournir une explication en fran\u00e7ais. Les r\u00e9sultats sont stock\u00e9s de mani\u00e8re s\u00e9curis\u00e9e pour que vous puissiez les retrouver. Votre email sert uniquement \u00e0 l\u2019authentification et \u00e0 l\u2019envoi de notifications li\u00e9es au service (confirmation de compte, etc.). Nous n\u2019envoyons jamais de publicit\u00e9 ni ne revendons vos donn\u00e9es.",
  },
  {
    icon: Server,
    title: "4. Sous-traitants et services tiers",
    content:
      "Pour fonctionner, Tloush fait appel aux services suivants : Supabase (h\u00e9bergement de la base de donn\u00e9es et stockage s\u00e9curis\u00e9 des documents, serveurs en Europe), Anthropic / Claude (analyse des documents par IA \u2014 les documents sont transmis de mani\u00e8re s\u00e9curis\u00e9e et ne sont pas utilis\u00e9s pour entra\u00eener le mod\u00e8le), Vercel (h\u00e9bergement de l\u2019application web), Resend (envoi d\u2019emails transactionnels), PostHog (analytics anonymis\u00e9es d\u2019utilisation du service) et Sentry (d\u00e9tection et correction d\u2019erreurs techniques). Chacun de ces prestataires est soumis \u00e0 ses propres obligations en mati\u00e8re de protection des donn\u00e9es.",
  },
  {
    icon: ShieldCheck,
    title: "5. S\u00e9curit\u00e9 des donn\u00e9es",
    content:
      "Vos documents sont stock\u00e9s dans un espace priv\u00e9 (bucket priv\u00e9 Supabase Storage) accessible uniquement par vous. L\u2019acc\u00e8s aux donn\u00e9es en base est isol\u00e9 par utilisateur gr\u00e2ce \u00e0 des r\u00e8gles de s\u00e9curit\u00e9 au niveau des lignes (Row Level Security). Toutes les communications sont chiffr\u00e9es via HTTPS.",
  },
  {
    icon: Clock,
    title: "6. Dur\u00e9e de conservation",
    content:
      "Vos donn\u00e9es sont conserv\u00e9es tant que votre compte est actif. Lorsque vous supprimez votre compte, toutes vos donn\u00e9es sont d\u00e9finitivement effac\u00e9es : documents, analyses, conversations et informations de profil. Cette suppression est irr\u00e9versible.",
  },
  {
    icon: UserX,
    title: "7. Vos droits (RGPD)",
    content:
      "Conform\u00e9ment au R\u00e8glement G\u00e9n\u00e9ral sur la Protection des Donn\u00e9es (RGPD), vous disposez des droits suivants : droit d\u2019acc\u00e8s \u00e0 vos donn\u00e9es personnelles, droit de rectification, droit \u00e0 l\u2019effacement (suppression de compte), droit \u00e0 la portabilit\u00e9 de vos donn\u00e9es et droit d\u2019opposition au traitement. Vous pouvez exercer ces droits \u00e0 tout moment depuis les param\u00e8tres de votre compte ou en nous contactant \u00e0 contact@tloush.com.",
  },
  {
    icon: Cookie,
    title: "8. Cookies et analytics",
    content:
      "Tloush utilise des cookies strictement n\u00e9cessaires au fonctionnement du service (authentification, session). Nous utilisons PostHog pour collecter des statistiques anonymis\u00e9es d\u2019utilisation (pages visit\u00e9es, fonctionnalit\u00e9s utilis\u00e9es) afin d\u2019am\u00e9liorer le service. Sentry est utilis\u00e9 pour d\u00e9tecter les erreurs techniques. Aucun cookie publicitaire n\u2019est utilis\u00e9.",
  },
  {
    icon: Mail,
    title: "9. Contact",
    content:
      "Pour toute question concernant cette politique de confidentialit\u00e9 ou vos donn\u00e9es personnelles, contactez-nous \u00e0 contact@tloush.com. Nous nous engageons \u00e0 r\u00e9pondre dans un d\u00e9lai de 30 jours.",
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
            Politique de confidentialit&eacute;
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed">
            Votre vie priv&eacute;e est notre priorit&eacute;. Voici comment Tloush
            collecte, utilise et prot&egrave;ge vos donn&eacute;es personnelles.
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

        {/* R&eacute;sum&eacute; visuel */}
        <div className="mt-8 bg-success/10 border border-success/20 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-3">&#128274;</p>
          <p className="font-bold text-neutral-800 text-lg mb-2">
            En r&eacute;sum&eacute; : vos donn&eacute;es vous appartiennent.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Vos documents sont stock&eacute;s de mani&egrave;re s&eacute;curis&eacute;e
            et isol&eacute;e. Vous pouvez supprimer votre compte et toutes vos
            donn&eacute;es &agrave; tout moment. Nous ne vendons jamais vos
            donn&eacute;es.
          </p>
        </div>

        <p className="text-xs text-neutral-400 text-center mt-6">
          Derni&egrave;re mise &agrave; jour : avril 2026
        </p>
      </div>
      <Footer />
    </main>
  );
}
