# Template de documentation d'une aide / droit

Ce fichier est le **cadre standard** pour documenter une nouvelle aide avant de l'ajouter à `src/lib/benefitsCatalog.ts`.

Il garantit que :
1. Toutes les infos nécessaires au moteur de matching sont collectées
2. Les sources sont vérifiées
3. Les faux positifs sont évités (grâce à la checklist anti-bugs)
4. Le mapping avec les champs du profil utilisateur est explicite

---

## 📋 Fiche type à remplir

> Copie ce bloc et remplis-le pour chaque nouvelle aide. Si un champ n'est pas applicable, écris `N/A` (pas vide).

```markdown
## Fiche : [Nom de l'aide en français]

### 1. Identité
- **Slug proposé** : `snake_case_identifier`
- **Nom FR** : Nom complet en français
- **Nom HE** : שם בעברית
- **Autorité émettrice** : bituach_leumi / tax_authority / misrad_haklita / misrad_hashikun / misrad_habitahon / municipality / misrad_hachinuch / claims_conference / other
- **Catégorie** : family / fiscal / employment / immigration / housing / health / retirement / military / welfare / education / special

### 2. Description
- **Description courte** (1-2 phrases, max 200 caractères) :
  > ...
- **Description longue** (paragraphes, ~500-1500 caractères) :
  > ...

### 3. Conditions d'éligibilité officielles (avant traduction code)
Liste EN LANGAGE NATUREL toutes les conditions officielles :
- [ ] Condition 1 : ...
- [ ] Condition 2 : ...
- [ ] Condition 3 : ...

### 4. Montants 2026 (sources à citer)
- **Valeur typique annuelle** : XXX NIS
- **Plage** : de XXX à XXX NIS (ex: variable selon mairie / revenu / niveau)
- **Unité** : `NIS/an` / `NIS/mois` / `NIS (one-shot)` / `NIS (en services)` / `NIS/an/enfant` / etc.
- **Type** :
  - [ ] Récurrent annuel (entre dans le total "valeur annuelle potentielle")
  - [ ] Récurrent mensuel (multiplié par 12 pour le total)
  - [ ] One-shot / ponctuel (EXCLU du total annuel, affiché avec label "(économie ponctuelle)")
  - [ ] En services / en nature (ex: aide à domicile)
  - [ ] Variable / indéterminé

### 5. Procédure
- **URL officielle de demande** : https://...
- **URL info complémentaire** (optionnel) : https://...
- **Label du bouton d'action** : "Demander XXX" / "Infos XXX"
- **Procédure résumée** : ...

### 6. Sources vérifiées (MINIMUM 2)
- [ ] Source 1 : [Titre](URL) — vérifiée le YYYY-MM-DD
- [ ] Source 2 : [Titre](URL) — vérifiée le YYYY-MM-DD
- [ ] Source 3 (optionnelle) : [Titre](URL)

**Sources privilégiées par ordre d'autorité** :
1. `gov.il` (portails ministériels officiels)
2. `btl.gov.il` (Bituach Leumi)
3. `kolzchut.org.il` (référence droits sociaux)
4. `nbn.org.il` (Nefesh B'Nefesh pour olim)
5. `iec.co.il`, `ravkavonline.co.il` (pour utilities/transport)
6. Presse reconnue : timesofisrael, jpost, globes, ynet (secondaires)

### 7. Mapping aux champs du profil utilisateur
Liste les champs `UserProfile` qui servent de déclencheur :
- `aliyah_year` / `years_since_aliyah` : ...
- `birth_date` / `age` : ...
- `gender` : ...
- `marital_status` : ...
- `children_count` / `children_birth_dates` : ...
- `employment_status` : ...
- `monthly_income` / `household_income_monthly` : ...
- `disability_level` : ...
- `served_in_idf` / `is_combat_veteran` / `is_active_reservist` : ...
- `education_level` / `is_current_student` : ...
- `is_holocaust_survivor` / `is_caregiver` / `is_bereaved_family` : ...
- `has_disabled_child` / `children_with_disabilities` : ...
- `has_mobility_limitation` / `chronic_illness` : ...

**Champs MANQUANTS dans `UserProfile` qu'il faudrait ajouter** (si applicable) :
- `...` → nécessite migration Supabase

### 8. Conditions TypeScript (traduction pour `benefitsCatalog.ts`)
```typescript
conditions: {
  // Copier-coller les conditions utilisables directement
  min_age: ...,
  requires_resident: true,
  // etc.
},
```

### 9. Confidence level (choisir selon la grille)
- **`high`** : sources multiples concordantes + montants exacts + conditions claires
- **`medium`** : source unique OU montants approximatifs OU varie selon mairie
- **`low`** : info partielle, à vérifier avant mise en prod
- **Choix** : `high` / `medium` / `low`

### 10. Status (visibilité en production)
- **`verified`** : affiché aux utilisateurs en production
- **`needs_verification`** : caché en production (filtré par `scanBenefits`)
- **`estimated`** : caché en production
- **Choix** : `verified` / `needs_verification` / `estimated`

### 11. Disclaimer (à afficher sous la carte dans l'UI)
> Texte du disclaimer qui apparaîtra sous la valeur estimée. Doit mentionner :
> - Variabilité (si applicable)
> - Pré-requis non codables (ex: dossier médical)
> - Recommandation professionnelle (yoetz mas, travailleur social, avocat)

### 12. Notes internes
> Notes techniques pour les futurs devs : pourquoi ces conditions, limites du matching, cas edge non couverts, date de vérification, commentaires sur les sources.
```

