# TLOUSH V3 — ROADMAP BMAD

## Vision produit
Transformer Tloush d'un "lecteur de fiche de paie" en **assistant administratif et financier complet pour francophones en Israel**.

---

## ETAT ACTUEL (ce qui est en production)

| Module | Status |
|--------|--------|
| Upload + analyse IA (Claude Sonnet 4.5) | LIVE |
| Assistant IA conversationnel (5 msg/mois free) | LIVE |
| Extraction paiement (liens, references, banque) | LIVE |
| Detection "c'est fait" dans le chat | LIVE |
| Depenses recurrentes manuelles | LIVE |
| Programme de parrainage | LIVE |
| Toast notifications + barre progression upload | LIVE |
| Emails post-analyse + rappels deadline (cron) | LIVE |
| Hub d'aide (6 guides olim + FAQ) | LIVE |
| WhatsApp bot (endpoint pret) | LIVE |
| CI/CD GitHub Actions | LIVE |
| OCR ameliore (Sharp preprocessing) | LIVE |
| Onboarding guide interactif | LIVE |
| Calculateur brut->net israelien | LIVE |
| Verification auto fiches de paie | LIVE |
| Comparaison contrat vs fiche de paie | LIVE |
| Comparaison mois N vs N-1 | LIVE |

---

## EPIC 1 — MOTEUR DE DROITS SALARIES
> Objectif: L'utilisateur sait exactement quels sont ses droits et si son employeur les respecte.

### Sprint 1.1 — Verificateur de droits (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 1.1.1 | Creer `src/lib/employeeRights.ts` — moteur de calcul des droits: conges (par anciennete), maladie (cumul + paiement), havra'a, preavis, pitzouim, heures sup max, pension obligatoire | OUI | M |
| 1.1.2 | Integrer la verification des droits dans l'upload: apres analyse d'une fiche de paie, comparer les donnees extraites avec les droits calcules et ajouter des attention_points automatiques | OUI | M |
| 1.1.3 | Ajouter une page `/rights-check` avec formulaire: anciennete, type de poste, temps plein/partiel → affiche tous les droits avec montants | OUI | L |

### Sprint 1.2 — Analyse contrat de travail (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 1.2.1 | Enrichir le prompt Claude pour les contrats: extraire clause par clause (salaire, heures, pension, keren hishtalmut, preavis, non-concurrence, Section 14, periode d'essai) dans `analysis_data.contract_details` | OUI | M |
| 1.2.2 | Page `/contract-analysis` avec checklist visuelle: chaque clause du contrat avec status vert/orange/rouge selon conformite au droit du travail | OUI | L |

### Sprint 1.3 — Rapport d'ecarts contrat vs fiche (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 1.3.1 | Ameliorer `/api/documents/compare-contract` pour generer un rapport structure: tableau des ecarts, recommandations, questions a poser au RH | OUI | M |
| 1.3.2 | Historiser les comparaisons: sauvegarder chaque rapport dans une table `contract_comparisons` pour suivi dans le temps | BESOIN USER (migration SQL) | S |

---

## EPIC 2 — RETRAITE, PENSION, EPARGNE SALARIALE
> Objectif: L'utilisateur comprend et verifie ses cotisations retraite.

### Sprint 2.1 — Navigateur pension (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 2.1.1 | Creer `src/lib/pensionCalculator.ts` — calculs: keren pensia, bituach menahalim, keren hishtalmut, kupat gemel. Frais de gestion (0.22%+1% defaut vs 0.5%+6% non-defaut), plafonds, avantages fiscaux, ages de retrait | OUI | L |
| 2.1.2 | Page `/pension` avec simulateur: "Combien j'aurai a la retraite?" basee sur salaire actuel, age, anciennete, type de fonds | OUI | L |
| 2.1.3 | Verification auto pension dans upload: comparer cotisation pension extraite vs obligatoire (6%+6.5%+6%), alerter si manquante ou sous-cotisee | OUI | M |

