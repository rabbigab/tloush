# Tloush V4 — Feasibility Study

> Version: 4.0
> Date: 2026-04-12
> Auteur: BMAD Business Analyst
> Statut: Valide — base de decision pour V4

---

## Contexte

Ce document valide la faisabilite technique des 6 features proposees pour Tloush V4 et identifie les prerequis bloquants.

**Stack verifiee :** Next.js 14 (App Router) + Supabase + Claude Sonnet API + Stripe + Vercel
**Libs metier existantes :** `israeliPayroll.ts`, `employeeRights.ts`, `bituachLeumi.ts`, `kolzchutRights.ts`, `tofesForms.ts`, `ruleEngine.ts`, `letterTemplates.ts`, `pdfGenerator.ts`

---

## Synthese transversale

| # | Feature | Complexite | Risque global | Decision |
|---|---|---|---|---|
| **17** | Admin monitoring | M | Faible | **GO Sprint 1** |
| **12** | Family module UI | L | Moyen (RLS) | **GO Sprint 2** (audit RLS obligatoire) |
| **6** | Miluim tracker | S | Faible | **GO Sprint 3** |
| **5** | Tax refund estimator | L | Eleve (legal) | **GO Sprint 4** (disclaimer + parser 106) |
| **8** | Annual payslip comparator | M | Faible | **GO Sprint 5** (apres normalisation) |
| **10** | Automatic rights detector | XL | Tres eleve | **MVP 10 regles** (Sprint 6) |

---

## Prerequis transversal BLOQUANT

**Story 0.0 — Profil utilisateur enrichi**

Sans un profil utilisateur complet (statut familial, annee d'alyah, nombre d'enfants, handicap, situation professionnelle), les features #5, #6 et #10 ne peuvent pas donner de resultats utiles.

**Criteres d'acceptation :**
- [ ] Migration : `ALTER TABLE profiles ADD COLUMN` : `marital_status`, `aliyah_year`, `children_count`, `disability_level`, `employment_status`, `spouse_profile_id`
- [ ] Page `/profile/edit` enrichie avec les nouveaux champs
- [ ] Validation Zod avec valeurs enum strictes
- [ ] Onboarding post-inscription qui pousse a remplir le profil
- [ ] API `/api/profile` GET/PATCH

**Effort :** 3h
**Impact :** Bloquant pour 3 features

---

## Analyse par feature

### #17 — Admin monitoring

**Faisabilite :** Oui. `src/app/admin/AdminDashboard.tsx` et `/api/admin/stats/route.ts` existent deja. Manque les metriques de performance et de cout.

**Risques techniques :**
- Migration retroactive : aucun cout calcule pour les docs anterieurs (champ `NULL`)
- Besoin de distinguer erreur Claude vs erreur OCR vs erreur parsing (enum `error_code`)
- `force-dynamic` actuel pour `/api/admin/stats` va exploser sur 100k+ docs sans materialized view

**Dependances externes :** Aucune. Tout est interne (Supabase + headers Anthropic deja recus dans les responses).

**Privacy/legal :** Faible. Donnees agregees, pas de PII exposee.

**Prerequis :**
1. Migration : `ALTER TABLE documents ADD COLUMN tokens_in INT, tokens_out INT, duration_ms INT, error_code TEXT, model TEXT`
2. Wrapper centralise autour de `anthropic.messages.create` pour logging automatique
3. Vue materialisee `admin_daily_stats` rafraichie par cron

**Complexite :** M — 3-5 jours

---

### #5 — Tax refund estimator (החזר מס)

**Faisabilite :** Partielle. `israeliPayroll.ts` contient les brackets 2025, points de credit, BL et mas briut. `tofesForms.ts` modelise le Tofes 101/106. **Manque la logique reverse** : a partir d'un Tofes 106 annuel, recalculer le mas du au prorata et soustraire le mas preleve.

