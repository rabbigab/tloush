/**
 * Predefined workflows for Israeli service automation
 * + Custom task mode for anything not in the list
 */

import type { AgentWorkflow } from './types'

const BASE_SYSTEM_PROMPT = `Tu es l'Agent Tloush. Tu aides les francophones en Israël à naviguer sur les sites web israéliens en hébreu.
Tu utilises un navigateur pour accomplir des tâches administratives à la place de l'utilisateur.
Tu lis l'hébreu parfaitement et tu traduis/expliques tout en français.`

export const WORKFLOWS: AgentWorkflow[] = [
  // ─── Utilities ───
  {
    id: 'iec-bill',
    name_fr: 'Consulter ma facture d\'electricite',
    name_he: 'צפייה בחשבון חשמל',
    description_fr: 'Voir votre dernière facture d\'electricite (IEC) et son montant.',
    icon: '⚡',
    category: 'utilities',
    estimatedMinutes: 3,
    estimatedCost: '~1-2₪',
    requiredInputs: [
      {
        id: 'contract_number', label_fr: 'Numéro de contrat IEC', label_he: 'מספר חוזה',
        type: 'text', placeholder: 'Ex: 1234567', required: false,
        helpText: 'Ce numéro se trouve en haut à droite de votre facture d\'electricite, ou sur le compteur électrique de votre appartement.',
        allowSkip: true,
      },
      {
        id: 'id_number', label_fr: 'Teudat Zehut', label_he: 'תעודת זהות',
        type: 'text', placeholder: '9 chiffres', required: true, sensitive: true,
        helpText: 'Votre numéro d\'identité israelien à 9 chiffres.',
      },
    ],
    startUrl: 'https://www.iec.co.il/',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Consulter la facture d'electricite sur le site de IEC (חברת החשמל).
ÉTAPES :
1. Trouve le bouton de connexion ou l'espace client
2. Si le numéro de contrat n'est pas fourni, essaie de te connecter uniquement avec la TZ
3. Navigue jusqu'à la section des factures
4. Résume la dernière facture en français : montant, date d'échéance, consommation en kWh
5. NE PAIE PAS — consultation uniquement`,
  },
  {
    id: 'water-bill',
    name_fr: 'Consulter ma facture d\'eau',
    name_he: 'צפייה בחשבון מים',
    description_fr: 'Voir votre dernière facture d\'eau et sa consommation.',
    icon: '💧',
    category: 'utilities',
    estimatedMinutes: 3,
    estimatedCost: '~1-2₪',
    requiredInputs: [
      {
        id: 'water_company', label_fr: 'Compagnie d\'eau', label_he: 'תאגיד מים',
        type: 'select', required: true,
        helpText: 'Vous ne savez pas ? Regardez sur votre dernière facture d\'eau ou demandez à votre propriétaire.',
        options: [
          { value: 'mei-avivim', label_fr: 'Mei Avivim (Tel Aviv / Gush Dan)' },
          { value: 'hagihon', label_fr: 'Hagihon (Jerusalem)' },
          { value: 'mei-raanana', label_fr: 'Mei Raanana' },
          { value: 'mei-netanya', label_fr: 'Mei Netanya' },
          { value: 'other', label_fr: 'Autre — je donnerai le nom' },
        ],
      },
      {
        id: 'account_number', label_fr: 'Numéro de compte eau', label_he: 'מספר חשבון',
        type: 'text', required: false,
        helpText: 'Sur votre facture d\'eau, en haut. Si vous ne l\'avez pas, l\'agent essaiera avec votre TZ.',
        allowSkip: true,
      },
      {
        id: 'id_number', label_fr: 'Teudat Zehut', label_he: 'תעודת זהות',
        type: 'text', placeholder: '9 chiffres', required: true, sensitive: true,
      },
    ],
    startUrl: 'https://www.mei-avivim.co.il/',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Consulter la facture d'eau.
ÉTAPES :
1. Connecte-toi à l'espace client de la compagnie d'eau
2. Si le numéro de compte n'est pas fourni, essaie avec la TZ seule
3. Résume la dernière facture en français : montant, période, consommation en m³
4. NE PAIE PAS — consultation uniquement`,
  },

  // ─── Government ───
  {
    id: 'arnona-check',
    name_fr: 'Verifier ma situation Arnona',
    name_he: 'בדיקת מצב ארנונה',
    description_fr: 'Voir si votre taxe municipale (Arnona) est à jour.',
    icon: '🏛️',
    category: 'government',
    estimatedMinutes: 4,
    estimatedCost: '~2-3₪',
    requiredInputs: [
      {
        id: 'city', label_fr: 'Votre ville', label_he: 'עיר',
        type: 'select', required: true,
        options: [
          { value: 'tel-aviv', label_fr: 'Tel Aviv-Yafo' },
          { value: 'jerusalem', label_fr: 'Jerusalem' },
          { value: 'haifa', label_fr: 'Haifa' },
          { value: 'netanya', label_fr: 'Netanya' },
          { value: 'raanana', label_fr: 'Raanana' },
          { value: 'herzliya', label_fr: 'Herzliya' },
          { value: 'ashdod', label_fr: 'Ashdod' },
          { value: 'beer-sheva', label_fr: 'Beer Sheva' },
          { value: 'other', label_fr: 'Autre ville — je préciserai' },
        ],
      },
      {
        id: 'id_number', label_fr: 'Teudat Zehut', label_he: 'תעודת זהות',
        type: 'text', placeholder: '9 chiffres', required: true, sensitive: true,
      },
      {
        id: 'account_number', label_fr: 'Numéro de compte municipal', label_he: 'מספר חשבון',
        type: 'text', required: false,
        helpText: 'Ce numéro est sur votre avis d\'Arnona. Si vous ne l\'avez pas, l\'agent cherchera avec votre TZ.',
        allowSkip: true,
      },
    ],
    startUrl: 'https://www.tel-aviv.gov.il/',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Vérifier la situation Arnona (ארנונה) sur le site de la municipalité.
ÉTAPES :
1. Trouve le portail en ligne de la municipalité
2. Navigue vers la section Arnona / taxes municipales
3. Si pas de numéro de compte, essaie avec la TZ seule
4. Résume en français : montant dû, prochaine échéance, statut
5. Si des réductions sont possibles (oleh hadash, étudiant), mentionne-les
6. NE PAIE PAS — consultation uniquement`,
  },
  {
    id: 'bl-status',
    name_fr: 'Mon statut Bituach Leumi',
    name_he: 'בדיקת מצב ביטוח לאומי',
    description_fr: 'Verifier vos droits et paiements au Bituach Leumi.',
    icon: '🛡️',
    category: 'government',
    estimatedMinutes: 5,
    estimatedCost: '~2-4₪',
    requiredInputs: [
      {
        id: 'id_number', label_fr: 'Teudat Zehut', label_he: 'תעודת זהות',
        type: 'text', placeholder: '9 chiffres', required: true, sensitive: true,
      },
      {
        id: 'birth_date', label_fr: 'Date de naissance', label_he: 'תאריך לידה',
        type: 'date', required: true,
        helpText: 'Utilisée pour la vérification d\'identité sur le site du BL.',
      },
    ],
    startUrl: 'https://www.btl.gov.il/',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Vérifier le statut au Bituach Leumi (ביטוח לאומי).
ÉTAPES :
1. Trouve l'espace personnel (אזור אישי)
2. Connecte-toi avec les identifiants
3. Vérifie les droits ouverts (allocations, assurance)
4. Vérifie s'il y a des paiements en attente
5. Résume tout en français clairement
6. NE MODIFIE RIEN — consultation uniquement`,
  },
  {
    id: 'address-change',
    name_fr: 'Changer mon adresse officielle',
    name_he: 'שינוי כתובת',
    description_fr: 'Déclarer votre nouvelle adresse au Misrad Hapnim via gov.il.',
    icon: '📍',
    category: 'government',
    estimatedMinutes: 8,
    estimatedCost: '~3-5₪',
    requiredInputs: [
      {
        id: 'id_number', label_fr: 'Teudat Zehut', label_he: 'תעודת זהות',
        type: 'text', placeholder: '9 chiffres', required: true, sensitive: true,
      },
      {
        id: 'new_city', label_fr: 'Nouvelle ville (en hébreu)', label_he: 'עיר חדשה',
        type: 'text', placeholder: 'Ex: תל אביב', required: true,
        helpText: 'Ecrivez le nom de la ville en hébreu. Vous pouvez copier-coller depuis Google Maps.',
      },
      {
        id: 'new_street', label_fr: 'Nouvelle rue (en hébreu)', label_he: 'רחוב חדש',
        type: 'text', placeholder: 'Ex: רוטשילד', required: true,
        helpText: 'Le nom de la rue en hébreu. Copiez depuis Google Maps ou votre contrat de location.',
      },
      {
        id: 'new_number', label_fr: 'Numéro de rue', label_he: 'מספר בית',
        type: 'text', required: true,
      },
      {
        id: 'new_apartment', label_fr: 'Numéro d\'appartement', label_he: 'דירה',
        type: 'text', required: false,
      },
      {
        id: 'new_zipcode', label_fr: 'Code postal (Mikoude)', label_he: 'מיקוד',
        type: 'text', required: false,
        helpText: 'Pas obligatoire. Vous pouvez le trouver sur israelpost.co.il',
        allowSkip: true,
      },
    ],
    startUrl: 'https://www.gov.il/he/service/change-address-notification',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Changer l'adresse au Misrad Hapnim via gov.il.
ÉTAPES :
1. Navigue vers le formulaire de changement d'adresse
2. Remplis les informations avec les données de l'utilisateur
3. AVANT DE SOUMETTRE : résume tout en français et utilise [CONFIRMATION]
4. Si identification SMS requise, utilise [CODE_SMS]

IMPORTANT : Ne soumets JAMAIS sans [CONFIRMATION].`,
  },

  // ─── Health ───
  {
    id: 'kupat-holim',
    name_fr: 'Prendre un RDV médical',
    name_he: 'קביעת תור רפואי',
    description_fr: 'Trouver un créneau chez le médecin via votre Kupat Holim.',
    icon: '🏥',
    category: 'health',
    estimatedMinutes: 5,
    estimatedCost: '~2-3₪',
    requiredInputs: [
      {
        id: 'kupat_holim', label_fr: 'Votre caisse maladie', label_he: 'קופת חולים',
        type: 'select', required: true,
        helpText: 'Vous ne savez pas ? Verifiez sur votre carte verte d\'assurance maladie ou votre fiche de paie (ligne "kupat holim").',
        options: [
          { value: 'clalit', label_fr: 'Clalit (כללית) — la plus courante' },
          { value: 'maccabi', label_fr: 'Maccabi (מכבי)' },
          { value: 'meuhedet', label_fr: 'Meuhedet (מאוחדת)' },
          { value: 'leumit', label_fr: 'Leumit (לאומית)' },
        ],
      },
      {
        id: 'id_number', label_fr: 'Teudat Zehut', label_he: 'תעודת זהות',
        type: 'text', placeholder: '9 chiffres', required: true, sensitive: true,
      },
      {
        id: 'doctor_type', label_fr: 'Type de rendez-vous', label_he: 'סוג רופא',
        type: 'select', required: true,
        options: [
          { value: 'family', label_fr: 'Medecin de famille (רופא משפחה)' },
          { value: 'specialist', label_fr: 'Spécialiste (avec ordonnance)' },
          { value: 'dentist', label_fr: 'Dentiste (רופא שיניים)' },
          { value: 'eye', label_fr: 'Ophtalmologue (רופא עיניים)' },
        ],
      },
      {
        id: 'preferred_date', label_fr: 'Date souhaitée (approximative)', label_he: 'תאריך מבוקש',
        type: 'date', required: false,
        helpText: 'L\'agent cherchera le créneau le plus proche de cette date.',
        allowSkip: true,
      },
    ],
    startUrl: 'https://www.clalit.co.il/',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Trouver un rendez-vous médical via le site de la Kupat Holim.
ÉTAPES :
1. Navigue vers la section prise de rendez-vous
2. Connecte-toi avec la TZ
3. Sélectionne le type de médecin
4. Trouve les créneaux disponibles proches de la date souhaitée
5. Présente les 3 meilleurs créneaux en français
6. Utilise [CONFIRMATION] avant de confirmer un RDV

IMPORTANT : Ne confirme JAMAIS un rendez-vous sans [CONFIRMATION].`,
  },

  // ─── Housing ───
  {
    id: 'tabu-check',
    name_fr: 'Extrait Tabu (cadastre)',
    name_he: 'בדיקת נסח טאבו',
    description_fr: 'Consulter le registre foncier pour un bien immobilier.',
    icon: '🏠',
    category: 'housing',
    estimatedMinutes: 5,
    estimatedCost: '~2-3₪',
    requiredInputs: [
      {
        id: 'gush', label_fr: 'Numéro de Gush (bloc)', label_he: 'גוש',
        type: 'text', placeholder: 'Ex: 6158', required: true,
        helpText: 'Le Gush est le numéro de bloc cadastral. Demandez-le à votre agent immobilier ou propriétaire. Il figure aussi sur le contrat de vente/location.',
      },
      {
        id: 'helka', label_fr: 'Numéro de Helka (parcelle)', label_he: 'חלקה',
        type: 'text', placeholder: 'Ex: 23', required: true,
        helpText: 'La Helka est le numéro de parcelle dans le bloc. Même source que le Gush.',
      },
      {
        id: 'tat_helka', label_fr: 'Tat Helka (sous-parcelle)', label_he: 'תת חלקה',
        type: 'text', placeholder: 'Ex: 5', required: false,
        helpText: 'Le numéro d\'appartement dans l\'immeuble. Pas toujours nécessaire.',
        allowSkip: true,
      },
    ],
    startUrl: 'https://www.gov.il/he/service/land-registration-extract',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Obtenir un extrait du registre foncier (נסח טאבו) sur gov.il.
ÉTAPES :
1. Navigue vers le service d'extrait Tabu
2. Saisis les numéros de Gush et Helka
3. Lis et traduis l'extrait en français
4. Résume : propriétaire(s), hypothèques, remarques
5. NE MODIFIE RIEN — consultation uniquement`,
  },
]

/**
 * Custom task workflow — user describes any task in free text
 */
export const CUSTOM_WORKFLOW: AgentWorkflow = {
  id: 'custom',
  name_fr: 'Autre tâche',
  name_he: 'משימה אחרת',
  description_fr: 'Décrivez ce que vous voulez faire sur n\'importe quel site israelien.',
  icon: '✨',
  category: 'government',
  estimatedMinutes: 5,
  estimatedCost: '~2-5₪',
  requiredInputs: [
    {
      id: 'task_description', label_fr: 'Décrivez votre tâche', label_he: 'תיאור המשימה',
      type: 'text', required: true,
      placeholder: 'Ex: Je veux vérifier si j\'ai des amendes de stationnement à Tel Aviv',
      helpText: 'Décrivez en français ce que vous voulez accomplir. L\'agent fera de son mieux.',
    },
    {
      id: 'website_url', label_fr: 'Adresse du site (si vous la connaissez)', label_he: 'כתובת האתר',
      type: 'text', required: false,
      placeholder: 'Ex: https://www.tel-aviv.gov.il',
      helpText: 'Si vous ne connaissez pas l\'adresse exacte, l\'agent la cherchera pour vous.',
      allowSkip: true,
    },
    {
      id: 'id_number', label_fr: 'Teudat Zehut (si nécessaire)', label_he: 'תעודת זהות',
      type: 'text', placeholder: '9 chiffres', required: false, sensitive: true,
      helpText: 'Certains sites demandent votre TZ pour se connecter.',
      allowSkip: true,
    },
  ],
  startUrl: 'https://www.gov.il/he',
  systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE PERSONNALISÉE : L'utilisateur va décrire ce qu'il veut faire.
Tu dois :
1. Comprendre la demande
2. Trouver le bon site si l'URL n'est pas fournie (cherche sur Google si nécessaire)
3. Naviguer et accomplir la tâche
4. Traduire tout en français
5. Utiliser [CONFIRMATION] avant toute soumission de formulaire
6. Utiliser [MOT_DE_PASSE], [CODE_SMS], [CAPTCHA] quand nécessaire`,
}

export function getWorkflow(id: string): AgentWorkflow | undefined {
  if (id === 'custom') return CUSTOM_WORKFLOW
  return WORKFLOWS.find(w => w.id === id)
}

export function getWorkflowsByCategory(category: AgentWorkflow['category']): AgentWorkflow[] {
  return WORKFLOWS.filter(w => w.category === category)
}

export function resolveStartUrl(workflow: AgentWorkflow, userInputs: Record<string, string>): string {
  // Custom workflow: use provided URL or default
  if (workflow.id === 'custom') {
    return userInputs.website_url || workflow.startUrl
  }

  const urls: Record<string, Record<string, string>> = {
    'water-bill': {
      'mei-avivim': 'https://www.mei-avivim.co.il/',
      'hagihon': 'https://www.hagihon.co.il/',
      'mei-raanana': 'https://www.mei-raanana.co.il/',
      'mei-netanya': 'https://www.mei-netanya.co.il/',
    },
    'arnona-check': {
      'tel-aviv': 'https://www.tel-aviv.gov.il/',
      'jerusalem': 'https://www.jerusalem.muni.il/',
      'haifa': 'https://www.haifa.muni.il/',
      'netanya': 'https://www.netanya.muni.il/',
      'raanana': 'https://www.raanana.muni.il/',
      'herzliya': 'https://www.herzliya.muni.il/',
      'ashdod': 'https://www.ashdod.muni.il/',
      'beer-sheva': 'https://www.beer-sheva.muni.il/',
    },
    'kupat-holim': {
      'clalit': 'https://www.clalit.co.il/',
      'maccabi': 'https://www.maccabi4u.co.il/',
      'meuhedet': 'https://www.meuhedet.co.il/',
      'leumit': 'https://www.leumit.co.il/',
    },
  }

  const workflowUrls = urls[workflow.id]
  if (!workflowUrls) return workflow.startUrl

  const inputKey = workflow.id === 'water-bill' ? 'water_company'
    : workflow.id === 'arnona-check' ? 'city'
    : workflow.id === 'kupat-holim' ? 'kupat_holim'
    : ''

  const selectedValue = userInputs[inputKey]
  return (selectedValue && workflowUrls[selectedValue]) || workflow.startUrl
}