### Sprint 2.2 — Projection impact (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 2.2.1 | Calculateur de manque a gagner: "Si votre pension n'a pas ete versee pendant X mois, l'ecart potentiel a la retraite est de Y₪" | OUI | M |
| 2.2.2 | Alerte pension dans le dashboard: widget montrant le total des cotisations detectees vs attendues sur les X derniers mois | OUI | S |

---

## EPIC 3 — BITUACH LEUMI & AIDES
> Objectif: L'utilisateur sait a quelles aides il a droit et comment les demander.

### Sprint 3.1 — Navigateur Bituach Leumi (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 3.1.1 | Creer `src/lib/bituachLeumi.ts` — base de donnees des 15+ programmes BL: retraite, chomage, maternite, allocations enfants, invalidite, accident travail, miluim, avec conditions d'eligibilite et montants 2025 | OUI | L |
| 3.1.2 | Page `/bituach-leumi` avec questionnaire d'eligibilite: situation familiale, emploi, anciennete, evenements recents → liste des droits potentiels avec montants estimes | OUI | L |
| 3.1.3 | Enrichir le prompt Claude pour documents BL: extraire type exact (allocation, convocation, confirmation, appel), montants, periodes, delais de recours | OUI | M |

### Sprint 3.2 — Assistant formulaires (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 3.2.1 | Guide formulaire 101: explication champ par champ en francais, avec les nekudot zikui, situation familiale, revenus secondaires | OUI | M |
| 3.2.2 | Guide formulaire 106: comprendre son recapitulatif annuel, verifier coherence avec fiches de paie, identifier droit a remboursement d'impot | OUI | M |

---

## EPIC 4 — GENERATION DE DOCUMENTS
> Objectif: L'utilisateur peut exporter des rapports et generer des courriers.

### Sprint 4.1 — Export PDF (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 4.1.1 | Installer une lib PDF (ex: @react-pdf/renderer ou jspdf) et creer `src/lib/pdfGenerator.ts` — generer un rapport PDF bilingue FR/HE: resume anomalies, droits, vocabulaire, prochaines etapes | OUI | L |
| 4.1.2 | Endpoint `/api/documents/[id]/pdf` + bouton "Telecharger le rapport" dans DocumentDetailClient | OUI | M |

### Sprint 4.2 — Generateur de courriers (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 4.2.1 | Creer `/api/generate-letter` — endpoint qui genere un courrier formel en hebreu via Claude: reclamation employeur, demande BL, courrier bailleur, mise en demeure | OUI | M |
| 4.2.2 | Page `/letters` avec templates: "Reclamer des heures sup non payees", "Demander un certificat de travail", "Contester une charge d'arnona", "Demander un remboursement BL" | OUI | L |
| 4.2.3 | Export "pour comptable/RH/avocat" — format structure avec annexes, references legales, vocabulaire HE/FR | OUI | M |

---

## EPIC 5 — ASSISTANT FINANCIER DU QUOTIDIEN
> Objectif: Tloush aide l'utilisateur a optimiser ses finances au quotidien.

### Sprint 5.1 — Budget planner israelien (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 5.1.1 | Creer `src/lib/budgetPlanner.ts` — modele budget israelien: salaire net, arnona (par ville), mashkanta, va'ad bayit, electricite, eau, internet, supermarche, transport, education, assurances | OUI | M |
| 5.1.2 | Page `/budget` avec saisie interactive: revenus + depenses fixes → affiche reste a vivre, benchmarks par ville, recommandations | OUI | L |
| 5.1.3 | Integration avec depenses detectees: pre-remplir le budget avec les depenses recurrentes deja identifiees dans l'onglet Depenses | OUI | M |

### Sprint 5.2 — Audit depenses intelligent (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 5.2.1 | Creer `src/lib/expenseAuditor.ts` — detecter anomalies: abonnements en double, hausses anormales, depenses au-dessus de la moyenne israelienne (benchmarks par categorie) | OUI | M |
| 5.2.2 | Widget dashboard "Ou economiser?" — top 3 postes de depenses optimisables avec estimation d'economie | OUI | S |

