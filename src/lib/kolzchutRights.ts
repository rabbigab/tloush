/**
 * Kolzchut (כל זכות / All Rights) Integration
 *
 * Curated database of Israeli rights and benefits from Kolzchut.org.il,
 * organized for use in the Tloush rights verification engine.
 *
 * Source: https://www.kolzchut.org.il
 * Note: This is a curated subset. Always link to Kolzchut for the full, up-to-date info.
 */

export interface KolzchutRight {
  id: string
  category: 'employment' | 'social_security' | 'housing' | 'health' | 'education' | 'immigration' | 'family' | 'disability' | 'elderly' | 'consumer'
  title_fr: string
  title_he: string
  description_fr: string
  eligibility_fr: string
  howToApply_fr: string
  kolzchutUrl: string
  relatedDocTypes: string[]
  tags: string[]
}

export const KOLZCHUT_RIGHTS: KolzchutRight[] = [
  // ─── Employment ───
  {
    id: 'minimum_wage',
    category: 'employment',
    title_fr: 'Droit au salaire minimum',
    title_he: 'שכר מינימום',
    description_fr: 'Tout salarie en Israel a droit au salaire minimum de 6 060₪/mois (depuis avril 2026) pour un temps plein.',
    eligibility_fr: 'Tous les salaries, y compris les travailleurs etrangers et les jeunes de plus de 16 ans.',
    howToApply_fr: 'Verifiez votre fiche de paie. Si votre salaire est inferieur, contactez votre employeur par ecrit. En cas de refus, deposez une plainte au Misrad HaAvoda.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/שכר_מינימום',
    relatedDocTypes: ['payslip', 'work_contract'],
    tags: ['salaire', 'minimum', 'smic'],
  },
  {
    id: 'paid_vacation',
    category: 'employment',
    title_fr: 'Conges payes annuels',
    title_he: 'חופשה שנתית',
    description_fr: 'Droit a des jours de conges payes : 12 jours/an (5j/sem) la 1ere annee, augmente avec l\'anciennete jusqu\'a 28 jours apres 14+ ans.',
    eligibility_fr: 'Tous les salaries des le premier jour de travail (prorata pour les temps partiels).',
    howToApply_fr: 'Les jours s\'accumulent automatiquement. Verifiez le solde sur votre fiche de paie (ligne "yitrat hufsha").',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/חופשה_שנתית',
    relatedDocTypes: ['payslip'],
    tags: ['conges', 'vacances', 'hufsha'],
  },
  {
    id: 'sick_leave',
    category: 'employment',
    title_fr: 'Conges maladie',
    title_he: 'דמי מחלה',
    description_fr: 'Droit a 1.5 jours de maladie par mois travaille (max 90 jours cumules). Jour 1 : non paye. Jours 2-3 : 50%. Jours 4+ : 100%.',
    eligibility_fr: 'Tous les salaries avec certificat medical.',
    howToApply_fr: 'Fournissez un certificat medical (ishur mahala) a votre employeur. Verifiez le solde sur votre fiche de paie.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/דמי_מחלה',
    relatedDocTypes: ['payslip'],
    tags: ['maladie', 'sick', 'mahala'],
  },
  {
    id: 'severance_pay',
    category: 'employment',
    title_fr: 'Indemnites de licenciement (Pitzouim)',
    title_he: 'פיצויי פיטורים',
    description_fr: 'Un mois de salaire par annee de service. Versee en cas de licenciement, demission dans certains cas, ou deces. Souvent provisionne en pension (Section 14).',
    eligibility_fr: 'Salaries ayant travaille au moins 1 an chez le meme employeur.',
    howToApply_fr: 'En cas de licenciement, l\'employeur doit verser les pitzouim dans les 15 jours. Si Section 14, verifiez que les versements pension couvrent les pitzouim.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/פיצויי_פיטורים',
    relatedDocTypes: ['payslip', 'work_contract'],
    tags: ['licenciement', 'pitzouim', 'indemnites'],
  },
  {
    id: 'convalescence_pay',
    category: 'employment',
    title_fr: 'Prime de convalescence (Dmei Havra\'a)',
    title_he: 'דמי הבראה',
    description_fr: 'Prime annuelle de 430₪/jour (2026) x nombre de jours selon anciennete (5 a 10 jours). Versee une fois par an, generalement en juin-juillet.',
    eligibility_fr: 'Salaries ayant au moins 1 an d\'anciennete.',
    howToApply_fr: 'Versee automatiquement par l\'employeur. Verifiez la ligne "dmei havra\'a" sur votre fiche de paie estivale.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/דמי_הבראה',
    relatedDocTypes: ['payslip'],
    tags: ['convalescence', 'havraa', 'havraah'],
  },
  {
    id: 'pension_obligatoire',
    category: 'employment',
    title_fr: 'Pension obligatoire',
    title_he: 'פנסיה חובה',
    description_fr: 'Cotisation pension obligatoire : 6% employe + 6.5% employeur + 6% pitzouim employeur. Total : 18.5% du salaire. Commence apres 6 mois d\'emploi.',
    eligibility_fr: 'Tout salarie apres 6 mois de travail (ou 3 mois si pension anterieure).',
    howToApply_fr: 'Verifiez votre fiche de paie pour les retenues pension. Contactez votre caisse de pension pour confirmer les versements.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/ביטוח_פנסיוני',
    relatedDocTypes: ['payslip', 'pension'],
    tags: ['pension', 'retraite', 'pensia'],
  },

  // ─── Social Security ───
  {
    id: 'unemployment_benefits',
    category: 'social_security',
    title_fr: 'Allocations chomage',
    title_he: 'דמי אבטלה',
    description_fr: 'Allocations versees par le Bituach Leumi apres un licenciement. Duree : 50-175 jours selon l\'age et la situation familiale. Montant : base sur le salaire moyen des 6 derniers mois.',
    eligibility_fr: 'Au moins 12 mois de cotisation BL sur les 18 derniers mois. Inscrit au bureau de l\'emploi (Lishkat HaAvoda).',
    howToApply_fr: 'Inscrivez-vous au bureau de l\'emploi dans les 30 jours suivant le licenciement. Remplissez une demande au Bituach Leumi.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/דמי_אבטלה',
    relatedDocTypes: ['bituah_leumi'],
    tags: ['chomage', 'avtala', 'licenciement'],
  },
  {
    id: 'maternity_allowance',
    category: 'social_security',
    title_fr: 'Allocation maternite',
    title_he: 'דמי לידה',
    description_fr: '15 semaines payees par le BL (sur 26 semaines de conge total). Montant : basé sur le salaire moyen des 3 derniers mois. Plafond : 5x salaire moyen.',
    eligibility_fr: 'Salariee ayant cotise au BL pendant au moins 10 mois sur les 14 derniers mois, ou 15 mois sur les 22 derniers.',
    howToApply_fr: 'Deposez une demande au Bituach Leumi avec le formulaire de demande de dmei leida + certificat medical.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/דמי_לידה',
    relatedDocTypes: ['bituah_leumi'],
    tags: ['maternite', 'leida', 'naissance'],
  },
  {
    id: 'child_allowance',
    category: 'family',
    title_fr: 'Allocations enfants',
    title_he: 'קצבת ילדים',
    description_fr: 'Allocation mensuelle pour chaque enfant jusqu\'a 18 ans. Montant : ~160₪ pour le 1er enfant, ~201₪ pour le 2eme, etc. (2026). Versee le 28 de chaque mois.',
    eligibility_fr: 'Tout parent resident en Israel avec enfant(s) de moins de 18 ans.',
    howToApply_fr: 'Automatique apres la naissance si vous etes inscrit au BL. Sinon, deposez le formulaire "bakasha lekitzvat yeladim".',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/קצבת_ילדים',
    relatedDocTypes: ['bituah_leumi'],
    tags: ['enfants', 'allocations', 'yeladim'],
  },

  // ─── Immigration ───
  {
    id: 'oleh_tax_benefits',
    category: 'immigration',
    title_fr: 'Avantages fiscaux olim',
    title_he: 'הטבות מס לעולים חדשים',
    description_fr: 'Points de credit supplementaires (3/2/1 sur 3 ans), exoneration de revenus etrangers pendant 10 ans, exoneration de plus-values etrangeres.',
    eligibility_fr: 'Olim hadashim et toshavim hozrim (residents de retour) pendant les annees suivant l\'aliyah.',
    howToApply_fr: 'Presentez votre teudat oleh a votre employeur pour le Tofes 101. Pour les revenus etrangers, consultez un comptable.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/הטבות_מס_לעולים_חדשים',
    relatedDocTypes: ['payslip', 'tax_notice'],
    tags: ['olim', 'aliyah', 'impots', 'tax'],
  },
  {
    id: 'oleh_sal_absorption',
    category: 'immigration',
    title_fr: 'Panier d\'absorption (Sal Klita)',
    title_he: 'סל קליטה',
    description_fr: 'Aide financiere du Misrad HaKlita pour les nouveaux olim. Versee en 6 paiements sur 1 an. Montant : ~25 000-35 000₪ selon la situation familiale.',
    eligibility_fr: 'Olim hadashim dans l\'annee suivant l\'aliyah.',
    howToApply_fr: 'Contactez le Misrad HaKlita dans les premiers jours. Le premier versement est disponible des l\'arrivee.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/סל_קליטה',
    relatedDocTypes: ['bituah_leumi'],
    tags: ['olim', 'klita', 'absorption'],
  },

  // ─── Housing ───
  {
    id: 'rent_protection',
    category: 'housing',
    title_fr: 'Protection du locataire',
    title_he: 'הגנה על שוכרים',
    description_fr: 'La loi sur la location equitable (2017) limite le depot a 3 mois de loyer, oblige un contrat ecrit, interdit certaines clauses abusives.',
    eligibility_fr: 'Tous les locataires de logements residentiels en Israel.',
    howToApply_fr: 'En cas de litige, contactez le tribunal des petites creances (beit mishpat letvia\'ot ketanot) ou le centre d\'aide aux locataires.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/שכירות_הוגנת',
    relatedDocTypes: ['rental_contract'],
    tags: ['location', 'loyer', 'bail'],
  },
  {
    id: 'arnona_discounts',
    category: 'housing',
    title_fr: 'Reductions d\'arnona',
    title_he: 'הנחות בארנונה',
    description_fr: 'Reductions possibles : oleh hadash (90% la 1ere annee), age avance, handicap, parent isole, bas revenus, soldat seul. Demande a la mairie.',
    eligibility_fr: 'Selon le statut : olim, 3e age, handicap reconnu, parent isole, beneficiaire d\'aide sociale.',
    howToApply_fr: 'Deposez une demande a la mairie (irya) avec les justificatifs. Delai : generalement 30 jours.',
    kolzchutUrl: 'https://www.kolzchut.org.il/he/הנחות_בארנונה',
    relatedDocTypes: [],
    tags: ['arnona', 'reduction', 'mairie'],
  },
]

/**
 * Search rights by keyword
 */
export function searchRights(query: string): KolzchutRight[] {
  const q = query.toLowerCase()
  return KOLZCHUT_RIGHTS.filter(r =>
    r.title_fr.toLowerCase().includes(q) ||
    r.description_fr.toLowerCase().includes(q) ||
    r.tags.some(t => t.includes(q))
  )
}

/**
 * Get rights related to a specific document type
 */
export function getRightsByDocType(docType: string): KolzchutRight[] {
  return KOLZCHUT_RIGHTS.filter(r => r.relatedDocTypes.includes(docType))
}

/**
 * Get rights by category
 */
export function getRightsByCategory(category: KolzchutRight['category']): KolzchutRight[] {
  return KOLZCHUT_RIGHTS.filter(r => r.category === category)
}

/**
 * Generate a rights summary for the AI assistant context
 */
export function getRightsContext(docType?: string): string {
  const rights = docType ? getRightsByDocType(docType) : KOLZCHUT_RIGHTS
  return rights.map(r =>
    `**${r.title_fr}** (${r.title_he})\n${r.description_fr}\nEligibilite: ${r.eligibility_fr}\nSource: ${r.kolzchutUrl}`
  ).join('\n\n---\n\n')
}
