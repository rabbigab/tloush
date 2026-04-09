# Tloush Recommande — Sprint Plan

> Version: 1.0
> Date: 2026-04-09

---

## Vue d'ensemble

```
Semaine 0          Sprint R0 — VALIDATION (avant le code)
Semaine 1-2        Sprint R1 — FONDATIONS & PAGES PUBLIQUES
Semaine 3-4        Sprint R2 — SUIVI QUALITE & INTEGRATION
Semaine 5-6        Sprint R3 — SEO & CONTENU
```

**Engagement temps total :** ~56h de dev (1 developpeur)
**Condition de lancement :** Sprint R0 validé (4 tests a 0 NIS)

---

## Sprint R0 — Validation (Semaine 0, AVANT de coder)
**Objectif :** Valider les hypotheses sans investissement technique

> ⚠️ Ces 4 tests doivent passer avant de lancer le Sprint R1. Cout : 0 NIS, 2-3 semaines.

### Toi (sans dev)

| # | Test | Seuil de validation | Duree |
|---|------|---------------------|-------|
| A | Creer 5 pages HTML statiques (plombier, electricien, etc.) + Google Search Console | >50 impressions/mois sur les termes cibles | 2 semaines |
| B | Poster dans 3 groupes Facebook francophones : "On prepare un annuaire verifie, qui serait interesse ?" | >50 reactions, >20 messages prives | 1 semaine |
| C | Landing page avec 5 prestataires reels + formulaire "Voir le numero" | >10% taux de conversion visiteur → email | 1 semaine |
| D | 10 relances WhatsApp manuelles post-prestation sur vos utilisateurs existants | >30% taux de reponse, avis utilisables | 2 semaines |

### Dev (Claude) — Parallelisable pendant la validation

| # | Tache | Effort |
|---|-------|--------|
| 1 | R1.1 — Schema SQL + migration | 2h |
| 2 | R1.2 — Types TypeScript | 1h |
| 3 | R1.5 — Mise a jour middleware | 30min |

### Definition of Done Sprint R0
- [ ] Les 4 tests sont executes et les seuils sont atteints
- [ ] Schema DB valide et execute dans Supabase
- [ ] Decision GO / NO-GO documentee

---

## Sprint R1 — Fondations & Pages publiques (Semaines 1-2)
**Objectif :** Annuaire visible, searchable, et gate d'inscription fonctionnelle

### Semaine 1

| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 1 | R1.3 — Routes API publiques (GET prestataires, search) | R1 | 2h | R1.1 |
| 2 | R1.4 — Routes API authentifiees (contact, avis) | R1 | 2h | R1.1 |
| 3 | R2.1 — Page hub `/annuaire` | R2 | 3h | R1.3 |
| 4 | R2.2 — Page listing `/annuaire/[categorie]` | R2 | 4h | R1.3 |

### Semaine 2

| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 5 | R2.3 — Fiche prestataire `/annuaire/[categorie]/[slug]` | R2 | 5h | R1.3 |
| 6 | R2.4 — Modale gate d'inscription | R2 | 4h | R1.4 |
| 7 | R2.5 — Revelation contact + boutons Appeler/WhatsApp | R2 | 2h | R2.4, R1.4 |
| 8 | R3.2 — Panel admin prestataires (CRUD) | R3 | 4h | R1.1 |

### Definition of Done Sprint R1
- [ ] Pages `/annuaire`, `/annuaire/plombier`, `/annuaire/plombier/[slug]` accessibles sans login
- [ ] Bouton "Obtenir le contact" declenche la modale d'inscription
- [ ] Apres inscription : numero visible + boutons Appeler/WhatsApp
- [ ] L'admin peut ajouter/editer/delister des prestataires
- [ ] Au moins 10 prestataires saisis manuellement dans l'admin
- [ ] Google peut indexer les pages (pas de noindex, sitemap a jour)

---

## Sprint R2 — Suivi qualite & Integration (Semaines 3-4)
**Objectif :** Boucle d'avis fonctionnelle + integration dans l'app Tloush

### Semaine 3

| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 1 | R4.2 — Tokens d'avis signes | R4 | 1h | - |
| 2 | R4.3 — Page de depot d'avis | R4 | 3h | R4.2 |
| 3 | R4.1 — Cron job suivi J+2 | R4 | 2h | R4.2, R4.3 |
| 4 | R3.1 — Page inscription prestataire | R3 | 5h | R1.1 |

### Semaine 4

| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 5 | R4.4 — Relance unique J+5 | R4 | 1h | R4.1 |
| 6 | R3.3 — Moderation des avis (admin) | R3 | 3h | R4.3, R3.2 |
| 7 | R5.1 — Navigation + onglet Annuaire | R5 | 30min | - |
| 8 | R5.2 — Widget annuaire sur dashboard | R5 | 2h | R1.4 |
| 9 | R5.3 — Cross-promotion rapports d'analyse | R5 | 2h | R1.3 |

### Definition of Done Sprint R2
- [ ] Cron job envoie les messages de suivi WhatsApp a J+2
- [ ] Utilisateur peut noter de 1 a 5 via le lien WhatsApp sans se reconnecter
- [ ] Avis soumis visible dans l'admin pour validation
- [ ] Formulaire d'inscription prestataire fonctionnel
- [ ] Onglet "Annuaire" visible dans la navigation
- [ ] Widget annuaire sur le dashboard
- [ ] Cross-promo dans les rapports d'analyse sur les documents de type devis/facture

---

## Sprint R3 — SEO & Contenu (Semaines 5-6)
**Objectif :** Optimisation pour Google et contenu editorial

### Semaine 5

| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 1 | R6.1 — Schema JSON-LD + metadata | R6 | 2h | R2.2, R2.3 |
| 2 | R6.2 — Contenu editorial (5 categories) | R6 | 3h | R2.2 |
| 3 | R6.3 — Pages ville+categorie | R6 | 2h | R2.2 |

### Semaine 6

| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 4 | Soumettre sitemap a Google Search Console | - | 30min | R6.1 |
| 5 | Fournir badges + QR codes aux prestataires inscrits | - | 2h | - |
| 6 | Recrutement 30 prestataires cibles (Netanya + Ashdod + Jerusalem) | - | 8h (toi) | R3.1 |
| 7 | Email blast utilisateurs Tloush existants | - | 1h | - |
| 8 | Tests E2E du flow complet | - | 3h | tous |

### Definition of Done Sprint R3
- [ ] Schema JSON-LD valide sur toutes les pages (test avec Rich Results Test Google)
- [ ] Contenu editorial sur les 5 categories
- [ ] Pages ville+categorie generees pour les combinaisons existantes
- [ ] Sitemap soumis a Google Search Console
- [ ] 30+ prestataires actifs dans l'annuaire
- [ ] Email blast envoye aux utilisateurs existants
- [ ] Flow complet teste E2E : visite → inscription → contact → avis

---

## Jalons cles

| Jalon | Date cible | Critere |
|-------|-----------|---------|
| **Validation GO** | Fin semaine 0 | 4 tests valides, decision GO documentee |
| **MVP Visible** | Fin semaine 2 | Pages publiques, gate fonctionnelle, 10 prestataires |
| **Boucle Qualite** | Fin semaine 4 | Suivi WhatsApp, avis, inscription prestataire, integration app |
| **Lancement Public** | Fin semaine 6 | SEO, 30+ prestataires, email blast, sitemap Google |

---

## Taches non-dev (toi)

| Sprint | Tache | Effort | Dependance |
|--------|-------|--------|------------|
| R0 | Executer les 4 tests de validation | 2-3 semaines | - |
| R0 | Faire rediger les CGU par un avocat israelien | 1-2 semaines | - |
| R1 | Executer la migration SQL dans Supabase | 15min | R1.1 |
| R1 | Saisir les 10 premiers prestataires dans l'admin | 2h | R3.2 |
| R2 | Configurer `REVIEW_TOKEN_SECRET` dans Vercel | 5min | R4.2 |
| R2 | Configurer le Cron Vercel pour `/api/cron/annuaire-followup` | 10min | R4.1 |
| R3 | Recruter 20-30 prestataires via Facebook + appels directs | 8h | R3.1 |
| R3 | Generer et envoyer les badges aux prestataires | 2h | - |
| R3 | Email blast utilisateurs existants | 1h | - |
| R3 | Soumettre le sitemap a Google Search Console | 15min | R6.1 |

---

## Risques identifies

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Tests R0 echouent (pas assez d'interet) | Faible | Critique | Ne pas lancer le dev — revalider la proposition |
| Difficulte a recruter des prestataires | Moyenne | Eleve | Commencer par les groupes Facebook + contacts existants |
| Taux de reponse WhatsApp trop bas | Moyenne | Moyen | Opt-in explicite + message tres court + lien en 1 clic |
| Google n'indexe pas rapidement | Elevee | Faible | Normal — le SEO prend 3-6 mois, Facebook/email en attendant |
| Avis frauduleux | Faible | Moyen | Seuls les contacts confirmes peuvent noter, admin valide |
| Prestataire mecontents du delisting | Faible | Moyen | Criteres objectifs + droit de reponse + préavis 15j |
