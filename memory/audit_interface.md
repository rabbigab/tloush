# Audit interface — Chantier 1

Date : 2026-04-16
Source : inventaire exhaustif de la navigation (`Header`, `Footer`, `AppNav`, `middleware`, `sitemap`) et des pages `src/app/*`.

---

## 1. Inventaire complet des outils

### 1.1 Pages publiques

| Route | Nom affiché | Fonction principale | Emplacement nav |
|---|---|---|---|
| `/` | Accueil | Landing : hero, features, FAQ, CTA inscription. | Logo Header |
| `/pricing` | Tarifs | Plans Free / Solo / Famille. | Header |
| `/scanner` | Scanner (Analyser un document) | Upload + analyse IA d'un document (auto-détection 11 types depuis PR C). | Footer + CTA Header |
| `/calculateurs` | Calculateurs | Hub galerie des calculateurs. | Header |
| `/calculateurs/brut-net` | Simulateur Brut→Net | Gross-to-net salarié. | Hub |
| `/calculateurs/conges` | Solde congés | Jours de congés par ancienneté. | Hub |
| `/calculateurs/indemnites` | Indemnités (Pitzuim) | Calcul pitzuim loi 1963. | Hub |
| `/calculateurs/maternite` | Congé maternité | Durée + allocations BL. | Hub |
| `/droits` | Guides des droits | Catalogue de guides éducatifs (congés, salaire, licenciement). | — (pas en nav) |
| `/droits/[slug]` | Guide détaillé | Contenu d'un guide spécifique. | — |
| `/droits-olim` | Droits olim | Questionnaire multi-étapes pour identifier aides olim. | Header |
| `/modeles` | Modèles de lettres | Galerie de templates (lettres, contrats). | Footer |
| `/modeles/[slug]` | Modèle détaillé | Visualisation + téléchargement. | — |
| `/experts` | Experts (landing) | Landing publique + waitlist experts. | — |
| `/annuaire` | Annuaire Tloush Recommande | Répertoire prestataires francophones par catégorie. | Header |
| `/annuaire/[category]` | Annuaire par catégorie | Plombier, électricien, peintre, serrurier, climatisation, bricoleur. | — |
| `/annuaire/[category]/[slug]` | Fiche prestataire | Détail d'un prestataire. | — |
| `/annuaire/inscription` | Inscription prestataire | Formulaire candidature. | — |
| `/a-propos` | À propos | Présentation. | Footer |
| `/faq` | FAQ | Questions fréquentes. | Footer |
| `/contact` | Contact | Formulaire. | Footer |
| `/aide` | Centre d'aide | Documentation publique. | — |
| `/privacy` | Confidentialité | RGPD. | Header + Footer |
| `/cgv` | CGV | Conditions générales. | Footer |
| `/mentions-legales` | Mentions légales | Éditeur, hébergeur, DPO. | Footer |
| `/immobilier` | Immobilier (en construction) | Landing "coming soon", `noindex`. | — |
| `/auth/login` | Connexion | — | Header |
| `/auth/register` | Inscription | — | — |
| `/auth/forgot-password` | Mot de passe oublié | — | — |
| `/auth/reset-password` | Réinitialisation | — | — |

### 1.2 Pages authentifiées (zone `src/app/(app)/`)

