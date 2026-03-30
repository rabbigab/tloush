// src/data/guides.ts

export type GuideCategory = "conges" | "salaire" | "licenciement" | "cotisations" | "contrat" | "avantages";

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
    subtitle: "Combien de jours vous êtes-vous acquis ? Comment sont-ils calculés ? Que se passe-t-il si vous ne les prenez pas ?",
    category: "conges",
    emoji: "🏖️",
    readingTime: "5 min",
    updatedAt: "2024-04-01",
    keywords: ["congés payés israël", "chofsha", "jours de congé israël", "vacances salarié israël"],
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
    subtitle: "Taux 125 % et 150 %, plafonds légaux, comment réclamer les heures non payées.",
    category: "salaire",
    emoji: "⏰",
    readingTime: "4 min",
    updatedAt: "2024-04-01",
    keywords: ["heures supplémentaires israël", "125% 150% israël", "shabatot israël", "récupération heures sup"],
    relatedSlugs: ["les-conges-payes", "comprendre-sa-fiche"],
    content: `## Définition des heures supplémentaires

En Israël, la journée légale de travail est de **8 heures** (ou 9h dans certains secteurs). La semaine légale est de **43 heures** (5 jours) ou **45 heures** (6 jours).

Toute heure au-delà de ces limites est une heure supplémentaire.

## Taux de majoration

- **2 premières heures supplémentaires** par jour : majorées à **125 %** du salaire normal
- **Heures suivantes** au-delà : majorées à **150 %** du salaire normal

**Exemple :** Vous gagnez 50 ₪/h. Votre 9ème heure de travail vaut 62,50 ₪ (50 × 1,25). Votre 11ème heure vaut 75 ₪ (50 × 1,50).

## Plafond d'heures supplémentaires

La loi limite les heures supplémentaires à **16 heures par semaine** au maximum.

## Vérifier sur votre fiche de paie

Cherchez les lignes :
- שעות נוספות 125 % (she'ot nosafot 125)
- שעות נוספות 150 % (she'ot nosafot 150)

Si vous avez fait des heures supplémentaires mais que ces lignes n'apparaissent pas, c'est un signal d'alerte.

## Que faire si vos heures sup ne sont pas payées ?

1. Documentez vos heures (emails, pointages, témoins)
2. Envoyez une réclamation écrite à votre employeur
3. Consultez un avocat en droit du travail si pas de réponse sous 14 jours
4. Portez plainte à l'Inspection du Travail (מפקח עבודה)`,
  },
  {
    slug: "indemnites-licenciement",
    title: "Les indemniés de licenciement (Pitzuim)",
    subtitle: "Conditions, calcul, délai de versement. Ce que vous êtes en droit de recevoir.",
    category: "licenciement",
    emoji: "💰",
    readingTime: "6 min",
    updatedAt: "2024-04-01",
    keywords: ["indemniés licenciement israël", "pitzuim", "licenciement israël", "fin de contrat israël"],
    relatedSlugs: ["les-conges-payes", "keren-hishtalmut"],
    content: `## Qu'est-ce que le Pitzuim ?

Le Pitzuim (פיצויים) est une indemnié de licenciement obliga toire en Israël. Elle est régie par la Loi sur la protection des salaires et la Loi sur l'indemnié de licenciement (1963).

## Qui y a droit ?

Tout salarié ayant travaillé **au moins 1 an** chez le même employeur, en cas de :
- Licenciement par l'employeur
- Démission pour raison de santé grave
- Démission suite à déménagement de l'employeur
- Décès de l'employé
- Retraite

**En cas de simple démission sans motif valable, vous n'avez en principe pas droit au Pitzuim.**

## Calcul du montant

**Formule :** Salaire mensuel de référence × Nombre d'années d'ancienneté

Le salaire de référence est le dernier salaire mensuel brut (ou la moyenne des 12 derniers mois si votre salaire a varié).

**Exemple :** Vous gagnez 10 000 ₪/mois et avez 5 ans d'ancienneté → Pitzuim = 50 000 ₪

## Délai de versement

Le Pitzuim doit être versé **au plus tard 15 jours** après la fin du contrat. Tout retard donne lieu à des pénalités.

## Le Pitzuim et la pension

Depuis 2008, l'employeur cotise chaque mois à un fonds de pension qui couvre le Pitzuim. Si les cotisations sont complètes, le Pitzuim est prélevé sur ce fonds. Sinon, l'employeur complète la différence.`,
  },
  {
    slug: "keren-hishtalmut",
    title: "La Keren Hishtalmut — tout comprendre",
    subtitle: "Un avantage souvent méconnu qui peut valoir des milliers de shekels. Êtes-vous concerné ?",
    category: "avantages",
    emoji: "🎓",
    readingTime: "5 min",
    updatedAt: "2024-04-01",
    keywords: ["keren hishtalmut", "קרן השתלמות", "formation israël", "épargne salarié israël"],
    relatedSlugs: ["indemnites-licenciement", "comprendre-sa-fiche"],
    content: `## Qu'est-ce que la Keren Hishtalmut ?

La Keren Hishtalmut (קרן השתלמות) est un fonds d'épargne-formation spécifique à Israël. Il est alimenté conjointement par l'employeur et le salarié, et permet à ce dernier de disposer d'une épargne disponible après 6 ans (ou disponible à tout moment pour la formation).

## Qui y a droit ?

La Keren Hishtalmut n'est **pas obligatoire par la loi**, mais elle est souvent imposée par :
- Les conventions collectives sectorielles (tzavei harchava)
- Les accords d'entreprise
- Les contrats individuels

En pratique, la grande majorité des employés du secteur privé y ont droit après une période d'essai (généralement 3 à 6 mois).

## Taux de cotisation

| Partie | Taux standard |
|---|---|
| Employeur | 7,5 % du salaire |
| Salarié | 2,5 % du salaire |

Ces taux varient selon la convention collective applicable.

## Avantages fiscaux

Les cotisations de l'employeur à la Keren Hishtalmut sont **exonérées d'impôt** jusqu'à un plafond annuel. C'est un avantage fiscal très intéressant.

## Quand peut-on retirer les fonds ?

- **Après 6 ans** : retrait libre, exonéré d'impôt
- **Avant 6 ans** : uniquement pour la formation professionnelle
- **En cas de retrait anticipé hors formation** : imposition normale

## Si votre employeur ne cotise pas

Commencez par vérifier votre contrat et la convention collective de votre secteur. Si vous y avez droit et que l'employeur ne cotise pas, c'est une infraction. Consultez un avocat ou l'Inspection du Travail.`,
  },
  {
    slug: "salaire-minimum",
    title: "Le salaire minimum en Israël",
    subtitle: "Montants légaux 2024, calcul pour les temps partiels, recours si vous êtes sous le minimum.",
    category: "salaire",
    emoji: "💵",
    readingTime: "3 min",
    updatedAt: "2024-04-01",
    keywords: ["salaire minimum israël 2024", "schar minimum israël", "smig israël"],
    relatedSlugs: ["heures-supplementaires", "comprendre-sa-fiche"],
    content: `## Montants en vigueur (depuis le 1er avril 2024)

| Type | Montant |
|---|---|
| Salaire minimum mensuel | 5 880 ₪ brut |
| Salaire minimum horaire | 32,30 ₪ brut |
| Salaire minimum journalier (6h/j) | 193,80 ₪ brut |

Ces montants sont révisés périodiquement par le gouvernement.

## Qui est concerné ?

Tous les salariés en Israël, qu'ils soient employés à temps plein, à temps partiel, en CDD ou CDI.

## Calcul pour un temps partiel

Si vous travaillez à mi-temps (50 %), votre salaire minimum est de 2 940 ₪ (50 % de 5 880).

**Le calcul se fait au prorata des heures travaillées**, pas en proportion fixe.

## Que faire si vous êtes sous le minimum ?

1. Vérifiez votre fiche de paie : salaire brut, heures travaillées
2. Calculez votre taux horaire réel
3. Si inférieur à 32,30 ₪/h, contactez votre employeur par écrit
4. Portez plainte à l'Inspection du Travail si pas de correction

L'employeur qui verse moins que le minimum légal est passible d'amendes et doit rembourser le différentiel avec intérêts.`,
  },
  {
    slug: "comprendre-sa-fiche",
    title: "Comprendre sa fiche de paie israélienne",
    subtitle: "Glossaire complet hébreu-français de toutes les lignes de votre bulletin de salaire.",
    category: "salaire",
    emoji: "🧾",
    readingTime: "7 min",
    updatedAt: "2024-04-01",
    keywords: ["fiche de paie israël", "bulletin salaire israël", "comprendre salaire israël", "hébreu salaire"],
    relatedSlugs: ["heures-supplementaires", "keren-hishtalmut", "salaire-minimum"],
    content: `## Les grandes sections de votre fiche de paie

Une fiche de paie israélienne (תלוש שכר) est divisée en plusieurs parties.

## Section : Revenus (הכנסות / Hakhnasot)

| Hébreu | Translittération | Signification |
|---|---|---|
| שכר בסיס | Schar basis | Salaire de base |
| שכר גלובאלי | Schar globali | Salaire global (tout inclus) |
| שעות נוספות 125% | She'ot nosafot 125% | Heures sup à 125% |
| שעות נוספות 150% | She'ot nosafot 150% | Heures sup à 150% |
| דמי חופשה | Dmei chofsha | Prime de vacances |
| החזר הוצאות נסיעה | Hahzarat hotza'ot nesia | Remboursement transport |

## Section : Cotisations employé (ניכויים / Nikuyim)

| Hébreu | Translittération | Signification |
|---|---|---|
| ביטוח לאומי | Bituah Leumi | Sécurité sociale |
| מס הכנסה | Mas Hachnasa | Impôt sur le revenu |
| קרן פנסיה | Keren Pansiya | Fonds de pension (part salarié) |
| קרן השתלמות | Keren Hishtalmut | Fonds de formation (part salarié) |

## Section : Cotisations employeur

| Hébreu | Translittération | Signification |
|---|---|---|
| הפרשת מעסיק לפנסיה | Hafrashat ma'asik l'pansiya | Cotisation employeur pension |
| הפרשת מעסיק לקרן השתלמות | Hafrashat ma'asik KH | Cotisation employeur Keren Hishtalmut |
| פיצויים | Pitzuim | Provision indemnié de licenciement |

## Soldes importants en bas de fiche

| Hébreu | Signification |
|---|---|
| שכר ברוטו | Salaire brut total |
| סך ניכויים | Total des déductions |
| שכר נטו | Salaire net à percevoir |
| יתרת חופשה | Solde de congés restants |
| יתרת הבראה | Solde de jours maladie |`,
  },
];
