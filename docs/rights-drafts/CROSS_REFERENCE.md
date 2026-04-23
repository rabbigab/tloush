# CROSS REFERENCE — MASTER_INDEX ↔ benefitsCatalog.ts

Diff entre les **116 fiches** du MASTER_INDEX (recherche exhaustive) et les **56 slugs** actuellement dans `src/lib/benefitsCatalog.ts`.

**Date** : 2026-04-15
**Base** : commit `7a78786` (wave 4/1 en cours)

---

## 📊 Résumé

| Statut | Nombre | % |
|---|---|---|
| ✅ Déjà dans le catalogue (exact ou équivalent) | ~22 | 19% |
| 🆕 Nouvelles entrées à ajouter (profil actuel suffit) | ~60 | 52% |
| ⚠️ Nouvelles entrées nécessitant de nouveaux champs profil | ~34 | 29% |
| **Total MASTER_INDEX** | **~116** | **100%** |

---

## ✅ Déjà dans le catalogue (ne rien faire, sauf update montants)

| Slug MASTER_INDEX | Slug catalogue actuel | État |
|---|---|---|
| `kitzvat_ezrach_vatik` | `old_age_pension` | ✅ OK (audit 14/04) |
| `tosefet_hashlamat_hakhnasa` | `old_age_income_supplement` | ✅ |
| `kitzvat_yeladim` | `kitsbat_yeladim` | ✅ |
| `hisakhon_lekhol_yeled` | `chisachon_lekol_yeled` | 🔄 Update montant (70k NIS à 18 ans) |
| `maanak_leyda` | `maanak_leida` | ✅ (audit 14/04) |
| `dmei_leyda` | `dmei_leida_full` + `dmei_leida_short` | 🔄 Update 1752 NIS/jour |
| `nakhut_klalit` | `disability_pension_general` | 🔄 Update 4711 (pas 4771) |
| `gimlat_sioud` | `gimlat_sicud` | ✅ (ajouté wave 2/2) |
| `kitzvat_shaarim` | `survivor_pension_spouse` | ✅ |
| `dmei_avtala` | `dmei_avtala` | ✅ |
| `havtachat_hakhnasa` | `hashlamat_hachnasa` | 🔄 Update montants tranches |
| `maanak_limudim` | `maanak_limudim` | ✅ (wave 3/1) |
| `horim_meametzim` / `dmei_omna` | `dmei_imutz` (partiel) | ⚠️ Couverture partielle |
| `tagmulei_miluim` | `tagmulei_miluim` | ✅ |
| `sal_klita` | `sal_klita` | ✅ |
| `ulpan_olim` | `ulpan_free` | ✅ |
| `arnona_hanacha_olim` | `arnona_olim` | ✅ |
| `ezrat_shekher_olim` | `rental_assistance_olim` | ✅ |
| `mashkanta_olim` | `mashkanta_olim` | ✅ |
| `nekudot_zikui_yeladim` | `credit_young_child` | ✅ (audit 14/04) |
| `hanakat_mas_hakhnasa_olim` | `oleh_2026_full_exemption` | 🔄 Update nekudot structure |
| `mas_rechisha_olim` | `olim_purchase_tax_reduction` | 🔄 Update 1 978 745 NIS |
| `hanakha_arnona_niztolei_shoah` | `holocaust_arnona_full_exemption` | ✅ (wave 1) |
| `hanakha_arnona_vatikim` | `arnona_retiree` | 🔄 Update 30% + revenu<13 222 |
| `minhal_hastudentim_olim` | `student_authority_olim` | ✅ |
| `hanakha_tahbura_tziburit` | `rav_kav_senior_free` + `rav_kav_disability_discount` + `rav_kav_discharged_soldier` | ✅ (wave 3/3) |

---

## 🆕 TOP 20 à ajouter EN PRIORITÉ (haut impact, profil actuel suffit)

Ces entrées peuvent être ajoutées **sans migration Supabase** en utilisant uniquement les champs existants de `UserProfile`.

| Slug | Source | Valeur estimée | Profil existant nécessaire |
|---|---|---|---|
| `hachzar_mas` | Source 4 | ~4 000/an | employment_status + israeli_citizen |
| `maonot_yom` | déjà ajouté | 30 000/an | children_birth_dates + employment |
| `tsaharon` | déjà ajouté | 10 000/an | children_birth_dates + employment |
| `kitzva_keren_sif2_claims` | Source 5/14 | 2 670/mois | is_holocaust_survivor |
| `maanak_shnati_shoah` | Source 5 | 7 688/an | is_holocaust_survivor |
| `maanak_matzeva_shoah` | Source 5 | 2 022 one-shot | is_holocaust_survivor |
| `tagmul_basissi_nakhei_tsahal` | Source 11 | 1 161-5 807/mois | served_in_idf + disability_level≥20 |
| `tagmul_ovedan_kosher_avoda` | Source 11 | 8 275-12 435/mois | served_in_idf + disability_level |
| `maanak_had_paami_nakhei_tsahal` | Source 11 | 62 719-134 961 one-shot | served_in_idf + disability_level 10-19 |
| `petur_mas_nakhut` | Source 4 | exonération totale | disability_level≥90 |
| `siyua_khomri_ezrakhim_vatikim` | Source 6 | 14 520/an | age≥62F/67M |
| `maanak_khimum` | Source 1 | ~600/an (hiver) | age≥67 + zone froide |
| `bituach_briut_olim` | Source 2 | 6 mois gratuits | aliyah_year récent + employment=unemployed |
| `tipulei_shinayim_vatikim` | Source 7 | couverture partielle | age≥72 |
| `shmirat_herayon` | Source 1 | 100% salaire temp | required_gender=female + employed |
| `maanak_ptira` | Source 1 | one-shot | is_bereaved_family |
| `dmei_kvura` | Source 1 | ~9 500 one-shot | is_bereaved_family |
| `shikum_miktzoi` | Source 1 | formation gratuite | disability_level≥20 |
| `dmei_kiyum_olim` | Source 2 | ~2 400/mois | aliyah_years_range [0, 1] |
| `gan_khofshi_olim` | Source 2 | ~12 000/an | aliyah récent + children_in_daycare |