| Route | Nom affiché | Fonction principale | Emplacement AppNav |
|---|---|---|---|
| `/dashboard` | Dashboard | Home auth : docs récents, alertes, graphique paie, dépenses. | Core |
| `/inbox` | Mon espace | Entry point post-login (alias du dashboard ?). | Logo |
| `/folders` | Mes documents | Gestion des dossiers de docs. | Core |
| `/documents/[id]` | Détail document | Vue analyse d'un document. | — (lien depuis folders) |
| `/scanner` (zone auth ?) | Scanner | Probable redirection vers `/scanner` public. | — |
| `/expenses` | Dépenses | Suivi mensuel + tendances. | Core |
| `/assistant` | Assistant IA | Questions FR sur docs (Claude). | Core |
| `/search` | Recherche | Moteur interne. | Icône Header |
| `/profile` | Mon profil | Infos perso, notifications, data. | Secondary |
| `/profile/edit` | Éditer profil | Formulaire. | — |
| `/family` | Ma famille | Situation familiale (enfants). | More (mobile) |
| **Calculateurs** | | | Dropdown "Outils" |
| `/calculator` | Simulateur salaire | **Redirection 307** → `/calculateurs/brut-net` (legacy). | Dropdown |
| `/freelance` | Freelance | Osek Patur vs Murshe. | Dropdown |
| `/compare` | Comparer tlushs | Comparateur fiches de paie. | Dropdown |
| `/payslips` | Mes fiches de paie | Liste historique. | — |
| `/payslips/annual` | Évolution annuelle | Synthèse annuelle paie. | Dropdown |
| **Droits & Infos** | | | Dropdown "Outils" |
| `/rights-detector` | Détecter aides | Scan profil → aides applicables (catalogue 125 entrées). | Dropdown |
| `/rights-check` | Droits salarié | Vérifier droits salarié. | Dropdown |
| `/droits-olim` | Droits olim | *(réutilise la page publique)* | Dropdown |
| `/miluim` | Miluim | Suivi réserve + compensation BL. | Dropdown |
| `/bituach-leumi` | Bituach Leumi | Analyse cotisations BL. | Dropdown |
| `/assurances` | Assurances | Catalogue / comparaison. | Dropdown |
| `/letters` | Courriers | Bibliothèque de lettres modèles. | Dropdown |
| **Finances** | | | Dropdown "Outils" |
| `/tax-refund` | Remboursement impôts | Estimateur refund fiscal. | Dropdown |
| `/mashkanta` | Mashkanta | Simulateur prêt immobilier. | Dropdown |
| `/bank-import` | Import bancaire | Import d'extraits. | Dropdown |
| **Autres** | | | Dropdown "Outils" |
| `/referral` | Parrainage | Programme referral. | Dropdown |
| `/help` | Aide | Centre d'aide auth. | Dropdown |
| `/experts` (auth ?) | Experts | Annuaire experts (landing ou réutilisation ?). | Secondary |
| `/experts/rejoindre` | Devenir expert | Formulaire inscription expert. | — |
| `/annuaire` | Annuaire | *(réutilise la page publique)* | Secondary |

### 1.3 Zone admin (pas dans nav utilisateur)

| Route | Fonction |
|---|---|
| `/admin` | Dashboard admin |
| `/admin/monitoring` | Supervision perf |
| `/admin/benefits-catalog` | Gestion catalogue aides |
| `/admin/legal-watch` | Veille légale |

---

## 2. Doublons à fusionner

### D1. `/rights-check` ⇄ `/rights-detector` — **doublon conceptuel critique**

Deux routes authentifiées aux noms quasi identiques :
- `rights-detector` : scan profil automatique → aides (catalogue de 125 entrées, moteur `src/lib/rightsDetector.ts`).
- `rights-check` : "vérificateur de droits salarié" (formulaire manuel, utilise `src/lib/employeeRights.ts`).

**Problème** : le nom ne distingue pas le périmètre (`aides publiques` vs `droits du travail`). Les utilisateurs n'ont aucune raison intuitive de choisir l'un plutôt que l'autre.

**Fusion proposée** : soit unifier sous un seul outil multi-onglets (onglet *Aides publiques* / onglet *Droits du travail*), soit renommer explicitement (cf. §4).

### D2. `/calculator` (auth) → `/calculateurs/brut-net` (public) — **legacy à purger**

`/calculator` est une redirection 307 vers `/calculateurs/brut-net`. Aucune logique propre. Déjà signalé comme legacy dans `docs/audits/technical-mapping.md` #17.

**Fusion proposée** : supprimer le dossier `/(app)/calculator/`, mettre à jour tous les liens internes vers `/calculateurs/brut-net`.

### D3. `/(app)/documents` (route sans `[id]`) — **redirection vide**

La page `/(app)/documents/page.tsx` n'existe pas ou redirige vers `/dashboard`. Seul `/(app)/documents/[id]/page.tsx` est utile (détail).

**Fusion proposée** : supprimer l'entrée `/documents` dans `middleware.ts` PROTECTED_ROUTES si la route parente n'existe pas, OU créer une vraie page d'index.

### D4. `/aide` (public) ⇄ `/(app)/help` (auth) — **doublons de contenu**

Deux centres d'aide distincts, contenus potentiellement dupliqués. Pas de raison fonctionnelle claire de séparer.

**Fusion proposée** : garder `/aide` comme source unique, supprimer `/(app)/help` (ou y rediriger).

### D5. `/modeles` (public) ⇄ `/(app)/letters` (auth) — **bibliothèques redondantes**

- `/modeles` : galerie publique de modèles (lettres, contrats).
- `/(app)/letters` : bibliothèque auth de lettres modèles.

**Problème** : même fonction, deux zones. Un utilisateur auth ne sait pas lequel utiliser.