### Sprint 5.3 — Simulateur mashkanta (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 5.3.1 | Creer `src/lib/mortgageCalculator.ts` — simulateur pret immobilier israelien: taux BOI, mix prime/CPI/variable, calcul mensualites, cout total, amortissement | OUI | L |
| 5.3.2 | Page `/mortgage` avec formulaire et graphiques: montant, duree, taux → tableau d'amortissement + comparaison de scenarios | OUI | L |

---

## EPIC 6 — MODE FREELANCE / INDEPENDANT
> Objectif: Couvrir les osek patur/murshe francophones en Israel.

### Sprint 6.1 — Moteur fiscal independant (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 6.1.1 | Creer `src/lib/freelanceCalculator.ts` — calculs: osek patur vs murshe, seuil TVA (120,000₪), cotisations BL independant (4.45%/12.55%), pension independant obligatoire, impot sur le revenu, avances trimestrielles | OUI | L |
| 6.1.2 | Page `/freelance` avec simulateur: CA annuel → impot, BL, pension, TVA, net reel | OUI | L |
| 6.1.3 | Dashboard freelance: suivi CA mensuel, echeances TVA (bi-mensuelle), echeances mas hachnasa, rappels automatiques | OUI | L |

### Sprint 6.2 — Gestion factures freelance (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 6.2.1 | Enrichir l'analyse des factures emises: extraire TVA, montant HT/TTC, numero osek, categoriser par type de depense fiscale | OUI | M |
| 6.2.2 | Export recapitulatif fiscal: resume annuel des revenus et depenses deductibles pour le comptable (format compatible formulaire 1301) | OUI | L |

---

## EPIC 7 — OPTIMISATION FOYER
> Objectif: Outils pratiques pour la vie quotidienne en Israel.

### Sprint 7.1 — Arnona (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 7.1.1 | Creer `src/lib/arnonaCalculator.ts` — estimation arnona par ville/zone/surface, remises eligibles (oleh hadash, etudiant, handicap, revenu bas, milouimnik), processus de contestation | OUI | M |
| 7.1.2 | Page `/arnona` — simulateur + checklist des remises potentielles + generation de lettre de contestation | OUI | L |

### Sprint 7.2 — Comparateurs (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 7.2.1 | Page `/compare-insurance` — comparateur d'assurances: auto (hovah+mekif), habitation, sante complementaire. Formulaire situation → tableau comparatif avec fourchettes de prix | OUI | L |
| 7.2.2 | Page `/compare-utilities` — comparateur services: electricite, eau, gaz, internet, mobile. Tarifs actuels par fournisseur | OUI | M |
| 7.2.3 | Enrichir l'analyse des factures: detecter si le montant est au-dessus de la moyenne pour le type de service et la zone | OUI | M |

---

## EPIC 8 — INTELLIGENCE REGLEMENTAIRE
> Objectif: L'utilisateur est informe des changements qui l'affectent.

### Sprint 8.1 — Veille et alertes (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 8.1.1 | Creer `src/lib/regulatoryUpdates.ts` — base des mises a jour reglementaires 2025: salaire minimum, tranches impot, seuils BL, plafonds pension. Versionnee pour mettre a jour facilement | OUI | M |
| 8.1.2 | Notification dans le dashboard quand une regle change: "Le salaire minimum passe a X₪ le 1er avril — verifiez votre prochaine fiche de paie" | OUI | S |

### Sprint 8.2 — Validation contexte employeur (2 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 8.2.1 | Enrichir l'extraction: detecter et valider le numero d'entreprise (ח.פ) de l'employeur sur les fiches de paie et contrats | OUI | S |
| 8.2.2 | Validation Teudat Zehut: verifier le checksum du numero d'identite israelien extrait des documents | OUI | S |

---

## EPIC 9 — UX / INTERFACE BILINGUE
> Objectif: Interface professionnelle FR/HE avec RTL propre.

### Sprint 9.1 — Ameliorations UX (3 stories)

| Story | Description | Autonome? | Complexite |
|-------|-------------|-----------|------------|
| 9.1.1 | Ajouter le support des dates israeliennes (format DD/MM/YYYY) et montants en shekels avec separateurs corrects partout dans l'app | OUI | S |
| 9.1.2 | Respecter Shabbat dans les rappels: ne pas envoyer d'emails entre vendredi 14h et samedi 21h (Israel time) | OUI | S |
| 9.1.3 | Ameliorer le dashboard: ajouter widget "Vos droits du mois", widget "Economie potentielle", widget "Prochaines echeances" | OUI | L |

