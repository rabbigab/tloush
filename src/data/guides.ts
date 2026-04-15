// src/data/guides.ts

export type GuideCategory =
  | "conges"
  | "salaire"
  | "licenciement"
  | "cotisations"
  | "contrat"
  | "avantages";

export interface GuideLegalSource {
  label: string;
  url: string;
}

export interface Guide {
  slug: string;
  title: string;
  subtitle: string;
  category: GuideCategory;
  emoji: string;
  readingTime: string;
  updatedAt: string;
  keywords: string[];
  relatedSlugs: string[];
  content: string;
  /** Sources officielles citees dans le guide (audit #22) */
  legalSources?: GuideLegalSource[];
}

export const CATEGORY_LABELS: Record<GuideCategory, string> = {
  conges: "Congés",
  salaire: "Salaire",
  licenciement: "Licenciement",
  cotisations: "Cotisations",
  contrat: "Contrat",
  avantages: "Avantages",
};

export const guides: Guide[] = [
  {
    slug: "les-conges-payes",
    title: "Les congés payés en Israël (Chofsha)",
    subtitle:
      "Combien de jours vous êtes-vous acquis ? Comment sont-ils calculés ? Que se passe-t-il si vous ne les prenez pas ?",
    category: "conges",
    emoji: "🏖️",
    readingTime: "5 min",
    updatedAt: "2024-04-01",
    keywords: [
      "congés payés israël",
      "chofsha",
      "jours de congé israël",
      "vacances salarié israël",
    ],
    relatedSlugs: ["heures-supplementaires", "comprendre-sa-fiche"],
    legalSources: [
      {
        label: "Loi sur les congés annuels 1951 (חוק חופשה שנתית)",
        url: "https://www.nevo.co.il",
      },
      {
        label: "Amendement 15 (2017) — rehaussement des barèmes",
        url: "https://www.nevo.co.il",
      },
    ],
    content: `## Qu'est-ce que la Chofsha annuelle ?

En Israël, tout salarié a droit à des congés payés annuels (חופשה שנתית) conformément à la Loi sur les congés annuels (1951).

## Nombre de jours minimum selon l'ancienneté

| Années de service | Jours ouvrables de congé |
|---|---|
| 1ère à 4ème année | 14 jours |
| 5ème année | 16 jours |
| 6ème année | 18 jours |
| 7ème année et au-delà | 21 jours |

Ces minimums peuvent être augmentés par convention collective ou contrat individuel.

## Comment sont calculés vos congés ?

Les congés s'accumulent au prorata du temps travaillé. Pour une année complète, vous avez droit au nombre de jours indiqué ci-dessus. Pour une année partielle, le calcul est proportionnel.

**Exemple :** Si vous avez droit à 14 jours par an et que vous avez travaillé 6 mois, vous avez acquis 7 jours.

## Quand prendre ses congés ?

L'employeur fixe en général les dates, mais doit vous prévenir au moins 14 jours à l'avance. Vous pouvez demander à prendre vos congés quand vous le souhaitez, sous réserve de l'accord de l'employeur.

## Report et expiration

Les congés non pris peuvent être reportés sur 3 ans maximum. Au-delà, ils sont perdus sauf accord écrit de l'employeur.

## Paiement des congés non pris à la fin du contrat

Si vous quittez l'entreprise (démission ou licenciement) avec des jours de congé non pris, votre employeur doit vous les payer. Le montant est calculé sur la base de votre salaire journalier moyen.

**⚠️ Point d'attention :** Vérifiez chaque mois sur votre fiche de paie le solde de congés restants (יתרת חופשה).`,
  },
  {
    slug: "heures-supplementaires",
    title: "Les heures supplémentaires en Israël",
    subtitle:
      "Taux 125 % et 150 %, plafonds légaux, comment réclamer les heures non payées.",
    category: "salaire",
    emoji: "⏰",
    readingTime: "4 min",
    updatedAt: "2024-04-01",
    keywords: [
      "heures supplémentaires israël",
      "125% 150% israël",
      "shabatot israël",
      "récupération heures sup",
    ],
    relatedSlugs: ["les-conges-payes", "comprendre-sa-fiche"],
    legalSources: [
      {
        label: "Loi sur les heures de travail et de repos 1951 (חוק שעות עבודה ומנוחה)",
        url: "https://www.nevo.co.il",
      },
      {
        label: "Ministère du Travail — inspection",
        url: "https://www.gov.il/he/departments/ministry_of_economy_and_industry",
      },
    ],
    content: `## Définition des heures supplémentaires

En Israël, la journée légale de travail est de **8 heures** (ou 9h dans certains secteurs). La semaine légale est de **43 heures** (5 jours) ou **45 heures** (6 jours). Toute heure au-delà de ces limites est une heure supplémentaire.

## Taux de majoration

- **2 premières heures supplémentaires** par jour : majorées à **125 %** du salaire normal
- **Heures suivantes** au-delà : majorées à **150 %** du salaire normal

**Exemple :** Vous gagnez 50 ₪/h. Votre 9ème heure de travail vaut 62,50 ₪ (50 × 1,25). Votre 11ème heure vaut 75 ₪ (50 × 1,50).

## Plafond d'heures supplémentaires

La loi limite les heures supplémentaires à **16 heures par semaine** au maximum.

## Vérifier sur votre fiche de paie

Cherchez les lignes :
- שעות נוספות 125 % (she'ot nosafot 125)
- שעות נוספות 150 % (she'ot nosafot 150)

Si vous avez fait des heures supplémentaires mais que ces lignes n'apparaissent pas, c'est un signal d'alerte.

## Que faire si vos heures sup ne sont pas payées ?

1. Documentez vos heures (emails, pointages, témoins)
2. Envoyez une réclamation écrite à votre employeur
3. Consultez un avocat en droit du travail si pas de réponse sous 14 jours
4. Portez plainte à l'Inspection du Travail (מפקח עבודה)`,
  },
  {
    slug: "comprendre-sa-fiche",
    title: "Comprendre sa fiche de paie israélienne (Tlush)",
    subtitle:
      "Les 10 lignes essentielles à repérer sur un tlush : brut, retenues, cotisations, soldes et mentions légales.",
    category: "salaire",
    emoji: "💵",
    readingTime: "6 min",
    updatedAt: "2026-04-01",
    keywords: [
      "tlush israël",
      "fiche de paie hebreu",
      "comprendre bulletin salaire israël",
      "tlush francais",
    ],
    relatedSlugs: ["heures-supplementaires", "les-conges-payes"],
    legalSources: [
      {
        label: "Loi sur la protection du salaire 1958 (חוק הגנת השכר)",
        url: "https://www.nevo.co.il",
      },
      {
        label: "Rashut HaMisim — barèmes fiscaux",
        url: "https://www.taxes.gov.il",
      },
    ],
    content: `## Structure d'un tlush israélien

Une fiche de paie israélienne (tlush, תלוש שכר) doit contenir au minimum 10 sections obligatoires selon la Loi sur la protection du salaire de 1958.

## 1. En-tête employeur

Nom de l'entreprise, numéro Osek (ח״פ ou ע״מ), adresse.

## 2. En-tête salarié

Nom, numéro Teudat Zehut, numéro de personnel (מס' עובד), date d'entrée, ancienneté.

## 3. Période de paiement

Le mois concerné (עבור חודש) et la date d'émission (תאריך).

## 4. Salaire de base (שכר יסוד)

Le salaire contractuel avant primes et retenues.

## 5. Primes et avantages (תוספות)

- Prime transport (החזר נסיעות)
- Prime repas (הבראה)
- Heures supplémentaires (שעות נוספות)
- Prime d'ancienneté (ותק)

## 6. Salaire brut total (שכר ברוטו)

Somme du salaire de base + toutes les primes. C'est le montant imposable.

## 7. Retenues obligatoires (ניכויי חובה)

Les 4 retenues légales :
- **Impôt sur le revenu (מס הכנסה)** : barème progressif 10% → 50%
- **Bituah Leumi (ביטוח לאומי)** : 0.4% jusqu'à 7 522 ₪, puis 7%
- **Assurance santé (מס בריאות)** : 3.23% / 5.2%
- **Pension / Keren Pensia** : 6% du salarié, obligatoire après 6 mois

## 8. Soldes de jours (ימים)

- Jours de congés restants (חופשה)
- Jours de maladie (מחלה)

## 9. Salaire net (שכר נטו)

Brut - retenues = net à payer.

## 10. Cumul annuel (מצטבר שנתי)

Total brut et net depuis le début de l'année fiscale (janvier-décembre).

## Signaux d'alerte à vérifier

- Absence de ligne pension après 6 mois d'ancienneté
- Taux BL ou impôt incorrect (voir le simulateur brut→net)
- Heures supplémentaires non listées
- Absence de prime havraa après 1 an d'ancienneté

## Comment Tloush peut vous aider

Utilisez le [scanner](/scanner) pour analyser votre tlush automatiquement, ou le [simulateur brut→net](/calculateurs/brut-net) pour vérifier les calculs.`,
  },
  {
    slug: "pitzuim-licenciement",
    title: "Pitzuim : les indemnités de licenciement en Israël",
    subtitle:
      "Qui y a droit, comment ils se calculent (salaire × ancienneté), l'article 14, et les cas de démission équivalente.",
    category: "licenciement",
    emoji: "📋",
    readingTime: "6 min",
    updatedAt: "2026-04-01",
    keywords: [
      "pitzuim israël",
      "indemnités licenciement israël",
      "article 14 pension",
      "pitzuey piturim",
    ],
    relatedSlugs: ["comprendre-sa-fiche"],
    legalSources: [
      {
        label: "Loi sur l'indemnisation de licenciement 1963 (חוק פיצויי פיטורים)",
        url: "https://www.nevo.co.il",
      },
      {
        label: "Jurisprudence Beit Din LaAvoda (Tribunal du travail)",
        url: "https://www.court.gov.il",
      },
    ],
    content: `## Le principe du pitzuim

Le pitzuim (פיצויי פיטורים) est l'indemnité légale versée au salarié en cas de licenciement ou de certains cas de démission équivalente. Il est régi par la Loi de 1963.

## Formule de base

**Pitzuim = dernier salaire brut mensuel × années d'ancienneté**

Exemple : 12 000 ₪/mois × 4 ans = 48 000 ₪ de pitzuim dû.

## Éligibilité

- Minimum **12 mois** d'ancienneté chez le même employeur
- Licenciement par l'employeur (tous motifs sauf faute grave documentée)
- OU démission équivalente à un licenciement (6 cas, voir ci-dessous)

## Les 6 cas de démission équivalente

Vous démissionnez mais avez droit au pitzuim si :

1. **Raisons de santé** — attestation médicale requise
2. **Raisons familiales** — parent / enfant à charge malade
3. **Après naissance** — mère dans les 9 mois post-accouchement
4. **Déménagement** — plus de 40 km, ou lié à un mariage
5. **Non-paiement du salaire** — retard > 3 mois
6. **Aggravation des conditions** — baisse de salaire, changement de poste défavorable

Chaque cas nécessite des justificatifs et souvent une notification préalable à l'employeur.

## L'Article 14 (סעיף 14)

Si votre contrat de travail contient la clause Article 14, votre pension (Keren Pitzuim) remplace tout ou partie du pitzuim :

- **Article 14 "complet" (100 %)** : la pension a été alimentée à 8.33 % du salaire. L'employeur ne doit **rien** de plus en cas de départ.
- **Article 14 "partiel" (72 %)** : la pension couvre 6 % du salaire sur 8.33 % théorique. Il reste 28 % à la charge de l'employeur (salaire × années × 28 %).
- **Pas d'article 14** : l'employeur doit verser 100 % du pitzuim.

Vérifiez votre contrat ou demandez à l'employeur.

## Exonération fiscale

Le pitzuim est **exonéré d'impôt** jusqu'à un plafond (2026 : environ 13 750 ₪ par année d'ancienneté). Au-delà, le montant est imposé comme revenu ordinaire, sauf étalement fiscal (prissa) sur 1 à 6 ans.

## Calculer votre pitzuim

Utilisez le [calculateur Pitzuim](/calculateurs/indemnites) pour obtenir une estimation avec ou sans article 14.

## En cas de litige

Si l'employeur refuse de verser le pitzuim ou calcule mal :

1. Mise en demeure écrite (recommandé)
2. Inspection du Travail (מפקח עבודה)
3. Tribunal du travail (בית דין לעבודה) — saisine gratuite pour le salarié

Un avocat en droit du travail peut souvent obtenir un règlement amiable avant procédure.`,
  },
  {
    slug: "bituah-leumi-cotisations",
    title: "Bituah Leumi et assurance santé : que paie-t-on vraiment ?",
    subtitle:
      "Comprendre les cotisations obligatoires retenues sur votre salaire : taux réduit, taux normal, plafond, et ce que ça finance.",
    category: "cotisations",
    emoji: "🏦",
    readingTime: "5 min",
    updatedAt: "2026-04-01",
    keywords: [
      "bituah leumi",
      "assurance nationale israël",
      "mas briut",
      "cotisations salaire israël",
    ],
    relatedSlugs: ["comprendre-sa-fiche"],
    legalSources: [
      {
        label: "Loi sur l'Assurance Nationale 1995 (חוק הביטוח הלאומי)",
        url: "https://www.btl.gov.il",
      },
      {
        label: "Loi sur l'Assurance Santé Nationale 1994 (חוק ביטוח בריאות ממלכתי)",
        url: "https://www.health.gov.il",
      },
    ],
    content: `## Deux cotisations distinctes

Sur votre tlush, deux lignes distinctes apparaissent dans les retenues :

1. **Bituah Leumi (ביטוח לאומי)** — sécurité sociale
2. **Mas Briut (מס בריאות)** — assurance santé

Elles sont **toutes les deux obligatoires** pour tous les salariés résidents israéliens.

## Taux Bituah Leumi (2026)

Deux tranches selon le salaire :

- **Salaire ≤ 7 522 ₪/mois (60 % du salaire moyen)** : taux réduit de **0.4 %**
- **Salaire > 7 522 ₪/mois** : taux normal de **7 %**
- **Plafond assurable** : 50 695 ₪/mois. Au-delà, aucune cotisation supplémentaire.

**Exemple** : pour un salaire de 15 000 ₪ :
- Tranche 1 : 7 522 × 0.4 % = 30 ₪
- Tranche 2 : (15 000 - 7 522) × 7 % = 523 ₪
- **Total BL = 553 ₪**

## Taux Assurance Santé (2026)

- **Salaire ≤ 7 522 ₪** : **3.23 %**
- **Salaire > 7 522 ₪** : **5.2 %**

**Exemple** (15 000 ₪) :
- Tranche 1 : 7 522 × 3.23 % = 243 ₪
- Tranche 2 : (15 000 - 7 522) × 5.2 % = 389 ₪
- **Total santé = 632 ₪**

## Ce que ça finance

### Bituah Leumi finance :
- Allocations chômage (dmei avtala)
- Indemnités maternité et paternité
- Retraite (kitzbat zikna)
- Allocation invalidité
- Allocation enfants
- Indemnités accident du travail
- Pitzuim Bituah Leumi (en cas de faillite d'employeur)

### Mas Briut finance :
- L'accès à une kupat holim (Clalit, Maccabi, Meuhedet, Leumit)
- Médicaments du panier santé (sal briut)
- Hospitalisation, chirurgie, urgences

## Vérifier sur votre tlush

Recherchez les lignes :
- ביטוח לאומי (Bituah Leumi)
- מס בריאות (Mas Briut)

Si les montants sont trop faibles par rapport à votre brut, c'est un signal d'alerte. Utilisez le [simulateur brut→net](/calculateurs/brut-net) pour vérifier.

## Taux cotisés vs. assurables

Attention : le **plafond de 50 695 ₪/mois** ne s'applique qu'à la **partie assurable**. Si vous gagnez 60 000 ₪, vous ne cotisez que sur les premiers 50 695 ₪.

## Différence salarié / indépendant

Les **indépendants (osek murshe / osek patur)** paient un taux combiné (Bituah Leumi + Mas Briut) sensiblement plus élevé : ~16.83 % sur la tranche haute. Voir le [calculateur freelance](/freelance) pour plus de détails.

## En résumé

- BL + santé représentent environ **5 % à 12 %** de votre brut selon le salaire
- Ces cotisations financent vos droits futurs (retraite, chômage, santé)
- Toujours vérifier les montants sur le tlush vs. le simulateur`,
  },
];
