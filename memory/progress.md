# Avancement Tloush

## Chantier 2 — Audit fraîcheur + constantes fiscales 2026 ✅ (2026-04-16)

### Livrables

| # | PR | Contenu |
|---|---|---|
| 1 | #25 | `audit(fraicheur): memory/audit_fraicheur.md` — rapport 125 aides + constantes 2026 |
| 2 | #26 | `fix(fiscal): mise à jour constantes fiscales 2026 + nekudat zikui non confirmée` |

### Audit fraîcheur (#25)

`memory/audit_fraicheur.md` (475 lignes, 5 sections) :
- Synthèse globale + détail par autorité (BTL, Mas Hakhnasa, kupot holim, Misrad HaKlita, etc.).
- Audit constantes fiscales + glossaire.
- 12 recommandations P0/P1/P2. Prochain audit prévu 2026-10-01.
- **Résultat** : 125/125 entrées catalogue ✅ Frais (aucune périmée, aucune à vérifier).

### Constantes fiscales mises à jour (#26)

**Tranches 2026** (`israeliPayroll.ts`, `taxRefund.ts`, `freelanceMode.ts`) :
- Tranche 20% élargie : 120 720 → **228 000 NIS/an** (était 193 800).
- Tranche 31% décalée : 228 000 → **301 200 NIS/an** (était 193 800–269 280).
- Tranches supérieures (35/47/50%) : inchangées.

**Bituah Leumi atzmai 2026** :
- Seuil réduit : 7 522 → **7 703 NIS/mois** (60% schar memutza indexé CPI).
- Plafond assurable : 50 695 → **51 910 NIS/mois**.

**Nekudat zikui** : maintenu à 242 NIS/mois (2 904/an). Commentaire explicite : *"valeur 2025, non confirmée 2026 — à revérifier quand taxes.gov.il publiera la brochure officielle 2026"*.

**EUR/NIS unifié** (`benefitsCatalog.ts`) :
- 3 taux hardcodés (4.00 / 4.10 / 4.20) remplacés par `EXCHANGE_RATE_EUR_NIS = 3.5268` (Bank of Israel 16/04/2026).
- Helper `eurToNis()` utilisé sur toutes les entrées Shoah.

**`LAST_VERIFIED_DATE = '2026-04-16'`** exporté depuis les 3 fichiers fiscaux.

---

## Chantier 4 — Scanner universel + 8 types spécialisés ✅ (2026-04-16)

### Objectif

Tout document uploadé est analysé automatiquement (plus de sélection manuelle du type). Détection Claude Vision → analyse spécialisée si type reconnu, sinon analyse universelle.

### Livrables

| # | PR | Contenu |
|---|---|---|
| A | #27 | `feat(scanner): mode universel + détection automatique` — fondation |
| B | #28 | `feat(scanner): 4 types santé + disclaimer médical` |
| C | #29 | `feat(scanner): 4 types courriers et factures` |

### PR A — Fondation (#27)

**Flow :** Upload → Pass 1 (détection Claude Vision, 256 tokens) → Pass 2 (analyse spécialisée ou universelle).

**Nouveau type `universal`** :
- Résumé FR 3–5 phrases.
- Traduction HE→FR complète si document en hébreu.
- Extraction auto : dates, montants, noms, institutions.
- Actions suggérées : `reminder` (échéance) ou `reply` (template de réponse).

**UI** :
- Suppression du step `selectType` + des 6 cartes.
- Flow en 3 étapes : Upload → Analyse (spinner) → Résultats.
- Composant `UniversalResults`.

### PR B — 4 types santé (#28)

| Type | Champs clés |
|---|---|
| `medicalBill` | provider + type, montants (total/dû/remboursable), kupat holim, détail postes, alertes dépassement |
| `kupatHolimLetter` | caisse, type (auth/refus/convocation/rappel), traduction HE→FR, procédure d'appel, template de réponse |
| `prescription` | médecin, médicaments (nom HE + FR/DCI), dosage/posologie/durée, warnings d'interaction |
| `labResults` | labo, paramètres (HE + FR), valeur, unité, intervalle, `horsNorme: boolean`, `interpretation: low/high/normal` |

**Disclaimer médical** : composant `MedicalDisclaimer` affiché au-dessus des résultats pour les 4 types santé. *"Analyse à titre informatif — ne remplace pas un avis médical professionnel."*

Guard typé : `HealthDocumentType` + `isHealthDocument()`.

### PR C — 4 types courriers et factures (#29)

| Type | Champs clés |
|---|---|
| `personalLetter` | sender, date, ton (formel/informel/urgent/amical), traduction HE→FR, réponse adaptée au ton |
| `schoolLetter` | école, classe, enfant, subject typé, deadline, amountDue, actions typées, template de réponse |
| `privateLetter` | sender + senderType (bank/insurance/telecom), subjectType, urgence, actions avec deadlines, template de contestation |
| `utilityInvoice` | utilityType (arnona/élec/eau/gaz), période, montant, dueDate, customerCode, paymentReference, `abnormalIncrease` >20%, `suggestedReminderDate` = dueDate − 3 jours |

### Récapitulatif types supportés

**11 types** : `payslip`, `contract`, `officialLetter`, `taxNotice`, `lease`, `termination` (existants avant chantier 4), `medicalBill`, `kupatHolimLetter`, `prescription`, `labResults`, `personalLetter`, `schoolLetter`, `privateLetter`, `utilityInvoice` (8 nouveaux), + `universal` (fallback).

### Pas de migration SQL

Route `/api/scan` stateless — aucune écriture DB, aucune contrainte CHECK à mettre à jour.

