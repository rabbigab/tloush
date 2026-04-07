/**
 * Insurance Guide for Israel
 *
 * Comprehensive guide to insurance types in Israel,
 * what's mandatory, what's recommended, and key terms.
 * Helps French-speaking olim understand the Israeli insurance landscape.
 */

export interface InsuranceType {
  id: string
  name_fr: string
  name_he: string
  category: 'mandatory' | 'recommended' | 'optional'
  description_fr: string
  typical_cost_monthly: string
  key_points_fr: string[]
  watch_out_fr: string[]
  how_to_compare_fr: string
}

export const INSURANCE_TYPES: InsuranceType[] = [
  {
    id: 'health_basic',
    name_fr: 'Assurance maladie de base (Kupat Holim)',
    name_he: 'קופת חולים',
    category: 'mandatory',
    description_fr: 'Couverture sante de base obligatoire via l\'une des 4 caisses maladie : Clalit, Maccabi, Meuhedet, Leumit. Financee par la taxe sante prelevee sur le salaire.',
    typical_cost_monthly: 'Inclus dans les cotisations sante (3.1-5% du salaire)',
    key_points_fr: [
      'Obligatoire pour tout resident israelien',
      '4 caisses au choix : Clalit, Maccabi, Meuhedet, Leumit',
      'Changement de caisse possible une fois par an',
      'Couvre les soins de base, urgences, hospitalisations',
    ],
    watch_out_fr: [
      'Les temps d\'attente pour les specialistes peuvent etre longs',
      'Certains traitements ne sont pas couverts (dentaire, optique)',
      'Les caisses ont des reseaux de medecins differents',
    ],
    how_to_compare_fr: 'Comparez les reseaux de medecins pres de chez vous et les services supplementaires proposes par chaque caisse.',
  },
  {
    id: 'health_supplementary',
    name_fr: 'Assurance maladie complementaire (Mashlamim)',
    name_he: 'ביטוח משלים',
    category: 'recommended',
    description_fr: 'Assurance complementaire proposee par votre Kupat Holim. Ajoute des services : choix du chirurgien, chambre privee, remboursements dentaires partiels.',
    typical_cost_monthly: '30-150₪ selon le niveau (argent/or/platine)',
    key_points_fr: [
      'Proposee par votre Kupat Holim',
      'Plusieurs niveaux (basique, premium)',
      'Couvre souvent : medecine alternative, IRM rapide, choix du chirurgien',
      'Pas de questionnaire medical (acceptation automatique)',
    ],
    watch_out_fr: [
      'Delais de carence (tkufat amtana) pour certains soins',
      'Verifiez ce qui est deja couvert avant d\'ajouter une privee',
    ],
    how_to_compare_fr: 'Contactez votre Kupat Holim pour connaitre les options. Comparez avec une assurance privee equivalente.',
  },
  {
    id: 'health_private',
    name_fr: 'Assurance sante privee',
    name_he: 'ביטוח בריאות פרטי',
    category: 'optional',
    description_fr: 'Assurance sante privee (Harel, Migdal, Clal, etc.) qui complete la Kupat Holim. Couvre les hospitalisations privees, acces rapide aux specialistes.',
    typical_cost_monthly: '150-500₪ selon l\'age et la couverture',
    key_points_fr: [
      'Acces aux hopitaux prives (Assuta, Herzliya Medical Center)',
      'Pas de files d\'attente pour les operations',
      'Couverture a l\'etranger souvent incluse',
    ],
    watch_out_fr: [
      'Peut faire doublon avec le Mashlamim',
      'Le cout augmente avec l\'age',
      'Questionnaire medical obligatoire (exclusions possibles)',
      'Verifiez les exclusions (pre-existing conditions)',
    ],
    how_to_compare_fr: 'Utilisez un courtier (sohen bituah) qui compare gratuitement. Verifiez les exclusions et franchises.',
  },
  {
    id: 'car',
    name_fr: 'Assurance auto (Bituah Rehev)',
    name_he: 'ביטוח רכב',
    category: 'mandatory',
    description_fr: 'L\'assurance obligatoire (hova) couvre les dommages corporels. L\'assurance tous risques (makif) est facultative mais fortement recommandee.',
    typical_cost_monthly: 'Hova: 150-400₪/an | Makif: 200-600₪/mois',
    key_points_fr: [
      'Hova (obligatoire) : dommages corporels uniquement',
      'Makif (tous risques) : vol, incendie, degats materiels',
      'Tsad gimel (tiers) : option intermediaire moins chere',
      'Le bonus (no-claims) reduit la prime chaque annee',
    ],
    watch_out_fr: [
      'Le premier bonus en Israel recommence a zero (meme si vous aviez un bonus en France)',
      'La franchise (hashtatfut atzmit) peut etre elevee',
      'Verifiez la couverture vol dans votre quartier',
    ],
    how_to_compare_fr: 'Comparez sur Bituah.Net ou via un courtier. Demandez un devis a au moins 3 compagnies.',
  },
  {
    id: 'apartment',
    name_fr: 'Assurance habitation (Bituah Dira)',
    name_he: 'ביטוח דירה',
    category: 'recommended',
    description_fr: 'Couvre la structure de l\'appartement (mivne) et le contenu (tkhulah). Non obligatoire mais essentiel. Souvent exige par les banques si mashkanta.',
    typical_cost_monthly: '50-150₪/mois',
    key_points_fr: [
      'Mivne : murs, plomberie, electricite (pour proprietaires)',
      'Tkhulah : meubles, electromenager, objets personnels',
      'Responsabilite civile (ahariyut tsad gimel) souvent incluse',
      'Couverture tremblement de terre optionnelle',
    ],
    watch_out_fr: [
      'Sous-assurance frequente : evaluez bien la valeur de vos biens',
      'Verifiez les exclusions (inondation, tremblement de terre)',
      'En location : le proprietaire assure le mivne, vous assurez le tkhulah',
    ],
    how_to_compare_fr: 'Demandez des devis en ligne (Lemonade, Harel, etc.) en precisant la valeur du contenu.',
  },
  {
    id: 'life',
    name_fr: 'Assurance vie (Bituah Haim)',
    name_he: 'ביטוח חיים',
    category: 'recommended',
    description_fr: 'Assurance deces/invalidite. Essentielle si vous avez une mashkanta ou des personnes a charge.',
    typical_cost_monthly: '100-400₪ selon l\'age et le montant assure',
    key_points_fr: [
      'Souvent exigee par la banque pour la mashkanta (risque deces)',
      'Peut etre liee a la pension (bituah menahalim)',
      'Verifiez si votre employeur fournit deja une couverture',
    ],
    watch_out_fr: [
      'Les frais de gestion (dmei nihul) varient enormement',
      'Attention aux exclusions (maladies pre-existantes)',
      'La couverture employeur s\'arrete quand vous quittez l\'entreprise',
    ],
    how_to_compare_fr: 'Comparez via un conseiller pension (yoetz pensioni). C\'est gratuit car ils sont remuneres par les compagnies.',
  },
  {
    id: 'pension',
    name_fr: 'Assurance pension (Bituah Pensioni)',
    name_he: 'ביטוח פנסיוני',
    category: 'mandatory',
    description_fr: 'Epargne retraite obligatoire pour tout salarie apres 6 mois. Deux types principaux : Keren Pensia (fonds) ou Bituah Menahalim (assurance).',
    typical_cost_monthly: '6% salarie + 6.5% employeur + 6% pitzuim',
    key_points_fr: [
      'Obligatoire apres 6 mois d\'emploi',
      'Keren Pensia : pas de frais de gestion sur l\'epargne, assurance incluse',
      'Bituah Menahalim : plus flexible mais frais plus eleves',
      'L\'employeur paie aussi : 6.5% + 6% pitzuim',
    ],
    watch_out_fr: [
      'Les frais de gestion impactent enormement le resultat final',
      'Verifiez que votre employeur cotise bien (visible sur le tlush)',
      'Ne laissez pas de "pensions orphelines" chez d\'anciens employeurs',
      'Un yoetz pensioni peut regrouper vos pensions et negocier les frais',
    ],
    how_to_compare_fr: 'Consultez un yoetz pensioni independant. Comparez les frais de gestion (dmei nihul) entre les fonds.',
  },
]

export const INSURANCE_CATEGORIES = [
  { id: 'mandatory', label_fr: 'Obligatoire', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'recommended', label_fr: 'Recommande', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'optional', label_fr: 'Optionnel', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
]

export function getInsuranceByCategory(category: string): InsuranceType[] {
  return INSURANCE_TYPES.filter(i => i.category === category)
}

/**
 * General tips for insurance in Israel
 */
export const INSURANCE_TIPS_FR = [
  'Un sohen bituah (courtier) compare gratuitement pour vous — son service est remunere par les compagnies.',
  'Regrouper vos assurances chez le meme assureur peut donner des reductions.',
  'Relisez vos contrats chaque annee : vos besoins changent et les offres evoluent.',
  'En tant qu\'oleh hadash, certaines compagnies offrent des conditions speciales la premiere annee.',
  'Attention aux doublons entre assurance employeur et assurance privee : vous payez peut-etre deux fois.',
  'Les frais de gestion en pension sont negociables — ne gardez jamais les frais par defaut.',
]