**Fusion proposée** : garder `/modeles` en public, `/(app)/letters` devient un alias/raccourci qui liste uniquement les modèles avec auto-remplissage depuis le profil auth. Ou alors fusion pure.

### D6. `/(app)/inbox` ⇄ `/(app)/dashboard` — **entry point ambigu**

Le Header auth pointe le logo sur `/inbox`. Le Core AppNav contient "Dashboard" sur `/dashboard`. Les deux sont marqués PROTECTED_ROUTES. Il n'est pas clair lequel est l'accueil canonique post-login.

**Fusion proposée** : choisir un des deux comme unique landing page auth. Supprimer l'autre ou le transformer en redirection.

---

## 3. Redondances à réorganiser

### R1. Trois outils "droits" aux périmètres flous

| Route | Périmètre effectif |
|---|---|
| `/droits` | Guides éducatifs statiques (Markdown) |
| `/droits-olim` | Questionnaire olim (aides publiques olim) |
| `/(app)/rights-detector` | Scan profil → aides publiques (catalogue 125) |
| `/(app)/rights-check` | Droits du travail salarié (formulaire) |

**Problèmes** :
- `droits-olim` fait doublon partiel avec `rights-detector` pour le sous-ensemble olim.
- `droits` (guides) n'est pas lié aux outils dynamiques : un utilisateur qui lit "Guide congés" ne sait pas qu'il peut scanner son profil ou vérifier ses droits.
- Aucune nav hiérarchique cohérente entre les 4.

**Réorganisation proposée** :
- **Un seul hub** `/droits` public qui regroupe :
  - *Guides éducatifs* (existant `/droits/[slug]`).
  - *Détecter mes aides* → lien vers `rights-detector` (auth).
  - *Droits salarié* → lien vers `rights-check` (auth).
  - *Aides olim spécifiques* → lien vers `droits-olim`.
- Dans AppNav, un seul dropdown "Droits" pointant vers les 4 outils ci-dessus (au lieu de "Droits & Infos" qui mélange aussi Miluim/BL/Assurances).

### R2. BL éparpillé sur 3 outils

| Route | Usage BL |
|---|---|
| `/(app)/bituach-leumi` | Simulation cotisations BL (salarié ou indépendant). |
| `/calculateurs/maternite` | Allocations maternité payées par BL. |
| `/(app)/miluim` | Compensation miluim payée par BL. |

**Pas un vrai doublon** (angles différents : cotisations / allocations famille / miluim), mais découverte difficile : trois endroits pour "parler à BL" sans vue consolidée.

**Réorganisation proposée** : hub `/(app)/bituach-leumi` avec onglets *Cotisations* / *Allocations famille* / *Miluim* / *Indemnités chômage*. Les calculateurs dédiés restent atteignables directement mais sont aussi réexposés dans le hub.

### R3. Annuaire multiple

| Route | Fonction |
|---|---|
| `/annuaire` | Annuaire Tloush Recommande (prestataires maison). |
| `/experts` (public) | Landing experts (waitlist). |
| `/(app)/experts` | Annuaire d'experts côté auth (actuellement incertain). |
| `/(app)/experts/rejoindre` | Inscription expert. |

**Problème** : deux annuaires distincts (prestataires maison vs professionnels), noms voisins. Un utilisateur ne sait pas si un comptable est dans `/annuaire` ou `/experts`.

**Réorganisation proposée** :
- Conserver la distinction mais **renommer** :
  - `/annuaire` → `/annuaire/artisans` ou label "Artisans / Bricolage".
  - `/experts` → `/annuaire/professionnels` ou label "Professionnels (comptable, avocat, etc.)".
- Un hub `/annuaire` qui fait la découverte.

### R4. Nav publique ne reflète pas la réalité des outils

Le Header public ne liste que : Annuaire, Droits olim, Calculateurs, Tarifs, Confidentialité.
Pages existantes mais **absentes du Header** : `/scanner`, `/droits`, `/modeles`, `/freelance`, `/mashkanta`, `/contact`, `/a-propos`, `/faq`.

**Problème** : le CTA "Analyser un document" pointe vers `/inbox` (auth) alors que `/scanner` public existe. Mauvaise découverte.

