import type { Metadata } from "next";
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
  Globe,
  Scale,
} from "lucide-react";
import {
  LEGAL_ENTITY,
  DATA_PROCESSORS,
  DATA_RETENTION,
  APPLICABLE_LAWS,
} from "@/lib/legalEntity";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Tloush protège vos données personnelles et vos documents. RGPD, chiffrement, conservation, droits des utilisateurs, transferts hors UE.",
};

// ---------------------------------------------------------------------------
// Helpers de generation de contenu depuis src/lib/legalEntity.ts (finding #10)
// ---------------------------------------------------------------------------

const COUNTRY_LABELS: Record<string, string> = {
  IL: 'Israël',
  IE: 'Irlande (UE)',
  US: 'États-Unis',
  FR: 'France (UE)',
  DE: 'Allemagne (UE)',
};

function renderProcessorsParagraph(): string {
  const lines = DATA_PROCESSORS.map((p) => {
    const country = COUNTRY_LABELS[p.country] || p.country;
    const safeguards: string[] = [];
    if (p.covered_by_scc) safeguards.push('Clauses Contractuelles Types (SCC)');
    if (p.dpf_certified) safeguards.push('EU-US Data Privacy Framework');
    const safeguardText =
      safeguards.length > 0 ? ` — garanties : ${safeguards.join(', ')}` : '';
    return `${p.name} (${country}) : ${p.purpose}${safeguardText}.`;
  });
  return (
    "Pour fonctionner, Tloush fait appel aux sous-traitants suivants, chacun lié par un accord de traitement des données (DPA) : " +
    lines.join(' ')
  );
}

function renderRetentionParagraph(): string {
  const sortedKeys = ['account_active', 'account_deleted', 'security_logs', 'invoices'];
  const parts = sortedKeys.map((key) => {
    const policy = DATA_RETENTION[key];
    if (!policy) return '';
    const labelByKey: Record<string, string> = {
      account_active: 'Compte actif',
      account_deleted: 'Compte supprimé',
      security_logs: 'Logs de sécurité',
      invoices: 'Factures et comptabilité',
    };
    return `${labelByKey[key]} : ${policy.label} (${policy.legalBasis}).`;
  });
  return (
    'Nous conservons vos données selon les durées suivantes : ' +
    parts.filter(Boolean).join(' ') +
    ' À l\'expiration du délai applicable, les données sont purgées de façon irréversible par un processus automatisé.'
  );
}

function renderLegalFrameworkParagraph(): string {
  const primary =
    APPLICABLE_LAWS.primary === 'israelien' ? 'droit israélien' : APPLICABLE_LAWS.primary;
  const rgpd = APPLICABLE_LAWS.gdprApplies
    ? " Le Règlement Général sur la Protection des Données (RGPD, UE 2016/679) s'applique également aux résidents de l'Union européenne et aux données transitant via l'UE."
    : '';
  const israeli = APPLICABLE_LAWS.israeliPrivacyLaw
    ? " La Loi israélienne sur la protection de la vie privée (חוק הגנת הפרטיות 1981) s'applique pour les résidents d'Israël."
    : '';
  return (
    `Le contrat d'utilisation du Service est régi par le ${primary} (voir article 14 des CGV).` +
    rgpd +
    israeli +
    " En cas de conflit entre ces cadres, Tloush applique la règle la plus protectrice pour l'utilisateur."
  );
}

function renderInternationalTransfersParagraph(): string {
  const nonEu = DATA_PROCESSORS.filter((p) => p.country === 'US');
  if (nonEu.length === 0) {
    return 'Toutes les données sont traitées dans l\'Espace économique européen (EEE).';
  }
  const names = nonEu.map((p) => p.name).join(', ');
  return (
    `Certains sous-traitants (${names}) sont basés aux États-Unis. ` +
    "Pour ces transferts, Tloush s'appuie sur les Clauses Contractuelles Types (SCC) de la Commission européenne (Décision 2021/914) et, le cas échéant, sur l'adhésion du sous-traitant au cadre EU-US Data Privacy Framework (DPF, Décision d'adéquation 2023/1795). " +
    "Vous pouvez demander une copie des garanties en vigueur pour chaque sous-traitant en écrivant à " +
    LEGAL_ENTITY.privacyContactEmail +
    "."
  );
}

// ---------------------------------------------------------------------------
// Sections de la page
// ---------------------------------------------------------------------------