---

## PLANNING SPRINTS

### Phase 1 — Semaines 1-2 (Core droits + export)
- Sprint 1.1 — Verificateur de droits (3 stories)
- Sprint 4.1 — Export PDF (2 stories)
- Sprint 8.1 — Veille reglementaire (2 stories)
**Total: 7 stories | 100% autonome**

### Phase 2 — Semaines 3-4 (Pension + BL + Courriers)
- Sprint 2.1 — Navigateur pension (3 stories)
- Sprint 3.1 — Navigateur Bituach Leumi (3 stories)
- Sprint 4.2 — Generateur de courriers (3 stories)
**Total: 9 stories | 100% autonome**

### Phase 3 — Semaines 5-6 (Financier + Budget)
- Sprint 5.1 — Budget planner (3 stories)
- Sprint 5.2 — Audit depenses (2 stories)
- Sprint 5.3 — Simulateur mashkanta (2 stories)
**Total: 7 stories | 100% autonome**

### Phase 4 — Semaines 7-8 (Freelance + Foyer)
- Sprint 6.1 — Moteur fiscal independant (3 stories)
- Sprint 6.2 — Gestion factures freelance (2 stories)
- Sprint 7.1 — Arnona (2 stories)
**Total: 7 stories | 100% autonome**

### Phase 5 — Semaines 9-10 (Comparateurs + UX + Contrats)
- Sprint 1.2 — Analyse contrat (2 stories)
- Sprint 1.3 — Rapport ecarts (2 stories)
- Sprint 7.2 — Comparateurs (3 stories)
- Sprint 9.1 — UX (3 stories)
**Total: 10 stories | 1 necessite migration SQL**

### Phase 6 — Semaines 11-12 (Pension avancee + BL formulaires + Validation)
- Sprint 2.2 — Projection pension (2 stories)
- Sprint 3.2 — Assistant formulaires (2 stories)
- Sprint 8.2 — Validation contexte (2 stories)
**Total: 6 stories | 100% autonome**

---

## RECAPITULATIF

| Metrique | Valeur |
|----------|--------|
| Epics | 9 |
| Sprints | 17 |
| Stories | 46 |
| Stories 100% autonomes (Claude) | 45 |
| Stories necessitant intervention user | 1 (migration SQL) |
| Nouvelles pages | ~12 |
| Nouveaux modules lib/ | ~10 |
| Estimation totale | 6 phases / ~12 semaines |

---

## DEPENDANCES USER (a valider)

1. **Migration SQL** (Sprint 1.3): table `contract_comparisons` — je fournirai le SQL, tu l'executes dans Supabase Studio
2. **Donnees arnona par ville**: je coderai les principales villes (Jerusalem, Tel Aviv, Haifa, Beer Sheva, Netanya, Ashdod, Raanana, Herzliya) mais tu pourras en ajouter
3. **Tarifs assurance/utilities**: je mettrai des fourchettes de prix 2025 basees sur les donnees publiques, a affiner si tu as des sources plus precises
4. **Verification comptable**: les calculs BL/impot/pension sont bases sur les baremes officiels 2025 mais un expert-comptable devrait valider avant communication aux users

---

## PRINCIPES ARCHITECTURE

1. **Ne pas toucher a ce qui marche** — les routes existantes (upload, assistant, inbox) ne sont modifiees que par enrichissement (ajout de champs, pas de refactoring)
2. **Modules lib/ isoles** — chaque calculateur est un module TypeScript pur, testable independamment, sans dependance aux routes
3. **Enrichissement progressif du prompt** — les connaissances sont ajoutees au system prompt de maniere additive
4. **Pages independantes** — chaque nouvelle page est autonome, pas de couplage entre features
5. **Backward compatible** — aucune modification de schema DB existant, uniquement des ajouts
6. **Test avant deploy** — `npx tsc --noEmit` systematique avant chaque push