**Réorganisation proposée** :
- Ajouter `Scanner` au Header public (c'est le produit phare, PR A/B/C Chantier 4).
- Regrouper `Droits olim` + `Droits` sous un unique lien `Droits` (cf. R1).
- Déplacer `Confidentialité` depuis Header → Footer (n'a rien à faire en nav principale).

### R5. Dropdown "Outils" trop chargé (15 entrées)

AppNav dropdown "Outils" regroupe 4 sous-sections (Calculateurs / Droits & Infos / Finances / Autres) pour 15 entrées. Plus d'entrées que d'items Core (4).

**Réorganisation proposée** : éclater en 3 dropdowns distincts au lieu d'un seul gigantesque :
- *Calculateurs* (brut-net, freelance, comparer, évolution, maternité, pitzuim, congés).
- *Mes droits* (rights-detector, rights-check, droits-olim, bituach-leumi, miluim).
- *Finances* (tax-refund, mashkanta, bank-import, assurances, expenses).

---

## 4. Suggestions de renommage

### Noms ambigus / trop proches

| Actuel | Problème | Suggéré |
|---|---|---|
| `rights-detector` | "Détecter" vague, pas clair vs rights-check | `Détecter mes aides` (UI) — slug `/aides` |
| `rights-check` | Idem, verbe "check" non différentiant | `Droits du travail` (UI) — slug `/droits-travail` |
| `letters` | Anglicisme, ambigu (courriers ou modèles ?) | `Modèles de courriers` — slug `/courriers-modeles` |
| `inbox` | Suggère une messagerie, mais c'est en fait l'accueil auth | `Accueil` — slug `/dashboard` unique |
| `folders` | Anglicisme, incohérent avec "Mes documents" affiché | `Mes documents` — slug `/documents` |
| `compare` | "Comparer" quoi ? | `Comparer mes fiches de paie` — slug `/compare-tlushs` |
| `help` | Doublon `/aide` | → fusion (D4) |

### Chemins incohérents

- **Singulier vs pluriel** : `/calculateurs` (pluriel, hub) vs `/calculator` (singulier, legacy). Harmoniser en pluriel partout, supprimer la version singulier.
- **FR vs EN** : `/folders`, `/letters`, `/help`, `/inbox`, `/search`, `/referral`, `/assistant`, `/bank-import`, `/tax-refund`, `/rights-detector`, `/rights-check` sont en anglais ; `/calculateurs`, `/droits`, `/droits-olim`, `/modeles`, `/annuaire`, `/aide`, `/pricing` (anglais), `/experts` sont mixés. Produit francophone → **standardiser en FR** pour les slugs user-facing.

---

## 5. Outils potentiellement obsolètes

Détectables automatiquement dans le code :

| Route | Signal d'obsolescence |
|---|---|
| `/(app)/calculator/page.tsx` | Redirection 307 uniquement, pas de contenu (signalé audit #17). |
| `/(app)/documents/page.tsx` (index) | Page racine vide ou redirect. |
| `/immobilier` | Landing "coming soon", `noindex`, masqué de sitemap (audit #11). |
| `/(app)/experts/page.tsx` | Contenu incertain (peut être doublon de `/experts` public). |
| `/(app)/help/page.tsx` | Doublon supposé de `/aide`. |

**Non détectables sans analytics** : `/(app)/referral`, `/(app)/assurances`, `/(app)/bank-import`, `/(app)/search` — vérifier PostHog pour usage réel.

---

## 6. Synthèse priorisée

### P0 — Nettoyage immédiat (low risk, high clarity)

1. **Supprimer `/calculator` (redirect legacy)** — remplacer tous les liens internes par `/calculateurs/brut-net`.
2. **Supprimer ou créer `/documents` index** — choisir entre supprimer la route (nettoyer middleware) ou créer une vraie page.
3. **Fusionner `/aide` et `/(app)/help`** — garder `/aide` en public unique.
4. **Déplacer `Confidentialité` Header → Footer uniquement**.

### P1 — Clarification conceptuelle (impact UX fort)

5. **Renommer `rights-detector` / `rights-check`** vers des noms distincts et FR (cf. §4).
6. **Fusionner ou hiérarchiser `/droits` / `/droits-olim` / `rights-detector` / `rights-check`** sous un hub unique.
7. **Ajouter `/scanner` au Header public** (CTA pointe déjà vers produit phare).
8. **Harmoniser les 2 annuaires** (`/annuaire` prestataires vs `/experts` professionnels) : renommer ou regrouper.

### P2 — Réorganisation navigation

9. **Éclater le dropdown "Outils"** en 3 dropdowns thématiques.
10. **Clarifier entry point auth** (`/inbox` vs `/dashboard`) — en choisir un canonique.
11. **Standardiser les slugs en FR** pour `/folders`, `/letters`, `/help`, `/inbox`, `/referral`, `/compare`, `/tax-refund`, `/rights-*`, `/bank-import`.

---

**Fin du rapport.** Aucune modification effectuée — rapport uniquement.