---

## 🚨 Checklist anti-bugs (NE PAS oublier)

Cette checklist vient des 7 bugs corrigés dans le commit `97600dd`. Pour chaque nouvelle entrée, vérifier :

### A. Dimension temporelle
- [ ] Si l'aide concerne un **événement récent** (naissance, décès, licenciement), utiliser `requires_recent_birth_months` ou équivalent. **Ne JAMAIS se contenter de `min_children: 1`** pour les aides de naissance.
- [ ] Si l'aide concerne des enfants **en bas âge**, utiliser `max_youngest_child_months` (ex: crédit jeune enfant → 72 mois).
- [ ] Si l'aide concerne des enfants dans une **tranche d'âge précise**, utiliser `requires_child_age_range_months` (ex: tsaharon 3-8 ans → `[36, 96]`).

### B. Dimension gender-spécifique
- [ ] Si l'aide a des **seuils différents selon le genre** (ex: retraite BL), utiliser `min_age_male` / `min_age_female` au lieu de `min_age`.
- [ ] Si l'aide est réservée à un genre, utiliser `required_gender: 'male' | 'female'`.

### C. Dimension statut civil
- [ ] Les pensions de survivant → `required_marital_status: ['widowed']`
- [ ] Les aides parent isolé → `required_marital_status: ['divorced', 'widowed', 'separated', 'single']`

### D. Dimension revenus
- [ ] Si l'aide est plafonnée par revenu, utiliser `max_monthly_income`. Attention : si ni `monthly_income` ni `household_income_monthly` ne sont définis dans le profil, le moteur match par défaut avec confidence réduite.

### E. Type de valeur (récurrent vs one-shot)
- [ ] Si le `value_unit` ne contient PAS `/an` ou `/mois`, l'entrée sera **EXCLUE** du total annuel affiché (comportement correct pour les one-shots).
- [ ] Si c'est un paiement ponctuel, écrire explicitement `(one-shot)` ou `(versement unique)` dans le `value_unit`.
- [ ] Ne JAMAIS écrire `NIS/an` pour une économie ponctuelle (ex: mashkanta, mas rechisha).

### F. Résident israélien
- [ ] Si l'aide nécessite d'être résident israélien (99% des cas), ajouter `requires_resident: true`.
- [ ] Vérifier qu'une aide ne matche pas un non-résident (ex: toshav chozer pas encore rentré).

### G. Éducation
- [ ] Si l'aide nécessite un niveau d'études (ex: crédit diplôme académique), utiliser `required_education_levels: ['ba', 'ma', 'phd']`. **Ne JAMAIS accepter `high_school`** pour les crédits académiques (le bac français ≠ diplôme académique).

---

## ✅ Exemple rempli (modèle de référence)

Voici un exemple complet, utilisé dans la vraie vie pour ajouter `maonot_yom` :

```markdown
## Fiche : Subvention crèche maonot yom

### 1. Identité
- **Slug** : `maonot_yom`
- **Nom FR** : Subvention creche / maonot yom (parents qui travaillent)
- **Nom HE** : סבסוד מעונות יום ומשפחתונים
- **Autorité** : `other` (Misrad HaAvoda)
- **Catégorie** : `family`

### 2. Description
- **Courte** : Subvention pouvant couvrir jusqu'a 75% du cout de la creche (maon yom) ou assistante maternelle (mishpachton) pour les enfants de 0 a 3 ans, pour les parents qui travaillent.

### 3. Conditions officielles
- Enfant âgé de 3 mois à 3 ans
- Creche/mishpachton dans la liste officielle agreee
- Les DEUX parents travaillent (≥24h/semaine chacun) OU parent isolé qui travaille
- Revenus du foyer sous un plafond (~17k NIS/mois)

### 4. Montants 2026
- **Valeur typique annuelle** : 2 500 × 12 = 30 000 NIS
- **Plage** : 500 - 40 000 NIS selon tranche revenu
- **Unité** : `NIS/an (variable selon tau revenu)`
- **Type** : Récurrent annuel (mensuel × 12)

### 5. Procédure
- **URL demande** : https://www.gov.il/he/service/childcare_subsidy
- **URL info** : https://www.kolzchut.org.il/he/סבסוד_שהיית_ילדים_במעונות_יום_ובמשפחתונים
- **Label** : "Demander la subvention creche"

### 6. Sources vérifiées
- [ ] [gov.il — childcare subsidy](https://www.gov.il/he/departments/bureaus/moital-childcare) — vérifié 2026-04-14
- [ ] [kolzchut — maonot yom](https://www.kolzchut.org.il/he/סבסוד_שהיית_ילדים_במעונות_יום_ובמשפחתונים) — vérifié 2026-04-14

### 7. Mapping profil
- `children_birth_dates` : au moins un enfant < 36 mois
- `employment_status` : `employed` ou `self_employed`
- `israeli_citizen` : true

### 8. Conditions TypeScript
```typescript
conditions: {
  max_youngest_child_months: 36,
  required_employment: ['employed', 'self_employed'],
  requires_resident: true,
},
```

### 9. Confidence : `high`

### 10. Status : `verified`

### 11. Disclaimer
> La creche ou mishpachton DOIT etre dans la liste officielle agreee par Misrad HaAvoda. Le revenu du foyer determine la tranche (tau). Demande en ligne sur gov.il, renouvelable chaque annee scolaire. Les deux parents doivent travailler (≥24h/semaine) ou justifier recherche active.

### 12. Notes internes
> Ajout catalogue 14/04/2026 (gap majeur). Les montants varient enormement selon le tau de revenu — la valeur indicative (30k NIS/an) correspond au tau moyen pour un foyer middle class.
```

