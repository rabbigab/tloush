---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-context.md'
status: 'complete'
---

# Epics & Stories — Tloush v3

**Date :** 2026-04-02
**Basé sur :** PRD v1.0 + Architecture v1.0

---

## Inventaire des Exigences Couvertes

### Exigences Fonctionnelles

| ID | Titre | Epic |
|----|-------|------|
| FR-AUTH-01 à 05 | Authentification complète | Epic 1 ✅ |
| FR-UPLOAD-01 à 05 | Upload + analyse | Epic 1 ✅ |
| FR-INBOX-01 à 05 | Inbox documentaire | Epic 1 ✅ |
| FR-ASSISTANT-01 à 06 | Assistant contextuel | Epic 1 ✅ |
| FR-PROFILE-01 à 04 | Profil utilisateur | Epic 2 |
| FR-DIGEST-01 à 03 | Résumé hebdomadaire | Epic 3 |
| —  | Abonnement / Paywall | Epic 4 |
| —  | Dashboard & Recherche | Epic 5 |

---

## Vue d'Ensemble des Epics

| Epic | Titre | Phase | Statut |
|------|-------|-------|--------|
| **E1** | Foundation MVP | Phase 1 | ✅ COMPLET |
| **E2** | Compte Utilisateur & RGPD | Phase 2 | 🔲 À faire |
| **E3** | Engagement & Digest Email | Phase 2 | 🔲 À faire |
| **E4** | Monétisation (Abonnement) | Phase 2 | 🔲 À faire |
| **E5** | Dashboard & Recherche | Phase 2 | 🔲 À faire |
| **E6** | WhatsApp & Expansion | Phase 3 | 🔲 Vision |

---

## Epic 1 : Foundation MVP ✅

**Objectif :** Permettre à un francophone de créer un compte, uploader un document administratif israélien, recevoir une analyse en français, et poser des questions à un assistant IA.

**Statut :** COMPLET (code livré en session précédente)

### Story 1.1 — Authentification ✅

**En tant qu'** utilisateur non connecté,
**je veux** créer un compte et me connecter,
**afin de** pouvoir accéder à mon inbox personnel et sécurisé.

**Critères d'Acceptation :**
- Étant donné que je suis sur `/auth/register`, quand je soumets un email valide et un mot de passe de 8+ caractères, alors je reçois un email de confirmation
- Étant donné que j'ai confirmé mon email, quand je me connecte sur `/auth/login`, alors je suis redirigé vers `/inbox`
- Étant donné que je ne suis pas connecté, quand j'accède à `/inbox` ou `/assistant`, alors je suis redirigé vers `/auth/login`

**Fichiers implémentés :** `src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`, `src/app/auth/callback/route.ts`, `src/middleware.ts`

---

### Story 1.2 — Upload et Analyse de Document ✅

**En tant qu'** utilisateur connecté,
**je veux** uploader un document (PDF, image) depuis mon inbox,
**afin d'** obtenir en moins de 30 secondes une explication en français de son contenu, type, urgence et actions requises.

**Critères d'Acceptation :**
- Étant donné que je suis dans l'inbox, quand je sélectionne un fichier PDF/JPG/PNG (max 10 Mo), alors l'analyse commence automatiquement
- Étant donné que l'analyse est terminée, quand Claude a identifié le document comme urgent, alors le document apparaît dans la section rouge de l'inbox
- Étant donné que l'analyse réussit, alors le document est sauvegardé avec : type, résumé FR, is_urgent, action_required, action_description, période

**Fichiers implémentés :** `src/app/api/documents/upload/route.ts`, `src/app/inbox/InboxClient.tsx`

---

### Story 1.3 — Inbox Documentaire ✅

**En tant qu'** utilisateur connecté,
**je veux** voir tous mes documents organisés avec des alertes visuelles,
**afin de** savoir immédiatement quels documents sont urgents ou requièrent une action.

**Critères d'Acceptation :**
- Étant donné que j'ai des documents urgents, quand j'ouvre l'inbox, alors je vois une section rouge en haut avec ces documents
- Étant donné que j'ai des documents nécessitant une action (non-urgents), alors je les vois dans une section ambre
- Étant donné que je clique sur "Demander", alors je suis redirigé vers l'assistant avec ce document chargé

**Fichiers implémentés :** `src/app/inbox/page.tsx`, `src/app/inbox/InboxClient.tsx`

---