const SECTIONS = [
  {
    icon: Database,
    title: "1. Qui collecte vos données ?",
    content:
      "Tloush est un service en ligne qui aide les francophones en Israël à comprendre leurs documents administratifs en hébreu. Le responsable du traitement des données est l'entité Tloush. Pour toute question relative à vos données personnelles, vous pouvez contacter notre point de contact dédié à la protection des données : " +
      LEGAL_ENTITY.privacyContactEmail +
      ". Pour toute autre question, écrivez à " +
      LEGAL_ENTITY.contactEmail +
      ".",
  },
  {
    icon: Eye,
    title: "2. Quelles données collectons-nous ?",
    content:
      "Nous collectons les données suivantes : votre adresse email (lors de la création de compte), les documents que vous téléversez pour analyse (fiches de paie, courriers administratifs, etc.), les résultats d'analyse générés par l'intelligence artificielle, ainsi que l'historique de vos conversations avec l'assistant. Des données techniques (adresse IP hachée, type de navigateur) peuvent également être collectées à des fins de sécurité et d'amélioration du service. Nous n'utilisons jamais vos données pour entraîner des modèles d'IA.",
  },
  {
    icon: Lock,
    title: "3. Comment vos données sont-elles utilisées ?",
    content:
      "Vos documents sont analysés par une intelligence artificielle (Claude, développé par Anthropic) afin de vous fournir une explication en français. Les résultats sont stockés de manière sécurisée pour que vous puissiez les retrouver. Votre email sert uniquement à l'authentification et à l'envoi de notifications liées au service. Nous n'envoyons jamais de publicité ni ne revendons vos données.",
  },
  {
    icon: Server,
    title: "4. Sous-traitants et services tiers",
    content: renderProcessorsParagraph(),
  },
  {
    icon: Globe,
    title: "5. Transferts hors Union européenne",
    content: renderInternationalTransfersParagraph(),
  },
  {
    icon: ShieldCheck,
    title: "6. Sécurité des données",
    content:
      "Vos documents sont stockés dans un espace privé (bucket privé Supabase Storage) accessible uniquement par vous. L'accès aux données en base est isolé par utilisateur grâce à des règles de sécurité au niveau des lignes (Row Level Security). Toutes les communications sont chiffrées via HTTPS (TLS 1.3). Les secrets applicatifs et les clés d'API sont stockés dans un gestionnaire de secrets et ne sont jamais exposés côté client.",
  },
  {
    icon: Clock,
    title: "7. Durée de conservation",
    content: renderRetentionParagraph(),
  },
  {
    icon: UserX,
    title: "8. Vos droits (RGPD)",
    content:
      "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès à vos données personnelles, droit de rectification, droit à l'effacement (suppression de compte), droit à la portabilité de vos données, droit d'opposition au traitement et droit de retirer votre consentement à tout moment. Vous pouvez exercer ces droits depuis les paramètres de votre compte ou en contactant notre point de contact données : " +
      LEGAL_ENTITY.privacyContactEmail +
      ". Vous avez également le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente (CNIL en France, CNPD au Luxembourg, ILITA en Israël).",
  },
  {
    icon: Cookie,
    title: "9. Cookies et analytics",
    content:
      "Tloush utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification, session). Nous utilisons PostHog pour collecter des statistiques anonymisées d'utilisation (pages visitées, fonctionnalités utilisées) afin d'améliorer le service. Sentry est utilisé pour détecter les erreurs techniques. Aucun cookie publicitaire tiers n'est utilisé. Aucune donnée n'est vendue ou partagée avec des régies publicitaires.",
  },
  {
    icon: Scale,
    title: "10. Cadre juridique applicable",
    content: renderLegalFrameworkParagraph(),
  },
  {
    icon: Mail,
    title: "11. Contact",
    content:
      "Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez notre point de contact dédié : " +
      LEGAL_ENTITY.privacyContactEmail +
      ". Pour les autres questions, écrivez à " +
      LEGAL_ENTITY.contactEmail +
      ". Nous nous engageons à répondre à toute demande relative à vos droits RGPD dans un délai de 30 jours.",
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
            Vos documents sont stockés de manière sécurisée et isolée. Vous
            pouvez supprimer votre compte et toutes vos données à tout moment.
            Nous ne vendons jamais vos données. Aucune publicité tierce.
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
