// src/data/experts.ts

export type ExpertSpecialty =
  | "droit-travail"
  | "comptabilite"
  | "rh"
  | "fiscalite"
  | "creation-entreprise";

export interface Expert {
  slug: string;
  name: string;
  title: string;
  specialties: ExpertSpecialty[];
  city: string;
  photo: string;
  bio: string;
  languages: string[];
  email: string;
  website?: string;
  phone?: string;
  tarif?: string;
  featured: boolean;
  active: boolean;
}

export const SPECIALTY_LABELS: Record<ExpertSpecialty, string> = {
  "droit-travail": "Droit du travail",
  "comptabilite": "Comptabilité",
  "rh": "Ressources humaines",
  "fiscalite": "Fiscalité",
  "creation-entreprise": "Création d'entreprise",
};

export const experts: Expert[] = [
  {
    slug: "exemple-avocat-francophone",
    name: "Me David Lévy",
    title: "Avocat en droit du travail",
    specialties: ["droit-travail"],
    city: "Tel Aviv",
    photo: "/images/experts/placeholder.svg",
    bio: "Spécialisé dans le droit du travail israélien depuis plus de 15 ans, Me Lévy accompagne les salariés francophones dans leurs litiges avec leurs employeurs : licenciements abusifs, réclamations salariales, harcèlement au travail. Il parle couramment le français et comprend les spécificités des olim hadashim.",
    languages: ["Français", "Hébreu", "Anglais"],
    email: "contact@tloush.com",
    website: "https://example.com",
    tarif: "À partir de 600 ₪ / consultation",
    featured: true,
    active: true,
  },
  {
    slug: "exemple-comptable-francophone",
    name: "Rachel Mizrahi",
    title: "Expert-comptable agréée",
    specialties: ["comptabilite", "fiscalite"],
    city: "Haïfa",
    photo: "/images/experts/placeholder.svg",
    bio: "Experte en comptabilité et fiscalité israélienne, Rachel accompagne les salariés et indépendants francophones dans la compréhension de leur bulletin de salaire, l'optimisation fiscale et la déclaration annuelle. Spécialiste du Tofes 106 et des cotisations sociales.",
    languages: ["Français", "Hébreu"],
    email: "contact@tloush.com",
    tarif: "À partir de 400 ₪ / consultation",
    featured: true,
    active: true,
  },
  {
    slug: "exemple-conseiller-rh",
    name: "Nathalie Cohen",
    title: "Consultante RH",
    specialties: ["rh", "droit-travail"],
    city: "Jérusalem",
    photo: "/images/experts/placeholder.svg",
    bio: "Consultante RH avec 10 ans d'expérience dans des entreprises israéliennes et internationales, Nathalie aide les salariés francophones à comprendre leur contrat de travail, négocier leurs conditions et connaître leurs droits. Elle intervient aussi en médiation employeur-salarié.",
    languages: ["Français", "Hébreu", "Anglais"],
    email: "contact@tloush.com",
    tarif: "À partir de 350 ₪ / consultation",
    featured: false,
    active: true,
  },
];