### Story 1.4 — Assistant Contextuel ✅

**En tant qu'** utilisateur connecté,
**je veux** poser des questions en français à un assistant qui connaît mes documents,
**afin de** comprendre les implications et savoir quoi faire.

**Critères d'Acceptation :**
- Étant donné que j'ai sélectionné un document, quand je pose une question, alors l'assistant répond en tenant compte du contenu du document
- Étant donné que je change de document dans la sidebar, alors la conversation repart de zéro
- Étant donné que je reviens sur une conversation, alors l'historique est préservé

**Fichiers implémentés :** `src/app/assistant/page.tsx`, `src/app/assistant/AssistantClient.tsx`, `src/app/api/assistant/chat/route.ts`

---

## Epic 2 : Compte Utilisateur & RGPD 🔲

**Objectif :** Donner à l'utilisateur le contrôle sur son compte et ses données, en conformité avec les exigences RGPD.

**Priorité :** Haute (Phase 2 — obligatoire avant lancement payant)

### Story 2.1 — Page Profil

**En tant qu'** utilisateur connecté,
**je veux** accéder à ma page de profil,
**afin de** voir et modifier mes informations personnelles et préférences.

**Critères d'Acceptation :**
- Étant donné que je suis connecté, quand j'accède à `/profile`, alors je vois mon email, préférences de notification, et statut d'abonnement
- Étant donné que je modifie mon nom d'affichage, quand je sauvegarde, alors le changement est persistant

**Fichiers à créer :** `src/app/profile/page.tsx`, `src/app/profile/ProfileClient.tsx`

---

### Story 2.2 — Suppression de Document

**En tant qu'** utilisateur connecté,
**je veux** supprimer un document de mon inbox,
**afin de** garder mon espace organisé et de supprimer des données sensibles.

**Critères d'Acceptation :**
- Étant donné que je clique sur "Supprimer" sur un document, quand je confirme, alors le document est supprimé de la DB et du Storage Supabase
- Étant donné que le document est supprimé, alors il disparaît immédiatement de l'inbox
- Étant donné qu'un document est supprimé, alors ses conversations associées sont aussi supprimées (cascade)

**Fichiers à modifier :** `src/app/inbox/InboxClient.tsx`
**API à créer :** `src/app/api/documents/[id]/route.ts` (DELETE)

---

### Story 2.3 — Suppression de Compte (RGPD)

**En tant qu'** utilisateur connecté,
**je veux** supprimer définitivement mon compte et toutes mes données,
**afin d'** exercer mon droit à l'oubli.

**Critères d'Acceptation :**
- Étant donné que je demande la suppression de mon compte, quand je confirme par email ou saisie du mot de passe, alors tous mes documents (DB + Storage), conversations, messages et données de profil sont supprimés
- Étant donné que la suppression est complète, alors je suis déconnecté et redirigé vers la page d'accueil

**API à créer :** `src/app/api/account/delete/route.ts`

---

## Epic 3 : Engagement & Digest Email 🔲

**Objectif :** Créer une habitude d'usage et maintenir l'engagement en informant l'utilisateur de façon proactive.

**Priorité :** Haute (Phase 2 — feature différenciante)

### Story 3.1 — Résumé Hebdomadaire par Email

**En tant qu'** utilisateur abonné,
**je veux** recevoir un email récapitulatif chaque lundi,
**afin de** ne pas manquer d'actions importantes sur mes documents de la semaine.

**Critères d'Acceptation :**
- Étant donné que j'ai uploadé des documents dans la semaine, quand le lundi arrive, alors je reçois un email avec la liste de ces documents et les actions en attente
- Étant donné que tous mes documents sont traités, alors l'email indique "Aucune action requise cette semaine"
- Étant donné que je désactive le digest dans mes préférences, alors je ne reçois plus d'emails

**Dépendances :** Resend (email), Vercel Cron (déclenchement hebdomadaire)
**API à créer :** `src/app/api/cron/weekly-digest/route.ts`
**Configuration à ajouter :** `vercel.json` avec cron jobs

---

### Story 3.2 — Préférences de Notification

**En tant qu'** utilisateur connecté,
**je veux** configurer mes préférences de notification,
**afin de** recevoir uniquement les notifications que je veux.

**Critères d'Acceptation :**
- Étant donné que je suis dans mes préférences, quand je désactive le digest hebdomadaire, alors je ne reçois plus d'emails le lundi
- Étant donné que j'active les alertes urgentes, quand un document urgent est analysé, alors je reçois un email immédiat

