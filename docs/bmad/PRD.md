# Tloush V3 — Product Requirements Document (PRD)

> Version: 3.0
> Date: 2026-04-04
> Statut: Approuve

---

## 1. Vision produit

### Avant (V1-V2)
> "Tloush aide les francophones en Israel a comprendre leurs documents en hebreu."

### Maintenant (V3)
> "Tloush est le copilote administratif et financier des francophones en Israel. Il aide a comprendre, verifier, suivre et agir sur les documents importants de la vie quotidienne."

### Proposition de valeur
Tloush ne se limite pas a expliquer un document. Il :
- **Detecte** les points suspects, anomalies et risques
- **Alerte** avant les echeances et les problemes
- **Suit** les sujets dans le temps (dossiers vivants)
- **Guide** vers les bonnes actions et les bons professionnels
- **Surveille** les depenses recurrentes sans integration bancaire

### Killer Promise
> "Tloush repere ce que tu ne vois pas : erreurs, risques, echeances oubliees et argent que tu peux economiser."

---

## 2. Utilisateur cible

### Persona principal
- **Olim francophone** (immigrant francais/francophone en Israel)
- Age : 25-55 ans
- Niveau d'hebreu : debutant a intermediaire
- Frustration principale : ne comprend pas ses documents administratifs
- Besoin : securite, controle, ne pas perdre d'argent ni de droits

### Cas d'usage principaux
1. Recevoir une fiche de paie et comprendre chaque ligne
2. Recevoir un courrier officiel et savoir quoi faire
3. Verifier un contrat de travail ou de location
4. Suivre ses depenses recurrentes (arnona, internet, electricite)
5. Ne pas oublier une echeance importante
6. Comparer ses fiches de paie mois apres mois

---

## 3. Architecture fonctionnelle V3

### 3.1 Pilier 1 — Comprehension (existe)
- Upload de document (PDF, image)
- OCR + analyse IA (Claude Sonnet)
- Resultat structure en francais
- 11 types de documents supportes

### 3.2 Pilier 2 — Detection et alertes (a ameliorer)
- Points a verifier avec niveaux (vert/orange/rouge)
- Actions recommandees
- Echeances detectees automatiquement
- Alertes email (urgence + rappel deadline)
- Detection anomalies (variation montant, clause a risque)

### 3.3 Pilier 3 — Suivi et continuite (nouveau)
- Dossiers vivants (grouper documents par sujet)
- Historique complet avec statuts
- Actions a faire avec checkbox
- Timeline par dossier

### 3.4 Pilier 4 — Pilotage financier (nouveau)
- Scan de factures, tickets de caisse, releves
- Extraction : fournisseur, montant, date, recurrence
- Tableau des depenses recurrentes
- Detection anomalies ("ta facture X a augmente de 30%")
- Assistant contextuel sur les depenses
- Types : arnona, electricite, internet, telephone, assurance, loyer, etc.

### 3.5 Pilier 5 — Assistant intelligent (existe, a enrichir)
- Chat contextuel relie aux documents
- Questions sur les depenses
- Orientation vers experts si necessaire
- Connaissance de l'historique utilisateur

---

## 4. Plans et tarification

### 4.1 Quotas revises (avec scan factures)

| | Gratuit | Solo 39 ILS | Famille 89 ILS |
|---|---------|------------|----------------|
| Documents/mois | 5 | 50 | 150 |
| Messages assistant | 15 | illimite (fair use) | illimite (fair use) |
| Historique | 30 jours | illimite | illimite |
| Rappels echeances | - | oui | oui |
| Suivi depenses | - | oui | oui |
| Comparaison docs | - | oui | oui |
| Dossiers vivants | - | oui | oui |
| Dashboard complet | - | oui | oui |
| Recap hebdo email | - | oui | oui |
| Membres famille | 1 | 1 | 5 |
| Essai gratuit | 60 jours | - | - |

### 4.2 Justification de l'augmentation des quotas

Avec l'ajout du scan de factures/tickets de caisse, les utilisateurs vont scanner plus :
- **Avant** : 2-3 docs administratifs par mois
- **Maintenant** : 2-3 docs admin + 5-15 factures/tickets par mois

Augmentations :
- Gratuit : 3 -> 5 (permet de tester le scan de factures)
- Solo : 30 -> 50 (marge suffisante pour admin + factures mensuelles)
- Famille : 100 -> 150 (5 personnes x ~30 docs)

### 4.3 Impact sur les couts

| Plan | Docs/mois | Cout IA | Cout stockage/mois | Revenu | Marge |
|------|-----------|---------|-------------------|--------|-------|
| Gratuit | 5 | ~$0.05 | ~2.5 MB | 0 ILS | -$0.05 |
| Solo | 50 | ~$0.50 | ~25 MB | ~$10.50 | ~$10/mois |
| Famille | 150 | ~$1.50 | ~75 MB | ~$24 | ~$22.50/mois |

**Verdict : toujours tres viable.** Le cout marginal par document est negligeable (~$0.01).

### 4.4 Presentation pricing (valeur percue, pas quotas)

**Page pricing — ce qu'on affiche :**

#### Gratuit
- Decouvrez Tloush
- Analysez vos premiers documents
- Assistant IA limite
- Historique 30 jours

#### Solo 39 ILS/mois
- Analyse complete de tous vos documents
- Suivi de vos depenses recurrentes
- Rappels automatiques avant les echeances
- Comparaison de documents dans le temps
- Recapitulatif hebdomadaire personnalise
- Assistant personnel intelligent
- Historique complet et securise
- Detection des anomalies et points a verifier

#### Famille 89 ILS/mois
- Tout Solo, plus :
- Jusqu'a 5 membres
- Tous les documents de la famille
- Suivi global (travail, logement, administratif, finances)
- Historique partage
- Le copilote administratif de toute la famille

**Les quotas techniques (50 docs, 150 docs) restent dans les CGV, pas sur la page pricing.**

---

## 5. Ce que Tloush peut promettre

### Avec confiance
- Explication claire de documents en hebreu
- Detection de champs manquants, incoherences visibles
- Extraction de montants, dates, echeances
- Suivi des depenses recurrentes
- Rappels d'echeances
- Comparaison dans le temps (meme fournisseur/employeur)

### Avec prudence (formulation "a verifier")
- "Ce montant semble inhabituel"
- "Cette clause merite verification"
- "Il pourrait manquer tel element"
- "Anomalie potentielle detectee"

### Ce que Tloush ne promet PAS
- Audit juridique definitif
- Calcul exact de droits
- Remplacement d'un comptable/avocat
- Certitude sur les trop-percus
- Conseil fiscal ou juridique

---

## 6. Stack technique

| Composant | Technologie |
|-----------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Auth | Supabase Auth (email + Google OAuth PKCE) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (bucket prive, RLS) |
| IA | Claude Sonnet 4.5 (analyse + chat) |
| Paiements | Stripe (subscriptions + webhooks) |
| Email | Resend (transactionnel + digest) |
| Analytics | PostHog |
| Monitoring | Sentry |
| Hosting | Vercel |
| Rate Limit | Upstash Redis |

---

## 7. Metriques de succes

### Phase lancement
- % visiteurs qui cliquent "Analyser"
- % upload termine
- % lecture du resultat
- Taux de creation de compte
- Retention J7

### Phase croissance
- Taux conversion gratuit -> payant
- NPS utilisateur
- Nombre docs scannes/utilisateur/mois
- Frequence d'usage (visites/semaine)
- Churn rate mensuel
