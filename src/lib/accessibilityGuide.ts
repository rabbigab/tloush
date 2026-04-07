/**
 * Accessibility Guide for Israeli Websites (IS 5568 / WCAG 2.1 AA)
 *
 * Provides context and rules for the AI assistant to give
 * accessibility-aware recommendations.
 */

export interface AccessibilityRule {
  id: string
  category: 'visual' | 'motor' | 'cognitive' | 'rtl' | 'legal'
  title_fr: string
  description_fr: string
  wcag_ref?: string
  is5568_ref?: string
}

export const ACCESSIBILITY_RULES: AccessibilityRule[] = [
  {
    id: 'contrast',
    category: 'visual',
    title_fr: 'Contraste de couleurs',
    description_fr: 'Le rapport de contraste entre le texte et l\'arriere-plan doit etre d\'au moins 4.5:1 pour le texte normal et 3:1 pour le texte large (18px+ ou 14px bold).',
    wcag_ref: 'WCAG 1.4.3',
    is5568_ref: 'IS 5568 Section 4.1',
  },
  {
    id: 'keyboard_nav',
    category: 'motor',
    title_fr: 'Navigation au clavier',
    description_fr: 'Tous les elements interactifs doivent etre accessibles au clavier (Tab, Shift+Tab, Enter, Escape). L\'ordre de focus doit etre logique et visible.',
    wcag_ref: 'WCAG 2.1.1',
    is5568_ref: 'IS 5568 Section 4.2',
  },
  {
    id: 'screen_reader',
    category: 'visual',
    title_fr: 'Lecteurs d\'ecran',
    description_fr: 'Les images doivent avoir un attribut alt. Les formulaires doivent avoir des labels. Les sections doivent utiliser des roles ARIA. Compatible avec JAWS, NVDA et VoiceOver.',
    wcag_ref: 'WCAG 1.1.1, 4.1.2',
  },
  {
    id: 'rtl_bidi',
    category: 'rtl',
    title_fr: 'RTL et texte bidirectionnel',
    description_fr: 'En Israel, les sites doivent supporter le RTL (hebreu/arabe). Utiliser dir="rtl" et lang="he" correctement. Le texte mixte HE/FR/EN doit utiliser l\'attribut dir="auto" ou des spans avec dir explicite.',
    is5568_ref: 'IS 5568 Section 6',
  },
  {
    id: 'focus_visible',
    category: 'motor',
    title_fr: 'Indicateur de focus visible',
    description_fr: 'Un indicateur de focus visible doit etre present sur tous les elements interactifs. Ne pas utiliser outline: none sans alternative visible.',
    wcag_ref: 'WCAG 2.4.7',
  },
  {
    id: 'form_errors',
    category: 'cognitive',
    title_fr: 'Messages d\'erreur clairs',
    description_fr: 'Les erreurs de formulaire doivent etre identifiees clairement (texte + couleur), liees au champ en erreur via aria-describedby, et proposer des suggestions de correction.',
    wcag_ref: 'WCAG 3.3.1, 3.3.3',
  },
  {
    id: 'responsive_text',
    category: 'visual',
    title_fr: 'Texte redimensionnable',
    description_fr: 'Le texte doit pouvoir etre agrandi a 200% sans perte de contenu ou de fonctionnalite. Utiliser des unites relatives (rem, em) plutot que px pour les tailles de police.',
    wcag_ref: 'WCAG 1.4.4',
  },
  {
    id: 'touch_targets',
    category: 'motor',
    title_fr: 'Zones tactiles',
    description_fr: 'Les zones tactiles doivent faire au minimum 44x44px (WCAG 2.5.5). Les boutons et liens sur mobile doivent avoir un espacement suffisant.',
    wcag_ref: 'WCAG 2.5.5',
  },
  {
    id: 'legal_obligation',
    category: 'legal',
    title_fr: 'Obligation legale en Israel',
    description_fr: 'La loi israelienne sur l\'egalite des droits des personnes handicapees (Hok Shivyon Zekhuyot LeAnashim Im Mugbaluyot) impose l\'accessibilite web conforme IS 5568. Applicable a tout site commercial ou de service public. Amendes possibles en cas de non-conformite.',
    is5568_ref: 'IS 5568 (base sur WCAG 2.1 AA)',
  },
  {
    id: 'accessibility_statement',
    category: 'legal',
    title_fr: 'Declaration d\'accessibilite',
    description_fr: 'Tout site israelien doit afficher une declaration d\'accessibilite (Hatzaarat Negishot) avec : date de derniere verification, standard applique (IS 5568), coordonnees du responsable accessibilite, et moyens de signaler un probleme.',
    is5568_ref: 'IS 5568 Annex A',
  },
]

/**
 * Get rules relevant to a specific category
 */
export function getRulesByCategory(category: AccessibilityRule['category']): AccessibilityRule[] {
  return ACCESSIBILITY_RULES.filter(r => r.category === category)
}

/**
 * Get all rules as a prompt context for the AI assistant
 */
export function getAccessibilityContext(): string {
  return `Regles d'accessibilite israeliennes (IS 5568 / WCAG 2.1 AA) :\n\n` +
    ACCESSIBILITY_RULES.map(r => `- ${r.title_fr}: ${r.description_fr}`).join('\n\n')
}
