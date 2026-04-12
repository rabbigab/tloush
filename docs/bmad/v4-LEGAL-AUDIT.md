# Tloush V4 — Rapport d'audit legal et corrections appliquees

> Date: 2026-04-12
> Statut : Corrections critiques appliquees, **features toujours en BETA**
> Voir aussi : `v4-FEASIBILITY.md`, `v4-ARCHITECTURE.md`

---

## Contexte

Apres avoir livre les 6 features V4 (tax refund, miluim, rights detector, etc.),
un audit legal a ete lance pour verifier que toutes les donnees utilisees
correspondent aux baremes officiels israeliens. **L'audit a revele plusieurs
erreurs critiques** qui auraient pu faire perdre de l'argent a nos utilisateurs
ou les pousser a faire de fausses declarations.

Ce document resume les erreurs identifiees et les corrections appliquees.

---

## Synthese des erreurs trouvees

| # | Item | Status initial | Severite | Corrige ? |
|---|------|----------------|----------|-----------|
| 1 | Tax brackets 2025 | ✅ Correct | Low | ✅ Relabeler |
| 2 | Oleh hadash schedule | ❌ Schedule pre-2022 | **HIGH** | ✅ Oui |
| 3 | Points credit enfants | ❌ Table simplifiee | **HIGH** | ✅ Oui (approximation documentee) |
| 4 | Miluim plafond | ❌ 1617.40 (faux) | **CRITICAL** | ✅ 1730.33 |
| 5 | Miluim plancher | ❌ 280.28 (faux) | **CRITICAL** | ✅ 328.76 |
| 6 | Miluim formule | ❌ `/30 monthly avg` | **CRITICAL** | ✅ `*3/90 (3 mois)` |
| 7 | Miluim cap 270j | ❌ Non verifiable | **CRITICAL** | ✅ Retire |
| 8 | Havraa table seniorite | ⚠️ Incorrecte | Medium | ✅ Oui |
| 9 | Havraa loi gel 2025 | ❌ Ignoree | Medium | ✅ Oui (-1 jour) |
| 10 | Kitsbat yeladim | ❌ Chiffres inventes | **HIGH** | ✅ 169/215/169 |
| 11 | Pension Section 14 | ⚠️ 6% pitzuim seulement | Medium | ✅ Oui (mention 8.33%) |
| 12 | BL/Mas Briut 2025 | ✅ Correct | Low | ✅ A refresh 2026 |

---

## Corrections detaillees

### 1. Miluim (CRITICAL) — `src/lib/miluim.ts`

**Avant :** valeurs inventees, formule incorrecte.

**Apres :**
- `dailyMaxNis: 1730.33` (officiel BTL 2026)
- `dailyMinNis: 328.76` (officiel BTL 2026)
- Formule officielle : `(salaire_3_mois) / 90` (au lieu de `monthly_avg / 30`)
- `baseDaysDivisor: 90`
- **Cap 270 jours retire** — non verifiable, remplace par un warning generique

**Impact :** Un reserviste avec salaire 20 000 ₪/mois aurait recu une estimation
sous-evaluee de ~3 400 ₪ pour 30 jours de service. **Correction urgente.**

Source : https://www.btl.gov.il/benefits/Reserve_Service/

---

### 2. Oleh hadash schedule (HIGH) — `src/lib/taxRefund.ts` + `rightsDetector.ts`

**Avant :** schedule pre-2022 (3/2/1 sur 3 ans = 6 points total).

**Apres (schedule 2022+ officiel) :**
- Annee 0 (mois 1-12) : 12 pts cumules → **1 pt annuel moyen**
- Annee 1 (mois 13-24) : 36 pts cumules → **3 pts annuel**
- Annee 2 (mois 25-36) : 30 pts → **2.5 pts annuel**
- Annee 3 (mois 37-48) : 18 pts → **1.5 pts annuel**
- Annee 4 (mois 49-54) : 6 pts → **0.5 pt annuel** (demi-annee)
- **Total 4.5 ans** (pas 3)

**Impact :** Un nouvel oleh aurait sous-reclame pendant ses 54 premiers mois.

Source : https://www.kolzchut.org.il/en/Income_Tax_Credit_Points_for_New_Immigrants

---

### 3. Points credit enfants (HIGH) — `src/lib/taxRefund.ts` + `rightsDetector.ts`

**Avant :** simplification `+1.5 / +1` par tranche d'age, sans distinction parent.

