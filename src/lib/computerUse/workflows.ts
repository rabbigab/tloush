/**
 * Predefined workflows for Israeli service automation
 *
 * Each workflow defines:
 * - Target website and start URL
 * - Required user inputs (name, ID, etc.)
 * - System prompt tailored to the specific task
 * - Confirmation requirements for sensitive actions
 */

import type { AgentWorkflow } from './types'

const BASE_SYSTEM_PROMPT = `Tu es un assistant Tloush qui aide les francophones en Israël à naviguer sur les sites web israéliens.
Tu utilises un navigateur pour accomplir des tâches administratives à la place de l'utilisateur.
Tu lis l'hébreu parfaitement et tu traduis/expliques tout en français.`

export const WORKFLOWS: AgentWorkflow[] = [
  // ─── Utilities ───
  {
    id: 'iec-bill',
    name_fr: 'Consulter ma facture d\'électricité',
    name_he: 'צפייה בחשבון חשמל',
    description_fr: 'Se connecter au site de la compagnie d\'électricité (IEC) et consulter la dernière facture.',
    icon: '⚡',
    category: 'utilities',
    estimatedMinutes: 3,
    estimatedCost: '~1-2₪',
    requiredInputs: [
      { id: 'contract_number', label_fr: 'Numéro de contrat IEC', label_he: 'מספר חוזה', type: 'text', placeholder: 'Ex: 1234567', required: true },
      { id: 'id_number', label_fr: 'Numéro de Teudat Zehut', label_he: 'תעודת זהות', type: 'text', placeholder: 'Ex: 123456789', required: true, sensitive: true },
    ],
    startUrl: 'https://www.iec.co.il/',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Consulter la facture d'électricité sur le site de IEC (חברת החשמל).
ÉTAPES :
1. Trouve le bouton de connexion ou l'espace client
2. Saisis les identifiants de l'utilisateur (numéro de contrat + TZ)
3. Navigue jusqu'à la section des factures
4. Lis et résume la dernière facture en français (montant, date, consommation)
5. NE PAIE PAS — consulte uniquement`,
    // User handles all auth via hybrid model
  },
  {
    id: 'water-bill',
    name_fr: 'Consulter ma facture d\'eau',
    name_he: 'צפייה בחשבון מים',
    description_fr: 'Se connecter au site de la compagnie d\'eau locale et consulter la dernière facture.',
    icon: '💧',
    category: 'utilities',
    estimatedMinutes: 3,
    estimatedCost: '~1-2₪',
    requiredInputs: [
      { id: 'water_company', label_fr: 'Compagnie d\'eau', label_he: 'תאגיד מים', type: 'select', required: true, options: [
        { value: 'mei-avivim', label_fr: 'Mei Avivim (Tel Aviv)' },
        { value: 'hagihon', label_fr: 'Hagihon (Jérusalem)' },
        { value: 'mei-raanana', label_fr: 'Mei Raanana' },
        { value: 'mei-netanya', label_fr: 'Mei Netanya' },
        { value: 'other', label_fr: 'Autre' },
      ]},
      { id: 'account_number', label_fr: 'Numéro de compte', label_he: 'מספר חשבון', type: 'text', required: true },
      { id: 'id_number', label_fr: 'Numéro de Teudat Zehut', label_he: 'תעודת זהות', type: 'text', required: true, sensitive: true },
    ],
    startUrl: 'https://www.mei-avivim.co.il/',  // Default, will be adjusted based on selection
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Consulter la facture d'eau.
ÉTAPES :
1. Connecte-toi à l'espace client de la compagnie d'eau
2. Saisis les identifiants de l'utilisateur
3. Trouve la section factures/paiements
4. Résume la dernière facture en français (montant, période, consommation en m³)
5. NE PAIE PAS — consulte uniquement`,
    // User handles all auth via hybrid model
  },

  // ─── Government ───
  {
    id: 'arnona-check',
    name_fr: 'Vérifier ma situation Arnona',
    name_he: 'בדיקת מצב ארנונה',
    description_fr: 'Consulter le site de la municipalité pour vérifier le statut du paiement de l\'Arnona (taxe municipale).',
    icon: '🏛️',
    category: 'government',
    estimatedMinutes: 4,
    estimatedCost: '~2-3₪',
    requiredInputs: [
      { id: 'city', label_fr: 'Ville', label_he: 'עיר', type: 'select', required: true, options: [
        { value: 'tel-aviv', label_fr: 'Tel Aviv' },
        { value: 'jerusalem', label_fr: 'Jérusalem' },
        { value: 'haifa', label_fr: 'Haïfa' },
        { value: 'netanya', label_fr: 'Netanya' },
        { value: 'raanana', label_fr: 'Raanana' },
        { value: 'herzliya', label_fr: 'Herzliya' },
        { value: 'ashdod', label_fr: 'Ashdod' },
        { value: 'beer-sheva', label_fr: 'Beer Sheva' },
      ]},
      { id: 'id_number', label_fr: 'Numéro de Teudat Zehut', label_he: 'תעודת זהות', type: 'text', required: true, sensitive: true },
      { id: 'account_number', label_fr: 'Numéro de compte municipal', label_he: 'מספר חשבון', type: 'text', placeholder: 'Si disponible', required: false },
    ],
    startUrl: 'https://www.tel-aviv.gov.il/',  // Adjusted per city
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Vérifier la situation Arnona (ארנונה) sur le site de la municipalité.
ÉTAPES :
1. Trouve le portail en ligne de la municipalité
2. Navigue vers la section Arnona / taxes municipales
3. Connecte-toi avec les identifiants fournis
4. Résume en français : montant dû, prochaine échéance, statut des paiements
5. Si des réductions sont possibles (oleh hadash, étudiant, etc.), mentionne-les
6. NE PAIE PAS — consulte uniquement`,
    // User handles all auth via hybrid model
  },
  {
    id: 'bl-status',
    name_fr: 'Vérifier mon statut Bituach Leumi',
    name_he: 'בדיקת מצב ביטוח לאומי',
    description_fr: 'Consulter le site du Bituach Leumi pour vérifier ses droits et paiements.',
    icon: '🛡️',
    category: 'government',
    estimatedMinutes: 5,
    estimatedCost: '~2-4₪',
    requiredInputs: [
      { id: 'id_number', label_fr: 'Numéro de Teudat Zehut', label_he: 'תעודת זהות', type: 'text', required: true, sensitive: true },
      { id: 'birth_date', label_fr: 'Date de naissance', label_he: 'תאריך לידה', type: 'date', required: true },
    ],
    startUrl: 'https://www.btl.gov.il/',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Vérifier le statut au Bituach Leumi (ביטוח לאומי / National Insurance).
ÉTAPES :
1. Trouve l'espace personnel (אזור אישי)
2. Connecte-toi avec les identifiants
3. Vérifie les droits ouverts (allocations, assurance)
4. Vérifie s'il y a des paiements en attente ou des dettes
5. Résume tout en français clairement
6. NE MODIFIE RIEN — consulte uniquement`,
    // User handles all auth via hybrid model
  },
  {
    id: 'address-change',
    name_fr: 'Changer mon adresse (Misrad Hapnim)',
    name_he: 'שינוי כתובת',
    description_fr: 'Initier un changement d\'adresse auprès du ministère de l\'Intérieur via le site gov.il.',
    icon: '📍',
    category: 'government',
    estimatedMinutes: 8,
    estimatedCost: '~3-5₪',
    requiredInputs: [
      { id: 'id_number', label_fr: 'Numéro de Teudat Zehut', label_he: 'תעודת זהות', type: 'text', required: true, sensitive: true },
      { id: 'new_city', label_fr: 'Nouvelle ville', label_he: 'עיר חדשה', type: 'text', placeholder: 'Ex: תל אביב', required: true },
      { id: 'new_street', label_fr: 'Nouvelle rue', label_he: 'רחוב חדש', type: 'text', placeholder: 'Ex: רוטשילד', required: true },
      { id: 'new_number', label_fr: 'Numéro', label_he: 'מספר בית', type: 'text', required: true },
      { id: 'new_apartment', label_fr: 'Appartement', label_he: 'דירה', type: 'text', required: false },
      { id: 'new_zipcode', label_fr: 'Code postal', label_he: 'מיקוד', type: 'text', required: false },
    ],
    startUrl: 'https://www.gov.il/he/service/change-address-notification',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Changer l'adresse au Misrad Hapnim (משרד הפנים) via gov.il.
ÉTAPES :
1. Navigue vers le formulaire de changement d'adresse
2. Identifie les champs requis
3. Remplis les informations avec les données de l'utilisateur
4. AVANT DE SOUMETTRE : résume toutes les informations saisies et ATTENDS la confirmation
5. Si une identification supplémentaire est requise (SMS, etc.), indique-le à l'utilisateur

IMPORTANT : Ne soumets JAMAIS le formulaire sans confirmation explicite de l'utilisateur.`,
    // User handles all auth via hybrid model
  },

  // ─── Health ───
  {
    id: 'kupat-holim',
    name_fr: 'Prendre un rendez-vous médical',
    name_he: 'קביעת תור רפואי',
    description_fr: 'Prendre un rendez-vous chez un médecin via le site de la Kupat Holim.',
    icon: '🏥',
    category: 'health',
    estimatedMinutes: 5,
    estimatedCost: '~2-3₪',
    requiredInputs: [
      { id: 'kupat_holim', label_fr: 'Caisse maladie', label_he: 'קופת חולים', type: 'select', required: true, options: [
        { value: 'clalit', label_fr: 'Clalit (כללית)' },
        { value: 'maccabi', label_fr: 'Maccabi (מכבי)' },
        { value: 'meuhedet', label_fr: 'Meuhedet (מאוחדת)' },
        { value: 'leumit', label_fr: 'Leumit (לאומית)' },
      ]},
      { id: 'id_number', label_fr: 'Numéro de Teudat Zehut', label_he: 'תעודת זהות', type: 'text', required: true, sensitive: true },
      { id: 'doctor_type', label_fr: 'Type de médecin', label_he: 'סוג רופא', type: 'select', required: true, options: [
        { value: 'family', label_fr: 'Médecin de famille (רופא משפחה)' },
        { value: 'specialist', label_fr: 'Spécialiste' },
        { value: 'dentist', label_fr: 'Dentiste (רופא שיניים)' },
        { value: 'eye', label_fr: 'Ophtalmologue (רופא עיניים)' },
      ]},
      { id: 'preferred_date', label_fr: 'Date souhaitée', label_he: 'תאריך מבוקש', type: 'date', required: false },
    ],
    startUrl: 'https://www.clalit.co.il/',  // Adjusted per selection
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Prendre un rendez-vous médical via le site de la Kupat Holim.
ÉTAPES :
1. Navigue vers la section prise de rendez-vous
2. Connecte-toi avec la TZ de l'utilisateur
3. Sélectionne le type de médecin demandé
4. Trouve les créneaux disponibles proches de la date souhaitée
5. AVANT DE CONFIRMER : présente les options disponibles en français
6. Attends que l'utilisateur choisisse un créneau

IMPORTANT : Ne confirme JAMAIS un rendez-vous sans l'accord de l'utilisateur.`,
    // User handles all auth via hybrid model
  },

  // ─── Housing ───
  {
    id: 'tabu-check',
    name_fr: 'Vérifier un extrait Tabu (cadastre)',
    name_he: 'בדיקת נסח טאבו',
    description_fr: 'Consulter le registre foncier (Tabu) pour obtenir un extrait sur un bien immobilier.',
    icon: '🏠',
    category: 'housing',
    estimatedMinutes: 5,
    estimatedCost: '~2-3₪',
    requiredInputs: [
      { id: 'gush', label_fr: 'Numéro de Gush (bloc)', label_he: 'גוש', type: 'text', placeholder: 'Ex: 6158', required: true },
      { id: 'helka', label_fr: 'Numéro de Helka (parcelle)', label_he: 'חלקה', type: 'text', placeholder: 'Ex: 23', required: true },
      { id: 'tat_helka', label_fr: 'Tat Helka (sous-parcelle)', label_he: 'תת חלקה', type: 'text', placeholder: 'Ex: 5', required: false },
    ],
    startUrl: 'https://www.gov.il/he/service/land-registration-extract',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

TÂCHE : Obtenir un extrait du registre foncier (נסח טאבו) sur gov.il.
ÉTAPES :
1. Navigue vers le service d'extrait Tabu
2. Saisis les numéros de Gush et Helka
3. Lis et traduis l'extrait en français
4. Résume les informations clés : propriétaire(s), hypothèques, remarques
5. NE MODIFIE RIEN — consultation uniquement`,
    // User handles all auth via hybrid model
  },
]

/**
 * Get a workflow by ID
 */
export function getWorkflow(id: string): AgentWorkflow | undefined {
  return WORKFLOWS.find(w => w.id === id)
}

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(category: AgentWorkflow['category']): AgentWorkflow[] {
  return WORKFLOWS.filter(w => w.category === category)
}

/**
 * Adjust the start URL based on user inputs (e.g., different water companies, cities)
 */
export function resolveStartUrl(workflow: AgentWorkflow, userInputs: Record<string, string>): string {
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

  // Find the relevant input key
  const inputKey = workflow.id === 'water-bill' ? 'water_company'
    : workflow.id === 'arnona-check' ? 'city'
    : workflow.id === 'kupat-holim' ? 'kupat_holim'
    : ''

  const selectedValue = userInputs[inputKey]
  return (selectedValue && workflowUrls[selectedValue]) || workflow.startUrl
}
