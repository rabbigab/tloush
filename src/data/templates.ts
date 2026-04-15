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

const COMMON_SENDER_FIELDS: TemplateField[] = [
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
];

export const templates: LetterTemplate[] = [
  {
    slug: "reclamation-salaire",
    title: "Réclamation de salaire",
    description:
      "Déclaration formelle pour réclamer un salaire incomplet ou non versé.",
    category: "salaire",
    emoji: "💰",
    fields: [
      ...COMMON_SENDER_FIELDS,
      {
        key: "period",
        label: "Période concernée",
        type: "text",
        required: true,
        placeholder: "Ex : mars 2026",
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

Sans réponse de votre part dans ce délai, je me verrai dans l'obligation de saisir les autorités compétentes (Misrad HaAvoda — Ministère du Travail).

Dans l'attente de votre retour, je reste à votre disposition pour tout éclaircissement.

Cordialement,
{{senderName}}`,
  },

  {
    slug: "lettre-demission",
    title: "Lettre de démission",
    description:
      "Démission formelle avec préavis conforme à la Loi sur le préavis 2001.",
    category: "licenciement",
    emoji: "✉️",
    fields: [
      ...COMMON_SENDER_FIELDS,
      {
        key: "noticeDate",
        label: "Date de notification (aujourd'hui)",
        type: "date",
        required: true,
      },
      {
        key: "lastDay",
        label: "Dernier jour de travail souhaité",
        type: "date",
        required: true,
      },
      {
        key: "reason",
        label: "Motif (optionnel, non obligatoire légalement)",
        type: "textarea",
        required: false,
        placeholder: "Nouvelle opportunité, projet personnel...",
      },
    ],
    templateFR: `{{senderName}}
{{senderAddress}}

{{noticeDate}}

À l'attention de la direction
{{employerName}}

Objet : Notification de démission

Madame, Monsieur,

Par la présente, je vous informe de ma décision de démissionner de mon poste au sein de votre entreprise.

Conformément à la Loi sur le préavis de licenciement et de démission (חוק הודעה מוקדמת לפיטורים ולהתפטרות, 2001), je respecterai le préavis légal correspondant à mon ancienneté. Mon dernier jour de travail sera le {{lastDay}}.

{{reason}}

Je m'engage à assurer une transition ordonnée de mes dossiers en cours durant la période de préavis et à former, le cas échéant, la personne qui me remplacera.

Je vous prie de bien vouloir me confirmer par écrit la bonne réception de la présente et m'établir, à la fin du préavis, un solde de tout compte incluant mon salaire, mes congés payés non pris, la 13ème mois prorata si applicable, ainsi qu'un certificat de travail (אישור העסקה).

Je vous remercie pour la collaboration passée et reste à votre disposition.

Cordialement,
{{senderName}}`,
  },

  {
    slug: "heures-supplementaires",
    title: "Réclamation heures supplémentaires",
    description:
      "Lettre pour réclamer le paiement d'heures supplémentaires non rémunérées.",
    category: "heures-sup",
    emoji: "⏰",
    fields: [
      ...COMMON_SENDER_FIELDS,
      {
        key: "period",
        label: "Période concernée",
        type: "text",
        required: true,
        placeholder: "Ex : janvier à mars 2026",
      },
      {
        key: "hoursCount",
        label: "Nombre d'heures supplémentaires estimées",
        type: "number",
        required: true,
        placeholder: "Ex : 40",
      },
      {
        key: "details",
        label: "Détail des heures (jours, horaires)",
        type: "textarea",
        required: true,
        placeholder: "Préciser les journées et les horaires...",
      },
    ],
    templateFR: `{{senderName}}
{{senderAddress}}

À l'attention de la direction des ressources humaines
{{employerName}}

Objet : Demande de paiement des heures supplémentaires — {{period}}

Madame, Monsieur,

Je me permets de vous contacter concernant le paiement de mes heures supplémentaires réalisées durant la période {{period}}, qui n'apparaissent pas correctement rémunérées sur mes bulletins de salaire.

Selon mes décomptes, j'ai effectué environ {{hoursCount}} heures supplémentaires au-delà de la durée légale du travail.

Détail : {{details}}

Conformément à la Loi sur les heures de travail et de repos (חוק שעות עבודה ומנוחה, 1951) et à ses articles 16-17, ces heures doivent être rémunérées à :
  • 125% du taux horaire pour les 2 premières heures supplémentaires
  • 150% du taux horaire au-delà des 2 premières

Je vous demande donc de bien vouloir procéder au recalcul et au versement des sommes correspondantes dans les 14 jours suivant la réception de la présente.

Je reste à votre disposition pour fournir tout justificatif et pour tout échange.

Cordialement,
{{senderName}}`,
  },

  {
    slug: "certificat-travail",
    title: "Demande de certificat de travail",
    description:
      "Demande formelle de délivrance du certificat de travail (אישור העסקה).",
    category: "documents",
    emoji: "📄",
    fields: [
      ...COMMON_SENDER_FIELDS,
      {
        key: "startDate",
        label: "Date de début chez l'employeur",
        type: "date",
        required: true,
      },
      {
        key: "endDate",
        label: "Date de fin (si applicable)",
        type: "date",
        required: false,
      },
    ],
    templateFR: `{{senderName}}
{{senderAddress}}

À l'attention de la direction des ressources humaines
{{employerName}}

Objet : Demande de certificat de travail (אישור העסקה)

Madame, Monsieur,

Employé(e) au sein de votre entreprise depuis le {{startDate}}{{endDate}}, je sollicite par la présente la délivrance de mon certificat de travail (אישור העסקה).

Conformément à la Loi sur la notification à l'employé (חוק הודעה לעובד ולמועמד לעבודה, 2002), l'employeur est tenu de remettre à l'employé, sur simple demande, un document attestant :
  • Les dates de début et de fin de la relation de travail
  • Le poste occupé
  • Le type de contrat

Je vous remercie de bien vouloir me faire parvenir ce document par email ou par courrier dans les meilleurs délais, et au plus tard dans les 14 jours suivant la réception de la présente.

Je reste à votre disposition pour toute information complémentaire.

Cordialement,
{{senderName}}`,
  },

  {
    slug: "recours-bituach-leumi",
    title: "Recours Bituach Leumi",
    description:
      "Modèle de lettre de contestation d'une décision du Bituach Leumi.",
    category: "documents",
    emoji: "⚖️",
    fields: [
      {
        key: "senderName",
        label: "Votre nom complet",
        type: "text",
        required: true,
      },
      {
        key: "senderAddress",
        label: "Votre adresse",
        type: "text",
        required: true,
      },
      {
        key: "teudatZehut",
        label: "Numéro Teudat Zehut",
        type: "text",
        required: true,
        placeholder: "9 chiffres",
      },
      {
        key: "decisionDate",
        label: "Date de la décision contestée",
        type: "date",
        required: true,
      },
      {
        key: "fileNumber",
        label: "Numéro de dossier (si connu)",
        type: "text",
        required: false,
      },
      {
        key: "reason",
        label: "Motif du recours",
        type: "textarea",
        required: true,
        placeholder: "Expliquez pourquoi vous contestez la décision...",
      },
    ],
    templateFR: `{{senderName}}
{{senderAddress}}
Teudat Zehut : {{teudatZehut}}

À l'attention du Service des Recours
המוסד לביטוח לאומי (Bituach Leumi)

Objet : Recours contre la décision du {{decisionDate}}{{fileNumber}}

Madame, Monsieur,

Je soussigné(e) {{senderName}}, titulaire de la Teudat Zehut {{teudatZehut}}, conteste par la présente la décision rendue le {{decisionDate}} par vos services.

Motif du recours : {{reason}}

Conformément à la Loi sur l'assurance nationale (חוק הביטוח הלאומי, 1995) article 396 et suivants, je sollicite le réexamen de ma situation par la commission compétente.

Je joins à ce courrier tous les justificatifs à l'appui de ma demande et me tiens à votre disposition pour fournir toute information complémentaire.

Je vous remercie de bien vouloir m'accuser réception de la présente et m'informer des suites données à mon recours dans les délais légaux.

Cordialement,
{{senderName}}`,
  },
];