**Apres :**
- Annee de naissance : +1.5 pts (mere qui travaille)
- Ages 1-5 : +2.5 pts (reforme 2022 pour jeunes enfants)
- Ages 6-17 : +2 pts (base + bonus temporaire 2022-2025)

**Note importante :** La table reelle varie par **parent** (mere vs pere) et
par **reformes temporaires**. Notre implementation utilise les points "mere"
(plus eleves) avec un disclaimer explicite.

Source : https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה

---

### 4. Kitsbat Yeladim (HIGH) — `src/lib/rightsDetector.ts`

**Avant :** chiffres inventes (157 / 355 / 553 / 887).

**Apres (officiel BTL 2025) :**
- Enfant 1 : **169 ₪/mois**
- Enfants 2-4 : **215 ₪/mois chacun**
- Enfant 5+ : **169 ₪/mois** (le tarif retombe !)

Exemple : 3 enfants = 169 + 215 + 215 = **599 ₪/mois** (pas 553).

Source : https://www.btl.gov.il/benefits/children/

---

### 5. Havraa (Medium) — `src/lib/rightsDetector.ts`

**Avant :** table simplifiee 5-10 jours sans les paliers corrects, loi gel 2025 ignoree.

**Apres (table Extension Order prive) :**
- Annee 1 : 5 jours
- Annees 2-3 : 6 jours
- Annees 4-10 : 7 jours
- Annees 11-15 : 8 jours
- Annees 16-19 : 9 jours
- Annees 20+ : 10 jours
- **Loi gel 2025 : -1 jour obligatoire** (pour financer miluim)

**Impact :** Un employe annee 1 en 2025 = 4 × 418 = 1 672 ₪ (pas 2 090).
Sans ce fix, le detecteur aurait genere des faux positifs "havraa manquante"
pour des employeurs conformes.

Source : https://www.nevo.co.il/law_html/law00/234284.htm

---

### 6. Pension Section 14 (Medium) — `src/lib/rightsDetector.ts`

**Avant :** disclaimer "6% pitzuim OK".

**Apres :** mention explicite que **Section 14 (8.33%)** est la vraie baseline saine.
Un employe avec seulement 6% pitzuim accumule un gap de 2.33%/an de severance
non finance, qu'il devra reclamer separement au licenciement.

---

### 7. Tax brackets — `src/lib/taxRefund.ts`

**Avant :** label "2025".

**Apres :** label **"2025-2027 (frozen)"** — les brackets sont geles par la
loi des finances, pas d'indexation inflation.

Source : Israel Tax Authority

---

## Ce qui reste a verifier

L'audit a identifie des elements **hors scope** qui necessitent une verification
manuelle avant une vraie mise en production :

1. **Constantes miluim 2026** : j'ai mis les valeurs que l'audit a citees, mais
   je n'ai pas d'acces direct pour verifier la date exacte de publication BTL.
2. **BL + Mas Briut 2026** : les seuils (7 522, 50 695) sont lies au salaire
   moyen qui change chaque janvier. A refresh pour 2026.
3. **Havraa rate 2026** : l'audit dit "verifier si la loi de gel continue".
4. **Children credit points** : notre approximation est la meilleure possible
   sans profil complet des deux parents — mais c'est une **approximation**.

---

## Recommandations pour V5

- [ ] **Valider les corrections** avec un yoetz mas francophone
- [ ] **Ajouter les constantes 2026** pour BL/Mas Briut/Havraa
- [ ] **Ajouter le genre (mere/pere)** dans le profil utilisateur pour calcul
      exact des points enfants
- [ ] **Split "hore yachid" vs "hore gaurouch"** dans le detecteur
      (les schedules sont differents)
- [ ] **Ajouter le schedule "pre-2022"** pour les olim qui ont fait alyah
      avant 2022 (le vieux schedule s'applique toujours a eux)
- [ ] **Revoir la table havraa** ligne par ligne avec kolzchut
- [ ] **Partenariat** avec un yoetz mas pour validation mensuelle des baremes

---

## Disclaimer produit

Tant que ces corrections n'ont pas ete **validees par un professionnel**, les 3
features suivantes restent marquees **BETA** dans l'UI :

- 🟣 `/tax-refund` — Estimateur de remboursement d'impots
- 🟣 `/miluim` — Tracker de miluim
- 🟣 `/rights-detector` — Detecteur automatique de droits

Chaque page affiche un disclaimer legal fort pointant vers la source officielle
et proposant de consulter un expert.

**Tloush n'est pas un conseil fiscal ou juridique.** Les utilisateurs sont
explicitement avertis de verifier chaque chiffre avant toute demande officielle.