---

## 🔄 Workflow session "rights-catalog"

Quand une session est dédiée à l'ajout de droits :

1. **Lire** : `CLAUDE.md` (règles projet) + ce fichier (template) + `src/types/userProfile.ts` (champs profil disponibles)
2. **Rechercher** : utiliser `WebSearch` / `WebFetch` sur les sources privilégiées pour confirmer les montants 2026
3. **Documenter** : remplir une fiche par aide en suivant le template ci-dessus (peut être dans un brouillon local ou directement en message)
4. **Coder** : ajouter l'entrée dans `src/lib/benefitsCatalog.ts` en respectant l'ordre par section
5. **Valider** : `npx tsc --noEmit`
6. **Commiter** : 1 commit par groupe de 2-3 entrées max (règle fractionnement)
7. **Déployer** : PR + merge vers main (règle auto-deploy)
8. **Auditer** : vérifier en prod qu'un profil pertinent voit bien la nouvelle entrée

---

## 🗺️ Champs actuellement supportés par le moteur

Liste des conditions TypeScript utilisables dans `conditions: {}` (d'après `EligibilityConditions` dans `benefitsCatalog.ts`) :

| Champ | Type | Utilisation |
|---|---|---|
| `min_age` / `max_age` | `number` | Borne d'âge générale |
| `min_age_male` / `min_age_female` | `number` | Âge gender-spécifique (override `min_age`) |
| `required_gender` | `'male' \| 'female'` | Genre requis |
| `required_marital_status` | `Array<...>` | Liste statuts autorisés |
| `min_children` | `number` | Nombre minimum d'enfants |
| `requires_recent_birth_months` | `number` | Naissance dans les N derniers mois |
| `max_youngest_child_months` | `number` | Plus jeune enfant < N mois |
| `requires_child_age_range_months` | `[number, number]` | Enfant dans tranche d'âge |
| `aliyah_years_range` | `[number, number]` | Années depuis alyah `[min, max]` |
| `requires_oleh` | `boolean` | Doit être olim |
| `required_employment` | `Array<...>` | Statuts emploi autorisés |
| `min_disability` | `number` | % invalidité minimum |
| `max_monthly_income` | `number` | Revenu mensuel maximum |
| `requires_resident` | `boolean` | Résident israélien |
| `requires_idf_service` | `boolean` | A servi dans Tsahal |
| `requires_combat` | `boolean` | Ancien combattant |
| `requires_active_reservist` | `boolean` | Réserviste actif |
| `requires_student` | `boolean` | Étudiant actuel |
| `requires_holocaust_survivor` | `boolean` | Survivant de la Shoah |
| `requires_bereaved` | `boolean` | Famille endeuillée |
| `requires_disabled_child` | `boolean` | A un enfant handicapé |
| `requires_caregiver` | `boolean` | Aidant familial |
| `required_education_levels` | `Array<EducationLevel>` | Niveaux d'études requis |

**Si votre aide nécessite une condition qui n'est pas dans cette liste** :
1. Vérifier si un champ du profil (`src/types/userProfile.ts`) peut servir de proxy
2. Si non → **proposer une nouvelle condition** : ajouter le champ à `EligibilityConditions` (dans `benefitsCatalog.ts`) + ajouter la vérification dans `matchProfile()` (dans `rightsDetector.ts`) + optionnellement ajouter un champ au profil utilisateur + migration Supabase

---

## 📞 En cas de doute

- **Montant introuvable** : `confidence: 'medium'` + disclaimer explicite
- **Condition complexe à modéliser** : utiliser la condition la plus proche + expliciter les cas exclus dans `full_description_fr`
- **Nouveau champ profil requis** : documenter dans la section 7 et laisser l'entrée en `needs_verification` jusqu'à la migration
- **Aide récente (<6 mois)** : toujours `confidence: 'medium'` car les modalités peuvent évoluer
