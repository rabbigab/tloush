/**
 * Source de verite unique pour les informations legales de Tloush.
 *
 * Cree en reponse au finding #10 du docs/audits/technical-mapping.md :
 * les 3 pages legales (CGV, Privacy, Mentions legales) divergeaient
 * sur le cadre juridique, l'hebergement et les processors.
 *
 * Les constantes de CE fichier doivent etre importees par :
 *  - src/app/cgv/page.tsx
 *  - src/app/privacy/page.tsx
 *  - src/app/mentions-legales/page.tsx
 *
 * IMPORTANT : les champs de LEGAL_ENTITY marques `__TODO__` attendent
 * les informations reelles de l'entite Tloush (raison sociale, numero
 * d'enregistrement ח״פ ou ע״מ, adresse du siege, representant legal,
 * statut TVA Ma'am israelienne). Tant qu'ils ne sont pas fournis, les
 * placeholders restent visibles dans /mentions-legales et /cgv.
 *
 * Findings couverts : #6, #7, #9, #10 du technical-mapping.
 */

// =====================================================
// Entite editrice
// =====================================================

export interface LegalEntityInfo {
  /** Raison sociale complete de l'entite (ex. "Tloush Ltd") */
  legalName: string
  /** Forme juridique (ex. "Chevra Be'Eravon Mugbal / Limited company") */
  legalForm: string
  /** Numero d'enregistrement israelien (ח״פ pour LTD, ע״מ pour osek murshe) */
  registrationNumber: string
  /** Adresse postale du siege social */
  address: string
  /** Directeur de publication / representant legal */
  representative: string
  /** Email de contact legal principal */
  contactEmail: string
  /** Email DPO / point de contact donnees personnelles */
  privacyContactEmail: string
  /** L'entite est-elle assujettie a la TVA israelienne (Ma'am) ? */
  vatRegistered: boolean
  /** Taux de TVA applicable (2026 = 17 %) */
  vatRate: number
}

export const LEGAL_ENTITY: LegalEntityInfo = {
  // __TODO__ : remplir avec les donnees reelles fournies par l'utilisateur.
  // Jusqu'a la mise a jour, les pages /cgv et /mentions-legales affichent
  // ces placeholders. Le build n'echoue pas, mais l'audit RGPD / legal
  // doit signaler ces champs comme non-conformes.
  legalName: '__TODO_LEGAL_NAME__',
  legalForm: '__TODO_LEGAL_FORM__',
  registrationNumber: '__TODO_REGISTRATION_NUMBER__',
  address: '__TODO_ADDRESS__',
  representative: '__TODO_REPRESENTATIVE__',
  contactEmail: 'contact@tloush.com',
  privacyContactEmail: 'privacy@tloush.com',
  vatRegistered: true,
  vatRate: 17,
}

/**
 * Renvoie `true` si l'entite legale a ete remplie (plus de placeholders).
 * Utilisable cote page legale pour afficher un badge "en cours de mise a jour".
 */
export function isLegalEntityConfigured(): boolean {
  return !LEGAL_ENTITY.legalName.startsWith('__TODO_')
}

// =====================================================
// Droit applicable
// =====================================================

export const APPLICABLE_LAWS = {
  /** Droit principal applicable au contrat (cite dans article 14 des CGV) */
  primary: 'israelien' as const,
  /** Le RGPD s'applique aussi (residents UE ou donnees transitant via UE) */
  gdprApplies: true,
  /** Loi israelienne sur la protection de la vie privee (חוק הגנת הפרטיות 1981) */
  israeliPrivacyLaw: true,
  /** Framework EU-US DPF pour transferts vers Vercel/Anthropic (US) */
  dpfFramework: true,
}

// =====================================================
// Sous-traitants et processors
// =====================================================

export type ProcessorCountry = 'IL' | 'IE' | 'US' | 'FR' | 'DE'

export interface DataProcessor {
  name: string
  purpose: string
  country: ProcessorCountry
  /** URL des clauses contractuelles types ou de la DPA */
  dpaUrl?: string
  /** Transfert hors UE couvert par SCC (Standard Contractual Clauses) */
  covered_by_scc?: boolean
  /** Adhesion au DPF EU-US Data Privacy Framework */
  dpf_certified?: boolean
}

export const DATA_PROCESSORS: DataProcessor[] = [
  {
    name: 'Supabase',
    purpose: 'Base de donnees, auth, storage (documents utilisateurs)',
    country: 'IE',
    dpaUrl: 'https://supabase.com/legal/dpa',
    covered_by_scc: true,
  },
  {
    name: 'Vercel',
    purpose: 'Hebergement applicatif (Next.js, edge functions)',
    country: 'US',
    dpaUrl: 'https://vercel.com/legal/dpa',
    covered_by_scc: true,
    dpf_certified: true,
  },
  {
    name: 'Anthropic (Claude API)',
    purpose: 'Analyse IA des documents televerses',
    country: 'US',
    dpaUrl: 'https://www.anthropic.com/legal/dpa',
    covered_by_scc: true,
    dpf_certified: true,
  },
  {
    name: 'Resend',
    purpose: 'Envoi d\'emails transactionnels (verification, rappels)',
    country: 'US',
    dpaUrl: 'https://resend.com/legal/dpa',
    covered_by_scc: true,
  },
  {
    name: 'Stripe',
    purpose: 'Traitement des paiements des abonnements',
    country: 'US',
    dpaUrl: 'https://stripe.com/legal/dpa',
    covered_by_scc: true,
    dpf_certified: true,
  },
  {
    name: 'PostHog',
    purpose: 'Analytics produit (comportement, pas de publicite)',
    country: 'US',
    dpaUrl: 'https://posthog.com/dpa',
    covered_by_scc: true,
  },
  {
    name: 'Sentry',
    purpose: 'Monitoring des erreurs applicatives',
    country: 'US',
    dpaUrl: 'https://sentry.io/legal/dpa',
    covered_by_scc: true,
  },
]

// =====================================================
// Durees de conservation
// =====================================================

export interface RetentionPolicy {
  /** Description courte, rendue a l'utilisateur */
  label: string
  /** Duree en jours (valeur numerique utilisable cote cron job de purge) */
  days: number
  /** Base legale de la retention (GDPR art. 6) */
  legalBasis: string
}

export const DATA_RETENTION: Record<string, RetentionPolicy> = {
  /** Compte actif : conservation tant que l'utilisateur l'utilise */
  account_active: {
    label: 'Tant que le compte est actif',
    days: 0, // 0 = infini (compte actif)
    legalBasis: 'Execution du contrat (art. 6.1.b RGPD)',
  },
  /** Apres suppression : purge automatique sous 90 jours */
  account_deleted: {
    label: '90 jours apres suppression du compte',
    days: 90,
    legalBasis: 'Obligation legale (art. 6.1.c RGPD) - delai de reclamation',
  },
  /** Logs d'acces et de securite */
  security_logs: {
    label: '12 mois',
    days: 365,
    legalBasis: 'Interet legitime (art. 6.1.f RGPD) - prevention de la fraude',
  },
  /** Factures et documents comptables */
  invoices: {
    label: '10 ans',
    days: 3650,
    legalBasis: 'Obligation legale (code du commerce israelien)',
  },
}

// =====================================================
// Export par defaut pour debug
// =====================================================

export default {
  LEGAL_ENTITY,
  APPLICABLE_LAWS,
  DATA_PROCESSORS,
  DATA_RETENTION,
  isLegalEntityConfigured,
}
