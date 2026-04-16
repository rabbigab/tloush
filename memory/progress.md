# Avancement Tloush

## Chantier 3 — Détecteur d'aides

### Étape A — Audit questionnaire (2026-04-16)
- [x] Audit questionnaire profil vs critères éligibilité
- [x] Diff slug-par-slug entre `memory/glossary.md` (116 aides) et `src/lib/benefitsCatalog.ts` (57 aides)
- [x] Identifier champs manquants (~10 champs, dont 2 critiques : `is_asir_tzion` / `is_khasid_umot_olam`)
- [x] Identifier bug de nommage : slug `hashlamat_hachnasa` pointait vers le concept `havtachat_hakhnasa`

### Étape B — Bug fix + enrichissement profil (2026-04-16)

#### PRs mergées

| # | PR | Contenu |
|---|---|---|
| 1 | #19 | `fix: rename hashlamat_hachnasa → havtachat_hakhnasa` |
| 2 | #20 | `feat(profile): add shoah_period` |
| 3 | #21 | `feat(profile): add is_7octobre_victim + block check` |
| 4 | #22 | `feat(profile): add disability_source + block check` |
| 5 | #23 | `feat(profile): add discharge_date + city_priority_zone + is_landlord` |

#### Champs profil ajoutés

- [x] `shoah_period: 'pre_1953' | 'post_1953' | 'ex_urss' | null`
  — discrimine les 3 catégories de bénéficiaires Shoah (pré/post 1953, ex-URSS via Keren Sif 2)
- [x] `is_7octobre_victim: boolean`
  — victime (ou famille de) des événements du 7 octobre / Kharvot Barzel
- [x] `disability_source: 'idf' | 'work' | 'general' | null`
  — origine de l'invalidité (Nakhei Tsahal / Nifgaei Avoda / Nakhut Klalit)
- [x] `discharge_date: DATE | null`
  — date précise de démobilisation IDF (pour aides à fenêtre post-service)
- [x] `city_priority_zone: 'a' | 'b' | 'c' | null`
  — zone de priorité nationale (Misrad HaPnim / Tax Authority), avec auto-suggestion depuis la ville saisie via `src/lib/priorityZones.ts`
- [x] `is_landlord: boolean`
  — loueur d'un bien résidentiel (aides fiscales bailleurs)

#### Conditions ajoutées au rights detector

- [x] `requires_7octobre_victim: boolean` — hard-fail si `is_7octobre_victim !== true`
- [x] `required_disability_source: 'idf' | 'work' | 'general'` — hard-fail si `disability_source` ne correspond pas

#### Migrations Supabase appliquées en prod

- [x] `20260421_shoah_period.sql`
- [x] `20260422_is_7octobre_victim.sql`
- [x] `20260423_disability_source.sql`
- [ ] `20260424_profile_fields_batch.sql` ← **À appliquer en prod** (discharge_date + city_priority_zone + is_landlord)

#### Volontairement non fait (pour éviter scope creep)

- **`receives_kitzvat_zikna`** : redondant avec `receives_old_age_pension` existant. Les aides du glossaire qui référencent cette condition seront mappées sur le champ existant.
- **Rename `is_holocaust_survivor` → `is_shoah_survivor`** : refactor transversal non prioritaire. Le champ existant reste fonctionnel.
- **Ajout conditions `EligibilityConditions` pour `city_priority_zone` / `is_landlord` / `discharge_date`** : reporté à l'étape C (sera fait quand les aides qui en dépendent seront intégrées au catalogue).

### Étape C — Ajout des 84 aides manquantes du glossaire (À démarrer)

Intégration par lots thématiques dans `src/lib/benefitsCatalog.ts` :

| Lot | Source glossaire | Nb aides | Champs profil utilisés | Statut |
|---|---|---:|---|---|
| C1 | BTL Famille/Maternité (S1 Famille) | 8 | children_birth_dates, marital_status | [ ] |
| C2 | BTL Accidents/Victimes (S1 Accidents) | 7 | — (auto-déclaration) | [ ] |
| C3 | Shoah complet (S5 + S14 + S15) | 11 | **shoah_period** ⭐ | [ ] |
| C4 | 7 octobre / Kharvot Barzel (S16) | 4 | **is_7octobre_victim** ⭐ | [ ] |
| C5 | IDF invalides (S11) | 4 | **disability_source = idf** ⭐ | [ ] |
| C6 | Soldats libérés (S13) | 2 | **discharge_date** ⭐ | [ ] |
| C7 | Fiscalité HaMisim (S4) | 8 | **city_priority_zone**, **is_landlord** ⭐ | [ ] |
| C8 | Logement HaShikun (S3) | 8 | — | [ ] |
| C9 | Retraite / seniors (S1 Retraite + S12 Kupot) | 7 | receives_old_age_pension | [ ] |
| C10 | HaRvaha + HaBriut + divers (S6+S7+autres) | 11 | — | [ ] |

### Points de vigilance connus (post-étape C)

- **Faux positifs `asirei_tzion` / `khasidei_umot_olam`** : toujours en place (cf. CLAUDE.md §"Rights detector issues"). Fix possible : retirer du catalogue OU ajouter 2 nouveaux champs profil `is_asir_tzion` / `is_khasid_umot_olam`.
- **Soft-fails `min_disability` / `max_monthly_income`** (rightsDetector.ts:257, 268) : toujours en place, incrémentent `totalChecks` sans passer même si champ null → score abaissé injustement pour profils incomplets. À revoir.
- **Auto-déclaration sans vérification** : `is_holocaust_survivor`, `is_bereaved_family`, `is_7octobre_victim`, `is_combat_veteran` — tous exposent au risque de faux positifs sur les aides à forte valeur.
