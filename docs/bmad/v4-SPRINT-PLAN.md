# Tloush V4 — Sprint Plan

> Version: 4.0
> Date: 2026-04-12
> Scrum Master: Claude Code (solo dev)
> Voir aussi: `v4-FEASIBILITY.md`, `v4-ARCHITECTURE.md`, `EPICS.md`

---

## 1. Vue d'ensemble

**Approche :** 7 sprints (1 prereq + 6 features), 1 feature = 1 sprint. Ordre optimise pour livrer la valeur tot et debloquer les dependances.

```
Sprint 0   EPIC 9  Profil enrichi          —  3h  [PREREQUIS BLOQUANT]
Sprint 1   EPIC 10 Admin monitoring        — 12h  [fondation observabilite]
Sprint 2   EPIC 11 Family UI               — 10h  [debloque EPIC 13, 15]
Sprint 3   EPIC 12 Miluim tracker          — 11h  [gain rapide, feature isolee]
Sprint 4   EPIC 13 Tax refund estimator    — 13h  [valeur forte, conversion premium]
Sprint 5   EPIC 14 Annual payslip compare  — 11h  [profondeur produit]
Sprint 6   EPIC 15 Rights detector MVP     — 14h  [waouh effect, acquisition]
                                     Total ~74h
```

---

## 2. Justification de l'ordre

### Pourquoi Sprint 0 en premier ?
L'analyst a identifie que sans profil utilisateur enrichi (alyah, enfants, situation familiale), les features #5, #6 et #10 ne peuvent pas personnaliser leurs calculs. C'est un **prerequis bloquant**.

### Pourquoi #17 Admin monitoring avant tout le reste ?
On va consommer ~40h de Claude API pendant les 5 sprints de features. **Sans observabilite, on est aveugles sur les couts et les erreurs**. #17 doit etre livre d'abord pour monitorer la suite.

### Pourquoi #12 Family en 2e ?
La table `family_members` existe deja sans UI. Cette UI debloque :
- #5 Tax refund (deductions enfants, conjoint)
- #10 Rights detector (droits familiaux)

### Pourquoi #6 Miluim en 3e ?
Feature la plus simple (S complexite), isolee, reutilise `bituachLeumi.ts` → **livraison rapide** pour valider la stack monitoring et redonner de l'elan.

### Pourquoi #5 Tax refund en 4e ?
Depend de #12 (deductions famille). Valeur business enorme (conversion premium). Complexite L, a faire quand la stack est stable.

### Pourquoi #8 Annual payslip en 5e ?
Pas de dependance critique, mais beneficie de la normalisation des extractions apres #5. Feature de **profondeur produit** (retention).

### Pourquoi #10 Rights detector en dernier ?
Feature la plus risquee (XL, faux positifs). Doit **agreger** tout : profil (Sprint 0), miluim (Sprint 3), tax refund (Sprint 4). A faire en dernier pour maximiser les signaux disponibles.

---

## 3. Sprint-by-sprint breakdown

### Sprint 0 — EPIC 9 : Profil enrichi (3h)

| # | Tache | Effort | Dependance |
|---|-------|--------|------------|
| 0.1 | Migration SQL `profile_enrichment` | 30min | - |
| 0.2 | Page `/profile/edit` avec nouveaux champs | 1h30 | 0.1 |
| 0.3 | Validation Zod + API PATCH | 30min | 0.1 |
| 0.4 | Progress bar "profil rempli a X%" | 30min | 0.2 |

**Livrable :** Profil complet avec situation familiale, alyah, enfants, handicap, emploi.

---

### Sprint 1 — EPIC 10 : Admin monitoring (12h)

| # | Tache | Effort | Dependance |
|---|-------|--------|------------|
| 1.1 | Migration `admin_metrics` + materialized view | 1h | - |
| 1.2 | `claudeWrapper.ts` — wrapper centralise tous appels Claude | 2h | - |
| 1.3 | `metrics.ts` + `claudePricing.ts` | 1h | 1.1 |
| 1.4 | Migration de tous les routes Claude vers le wrapper | 2h | 1.2 |
| 1.5 | Page `/admin/monitoring` + widgets | 3h | 1.3 |
| 1.6 | Journal erreurs + table `error_log` | 2h | 1.1 |
| 1.7 | Cron refresh admin stats | 30min | 1.1 |
| 1.8 | Alerte email si cout > seuil | 30min | 1.3 |

**Livrable :** Dashboard admin avec perf, couts Claude, taux d'erreur, top users.

---

### Sprint 2 — EPIC 11 : Family module UI (10h)

