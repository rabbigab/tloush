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

<!-- Audit constantes 2026 ajouté en sous-étape 3 -->
<!-- Audit glossary + recos ajoutés en sous-étape 4 -->
