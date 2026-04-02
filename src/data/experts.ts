export type ExpertSpecialty =
  | 'comptabilite'
  | 'fiscalite'
  | 'droit-travail'

export const SPECIALTY_LABELS: Record<ExpertSpecialty, string> = {
  'comptabilite': 'Comptabilite',
  'fiscalite': 'Fiscalite',
  'droit-travail': 'Droit du travail',
}
