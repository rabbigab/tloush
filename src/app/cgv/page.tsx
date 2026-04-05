import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export const metadata = {
  title: "CGV — Tloush",
  description:
    "Conditions Générales de Vente et d'Utilisation du service Tloush.",
};

const SECTIONS = [
  {
    title: "1. Objet",
    content:
      "Les présentes Conditions Générales de Vente et d'Utilisation (ci-après « CGV ») régissent l'accès et l'utilisation du service Tloush, accessible à l'adresse https://tloush.com (ci-après le « Service »). Tloush est un outil d'aide à la compréhension de documents administratifs israéliens destiné aux francophones résidant en Israël. En créant un compte et en utilisant le Service, l'utilisateur accepte sans réserve les présentes CGV.",
  },
  {
    title: "2. Description du service",
    content:
      "Tloush permet à l'utilisateur de téléverser des documents administratifs (fiches de paie, factures, courriers officiels, contrats, etc.) et d'obtenir en retour une analyse automatisée en français générée par intelligence artificielle. Le Service inclut notamment : l'explication du contenu, la détection d'anomalies, les rappels d'échéances, le suivi des dépenses récurrentes, la gestion de dossiers et un assistant conversationnel. Tloush est un outil d'aide à la compréhension et ne remplace en aucun cas l'avis d'un professionnel qualifié (expert-comptable, avocat, conseiller fiscal).",
  },
  {
    title: "3. Création de compte",
    content:
      "L'accès au Service nécessite la création d'un compte via une adresse email et un mot de passe, ou via une authentification Google. L'utilisateur s'engage à fournir des informations exactes et à préserver la confidentialité de ses identifiants. Tloush ne pourra être tenu responsable en cas d'utilisation frauduleuse des identifiants d'un utilisateur.",
  },
  {
    title: "4. Plans et tarification",
    content:
      "Tloush propose trois formules : un plan Découverte gratuit (2 mois d'essai, 5 documents par mois), un plan Solo à 49 ILS par mois (50 documents, historique illimité, assistant IA, rappels) et un plan Famille à 99 ILS par mois (150 documents, jusqu'à 5 membres). Les prix sont indiqués en shekels israéliens (ILS) toutes taxes comprises. Le paiement est mensuel et s'effectue par carte bancaire via notre prestataire Stripe. L'abonnement est tacitement renouvelé chaque mois jusqu'à annulation par l'utilisateur.",
  },
  {
    title: "5. Paiement et facturation",
    content:
      "Le paiement est traité de manière sécurisée par Stripe. Aucune donnée bancaire n'est stockée sur les serveurs de Tloush. Une facture électronique est accessible depuis le portail de gestion de l'abonnement. En cas d'échec de paiement, l'accès aux fonctionnalités payantes peut être suspendu après notification de l'utilisateur.",
  },
  {
    title: "6. Résiliation",
    content:
      "L'utilisateur peut annuler son abonnement à tout moment depuis son espace personnel ou via le portail client Stripe. L'annulation prend effet à la fin de la période de facturation en cours ; aucun remboursement au prorata n'est effectué. L'utilisateur peut supprimer définitivement son compte et toutes ses données depuis son profil, de manière irréversible.",
  },
  {
    title: "7. Droit de rétractation",
    content:
      "Conformément à la législation applicable, pour les services numériques fournis de manière continue, l'utilisateur dispose d'un droit de rétractation de 14 jours à compter de la souscription. Toutefois, en utilisant activement le Service pendant cette période, l'utilisateur renonce expressément à son droit de rétractation, le service étant considéré comme pleinement exécuté.",
  },
  {
    title: "8. Propriété des données",
    content:
      "L'utilisateur conserve l'entière propriété des documents qu'il téléverse et des données qu'il saisit. Tloush n'acquiert aucun droit sur ces contenus. L'utilisateur accorde uniquement à Tloush une licence limitée d'utilisation pour fournir le Service : stockage sécurisé, analyse automatisée et restitution des résultats. Aucune donnée utilisateur n'est utilisée pour entraîner des modèles d'intelligence artificielle.",
  },
  {
    title: "9. Responsabilités",
    content:
      "Les analyses générées par Tloush sont fournies à titre indicatif et informatif uniquement. Elles ne constituent en aucun cas un conseil juridique, fiscal, comptable ou administratif. L'utilisateur reste seul responsable des décisions qu'il prend sur la base de ces analyses. Tloush ne peut être tenu responsable d'erreurs d'interprétation, de dommages directs ou indirects résultant de l'utilisation du Service, ni d'interruptions de service imputables à des tiers (hébergeurs, fournisseurs d'API).",
  },
  {
    title: "10. Obligations de l'utilisateur",
    content:
      "L'utilisateur s'engage à ne téléverser que des documents dont il est propriétaire ou pour lesquels il dispose d'une autorisation de traitement. Il s'engage à ne pas utiliser le Service à des fins illégales, frauduleuses ou portant atteinte aux droits de tiers. Tout manquement peut entraîner la suspension ou la résiliation du compte sans préavis.",
  },
  {
    title: "11. Disponibilité",
    content:
      "Tloush s'efforce de maintenir le Service accessible 24h/24 et 7j/7, mais ne garantit pas une disponibilité absolue. Des interruptions peuvent survenir pour maintenance, mise à jour ou en raison de facteurs indépendants (pannes des prestataires tiers). Tloush ne saurait être tenu responsable des conséquences de ces interruptions.",
  },
  {
    title: "12. Modifications des CGV",
    content:
      "Tloush se réserve le droit de modifier les présentes CGV à tout moment. Les utilisateurs seront informés par email des modifications substantielles au moins 30 jours avant leur entrée en vigueur. La poursuite de l'utilisation du Service après cette date vaut acceptation des nouvelles CGV.",
  },
  {
    title: "13. Droit applicable",
    content:
      "Les présentes CGV sont régies par le droit israélien. Tout litige relatif à l'exécution, l'interprétation ou la résiliation des présentes sera soumis à la compétence exclusive des tribunaux du ressort du siège social de Tloush, sauf disposition légale impérative contraire.",
  },
  {
    title: "14. Contact",
    content:
      "Pour toute question relative aux présentes CGV, contactez-nous à contact@tloush.com.",
  },
];

export default function CGVPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={30} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-slate-100 mb-3">
            Conditions Générales de Vente
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-sm">
            Version en vigueur à compter d&apos;avril 2026
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 p-6 sm:p-8 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="pb-5 border-b border-neutral-100 dark:border-slate-700 last:border-0 last:pb-0">
              <h2 className="font-bold text-neutral-800 dark:text-slate-200 text-base mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-neutral-400 dark:text-slate-500 text-center mt-6">
          Dernière mise à jour : avril 2026
        </p>
      </div>
      <Footer />
    </main>
  );
}