---

## ⚠️ Nouvelles entrées nécessitant de nouveaux champs `UserProfile`

Ces entrées ne peuvent **PAS** être ajoutées tant que le profil n'est pas enrichi. Nécessitent une **migration Supabase** + mise à jour du type `UserProfile`.

### Champs profil à ajouter (grouping par migration)

**Migration 1 — IDF détaillé** :
- `discharge_date: date`
- `service_duration_months: number`
- `service_type: 'obligatory' | 'professional' | 'national'`
- **Débloque** : `nekudot_zikui_khayalim_meshukrarim`, `ptor_bituakh_khayalim_meshukrarim`, `maanak_avoda_nidreshet`

**Migration 2 — Shoah détaillé** :
- `shoah_persecution_type: text`
- `shoah_persecution_country: text`
- `shoah_immigration_before_1953: boolean`
- `shoah_receives_gmala: boolean`
- `shoah_claims_conference_sif2: boolean`
- `is_shoah_survivor_spouse: boolean`
- `shoah_worked_in_ghetto: boolean` (ZRBG)
- `shoah_receives_beg: boolean`
- **Débloque** : `gmala_niztolei_shoah_misrad_haotzer` (détails), `tagmul_niztolei_shoah_vatik`, `maanak_hardship_fund_claims`, `kitzva_beg_niztolei_shoah`, `tagmul_shaarim_niztolei_shoah`

**Migration 3 — Logement détaillé** :
- `is_homeowner: boolean` / `is_tenant: boolean`
- `property_size_sqm: number`
- `rental_income_monthly: number`
- `is_landlord: boolean`
- `city_priority_zone: 'A' | 'B' | 'none'`
- **Débloque** : `petur_mas_shkhirat_dira`, `zikuy_mas_priferia`, `yivua_meshek_bayit`, `dira_tziburit`, `siyua_mugdal_dira_tziburit`

**Migration 4 — Santé détaillée** :
- `has_chronic_illness: boolean`
- `has_serious_illness: boolean`
- `disability_type: 'psychiatric' | 'physical' | 'mixed'`
- `hearing_aid_user: boolean`
- `vision_impairment: boolean`
- **Débloque** : `sal_shikum_mitmodedei_nefesh`, `petur_mas_hakhnasa_huhul`, `sherutim_meyukhadim`

**Migration 5 — Fiscal détaillé** :
- `capital_income_annual: number`
- `pension_voluntary_contribution_annual: number`
- `has_academic_degree: boolean` (existe déjà via education_level)
- **Débloque** : `hatavat_mas_gil_60`, `hatavot_mas_pensia_atzmai`

**Migration 6 — 7 octobre / Kharvot Barzel** :
- `is_7octobre_victim: boolean`
- `7octobre_exposure_level: 1 | 2 | 3`
- `is_family_of_fallen_civilian: boolean`
- `is_hostage_family: boolean`
- `is_miluim_active: boolean`
- **Débloque** : `maanak_sal_shikum_nifgaei_7_octobre`, `kitzvat_mishpakha_nifgaei_peulot_eyva`, `tagmulei_miluim_kharvot_barzel`, `siyua_tipulim_miluim`

**Migration 7 — Misrad HaBitakhon (IDF invalides, distinct BL)** :
- `disability_recognized_before_1996: boolean`
- `disability_is_special: boolean`
- `disability_level_mod: number` (% Misrad HaBitakhon, distinct de `disability_level` BL)
- `is_nazi_war_invalid: boolean`
- **Débloque** : les 4 fiches Source 11 (Misrad HaBitakhon)

---

## 📦 Livrables à produire par l'utilisateur

Pour que chaque fiche `_pending/{slug}.md` soit intégrable, il faut :

1. **Une fiche complète** par aide selon le template `docs/rights-catalog-template.md`
2. Priorité : commencer par les **TOP 20** (profil actuel suffit)
3. Ensuite : grouper par migration (1-7) et proposer la migration Supabase correspondante
4. Enfin : les ~10 aides marginales / niches (asirei_tzion, khasidei_umot_olam, etc.)

## 🎯 Prochain plan d'action suggéré

### Phase A — Quick wins sans migration (1-2 sessions Claude Code)
Intégrer les **TOP 20** dans le catalogue (via le workflow standard : fiche → `_pending/` → Claude ajoute au catalogue → merge).

### Phase B — Migrations Supabase (3-4 sessions)
Créer les 7 migrations groupées ci-dessus + mettre à jour le type `UserProfile` + ajouter les checks dans `rightsDetector.matchProfile()`.

### Phase C — Intégration des entrées débloquées (2-3 sessions)
Ajouter les ~74 entrées restantes au catalogue, par batch de 5-10 par session.

### Phase D — Updates montants 2026 sur entrées existantes (1 session)
Corriger les montants des entrées marquées 🔄 dans la table "Déjà dans le catalogue".

### Phase E — Marginal & niche (1 session)
Ajouter les aides peu courantes (asirei_tzion, khasidei_umot_olam, harugui_malkhut, etc.) en bloc.

---

**Total estimé** : 8-12 sessions Claude Code pour atteindre 100% de couverture du MASTER_INDEX.
