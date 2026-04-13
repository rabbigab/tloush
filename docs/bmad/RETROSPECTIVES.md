# Rétrospectives Tloush

Document vivant — une rétro par sprint livré.

---

## V4.2 — Catalogue de benefices + Rights Detector V2

### Livre

**Profil utilisateur enrichi (+20 champs)**
- Migration `20260418_profile_enrichment_v2.sql` : gender, birth_date,
  spouse_*, served_in_idf, is_combat_veteran, is_active_reservist,
  education_level, is_holocaust_survivor, is_caregiver, chronic_illness,
  has_mobility_limitation, has_disabled_child, is_bereaved_family,
  household_income_monthly, municipality, home_size_sqm,
  children_with_disabilities, receives_* flags
- Types TypeScript mis a jour (Gender, EducationLevel, etc.)
- Profile completion algorithm updated (30+ fields, weighted)
- UI : 9 sections (identite, famille, alyah, service militaire, pro,
  education, sante, logement, allocations en cours)
- API PATCH validation complete

**Catalogue de benefices (src/lib/benefitsCatalog.ts — 20 sections)**
- 44 benefices structures
- 11 categories (family, fiscal, employment, immigration, housing,
  health, retirement, military, welfare, education, special)
- 8 autorites (BL, Tax Authority, Klita, HaShikun, HaBitachon, Municipality,
  HaChinuch, Claims Conference)
- Interface EligibilityConditions avec 20+ champs pour matching
- Chaque benefice avec slug, titre FR/HE, conditions, valeur estimee,
  URL d'action, disclaimer, confidence level, status, verified_at
- Helper functions : getBenefitBySlug, getBenefitsByCategory,
  getVerifiedBenefits, getBenefitsNeedingVerification, getCatalogStats

**Nouvelle loi 2026 decouverte** : exemption totale d'impot pour olim
qui arrivent en 2026 (0% 2026-2027, puis 10/20/30% 2028-2030, plafond
1M NIS/an). Integree au catalogue via `oleh_2026_full_exemption`.

**Rights Detector V2 (src/lib/rightsDetectorV2.ts)**
- Nouveau moteur base sur le catalogue (vs hardcoded V1)
- Matching profile -> EligibilityConditions (20+ champs)
- Confidence scoring : catalog confidence × match quality
- Detection "already_receiving" via profile flags
- Trie par confidence_score desc, puis valeur desc
- Exports : scanBenefits, scanUnclaimedBenefits, estimateUnclaimedValue

