# Audit de fraîcheur — Guides & sources Tloush

**Date d'audit** : 2026-04-16
**Scope** : `src/lib/benefitsCatalog.ts` (125 entrées) + `memory/glossary.md` (116 entrées) + constantes fiscales/BTL (`src/lib/israeliPayroll.ts`, `taxRefund.ts`, `freelanceMode.ts`)
**Méthodologie** : extraction du champ `verified_at` de chaque entrée, classification selon l'ancienneté à la date du jour.

---

## Grille de classification

| Badge | Ancienneté | Signification |
|---|---|---|
| ✅ **Frais** | < 18 mois | Source fraîche, pas d'action requise |
| ⚠️ **À vérifier** | 18-24 mois | Revue recommandée sous 3-6 mois |
| ❌ **Périmé** | > 24 mois OU date inconnue | Revue prioritaire obligatoire |

Une entrée peut être "fraîche" en date de vérification mais **needs_verification** en statut de modélisation (problème d'éligibilité distinct de la fraîcheur du montant/source).

---

## Synthèse globale

### Fraîcheur brute (basée sur `verified_at`)

| Classification | Nombre | Pourcentage |
|---|---:|---:|
| ✅ Frais (< 18 mois) | **125 / 125** | **100 %** |
| ⚠️ À vérifier (18-24 mois) | 0 / 125 | 0 % |
| ❌ Périmé (> 24 mois ou inconnu) | 0 / 125 | 0 % |

**Toutes les entrées du catalogue ont été vérifiées entre le 2026-04-12 et le 2026-04-16** (soit entre 0 et 4 jours avant la date d'audit).

### Répartition par date de vérification

| Date | Nb entrées |
|---|---:|
| 2026-04-12 | 10 |
| 2026-04-13 | 23 |
| 2026-04-14 | 24 |
| 2026-04-16 | 68 |
| **Total** | **125** |

### Métadonnées catalogue

- `CATALOG_METADATA.version` = `2.0.0`
- `CATALOG_METADATA.last_updated` = `2026-04-16` (aujourd'hui)
- `CATALOG_METADATA.total_benefits` = `125`
- Glossaire (`memory/glossary.md`) : "Dernière mise à jour : 2026-04-16"

### Confidence & statut de modélisation

| Dimension | Valeur | Nb |
|---|---|---:|
| confidence | `high` | 99 |
| confidence | `medium` | 25 |
| confidence | `low` | 1 (`hanaka_mitaamei_tzedek`) |
| status | `verified` | 119 |
| status | `needs_verification` | 6 |
| status | `estimated` | 0 |

**Les 6 entrées `needs_verification`** (modélisation imparfaite — faux positifs possibles, date de vérification OK) :

| Slug | Motif |
|---|---|
| `kitzvat_leyda_rav_ubarit` | manque `is_multiple_birth` |
| `kitzva_yeled_pag` | manque `is_premature_birth` |
| `horim_meametzim` | manque `is_adoptive_parent` |
| `dmei_omna` | manque `is_foster_parent` |
| `maanak_histaglut_nashim_alimut` | manque `is_domestic_violence_victim` |
| `yetom_alimut_mishpakha` | manque `is_orphan_of_domestic_violence` |

### Conclusion fraîcheur catalogue

> **Rien n'est périmé sur la base du `verified_at`.** Le catalogue a bénéficié d'un cycle d'audit massif les 12-16 avril 2026 (Étape C du chantier 3 qui a doublé le catalogue de 57 à 125 entrées). Prochain rappel d'audit recommandé : **Q3 2026** (octobre 2026), pour rester sous le seuil 18 mois.

---

## Détail par autorité

Pour chaque entrée : `slug` — `verified_at` — confidence — statut. Toutes sont ✅ **Frais** (moins de 5 jours d'ancienneté).

### Bituach Leumi (BTL) — 50 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `kitsbat_yeladim` | 2026-04-12 | high | verified |
| `chisachon_lekol_yeled` | 2026-04-12 | high | verified |
| `maanak_limudim` | 2026-04-14 | high | verified |
| `mishpacha_brucha_yeladim` | 2026-04-14 | high | verified |
| `dmei_imutz` | 2026-04-14 | high | verified |
| `maanak_leida` | 2026-04-12 | high | verified |
| `old_age_pension` | 2026-04-13 | high | verified |
| `old_age_income_supplement` | 2026-04-13 | high | verified |
| `survivor_pension_spouse` | 2026-04-13 | high | verified |
| `survivor_pension_orphan` | 2026-04-13 | high | verified |
| `disability_pension_general` | 2026-04-13 | high | verified |
| `attendance_allowance` | 2026-04-13 | high | verified |
| `mobility_allowance` | 2026-04-13 | high | verified |
| `gimlat_sicud` | 2026-04-14 | high | verified |
| `dmei_avtala` | 2026-04-12 | high | verified |
| `oleh_unemployment_extended` | 2026-04-14 | high | verified |
| `havtachat_hakhnasa` | 2026-04-14 | high | verified |
| `dmei_leida_full` | 2026-04-13 | high | verified |
| `dmei_leida_short` | 2026-04-12 | high | verified |
| `paternity_leave` | 2026-04-13 | high | verified |
| `tagmulei_miluim` | 2026-04-12 | high | verified |
| `oleh_bituach_leumi_exemption_us` | 2026-04-13 | high | verified |
| `asirei_tzion` | 2026-04-14 | medium | verified ⚠️ faux positif (cf. CLAUDE.md) |
| `khasidei_umot_olam` | 2026-04-14 | medium | verified ⚠️ faux positif (cf. CLAUDE.md) |
| `shmirat_herayon` | 2026-04-16 | high | verified |
| `kitzvat_leyda_rav_ubarit` | 2026-04-16 | medium | **needs_verification** |
| `maanak_ishpuz` | 2026-04-16 | high | verified |
| `kitzva_yeled_pag` | 2026-04-16 | medium | **needs_verification** |
| `mezonot` | 2026-04-16 | high | verified |
| `horim_meametzim` | 2026-04-16 | medium | **needs_verification** |
| `dmei_omna` | 2026-04-16 | medium | **needs_verification** |
| `nifgaei_avoda` | 2026-04-16 | high | verified |
| `nifgaei_teunot` | 2026-04-16 | high | verified |
| `nifgaei_peulot_eyva` | 2026-04-16 | high | verified |
| `nifgaei_polio` | 2026-04-16 | medium | verified |
| `nifgaei_eyrui_dam` | 2026-04-16 | medium | verified |
| `nifgaei_gazezet` | 2026-04-16 | medium | verified |
| `pgia_bizman_hitnadvut` | 2026-04-16 | medium | verified |
| `tagmulei_miluim_kharvot_barzel` | 2026-04-16 | high | verified |
| `ptor_bituakh_khayalim_meshukrarim` | 2026-04-16 | high | verified |
| `gimlat_ezrach_vatik_meyukhedet` | 2026-04-16 | high | verified |
| `tosefet_dkhiyat_kitzva` | 2026-04-16 | high | verified |
| `maanak_khimum` | 2026-04-16 | high | verified |
| `demi_bituakh_briut_kitzvat_zikna` | 2026-04-16 | high | verified |
| `hanakha_trufot_havtakhat_hakhnasa` | 2026-04-16 | high | verified |
| `hanakha_kupat_holim_olim` | 2026-04-16 | medium | verified |
| `maanak_maavar_nashim` | 2026-04-16 | medium | verified |
| `harugui_malkhut` | 2026-04-16 | medium | verified |
| `amnat_beinleumiyot` | 2026-04-16 | high | verified |
| `hanaka_mitaamei_tzedek` | 2026-04-16 | **low** | verified |

### Rashut HaMisim (Tax Authority) — 18 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `miluim_tax_credit_combat` | 2026-04-13 | high | verified |
| `credit_woman` | 2026-04-12 | high | verified |
| `credit_academic_degree` | 2026-04-12 | high | verified |
| `credit_young_child` | 2026-04-13 | high | verified |
| `credit_disabled_child` | 2026-04-12 | high | verified |
| `hachzar_mas` | 2026-04-14 | high | verified |
| `oleh_2026_full_exemption` | 2026-04-13 | high | verified |
| `olim_purchase_tax_reduction` | 2026-04-14 | high | verified |
| `nekudot_zikui_khayalim_meshukrarim` | 2026-04-16 | high | verified |
| `nekudot_zikui_toshav` | 2026-04-16 | high | verified |
| `nekudot_zikui_yeladim` | 2026-04-16 | high | verified |
| `nekudot_zikui_horim_yehidim` | 2026-04-16 | high | verified |
| `petur_mas_nakhut` | 2026-04-16 | high | verified |
| `petur_mas_shkhirat_dira` | 2026-04-16 | high | verified |
| `zikuy_mas_priferia` | 2026-04-16 | high | verified |
| `hatavat_mas_gil_60` | 2026-04-16 | medium | verified |
| `yivua_meshek_bayit` | 2026-04-16 | medium | verified |
| `hatavot_mas_pensia_atzmai` | 2026-04-16 | high | verified |

### Misrad HaBitahon (Défense / IDF) — 11 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `miluim_low_income_supplement` | 2026-04-14 | medium | verified |
| `combat_reservist_bonuses_2026` | 2026-04-13 | high | verified |
| `combat_veteran_rights` | 2026-04-13 | high | verified |
| `bereaved_family_benefits` | 2026-04-13 | high | verified |
| `maanak_sal_shikum_nifgaei_7_octobre` | 2026-04-16 | high | verified |
| `kitzvat_mishpakha_nifgaei_peulot_eyva` | 2026-04-16 | high | verified |
| `siyua_tipulim_miluim` | 2026-04-16 | high | verified |
| `tagmul_basissi_nakhei_tsahal` | 2026-04-16 | high | verified |
| `maanak_had_paami_nakhei_tsahal` | 2026-04-16 | high | verified |
| `tagmul_ovedan_kosher_avoda` | 2026-04-16 | high | verified |
| `maanak_hashtatafut_mas_tsahal` | 2026-04-16 | medium | verified |

### Misrad HaShikun (Logement) — 9 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `rental_assistance_olim` | 2026-04-13 | high | verified |
| `mashkanta_olim` | 2026-04-13 | high | verified |
| `dira_tziburit` | 2026-04-16 | high | verified |
| `dira_behanacha_mehir_lemishtaken` | 2026-04-16 | high | verified |
| `siyua_shkhar_dira` | 2026-04-16 | high | verified |
| `siyua_shkhar_dira_khad_horiot` | 2026-04-16 | high | verified |
| `siyua_mugdal_dira_tziburit` | 2026-04-16 | high | verified |
| `siyua_diyur_niztolei_shoah` | 2026-04-16 | high | verified |
| `mashkanta_zkaim` | 2026-04-16 | medium | verified |

### Municipalités (Arnona) — 6 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `arnona_olim` | 2026-04-13 | high | verified |
| `arnona_disability` | 2026-04-14 | high | verified |
| `arnona_retiree` | 2026-04-14 | high | verified |
| `arnona_single_parent` | 2026-04-14 | high | verified |
| `arnona_student` | 2026-04-14 | medium | verified |
| `holocaust_arnona_full_exemption` | 2026-04-14 | high | verified |

### Claims Conference (Shoah) — 4 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `holocaust_monthly_stipend` | 2026-04-14 | high | verified |
| `kitzva_keren_sif2_claims` | 2026-04-16 | high | verified |
| `maanak_hardship_fund_claims` | 2026-04-16 | high | verified |
| `keren_sif2_article2_fund` | 2026-04-16 | high | verified |

### Misrad HaKlita (Aliyah) — 3 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `sal_klita` | 2026-04-13 | high | verified |
| `ulpan_free` | 2026-04-12 | high | verified |
| `student_authority_olim` | 2026-04-13 | high | verified |

### Other (Rashut Shoah / HaRvaha / HaBriut / IEC / Transport) — 24 entrées

| Slug | verified_at | Conf. | Statut |
|---|---|---|---|
| `holocaust_in_home_services` | 2026-04-14 | high | verified |
| `perach_scholarship` | 2026-04-13 | high | verified |
| `student_scholarships_general` | 2026-04-13 | high | verified |
| `maonot_yom` | 2026-04-14 | high | verified |
| `tsaharon` | 2026-04-14 | high | verified |
| `hanacha_hashmal` | 2026-04-14 | high | verified |
| `rav_kav_senior_free` | 2026-04-14 | high | verified |
| `rav_kav_disability_discount` | 2026-04-14 | high | verified |
| `rav_kav_discharged_soldier` | 2026-04-14 | high | verified |
| `tagmul_niztolei_shoah_vatik` | 2026-04-16 | high | verified |
| `gmala_hashlama_sif2` | 2026-04-16 | medium | verified |
| `maanak_matzeva_shoah` | 2026-04-16 | high | verified |
| `maanak_shnati_shoah` | 2026-04-16 | high | verified |
| `tagmul_shaarim_niztolei_shoah` | 2026-04-16 | high | verified |
| `hatavot_refuiot_niztolei_shoah` | 2026-04-16 | high | verified |
| `taavurot_hatavot_shoah` | 2026-04-16 | medium | verified |
| `kitzva_beg_niztolei_shoah` | 2026-04-16 | medium | verified |
| `siyua_khomri_ezrakhim_vatikim` | 2026-04-16 | medium | verified |
| `maanak_histaglut_nashim_alimut` | 2026-04-16 | high | **needs_verification** |
| `tmikha_sotsyalit_vatikim` | 2026-04-16 | medium | verified |
| `siyua_nifgeot_alimut_mishpakha` | 2026-04-16 | high | verified |
| `yetom_alimut_mishpakha` | 2026-04-16 | medium | **needs_verification** |
| `tipulei_shinayim_vatikim` | 2026-04-16 | high | verified |
| `sal_shikum_mitmodedei_nefesh` | 2026-04-16 | high | verified |

---

## Audit des constantes 2026

Un catalogue "frais" ne vaut que si les **constantes numériques** qui alimentent les calculateurs et les estimations sont elles-mêmes à jour. Ci-dessous l'audit des principales valeurs pivots.

### 🔴 Constantes encore au millésime **2025** dans le code

Contrairement aux entrées du catalogue (100% datées 2026), plusieurs fichiers de logique fiscale utilisent encore les valeurs 2025, sans `verified_at` explicite.

| Fichier | Constante | Valeur | Problème |
|---|---|---|---|
| `src/lib/israeliPayroll.ts:19` | `TAX_BRACKETS_2025` | brackets 2025 | ❌ **nom et valeurs 2025**, en-tête du fichier dit "Last verified: January 2025" (ligne 14) |
| `src/lib/israeliPayroll.ts:36` | `BL_RATES_2025` | 0.4% / 7% | ❌ seuil `7_522` = 60% salaire moyen 2025 (`12 536 × 0.6`) ; plafond `50_695` (`5× salaire moy. 2025`) |
| `src/lib/israeliPayroll.ts:45` | `HEALTH_RATES_2025` | 3.23% / 5.2% | ❌ idem, millésime 2025 explicite dans le nom |
| `src/lib/israeliPayroll.ts:71` | `CREDIT_POINT_VALUE_MONTHLY` | `242` NIS/mois | ❌ commentaire : `~₪2,904/year` (valeur 2025). Le fichier `taxRefund.ts:22` confirme : `2904 NIS/an par point (2025)` |
| `src/lib/freelanceMode.ts:55` | `CREDIT_POINT_VALUE_2025` | `242 × 12` | ❌ nom 2025 explicite |
| `src/lib/taxRefund.ts:22` | `CREDIT_POINT_VALUE_ANNUAL` | `242 × 12` | ❌ commentaire explicite "(2025)" |

> **Impact** : tous les calculs des pages `/calculateurs/brut-net`, `/tax-refund`, et freelance utilisent des brackets / seuils **2025**, alors que le catalogue annonce des montants 2026 (ex. `nekudot_zikui_toshav` → `2 904 NIS/an` cohérent 2025 ET 2026 car le point n'a pas bougé dans le code, mais les brackets IRPP ont probablement été réindexés sur l'IPC).

> **Action recommandée** : vérifier si l'Israel Tax Authority a publié les brackets 2026 officiels. Si oui, ajouter `TAX_BRACKETS_2026` / `BL_RATES_2026` + `LAST_VERIFIED_DATE` en haut du fichier (pattern déjà utilisé par les calculateurs selon CLAUDE.md lot4-q3-fixes).

### 🟡 Valeur de la `nekudat zikui` — divergence code vs glossaire

| Source | Valeur affichée | NIS/point/an implicite |
|---|---|---|
| `src/lib/israeliPayroll.ts:71` | `CREDIT_POINT_VALUE_MONTHLY = 242` | **2 904 NIS/an** |
| `src/lib/taxRefund.ts:22` | commentaire "2904 NIS/an par point (2025)" | **2 904 NIS/an** |
| `src/lib/benefitsCatalog.ts:1172,1237,1259,1289,1310,3910,4054,4096` | calculs avec `× 2904` | **2 904 NIS/an** |
| `memory/glossary.md:137` | `nekudot_zikui_toshav` → `2,25–2,75 pts = 5 436–6 636 NIS/an` | **≈ 2 416 NIS/an** ❌ |

**Incohérence** : le glossaire indique `5 436–6 636 NIS/an` pour 2.25–2.75 points, soit une valeur implicite de `2 416 NIS/an/point`, alors que le code utilise `2 904 NIS/an/point` partout. Le bon calcul à 2 904 serait `6 534–7 986 NIS/an`.

> **Hypothèse** : le glossaire a été rédigé avec une valeur pré-2024 (`~2 400 NIS/an`), et jamais réindexée malgré la date "dernière mise à jour : 2026-04-16".

### 🟡 Conversions EUR/NIS — taux non-daté

Les montants Shoah étrangers (Claims Conference, BEG) sont convertis en NIS dans le catalogue. Le taux implicite n'est pas versionné.

| Entrée | EUR mensuel | NIS affiché | Taux implicite |
|---|---|---|---|
| `kitzva_keren_sif2_claims` (ligne 3091, 3132) | 667 EUR | **2 670 NIS** | 4.00 NIS/EUR |
| `keren_sif2_article2_fund` (ligne 3415) | 667 EUR | **2 734 NIS** | 4.10 NIS/EUR |
| `maanak_hardship_fund_claims` (ligne 3377) | ~2 500 EUR | **~10 500 NIS** | 4.20 NIS/EUR |
| `maanak_hardship_fund_claims` (ligne 3378) | ~1 320 EUR/an | **~5 540 NIS/an** | 4.20 NIS/EUR |
| `holocaust_monthly_stipend` (commentaire 1791) | ~450 EUR/mois | (pas converti) | — |

**Problème** : trois taux différents (`4.00`, `4.10`, `4.20`) cohabitent sans date de référence. Pour mémoire, le taux EUR/NIS réel oscille entre 3.80 et 4.20 sur 2024-2026.

> **Action recommandée** : extraire le taux EUR/NIS dans une constante `EXCHANGE_RATE_EUR_NIS` + `EXCHANGE_RATE_VERIFIED_AT`, et afficher côté UI un indicateur "taux de change indicatif au JJ/MM/AAAA".

### 🟢 Barèmes BTL 2026 — cohérents avec les sources

Les entrées BTL du catalogue (ex. `kitsbat_yeladim`, `maanak_leida`, `old_age_pension`) contiennent des **fonctions calculatrices explicites** (`computeKitsbatYeladim2026()`, `computeMaanakLeida2026()`) avec les montants 2026 hardcodés et commentés source (`btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx`).

| Aide | Montant 2026 dans le code | Source citée |
|---|---|---|
| `kitsbat_yeladim` | 173 NIS (1er, 5e+) / 219 NIS (2e-4e) | ✅ `btl.gov.il .../hadasaidkonkitzva2026.aspx` |
| `maanak_leida` | 2 103 / 946 / 631 NIS | ✅ commentaire "Confirme via recherche web avril 2026" |
| `old_age_pension` | 1 795 NIS individu / 2 762 NIS couple | ✅ audit manuel 13/04/2026 |

### 🟢 Cas spécial — plan `oleh_2026_full_exemption`

L'entrée `oleh_2026_full_exemption` (nouveau plan fiscal 2026 pour olim) mentionne explicitement `2026` dans son slug et est datée `verified_at: 2026-04-13`. Dispo sous `OLEH_2026_BENEFITS` (ligne 1369). ✅ à jour.

### 🟢 Cas spécial — `combat_reservist_bonuses_2026`

Slug explicitement millésimé 2026, `verified_at: 2026-04-13`. ✅

### Synthèse constantes

| Zone | État |
|---|---|
| Montants BTL 2026 (catalogue) | ✅ frais |
| Brackets IRPP (`israeliPayroll.ts`) | 🔴 **encore 2025** |
| Cotisations BL/santé (`israeliPayroll.ts`) | 🔴 **encore 2025** |
| Valeur point fiscal (`CREDIT_POINT_VALUE_MONTHLY`) | 🟡 valeur 2025 (probablement identique 2026 mais non-revalidée explicitement) |
| Valeur point dans glossaire | 🟡 **incohérente** avec le code (2 416 vs 2 904 NIS/an/point) |
| Taux EUR/NIS | 🟡 trois valeurs coexistent (4.00 / 4.10 / 4.20), non-datées |
| Plans fiscaux 2026 dédiés | ✅ (`oleh_2026_full_exemption`, `combat_reservist_bonuses_2026`, `miluim_tax_credit_combat`) |

---

<!-- Audit glossary + recos ajoutés en sous-étape 4 -->