| # | Tache | Effort | Dependance |
|---|-------|--------|------------|
| 2.1 | Migration `family_shared_documents` + RLS | 1h | - |
| 2.2 | Tests pgTAP RLS (obligatoire avant deploiement) | 2h | 2.1 |
| 2.3 | Page `/family` (liste membres, invitation) | 2h | 2.1 |
| 2.4 | Page `/family/dashboard` (vue consolidee) | 2h | 2.1 |
| 2.5 | `familySharing.ts` + API routes | 2h | 2.1 |
| 2.6 | Toggle "partager avec famille" sur page document | 1h | 2.5 |

**Livrable :** Utilisateur peut inviter conjoint + enfants, partager docs selectivement.

**Point critique :** NE PAS deployer en prod sans que 2.2 soit vert.

---

### Sprint 3 — EPIC 12 : Miluim tracker (11h)

| # | Tache | Effort | Dependance |
|---|-------|--------|------------|
| 3.1 | Migration `miluim_periods` | 30min | - |
| 3.2 | `src/lib/miluim.ts` — constantes 2025/2026 + calculs | 2h | - |
| 3.3 | Page `/miluim` avec timeline | 2h | 3.1 |
| 3.4 | Form ajout periode + upload tzav 8 | 2h | 3.2 |
| 3.5 | Calcul compensation (integration bituachLeumi.ts) | 2h | 3.2 |
| 3.6 | Generation lettre employeur (PDF bilingue) | 1h30 | 3.5 |
| 3.7 | Widget miluim sur dashboard | 1h | 3.5 |

**Livrable :** Reserviste peut tracker ses jours, estimer sa compensation, generer sa lettre.

---

### Sprint 4 — EPIC 13 : Tax refund estimator (13h)

| # | Tache | Effort | Dependance |
|---|-------|--------|------------|
| 4.1 | Migration `tax_refund_estimates` | 30min | - |
| 4.2 | Prompt `form106.ts` + route `analyze-106` | 3h | - |
| 4.3 | Ajout `tax_form_106` dans docTypes | 30min | - |
| 4.4 | `taxRefund.ts` — logique reverse-calc | 3h | Sprint 0 |
| 4.5 | Wizard 4 etapes `/tax-refund` | 3h | 4.4 |
| 4.6 | Detection points de credit manques | 2h | Sprint 0, 4.4 |
| 4.7 | Export PDF "Brouillon Tofes 135" | 1h | 4.5 |
| 4.8 | Disclaimer juridique + lien expertMatcher | 30min | - |

**Livrable :** Olim obtient estimation chiffree de son remboursement avec PDF exportable.

**Point critique :** Tester sur 5+ Tofes 106 reels avant annonce publique.

---

### Sprint 5 — EPIC 14 : Annual payslip comparator (11h)

| # | Tache | Effort | Dependance |
|---|-------|--------|------------|
| 5.1 | Vue SQL `v_payslips_normalized` | 30min | - |
| 5.2 | `payslipTimeline.ts` — construction timeline + detection | 3h | 5.1 |
| 5.3 | Page `/payslips/annual` avec tableau comparatif | 2h | 5.2 |
| 5.4 | Graphiques Recharts (barres, ligne, camembert) | 3h | 5.2 |
| 5.5 | Detection augmentations / variations | 1h30 | 5.2 |
| 5.6 | Export CSV / PDF | 1h | 5.3 |

**Livrable :** Salarie visualise son evolution sur 12 mois avec alertes sur variations.

---

### Sprint 6 — EPIC 15 : Rights detector MVP (14h)

| # | Tache | Effort | Dependance |
|---|-------|--------|------------|
| 6.1 | Migration `rights_catalog` + `detected_rights` | 1h | - |
| 6.2 | Seed des 10 regles MVP | 2h | 6.1 |
| 6.3 | `rightsDetector.ts` — moteur de regles | 3h | 6.1, Sprint 0 |
| 6.4 | Implementation des 10 regles (1 fichier par regle) | 4h | 6.3 |
| 6.5 | Page `/rights-check` — onglet "Detectes pour vous" | 2h | 6.3 |
| 6.6 | Hook auto-scan apres upload document | 1h | 6.3 |
| 6.7 | Notification dashboard si nouveaux droits | 1h | 6.5 |

**Livrable :** Utilisateur decouvre jusqu'a 10 droits potentiels personnalises.

**Point critique :** Validation legale sur les 10 regles avant deploiement.

---

## 4. Risk register

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| Cout Claude explose pendant Sprints 3-6 (analyses lourdes) | Eleve | Moyen | #17 livre en Sprint 1 → alertes en place |
| RLS Supabase mal configuree sur family_members (data breach) | Eleve | Faible | Tests pgTAP obligatoires en Sprint 2 |
| Calculs fiscaux faux → risque reputationnel | Eleve | Faible | Disclaimer partout + tests vs 5 cas reels Tofes 106 |
| Faux positifs du rights detector | Tres eleve | Moyen | MVP 10 regles a forte confiance + validation legale |
| Parser Tofes 106 ne marche pas sur tous les formats | Moyen | Moyen | Fallback manuel + log via #17 |
| Regles obsoletes (baremes 2026 differents) | Moyen | Moyen | Versioning des constantes + `last_verified_at` |
| Surcharge cognitive UI (7 features en 7 sprints) | Moyen | Moyen | Reutilisation composants existants, pas de design custom |
| User n'a pas rempli son profil → features 5/6/10 inutiles | Eleve | Eleve | Onboarding pousse + progress bar + reminder email |