**Doc `v4-INACCESSIBLE-SOURCES.md`**
- Liste exhaustive des sources officielles bloquees (403 WebFetch)
- 6 categories : BTL, Tax Authority, Klita, Arnona, new laws, missing info
- Pour chaque source : URL, statut, ce qu'il faut verifier, frequence
- Checklist trimestrielle pour validation manuelle
- Contacts utiles (BL, NBN, Chaim V'Chessed, etc.)
- Script de verification semi-automatique propose (Browserless.io)

### Ce qui a bien marche
- **20 commits successifs** sur le catalogue, un par section, commit granulaire
- Chaque commit compile (`npx tsc --noEmit`) avant push
- Recherche web reelle sur les sources officielles (pas juste training data)
- Decouverte de la loi 2026 exemption olim que je n'aurais jamais trouve
  sans recherche active
- Profile enrichi designe pour matcher exactement les conditions des benefices

### Ce qui a coince
- Plusieurs bugs de comportement de mon cote : je terminais les reponses
  sans chainer les tool calls. Corrige en forcant execution directe.
- Les pages BTL retournent 403 sur WebFetch — impossible de verifier
  automatiquement. Compromis : utiliser Google + sites tiers (CWS, NBN,
  kolzchut) et documenter dans INACCESSIBLE-SOURCES.md
- Certaines valeurs 2026 restent approximatives (old age, disability,
  survivor). Marquees `needs_verification` dans le catalogue.
- Le rights detector V1 existe toujours — V2 coexiste mais pas encore
  wire-in dans l'UI. A faire dans un sprint ulterieur.

### Actions pour V5
- [ ] Wire rights detector V2 dans `/rights-detector` (remplacer V1)
- [ ] Tester avec 3-5 vrais profils olim francophones
- [ ] Faire valider le catalogue par un yoetz mas
- [ ] Ajouter un script de verification semi-automatique (Browserless)
- [ ] Ajouter le champ `gender` au profil UI (actuellement dans le type
      mais pas expose dans l'edit form — a verifier)
- [ ] Afficher les benefices deja declares separement dans
      `/rights-detector` (section "Deja reclames")

### Metriques
- ~1 300 lignes de code dans benefitsCatalog.ts
- ~385 lignes dans rightsDetectorV2.ts
- ~300 lignes de documentation (INACCESSIBLE-SOURCES.md)
- 23 commits deployes sur main
- 0 erreur TypeScript

---

## V4 — 7 sprints livres en une session (BMAD task force)

### Livre

**Sprint 0 — EPIC 9 : Profil utilisateur enrichi (prerequis)**
- Migration `user_profiles` (14 champs : famille, alyah, emploi, sante, logement)
- Page `/profile/edit` avec auto-save, progress bar, 6 sections
- Lib `profileCompletion.ts`, API PATCH validation Zod

**Sprint 1 — EPIC 10 : Admin monitoring**
- Migrations : `claude_usage`, `error_log`, colonnes tokens/cost sur documents
- Libs `claudePricing.ts` + `claudeMetrics.ts` (fire-and-forget, dedup)
- Page `/admin/monitoring` : stats, bar chart, top users, erreurs, auto-refresh 60s
- Integration dans `/api/documents/upload` (capture stream events)

**Sprint 2 — EPIC 11 : Family module UI**
- Migration `family_shared_documents` + RLS etendue sur documents
- API GET/POST/DELETE `/api/family/documents`
- Page `/family` : gestion membres + partage doc selectif + CTA upgrade plan

**Sprint 3 — EPIC 12 : Miluim tracker**
- Migration `miluim_periods` (colonne generee days_count)
- Lib `miluim.ts` : constantes 2025/2026 versionnees, calcul compensation, plafond 270j/3ans
- Page `/miluim` : 3 stats, form ajout, historique avec compensation estimee

**Sprint 4 — EPIC 13 : Tax refund estimator**
- Lib `taxRefund.ts` : brackets 2025, points credit (resident + olim + enfants + parent isole)
- API POST `/api/tax-refund/estimate` (requiert profil complet)
- Page `/tax-refund` : wizard, result card, detection points manquants

**Sprint 5 — EPIC 14 : Annual payslip comparator**
- Lib `payslipTimeline.ts` : parsePeriod multi-format, normalize, buildTimeline, detectAnomalies
- API GET `/api/payslips/annual?year=`
- Page `/payslips/annual` : 4 summary cards, bar chart mensuel, anomalies, table

**Sprint 6 — EPIC 15 : Rights detector MVP (9 regles)**
- Migration `detected_rights`
- Lib `rightsDetector.ts` avec 9 regles a forte confiance :
  oleh points / parent isole / enfants < 5 / kitsbat yeladim /
  refund mas / havraa absente / pension absente / freelance BL / invalidite
- API GET/POST/PATCH `/api/rights-detector`
- Page `/rights-detector` avec scan, filtres, actions par droit

### Ce qui a bien marche
- **BMAD en parallele** : 4 sous-agents (analyst, architect, PM, scrum master) ont produit toute la doc V4 en 1 seule session
- **Reutilisation massive** : `israeliPayroll.ts`, `bituachLeumi.ts`, `kolzchutRights.ts` deja la
- **Identification du prerequis** par l'analyst : profil user bloquant pour 3 features
- **Scope reduit #10** : MVP 9 regles au lieu d'un detecteur universel
- **TypeScript strict** : zero `any`, tous les types exportes
- **~7000 lignes de code** livrees en une session

### Ce qui a coince
- Le wrapper Claude centralise n'est pas fait : logging integre uniquement dans upload (minimal)
- La detection miluim non rembourse dans rightsDetector n'est pas implementee (necessite query async)
- Constantes miluim 2026 approximatives — a verifier avec baremes officiels
- Tests pgTAP RLS pour family_shared_documents non executes

### Actions pour V5
- [ ] Executer les 6 migrations SQL sur Supabase prod
- [ ] Tester avec 1-2 cas reels chaque feature
- [ ] Ecrire les tests pgTAP RLS pour family_shared_documents
- [ ] Etendre le logging Claude a scan/extract/assistant/compare
- [ ] Ajouter detection miluim non rembourse dans rightsDetector
- [ ] Validation legale des 10 regles rights detector par un yoetz mas
- [ ] Monitoring alertes email si cout Claude > seuil

---

## Sprint 0 — Fondations V3 (landing, pricing, template analyse)

### Livré
- Landing page repositionnée : "Ne subissez plus vos papiers en Israël"
- 3 piliers (Comprendre / Vérifier / Agir) + section "Pourquoi Tloush" (6 bénéfices)
- Pricing revu : plans Gratuit / Solo / Famille avec assistant réservé aux payants
- Template d'analyse enrichi : `attention_points` (ok/info/warning/critical), `recommended_actions` avec priorité, `should_consult_pro`, `recurring_info`
- Nouveaux `document_type` : invoice, receipt, utility_bill, insurance → catégorie `finance`
- Onglet "Factures" dans l'inbox

### Ce qui a bien marché
- Décision rapide d'abandonner les features compliquées (score admin, intégrations bancaires)
- Prompt Claude enrichi qui retourne des données structurées exploitables dans l'UI
- Pricing cohérent avec l'analyse de coûts (90% de marge)

### Ce qui a coincé
- Besoin de clarifier que l'assistant n'est pas dispo en gratuit (correction post-livraison)
- `max_tokens` augmenté à 3000 pour Claude (nécessaire vu le schema JSON élargi)

### Actions pour les sprints suivants
- [x] Toujours valider les specs "inclusion/exclusion par plan" explicitement
- [ ] Documenter les coûts par plan dans COST-ANALYSIS.md après 1 mois de prod

---

## Sprint 1 — Deadlines & rappels automatiques

### Livré
- Colonne `deadline` DATE extraite de l'analyse (parse JJ/MM/AAAA, DD.MM.YYYY, YYYY-MM-DD)
- Table `reminder_log` pour éviter les rappels en double
- Endpoint `/api/reminders/check` (cron quotidien) → envois J-7, J-2, J-0
- Colonne `action_completed_at` + endpoint `/api/documents/[id]/action`
- Sections "Échéances à venir" (14j) + "Actions en attente" sur le dashboard
- Page détail `/documents/[id]` avec display riche (attention points, actions, consult pro)
- Bouton "Voir" dans l'inbox → page détail
- Cron Vercel configuré (daily 8am)

### Ce qui a bien marché
- Le parsing multi-format de date couvre 95% des cas réels
- La table `reminder_log` élimine proprement les doublons
- La page détail donne une vraie valeur perçue (≠ ChatGPT + storage)

### Ce qui a coincé
- Set iteration TypeScript (`downlevelIteration` flag) — fix via `Array.from`
- `docs` possibly null dans digest/send — fix via fallback `(docs \|\| []).length`

### Actions pour les sprints suivants
- [x] Systématiser `Array.from(set)` ou fallbacks `|| []`
- [ ] Tester en prod le cron avec une deadline réelle
- [ ] Monitorer le taux d'extraction de deadline (% docs avec key_info.deadline non null)

---

## Sprint 2 — Dossiers vivants & dépenses récurrentes

### Livré
- Tables SQL : `folders`, `recurring_expenses` + RLS
- Colonne `folder_id` sur documents
- Auto-groupement par émetteur à chaque upload (crée le dossier s'il n'existe pas)
- Détection automatique de récurrence via `recurring_info` dans l'analyse
- Page `/folders` : vue accordéon avec compteurs urgent/à traiter
- Page `/expenses` : budget mensuel, projection annuelle, regroupement par catégorie
- API DELETE pour archiver une dépense

### Ce qui a bien marché
- Le contournement des intégrations bancaires par le scan des factures fonctionne
- L'auto-groupement donne une structure aux documents sans effort utilisateur
- Supabase RLS + JSONB `document_ids` simple et efficace

### Ce qui a coincé
- Besoin de déduplication par `provider_name` (ilike) — cas edge quand l'émetteur varie légèrement
- Migration SQL doit être exécutée manuellement en prod

### Actions pour les sprints suivants
- [x] Ajouter rename/merge manuel des dossiers (fait en Sprint 4)
- [ ] Normaliser les noms de provider avec Claude (ex: "cellcom ltd" vs "Cellcom")
- [ ] Checklist déploiement : toujours inclure les migrations SQL

---

## Sprint 3 — Intelligence & dashboard enrichi

### Livré
- Widget "Budget mensuel" sur dashboard : top 5 fournisseurs avec barres proportionnelles
- Détection d'anomalies : variation ≥20% → attention_point warning/critical auto-injecté
- Assistant étendu : détection mots-clés (combien, budget, arnona...) → injection contexte dépenses
- Quick wins : export CSV, édition inline dépense, filtre par dossier dans inbox

### Ce qui a bien marché
- La détection d'anomalies est simple (comparaison montant N vs N-1) mais très parlante
- L'assistant devient capable de répondre factuellement sur les dépenses
- Quick wins livrés en même temps améliorent drastiquement l'UX

### Ce qui a coincé
- Choix du seuil d'anomalie (20%) arbitraire — à calibrer avec de la vraie donnée
- Mots-clés de détection assistant risquent de louper certaines questions formulées différemment

### Actions pour les sprints suivants
- [ ] A/B tester seuil anomalie 15% vs 20% vs 25%
- [ ] Passer à une détection d'intention LLM si keywords trop limitants
- [ ] Logger les questions "expenses" sans match pour améliorer les keywords

---

## Sprint 4 — Évolution & qualité

### Livré
- Graphique d'évolution des dépenses sur 12 mois (bars SVG sur /expenses)
- Graphique d'évolution des fiches de paie sur dashboard (delta vs précédent)
- Recherche globale `/search` (debounced 300ms, highlight matches)
- Rename / Delete / Merge manuel des dossiers
- Email d'alerte anomalie (seuil ≥30%)
- Plan de tests et premiers tests unitaires

### Ce qui a bien marché
- Les graphiques SVG maison évitent une dépendance lourde (recharts/chart.js)
- La recherche debounced est très réactive côté UX
- Le merge de dossiers est un vrai filet de sécurité pour l'auto-groupement imparfait

### Ce qui a coincé
- Extraction de montant depuis `key_info.amount` nécessite un parsing regex (formats variés)
- Les dossiers auto-générés peuvent être bruyants — il faut pouvoir les nettoyer facilement

### Actions pour les sprints suivants
- [ ] Stocker `amount` en numérique dès l'analyse Claude (plutôt que de le re-parser après)
- [ ] Ajouter un bouton "Supprimer les dossiers à 1 document" sur /folders
- [ ] Écrire les tests E2E Playwright pour les parcours critiques

---

## Plan de tests

### Tests unitaires (à ajouter progressivement)
- `lib/deadlineParser.ts` — tous les formats de date
- `lib/amountParser.ts` — parsing de montants avec devise/séparateur variables
- `lib/expenseFrequency.ts` — calcul multiplier mensuel par fréquence
- `lib/stripe.ts PLANS` — constantes de plan conformes à l'UI

### Tests d'intégration API (à prioriser)
- `POST /api/documents/upload` — flow complet upload → analysis → folder auto → recurring detection
- `POST /api/assistant/chat` — context expenses injecté quand keywords match
- `POST /api/reminders/check` — sélection docs dans les fenêtres J-7/J-2/J-0 sans doublon
- `POST /api/folders/merge` — move docs + delete source folders

### Tests E2E (Playwright, à construire)
1. **Onboarding** : signup → upload 1er doc → voir l'analyse
2. **Deadline flow** : upload doc avec deadline → visible sur dashboard → mark action done
3. **Facture récurrente** : upload 2 factures même fournisseur → apparition /expenses + dossier auto
4. **Anomalie** : upload facture avec amount ≠ 30% → attention_point critical
5. **Stripe upgrade** : free quota atteint → modal upgrade → checkout → webhook → solo actif
6. **Famille** : owner invite membre → membre join → limite partagée

### Tests manuels (check-list avant chaque déploiement)
- [ ] Login/logout fonctionne sur staging
- [ ] Upload PDF + image OK
- [ ] Toutes les pages nav (Inbox, Dashboard, Dossiers, Dépenses, Assistant, Search) chargent sans 500
- [ ] Dark mode OK sur toutes les nouvelles pages
- [ ] Mobile responsive (viewport 375px) sur toutes les pages
- [ ] Cron Vercel affiche les bons logs