---

## Epic 4 : Monétisation (Abonnement) 🔲

**Objectif :** Mettre en place un système de freemium avec abonnement payant pour rendre le produit viable.

**Priorité :** Haute (Phase 2 — nécessaire avant de scaler)

### Story 4.1 — Intégration Stripe

**En tant que** développeur,
**je veux** intégrer Stripe pour gérer les abonnements,
**afin que** les utilisateurs puissent s'abonner et que les paiements soient gérés automatiquement.

**Critères d'Acceptation :**
- Étant donné qu'un utilisateur clique sur "S'abonner", quand il complète le paiement Stripe, alors son statut passe à `pro` dans la table `subscriptions`
- Étant donné qu'un abonnement est annulé, quand la période actuelle se termine, alors l'accès aux features pro est révoqué

**API à créer :** `src/app/api/stripe/webhook/route.ts`, `src/app/api/stripe/create-checkout/route.ts`

---

### Story 4.2 — Logique Freemium

**En tant qu'** utilisateur en free tier,
**je veux** pouvoir analyser 3 documents par mois gratuitement,
**afin d'** évaluer le service avant de m'abonner.

**Critères d'Acceptation :**
- Étant donné que je suis en free tier et que j'ai uploadé 3 documents ce mois, quand je tente un 4ème upload, alors je vois un message d'upgrade
- Étant donné que je suis en pro tier, alors je n'ai pas de limite mensuelle

**À modifier :** `src/app/api/documents/upload/route.ts` (vérification du quota)

---

### Story 4.3 — Page Tarification et Upgrade

**En tant qu'** utilisateur en free tier,
**je veux** voir les avantages de l'abonnement et pouvoir m'abonner,
**afin de** débloquer l'accès illimité.

**Critères d'Acceptation :**
- Étant donné que j'accède à `/pricing`, alors je vois les deux plans (free/pro) avec les différences claires
- Étant donné que je clique "S'abonner" (29₪/mois), alors je suis redirigé vers Stripe Checkout

**Fichiers à créer :** `src/app/pricing/page.tsx`

---

## Epic 5 : Dashboard & Recherche 🔲

**Objectif :** Donner à l'utilisateur une vue d'ensemble de sa situation administrative et un moyen de retrouver ses documents.

**Priorité :** Moyenne (Phase 2 — différenciation UX)

### Story 5.1 — Dashboard Personnel

**En tant qu'** utilisateur connecté,
**je veux** avoir une vue d'ensemble de mes documents et de leur statut,
**afin de** comprendre ma situation administrative globale en un coup d'œil.

**Critères d'Acceptation :**
- Étant donné que j'ouvre le dashboard, alors je vois : nombre de documents totaux, documents urgents en attente, documents par type (graphique simple)
- Étant donné que j'ai des actions en attente, alors elles sont listées avec leur deadline

**Fichiers à créer :** `src/app/dashboard/page.tsx`, `src/app/dashboard/DashboardClient.tsx`

---

### Story 5.2 — Recherche dans les Documents

**En tant qu'** utilisateur avec plusieurs documents,
**je veux** rechercher dans mes documents par mot-clé,
**afin de** retrouver rapidement un document spécifique.

**Critères d'Acceptation :**
- Étant donné que je saisis "bituah" dans la recherche, alors je vois tous les documents dont le nom ou le résumé contient ce mot
- Étant donné que la recherche ne trouve rien, alors un message "Aucun document trouvé" s'affiche

**À modifier :** `src/app/inbox/InboxClient.tsx` (filtre local côté client)

---

## Epic 6 : WhatsApp & Expansion (Phase 3 — Vision) 🔲

**Objectif :** Permettre l'upload et la consultation via WhatsApp pour atteindre les utilisateurs là où ils sont.

**Priorité :** Faible (Phase 3 — après stabilisation Phase 2)

### Story 6.1 — Upload via WhatsApp

**En tant qu'** utilisateur sur mobile,
**je veux** envoyer une photo de mon document par WhatsApp,
**afin de** l'analyser sans ouvrir l'application web.

**Critères d'Acceptation :**
- Étant donné que j'envoie une image à mon numéro Tloush WhatsApp, quand l'analyse est terminée, alors je reçois un message WhatsApp avec le résumé et les actions
- Étant donné que le document est analysé, alors il apparaît aussi dans mon inbox web

