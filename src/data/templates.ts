// src/data/templates.ts

export type TemplateCategory =
  | "salaire"
  | "licenciement"
  | "documents"
  | "heures-sup";

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
    description:
      "Déclaration formelle pour réclamer un salaire incomplet ou non versé.",
    category: "salaire",
    emoji: "💰",
    fields: [
      {
        key: "senderName",
        label: "Votre nom complet",
        type: "text",
        required: true,
        placeholder: "Prénom Nom",
      },
      {
        key: "senderAddress",
        label: "Votre adresse",
        type: "text",
        required: true,
        placeholder: "Rue, Ville",
      },
      {
        key: "employerName",
        label: "Nom de l'employeur / entreprise",
        type: "text",
        required: true,
        placeholder: "Nom de la société",
      },
      {
        key: "period",
        label: "Période concernée",
        type: "text",
        required: true,
        placeholder: "Ex : mars 2024",
      },
      {
        key: "amount",
        label: "Montant manquant (₪)",
        type: "number",
        required: true,
        placeholder: "Ex : 1500",
      },
      {
        key: "details",
        label: "Détails de la réclamation",
        type: "textarea",
        required: true,
        placeholder: "Décrivez ce qui manque sur votre salaire...",
      },
    ],
    templateFR: `{{senderName}}
{{senderAddress}}

À l'attention de la direction des ressources humaines
{{employerName}}

Objet : Réclamation concernant le versement du salaire — {{period}}

Madame, Monsieur,

Je me permets de vous contacter au sujet de mon salaire du mois de {{period}}, qui présente une anomalie que je souhaite porter à votre attention.

En effet, j'ai constaté un manque de {{amount}} ₪ sur mon bulletin de salaire de la période concernée.

Détail de la réclamation : {{details}}

Je vous demande de bien vouloir procéder au versement de la somme de {{amount}} ₪ dans les meilleurs délais et au plus tard dans les 14 jours suivant la réception de ce courrier.

Sans réponse de votre part dans ce délai, je me verrai dans l'obligation de saisir les autorités compétentes.

Dans l'attente de votre retour, je reste à votre disposition pour tout éclaircissement.

Cordialement,
{{senderName}}`,
  },
];