---

## 5. Definition of Done (par feature)

### Criteres communs
- [ ] Code TypeScript strict, zero `any`
- [ ] Types exportes depuis `src/types/*.ts`
- [ ] RLS Supabase activee et testee
- [ ] Logging des appels Claude via wrapper Sprint 1
- [ ] Page responsive mobile
- [ ] Textes en francais
- [ ] Empty state + loading state + error state
- [ ] Tracke dans dashboard admin (#17)
- [ ] Smoke test manuel sur preview Vercel
- [ ] Entree dans `RETROSPECTIVES.md` en fin de sprint

### Specifique aux features sensibles (#5, #6, #8, #10)
- [ ] Disclaimer "estimation, pas conseil juridique"
- [ ] Lien vers source officielle (Mas Hachnasa, Bituach Leumi, Kol-Zchut)
- [ ] Validation contre au moins 3 cas reels

### Specifique au family module (#12)
- [ ] Tests pgTAP RLS verts
- [ ] Test de revocation (ex-membre perd l'acces)
- [ ] Mention CGV mise a jour

---

## 6. Parallelizable work

**Solo dev = parallelisme limite**, mais certaines taches peuvent se chevaucher :

| Parallelisable | Raison |
|----------------|--------|
| Sprint 1 task 1.6 (error_log) pendant 1.2-1.5 | Table independante du wrapper |
| Sprint 2 task 2.2 (tests RLS) pendant 2.3-2.6 | Tests sur policies stables |
| Sprint 4 task 4.8 (disclaimer) en background | Texte statique |
| Migrations SQL des sprints 3, 4, 5 | Preparables en batch des Sprint 2 |
| Prompts Claude (4.2 form106) | Testables en standalone |

**Strictement sequentiel :**
- Sprint 0 → Sprints 4 et 6 (profil requis)
- Sprint 1 → tous les autres (monitoring obligatoire)
- Sprint 2 → Sprints 4 et 6 (family_members requis)
- Sprint 3 → Sprint 6 (miluim alimente rights detector)
- Sprint 4 → Sprint 6 (tax refund alimente rights detector)

---

## 7. Jalons cles

| Jalon | Sprint | Critere |
|-------|--------|---------|
| **Profil bloquant debloqe** | 0 | Migration + page edition en prod |
| **Observabilite active** | 1 | Dashboard admin + wrapper Claude |
| **Famille debloquee** | 2 | Invitation conjoint possible |
| **Premier reserviste track** | 3 | Miluim en prod |
| **Premiere estimation remboursement** | 4 | Tax refund en prod |
| **Premiere evolution visible** | 5 | Payslip annuel en prod |
| **Premier droit reclame** | 6 | Rights detector en prod |
| **V4 complete** | 6 | 7 features livrees |

---

## 8. Taches utilisateur a anticiper

Choses que TU (l'utilisateur de Tloush) dois preparer avant certains sprints :

- **Avant Sprint 1** : Definir un seuil de cout Claude journalier (ex: $20/jour) pour les alertes
- **Avant Sprint 3** : Fournir 2-3 vrais tzav 8 pour tester le parsing miluim
- **Avant Sprint 4** : Valider 3 Tofes 106 reels (toi + 2 amis olim) pour la validation parser
- **Avant Sprint 6** : Faire valider les 10 regles MVP par un yoetz mas ou avocat francophone (liste fournie)

---

## 9. Metriques de succes V4

| Feature | KPI a surveiller |
|---|---|
| EPIC 9 Profil | % utilisateurs avec profil > 80% rempli |
| EPIC 10 Monitoring | 100% des appels Claude logges avec cout |
| EPIC 11 Family | % abonnes Famille avec >= 1 membre ajoute |
| EPIC 12 Miluim | Nombre de reservistes actifs sur l'outil |
| EPIC 13 Tax refund | Nombre d'estimations generees en beta |
| EPIC 14 Payslip annual | Temps moyen sur la page > 2 min |
| EPIC 15 Rights detector | Nombre de droits "claimed" par les users |

---

**Total V4 : ~74h sur 7 sprints.**

Chaque sprint se termine par :
1. Tests smoke
2. Commit + push
3. Entree dans `RETROSPECTIVES.md`
4. Update de la colonne "status" dans ce plan