---

## Chantier 1 — Reste à faire

À cadrer ultérieurement.

---

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

### Étape C — Ajout des aides manquantes du glossaire (2026-04-16 — ✅ COMPLÈTE)

Intégration par lots thématiques dans `src/lib/benefitsCatalog.ts`.

**Résultat** : `BENEFITS_CATALOG` passe de 57 à **125 entrées** (+68).
Branche : `claude/review-progress-step-c-Cx3yP` → PR #24 (draft).

#### Infra préalable (commit `5240f75`)

`EligibilityConditions` étendue avec 4 nouveaux discriminants :
- `required_shoah_period` : `'pre_1953' | 'post_1953' | 'ex_urss' | Array<...>`
- `required_city_priority_zone` : `'a' | 'b' | 'c' | Array<...>`
- `requires_landlord` : boolean
- `requires_recent_discharge_months` : number (fenêtre post-démob)

`matchProfile()` dans `rightsDetector.ts` gère les 4 nouveaux champs en hard-fail.

#### Lots livrés

| Lot | Source glossaire | Nb aides | Champs profil utilisés | Statut |
|---|---|---:|---|---|
| C1 | BTL Famille/Maternité (S1 Famille) | 7 | children_birth_dates, marital_status | ✅ (3 sous-commits) |
| C2 | BTL Accidents/Victimes (S1 Accidents) | 7 | disability_source=work | ✅ (2 sous-commits) |
| C3 | Shoah complet (S5 + S14 + S15) | 11 | **shoah_period** ⭐ | ✅ (3 sous-commits) |
| C4 | 7 octobre / Kharvot Barzel (S16) | 4 | **is_7octobre_victim**, is_active_reservist | ✅ |
| C5 | IDF invalides (S11) | 4 | **disability_source=idf**, disability_level | ✅ |
| C6 | Soldats libérés (S13) | 2 | **discharge_date** via requires_recent_discharge_months | ✅ |
| C7 | Fiscalité HaMisim (S4) | 7 | **city_priority_zone**, **is_landlord**, seniors 60+ | ✅ (2 sous-commits) |
| C8 | Logement HaShikun (S3) | 8 | disability, holocaust, is_landlord | ✅ (2 sous-commits) |
| C9 | Retraite / seniors + Kupot (S1 Retraite + S12) | 7 | min_age, aliyah_year, olim | ✅ (2 sous-commits) |
| C10 | HaRvaha + HaBriut + divers (S6 + S7 + S1 divers) | 11 | bereaved, welfare, seniors | ✅ (3 sous-commits) |
| **Total** | | **68** | | |

#### Champs EligibilityConditions ajoutés (infra étape C)

| Champ | Usage | Lots concernés |
|---|---|---|
| `required_shoah_period` | Discrimine pre_1953 / post_1953 / ex_urss | C3 (3 pensions) |
| `required_city_priority_zone` | Zones A/B/C périphérie | C7 (zikuy_mas_priferia) |
| `requires_landlord` | Bailleur résidentiel | C7 + C8 (2 entrées) |
| `requires_recent_discharge_months` | Fenêtre post-démob (36 / 2 mois) | C6 (2 entrées) |

#### Métadonnées catalogue mises à jour

- `CATALOG_METADATA.version` : `1.0.0` → `2.0.0`
- `CATALOG_METADATA.total_benefits` : `35` → `125`
- `CATALOG_SUMMARY.total` : `35` → `125`

### Étape D — Suites prévues (non démarrées)

- **Promouvoir les `needs_verification` en `verified`** (6 entrées ajoutées en C avec ce statut) :
  - `kitzvat_leyda_rav_ubarit`, `kitzva_yeled_pag`, `horim_meametzim`, `dmei_omna` (manque champs profil dédiés)
  - `maanak_histaglut_nashim_alimut`, `yetom_alimut_mishpakha` (manque `is_domestic_violence_victim`)
- **Ajouter champs profil complémentaires** pour lever les limitations restantes :
  - `is_pregnant` (shmirat_herayon)
  - `is_multiple_birth` (kitzvat_leyda_rav_ubarit)
  - `is_premature_birth` (kitzva_yeled_pag)
  - `is_adoptive_parent` (horim_meametzim)
  - `is_foster_parent` (dmei_omna)
  - `is_domestic_violence_victim` (maanak_histaglut, yetom_alimut, siyua_nifgeot)
  - `is_asir_tzion` / `is_khasid_umot_olam` (cf. faux positifs connus CLAUDE.md)
  - `disability_type` : 'physical' | 'psychiatric' | 'sensory' (sal_shikum_mitmodedei_nefesh)
- **Fixer les soft-fails connus de `matchProfile()`** (CLAUDE.md § "Rights detector issues")

### Points de vigilance connus (post-étape C)

- **Faux positifs `asirei_tzion` / `khasidei_umot_olam`** : toujours en place (cf. CLAUDE.md §"Rights detector issues"). Fix possible : retirer du catalogue OU ajouter 2 nouveaux champs profil `is_asir_tzion` / `is_khasid_umot_olam`.
- **Soft-fails `min_disability` / `max_monthly_income`** (rightsDetector.ts:257, 268) : toujours en place, incrémentent `totalChecks` sans passer même si champ null → score abaissé injustement pour profils incomplets. À revoir.
- **Auto-déclaration sans vérification** : `is_holocaust_survivor`, `is_bereaved_family`, `is_7octobre_victim`, `is_combat_veteran` — tous exposent au risque de faux positifs sur les aides à forte valeur.