**Risques techniques :**
- **Layout PDF heterogene** : Tofes 106 varie selon l'editeur de paie (Hilan, Michpat, Synel, Malam...). Le pipeline `extract.ts` actuel cible la fiche mensuelle, pas le recap annuel → nouveau prompt specifique.
- **Multi-employeurs** : piege classique. Sans chaque Tofes 106 de l'annee, l'estimation est fausse.
- **Points de credit non reclames** : necessite un profil utilisateur complet (d'ou le prerequis Sprint 0).

**Dependances externes :** Aucune (pas d'API gov.il ouverte).

**Privacy/legal :** **ELEVE**. Donnees fiscales + risque de mise en cause si chiffre faux.
- Disclaimer obligatoire "estimation, pas avis fiscal"
- Bouton "consulter un yoetz mas" integre

**Prerequis :**
1. Profil utilisateur enrichi (Sprint 0)
2. Parser Tofes 106 robuste avec validation par champ
3. Disclaimer juridique valide + integration `expertMatcher.ts`

**Complexite :** L — 2-3 semaines

---

### #6 — Miluim tracker

**Faisabilite :** Oui, **simple**. CRUD jours + calcul lineaire. Regles BL stables. `bituachLeumi.ts` a deja la categorie `reserve`.

**Risques techniques :**
- Aucun bloquant
- Distinction **tagmulei miluim** (paye par BL) vs **reimbursement employeur** — a bien expliquer dans la lettre generee
- Post-7-octobre : baremes ont bouge plusieurs fois → versionner les constantes par annee

**Dependances externes :** Aucune. Baremes BL publics et stables sur 12 mois.

**Privacy/legal :** Faible. Donnees personnelles mais pas sensibles RGPD/loi 7981.

**Prerequis :**
1. Constantes miluim 2025/2026 versionnees dans `src/lib/miluim.ts`
2. Template lettre FR + HE dans `letterTemplates.ts`
3. Validation : max 270 jours miluim/3 ans (plafond legal)

**Complexite :** S — 4-6 jours

---

### #8 — Annual payslip comparator

**Faisabilite :** Oui, **le plus naturel** des 6. Le pipeline `extract.ts` produit deja une `analysis_data` JSONB par fiche, `period` est rempli. La table `documents` permet de filtrer 12 mois en arriere par user.

**Risques techniques :**
- **Normalisation des champs extraits** : chaque fiche peut avoir des cles differentes selon le prompt et le format (Hilan/Michpat). Sans schema strict, comparer 12 fiches = cauchemar. Couche de normalisation post-extraction necessaire.
- **Detection raise vs prime ponctuelle vs 13e mois** : necessite de comparer plusieurs colonnes (base, gross total, net)
- **Trous** : si l'utilisateur n'a pas upload les 12 mois, le graphe est trompeur → afficher "8/12 mois disponibles"

**Dependances externes :** Recharts ou Tremor pour les graphes (~150kb gzipped si pas deja present)

**Privacy/legal :** Faible. Donnees deja stockees.

**Prerequis :**
1. Schema d'extraction stable (validation Zod des `analysis_data` payslip)
2. Backfill : re-normaliser les fiches deja en base
3. Minimum 3 fiches pour activer la feature

**Complexite :** M — 5-7 jours

---

### #10 — Automatic rights detector

**Faisabilite :** Oui, mais **la feature la plus piegeuse**. Les briques existent (`kolzchutRights`, `bituachLeumi`, `employeeRights`, `ruleEngine`). Manque la **glue** : moteur d'inference qui croise profil + docs + rights DB.

**Risques techniques :**
- **FAUX POSITIFS CATASTROPHIQUES** : annoncer "vous avez droit a 70% de reduction Arnona" alors que c'est faux = perte de confiance instantanee
- **Arnona municipale** : 257 communes, 257 baremes differents. Sans scraping (illegal/fragile) ou donnees gouv ouvertes (n'existent pas en JSON), on est limite a "verifiez aupres de votre mairie"
- **Profil complet requis** → frein adoption

**Dependances externes :**
- Souhaite : data.gov.il (Arnona reductions) — existe partiellement, pas a jour
- Kolzchut : pas d'API publique, scraping fragile

**Privacy/legal :** **TRES ELEVE**. Statut handicap, revenus conjoint, situation familiale = donnees sensibles RGPD art. 9. Consentement explicite obligatoire.

**Decision : MVP reduit a 10 regles a forte confiance**
1. Points de credit oleh (3 ans)
2. Points de credit parent isole
3. Points de credit enfants < 5 ans
4. Exemption Arnona etudiant (selon ville declaree)
5. Allocation enfants (kitsbat yeladim)
6. Exemption BL freelance debut activite
7. Remboursement miluim non reclame
8. Remboursement mas hachnasa (lien avec #5)
9. Droits licenciement non verses (via ruleEngine existant)
10. Conges non pris au-dela du plafond legal

**Prerequis :**
1. Profil utilisateur enrichi (Sprint 0)
2. Schema regle JSON commun pour les 4 libs rights
3. Validation legale par professionnel sur les 10 regles MVP
4. UI distinguant "eligible probable" vs "a verifier"

**Complexite :** XL — 3-4 semaines avec scope reduit (sinon repousser)

---

### #12 — Family module UI

**Faisabilite :** Oui, **partiellement deja en place**. `supabase-family-members.sql` cree la table avec RLS. `src/app/api/family/{join,leave,members}/route.ts` gere les invitations. Stripe family plan existe. **Manque** : UI de gestion, partage de documents, budget commun.

**Risques techniques :**
- **Partage de documents** : la RLS actuelle sur `documents` est strictement `auth.uid() = user_id`. Il faut etendre avec OR sur `family_members` — risque de fuite si mal ecrit. **Tests pgTAP obligatoires.**
- **Budget menage** : table `recurring_expenses` existe en mode solo. Migrer vers shared = breaking change → notion de "perimetre" (perso vs famille)
- **Gestion des conflits** : 2 membres uploadent la meme fiche EDF → dedup necessaire

**Dependances externes :** Aucune. Resend deja en place pour les emails d'invitation.

**Privacy/legal :** **Moyen**. Partage conjoint OK avec consentement, mais divorce → revocation immediate obligatoire (pas suppression du doc cote owner). A documenter dans CGV.

**Prerequis :**
1. Decision produit : partage **selectif** (par doc) recommande fortement
2. Tests RLS automatises avant deploiement (un bug = data breach)
3. Mecanisme de revocation propre (effet sur les docs partages)
4. Mention CGV mise a jour

**Complexite :** L — 2-3 semaines

---

## Recommandations finales

### Ordre d'execution retenu

1. **Sprint 0** : Profil utilisateur enrichi (prerequis bloquant)
2. **Sprint 1** : #17 Admin monitoring (observabilite avant le reste)
3. **Sprint 2** : #12 Family module UI (debloque #5/#10)
4. **Sprint 3** : #6 Miluim tracker (gain rapide, feature isolee)
5. **Sprint 4** : #5 Tax refund estimator (valeur forte)
6. **Sprint 5** : #8 Annual payslip comparator (profondeur)
7. **Sprint 6** : #10 Automatic rights detector (MVP 10 regles)

### Points de vigilance

- **#17 avant tout** : sans monitoring, on est aveugles sur les couts Claude pendant 5 sprints de features lourdes
- **#12 avant #5/#10** : family_members est la fondation
- **Tests RLS obligatoires** pour #12
- **Validation legale** sur les 10 regles MVP pour #10
- **Disclaimers juridiques** sur #5 et #10

### Metriques de succes

| Feature | KPI |
|---|---|
| #17 | 100% des appels Claude logges avec cout |
| #5 | Au moins 1 remboursement reel valide par un utilisateur en beta |
| #6 | 10+ reservistes utilisent l'outil en premier mois |
| #8 | Temps moyen sur /payslips/annual > 2 minutes |
| #10 | Au moins 3 droits reclames via Tloush en premier mois |
| #12 | 20%+ des abonnes Famille ajoutent au moins 1 membre |