**Dépendances :** Twilio / WhatsApp Business API, webhook Vercel

---

## Epic 7 : Comparaison de Fiches de Paie (Phase 3)

**Objectif :** Permettre aux utilisateurs de comparer leurs fiches de paie mois par mois et détecter automatiquement les anomalies.

**Priorité :** Haute (Phase 3 — forte valeur ajoutée, rétention)

### Story 7.1 — Comparaison Mois par Mois

**En tant qu'** utilisateur ayant uploadé plusieurs fiches de paie,
**je veux** comparer deux fiches côte à côte,
**afin de** voir ce qui a changé (salaire, déductions, primes) d'un mois à l'autre.

**Critères d'Acceptation :**
- Étant donné que j'ai au moins 2 fiches de paie dans mon inbox, quand j'accède à `/compare`, alors je peux sélectionner deux fiches à comparer
- Étant donné que je sélectionne deux fiches, quand la comparaison est générée, alors je vois les différences clés mises en évidence
- Étant donné que des anomalies sont détectées, alors elles sont signalées en rouge avec une explication en français

**Fichiers à créer :** `src/app/compare/page.tsx`, `src/app/compare/CompareClient.tsx`, `src/app/api/documents/compare/route.ts`

---

### Story 7.2 — Détection Automatique d'Anomalies

**En tant qu'** utilisateur qui uploade une fiche de paie,
**je veux** que le système détecte automatiquement si quelque chose a changé par rapport au mois précédent,
**afin d'** être alerté sans avoir à comparer manuellement.

**Critères d'Acceptation :**
- Étant donné que j'uploade une fiche de paie et qu'une fiche du mois précédent existe, alors le résumé mentionne les changements détectés
- Étant donné qu'un changement significatif est détecté (>5% du net), alors c'est signalé comme "attention requise"

---

## Epic 8 : Annuaire d'Experts v3 (Phase 3)

**Objectif :** Connecter les utilisateurs avec des professionnels francophones qualifiés en Israël, avec recommandation contextuelle basée sur les documents analysés.

**Priorité :** Moyenne (Phase 3 — monétisation future via commissions)

### Story 8.1 — Annuaire d'Experts Dynamique

**En tant qu'** utilisateur,
**je veux** parcourir un annuaire de comptables et avocats francophones,
**afin de** trouver un professionnel adapté à ma situation.

**Critères d'Acceptation :**
- Étant donné que j'accède à `/experts`, alors je vois la liste des experts filtrables par spécialité et ville
- Étant donné que je clique sur un expert, alors je vois son profil détaillé et un formulaire de contact
- Étant donné que je soumets le formulaire, alors l'expert reçoit ma demande avec le contexte de mon document

**Fichiers à modifier :** `src/app/experts/page.tsx`, `src/app/experts/[slug]/page.tsx`, `src/components/experts/ContactExpertForm.tsx`

---

### Story 8.2 — Recommandation d'Expert Contextuelle

**En tant qu'** utilisateur qui consulte un document complexe,
**je veux** qu'on me recommande un type d'expert adapté,
**afin de** trouver rapidement l'aide professionnelle dont j'ai besoin.

**Critères d'Acceptation :**
- Étant donné que j'ai un document fiscal, quand l'assistant me recommande un professionnel, alors il me dirige vers un comptable spécialisé en fiscalité
- Étant donné que j'ai un contrat de travail litigieux, alors l'assistant me recommande un avocat en droit du travail

---

## Ordre d'Implémentation (Sprint Planning)

```
Phase 2 (✅ COMPLÈTE)
  Sprint 1 — Base Account → Stories 2.1, 2.2, 2.3 ✅
  Sprint 2 — Dashboard & Recherche → Stories 5.1, 5.2 ✅
  Sprint 3 — Engagement → Stories 3.1, 3.2 ✅
  Sprint 4 — Monetisation → Stories 4.1, 4.2, 4.3 (deferred)

Phase 3 (EN COURS)
  Sprint 5 — Comparaison Fiches de Paie
    → Story 7.1 (Comparaison mois par mois)
    → Story 7.2 (Détection automatique d'anomalies)

  Sprint 6 — Annuaire d'Experts v3
    → Story 8.1 (Annuaire dynamique)
    → Story 8.2 (Recommandation contextuelle)

  Sprint 7 — WhatsApp (quand Twilio disponible)
    → Story 6.1 (Upload via WhatsApp)
```
