// src/data/templates.ts

export type TemplateCategory = "salaire" | "licenciement" | "documents" | "heures-sup";

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "textarea";
  required: boolean;
  placeholder?: string;
}

export interface LetterTemplate {
  slug: string;
  title: string;
  description: string;
  category: TemplateCategory;
  emoji: string;
  fields: TemplateField[];
  templateFR: string;
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  salaire: "Salaire",
  licenciement: "Licenciement",
  documents: "Documents RH",
  "heures-sup": "Heures supplémentaires",
};

export const templates: LetterTemplate[] = [
  {
    slug: "reclamation-salaire",
    title: "Réclamation de salaire",
    description: "Déclaration formelle pour réclamer un salaire incomplet ou non versé.",
    category: "salaire",
    emoji: "💰",
    fields: [
      { key: "senderName", label: "Votre nom complet", type: "text", required: true, placeholder: "Prénom Nom" },
      { key: "senderAddress", label: "Votre adresse", type: "text", required: true, placeholder: "Rue, Ville" },
      { key: "employerName", label: "Nom de l'employeur / entreprise", type: "text", required: true, placeholder: "Nom de la société" },
      { key: "period", label: "Période concernée", type: "text", required: true, placeholder: "Ex : mars 2024" },
      { key: "amount", label: "Montant manquant (₪)", type: "number", required: true, placeholder: "Ex : 1500" },
      { key: "details", label: "Détails de la réclamation", type: "textarea", required: true, placeholder: "Décrivez ce qui manque sur votre salaire..." },
    ],
    templateFR: `{{senderName}}
{{senderAddress}}

À l'attention de la direction des ressources humaines
{{employerName}}

Objet : Réclamation concernant le versement du salaire — {{period}}

Madame, Monsieur,

Je me permets de vous contacter au sujet de mon salaire du mois de {{period}}, qui présente une anomalie que je souhaite porter à votre attention.

En effet, j'ai constaté un manque de {{amount}} ₪ sur mon bulletin de salaire de la période concernée.

Détail de la réclamation :
{{details}}

Je vous demande de bien vouloir procéder au versement de la somme de {{amount}} ₪ dans les meilleurs délais et au plus tard dans les 14 jours suivant la réception de ce courrier.

Sans réponse de votre part dans ce délai, je me verrai dans l'obligation de saisir les autorités compétentes.

Dans l'attente de votre retour, je reste à votre disposition pour tout éclaircissement.

Cordialement,
{{senderName}}`,
  },
  {
    slug: "mise-en-demeure-heures-sup",
    title: "Mise en demeure — Heures supplémentaires",
    description: "Lettre formelle pour réclamer le paiement d'heures supplémentaires non rémunérées.",
    category: "heures-sup",
    emoji: "⏰",
    fields: [
      { key: "senderName", label: "Votre nom complet", type: "text", required: true, placeholder: "Prénom Nom" },
      { key: "employerName", label: "Nom de l'employeur", type: "text", required: true, placeholder: "Nom de la société" },
      { key: "period", label: "Période concernée", type: "text", required: true, placeholder: "Ex : janvier à mars 2024" },
      { key: "hoursCount", label: "Nombre d'heures non payées", type: "number", required: true, placeholder: "Ex : 24" },
      { key: "amount", label: "Montant estimé (₪)", type: "number", required: true, placeholder: "Ex : 2400" },
    ],
    templateFR: `{{senderName}}

À l'attention de la direction des ressources humaines
{{employerName}}

Objet : Mise en demeure — Paiement des heures supplémentaires

Madame, Monsieur,

Par la présente, je vous mets en demeure de procéder au paiement de mes heures supplémentaires non rémunérées.

Durant la période {{period}}, j'ai effectué {{hoursCount}} heures supplémentaires qui n'ont pas été incluses dans mes bulletins de salaire, en violation de la Loi sur les heures de travail et de repos israélienne.

Le montant total dû s'élève à {{amount}} ₪, calculé selon les taux légaux (125 % pour les 2 premières heures quotidiennes, 150 % au-delà).

Je vous demande de régulariser cette situation dans un délai de 14 jours. Passé ce délai, je me réserve le droit de saisir l'Inspection du Travail (מפקח עבודה) et d'engager une procédure judiciaire.

Cordialement,
{{senderName}}`,
  },
  {
    slug: "demande-documents-rh",
    title: "Demande de documents RH",
    description: "Pour obtenir une fiche de paie manquante, une attestation ou tout document de votre employeur.",
    category: "documents",
    emoji: "📁",
    fields: [
      { key: "senderName", label: "Votre nom complet", type: "text", required: true, placeholder: "Prénom Nom" },
      { key: "employerName", label: "Nom de l'employeur", type: "text", required: true, placeholder: "Nom de la société" },
      { key: "documentType", label: "Type de document demandé", type: "text", required: true, placeholder: "Ex : fiche de paie de janvier 2024, attestation d'emploi..." },
      { key: "period", label: "Période concernée", type: "text", required: false, placeholder: "Ex : janvier 2024" },
    ],
    templateFR: `{{senderName}}

À l'attention du service des ressources humaines
{{employerName}}

Objet : Demande de document — {{documentType}}

Madame, Monsieur,

Je me permets de vous contacter afin de vous demander la transmission du document suivant :

Document demandé : {{documentType}}
Période concernée : {{period}}

Conformément à la législation israélienne du travail, l'employeur est tenu de fournir ce type de document sur demande du salarié.

Je vous serais reconnaissant(e) de bien vouloir me transmettre ce document dans un délai de 7 jours ouvrables.

Cordialement,
{{senderName}}`,
  },
  {
    slug: "contestation-licenciement",
    title: "Contestation de licenciement",
    description: "Lettre pour contester un licenciement abusif ou dont les conditions ne sont pas respectées.",
    category: "licenciement",
    emoji: "⚖️",
    fields: [
      { key: "senderName", label: "Votre nom complet", type: "text", required: true, placeholder: "Prénom Nom" },
      { key: "employerName", label: "Nom de l'employeur", type: "text", required: true, placeholder: "Nom de la société" },
      { key: "dismissalDate", label: "Date de notification du licenciement", type: "date", required: true },
      { key: "grounds", label: "Motifs invoqués par l'employeur", type: "text", required: true, placeholder: "Ex : réduction d'effectifs, faute professionnelle..." },
      { key: "contestReason", label: "Raisons de votre contestation", type: "textarea", required: true, placeholder: "Décrivez pourquoi vous contestez ce licenciement..." },
    ],
    templateFR: `{{senderName}}

À l'attention de la direction
{{employerName}}

Objet : Contestation du licenciement notifié le {{dismissalDate}}

Madame, Monsieur,

Par la présente, je conteste formellement la décision de licenciement qui m'a été notifiée le {{dismissalDate}}, dont le motif indiqué est : {{grounds}}.

Je considère ce licenciement comme abusif ou irrégulier pour les raisons suivantes :

{{contestReason}}

Je vous demande de :
1. Reconsidérer cette décision dans un délai de 7 jours
2. M'informer par écrit des motifs détaillés justifiant cette mesure
3. M'assurer du versement intégral de toutes les sommes dues (Pitzuim, préavis, congés non pris)

Sans réponse satisfaisante, je me réserve le droit de saisir le Tribunal du Travail (Beit Din La'avoda).

Cordialement,
{{senderName}}`,
  },
];
