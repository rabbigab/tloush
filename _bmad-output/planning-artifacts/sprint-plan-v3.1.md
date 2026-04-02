# BMAD Sprint Plan — Tloush v3.1 UX Overhaul
# Date: 2026-04-02
# Basé sur: Retours utilisateur post-lancement

---

## Contexte

Retours utilisateur identifiant 3 problèmes majeurs :
1. **Navigation cassée** — L'utilisateur a l'impression de quitter son compte et revenir sur la landing page
2. **Pas de tri par catégorie** — Les documents sont triés uniquement par urgence, pas par catégorie (travail, bituah leumi, impôts, retraite, etc.)
3. **Annuaire d'experts invisible** — La feature existe mais aucun lien dans la navigation principale

---

## Diagnostic

### Problème 1 : Navigation (CRITIQUE)
- **Aucun app shell partagé** — Chaque page (inbox, assistant, dashboard, compare, profile) a son propre header inline
- **Le logo Tloush dans l'inbox pointe vers `/`** (landing page) au lieu de `/inbox`
- **Headers visuellement incohérents** — max-width, padding, style différents sur chaque page
- **Logout redirige vers `/`** au lieu de `/auth/login`
- **Pas de barre de navigation persistante** — L'utilisateur ne sait pas quelles pages existent

### Problème 2 : Catégorisation des documents
- **Seulement 5 types** : payslip, official_letter, contract, tax, other
- **Pas de catégories métier** : bituah leumi, retraite, santé, travail absents
- **Inbox = liste chronologique** sans filtre par catégorie
- **Pas de tabs/filtres** dans l'inbox

### Problème 3 : Annuaire d'experts
- **Aucun lien dans le header** ni dans la navigation de l'app
- **3 experts placeholder** avec données fictives
- **Découverte uniquement** via recommandation contextuelle après upload

---

## Plan d'Implémentation

### Epic A : App Shell & Navigation (CRITIQUE — Sprint 1)

#### Story A.1 — Créer le layout partagé pour l'app authentifiée
**Objectif :** Toutes les pages protégées partagent le même layout (header + navigation)

**Tâches :**
1. Créer un route group `(app)` pour les pages protégées
2. Créer `src/app/(app)/layout.tsx` avec AppShell
3. Créer `src/components/app/AppHeader.tsx` — header unifié
4. Créer `src/components/app/AppNav.tsx` — barre de navigation horizontale (mobile-friendly)
5. Déplacer inbox, assistant, dashboard, compare, profile dans `(app)/`
6. Supprimer les headers inline de chaque ClientComponent

**Navigation items :**
- Inbox (icône Inbox)
- Dashboard (icône LayoutDashboard)
- Assistant (icône MessageSquare)
- Comparer (icône BarChart3)
- Experts (icône Users)
- Profil (icône User)

