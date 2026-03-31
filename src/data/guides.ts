// src/data/guides.ts

export type GuideCategory =
  | "conges"
  | "salaire"
  | "licenciement"
  | "cotisations"
  | "contrat"
  | "avantages";

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
];