**Règles :**
- Logo Tloush → pointe vers `/inbox` (pas `/`)
- Logout → redirige vers `/auth/login`
- Page active = surlignée visuellement
- Mobile : navigation bottom bar (tabs en bas de l'écran)
- Desktop : navigation horizontale sous le header

**Critères d'acceptation :**
- Navigation identique sur TOUTES les pages protégées
- L'utilisateur ne voit jamais la landing page tant qu'il est connecté
- Le logo ne redirige jamais vers `/`

#### Story A.2 — Séparer les layouts marketing / app
**Objectif :** La landing page et les pages publiques ont leur propre layout

**Tâches :**
1. Créer un route group `(public)` pour landing, auth, privacy, experts
2. Garder le Header/Footer marketing existant pour ces pages
3. S'assurer que `/auth/login` et `/auth/register` n'utilisent PAS l'app shell

---

### Epic B : Catégorisation des Documents (Sprint 2)

#### Story B.1 — Étendre les types de documents
**Objectif :** Claude détecte des catégories plus précises

**Tâches :**
1. Modifier le prompt Claude dans `/api/documents/upload/route.ts`
2. Ajouter les nouveaux types : `bituah_leumi`, `tax_notice`, `pension`, `health_insurance`, `work_contract`, `rental`, `bank`
3. Ajouter un champ `category` dans le prompt : `travail | securite_sociale | fiscal | retraite | logement | bancaire | autre`
4. Mettre à jour `DOC_LABELS` et `DOC_COLORS` dans InboxClient

**Nouveaux types et labels :**
```
payslip          → 💰 Fiche de paie         (catégorie: travail)
work_contract    → 📋 Contrat de travail    (catégorie: travail)
bituah_leumi     → 🏥 Bituah Leumi         (catégorie: securite_sociale)
tax_notice       → 🧾 Avis d'impôt         (catégorie: fiscal)
pension          → 🏦 Retraite / Pension    (catégorie: retraite)
health_insurance → 🩺 Assurance santé       (catégorie: securite_sociale)
rental           → 🏠 Logement / Bail       (catégorie: logement)
bank             → 🏦 Document bancaire     (catégorie: bancaire)
official_letter  → 📨 Courrier officiel     (catégorie: autre)
contract         → 📋 Contrat              (catégorie: travail)
other            → 📄 Autre document        (catégorie: autre)
```

#### Story B.2 — Ajouter des filtres par catégorie dans l'inbox
**Objectif :** L'utilisateur peut filtrer ses documents par catégorie

**Tâches :**
1. Ajouter une barre de tabs horizontale scrollable au-dessus de la liste
2. Tabs : Tous | Travail | Sécu sociale | Fiscal | Retraite | Logement | Bancaire
3. Chaque tab affiche le nombre de documents
4. Le filtre par catégorie fonctionne avec la recherche texte existante
5. Conserver le tri urgence en haut dans chaque catégorie

**Critères d'acceptation :**
- Par défaut : tab "Tous" sélectionné
- Cliquer sur une catégorie filtre instantanément
- Le compteur de documents par catégorie est à jour
- La recherche texte fonctionne à l'intérieur du filtre actif

#### Story B.3 — Mettre à jour le schema DB (si nécessaire)
**Objectif :** La base de données supporte les nouveaux types

**Tâches :**
1. Vérifier si un ALTER TABLE est nécessaire (le champ `document_type` est TEXT, donc flexible)
2. Ajouter une colonne `category` si on décide d'avoir type + catégorie séparés
3. Mettre à jour le dashboard pour refléter les nouvelles catégories

---

### Epic C : Annuaire d'Experts Visible (Sprint 2)

#### Story C.1 — Intégrer l'annuaire dans la navigation
**Objectif :** Les utilisateurs trouvent facilement l'annuaire

**Tâches :**
1. Ajouter "Experts" dans la navigation AppNav (icône Users)
2. Ajouter un encart "Besoin d'un expert ?" dans le dashboard
3. Ajouter un lien "Consulter un expert" plus visible dans l'inbox (pas juste un petit lien)

#### Story C.2 — Améliorer la page experts pour les vrais experts
**Objectif :** Préparer l'annuaire pour de vrais professionnels

**Tâches :**
1. Ajouter un badge "Bientôt disponible" si pas encore de vrais experts
2. Mettre en avant le formulaire "Rejoindre en tant qu'expert" (/experts/rejoindre)
3. Ajouter des catégories visuelles claires (comptable, avocat, RH, etc.)
4. Préparer le template pour quand les vrais experts arriveront

---

## Priorité et Ordre

```
Sprint 1 (URGENT) — App Shell & Navigation
  → Story A.1 : Layout partagé + navigation
  → Story A.2 : Séparation marketing / app
  
Sprint 2 — Catégorisation + Experts
  → Story B.1 : Nouveaux types de documents
  → Story B.2 : Filtres par catégorie dans l'inbox
  → Story B.3 : Schema DB (si nécessaire)
  → Story C.1 : Experts dans la navigation
  → Story C.2 : Page experts améliorée
```

---

## Contraintes techniques

- Tailwind CSS uniquement (pas de custom CSS)
- Mobile-first : bottom navigation bar sur mobile
- Pas de breaking change sur les données existantes
- Les documents déjà uploadés gardent leur ancien type (rétro-compatible)
- `await createClient()` côté serveur, synchrone côté client
