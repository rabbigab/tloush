# Rapport de Verification Manuelle — Tloush V4
## Audit complet du catalogue de benefices israeliens

**Date** : 13/04/2026
**Duree effective** : ~3h (4 agents paralleles)
**URLs verifiees** : 41 / 41
**Valeurs extraites** : ~200+

---

## Resume executif global

| Partie | MATCH | DIFF | UNCLEAR | NOT_FOUND | Total |
|--------|-------|------|---------|-----------|-------|
| **2 — Bituach Leumi** (10 URLs) | 25 | 13 | 17 | 6 | 61 |
| **3 — Rashut HaMisim** (7 URLs) | 5 | 1 | 3 | 0 | 9 |
| **4 — Klita + Shikun** (7 URLs) | 2 | 3 | 5 | 4 | 14 |
| **5 — Mairies + Special** (17 URLs) | 6 | 1 | 9 | 1 | 17 |
| **TOTAL** | **38** | **18** | **34** | **11** | **101** |

**Taux de fiabilite actuel du catalogue** : ~38% MATCH exact, ~56% necessitant verification manuelle approfondie (UNCLEAR/NOT_FOUND).

---

## 🔴 CORRECTIONS URGENTES (DIFF confirmes)

Ces valeurs sont **fausses dans le catalogue** et doivent etre corrigees immediatement dans `src/lib/benefitsCatalog.ts` :

### 1. Attendance Allowance (Invalidite) — SOUS-ESTIMES

| Niveau | Tloush actuel | Valeur officielle 2026 | Ecart |
|--------|--------------|----------------------|-------|
| Niveau 1 (50%) | ~2 240 NIS | **1 943 NIS** | -297 NIS |
| Niveau 2 (112%) | ~5 017 NIS | **4 501 NIS** | -516 NIS |
| Niveau 3 (188%) | ~8 422 NIS | **7 181 NIS** | -1 241 NIS |

> **Impact** : Tloush SURESTIME les montants. Des beneficiaires pourraient etre decus.

### 2. Pension Invalidite 100% — SOUS-ESTIME

- Tloush : ~4 480 NIS/mois → **Officiel : 4 771 NIS/mois**
- Impact : +291 NIS/mois que les beneficiaires ne reclament pas

### 3. Pension Vieillesse — LEGERE SURESTIMATION

| Profil | Tloush | Officiel 2026 |
|--------|--------|--------------|
| Individu de base | ~1 879 NIS | **1 795 NIS** (base) / ~1 838 NIS (avec 80+) |
| Couple | ~2 824 NIS | **2 762 NIS** |
| Supplement 80+ | ~50 NIS | **~103 NIS** |

### 4. Miluim — Planchers incorrects

| Element | Tloush | Officiel 2026 |
|---------|--------|--------------|
| Plancher journalier | 328.76 NIS | **310.52 NIS** |
| Plancher mensuel | 9 863 NIS | **9 316 NIS** |

### 5. Chisachon LeKol Yeled — Mise a jour mineure

- Tloush : 57 NIS/mois → **Officiel : 58 NIS/mois** (depuis 01/01/2026)

### 6. Conge Maternite — ERREUR CRITIQUE de formulation

- Tloush dit : "26 semaines payees" pour anciennete >= 12 mois
- **Realite : 26 semaines de conge total, dont SEULEMENT 15 semaines payees par BL**
- Impact : des utilisatrices peuvent croire qu'elles seront payees 26 semaines

### 7. Conge Paternite — Debut corrige

- Tloush : le pere peut commencer "a partir de la 7e semaine"
- **Realite : a partir de la 6e semaine** (quand la mere a pris ses 6 semaines minimum)

### 8. Supplement conjoint invalidite — Formulation incorrecte

- Tloush : +20% du montant de base
- **Realite : montant fixe de ~1 458 NIS** (soit ~22% pour 100% incapacite, mais c'est un montant fixe, pas un %)

### 9. Student Authority Eligibilite — ERREUR CRITIQUE

- Tloush : "eligible 10 ans apres alyah"
- **Realite : doit commencer les etudes dans les 36 mois apres alyah**
- Impact : des olim pourraient croire qu'ils ont 10 ans pour commencer

### 10. Loi 2026 Olim — Piege reporting

- **NOUVEAU** : L'exemption de 10 ans de declaration des revenus etrangers a ete **SUPPRIMEE** pour les olim arrivant en 2026+
- Les revenus etrangers restent EXEMPTES d'impot pendant 10 ans
- Mais les actifs et revenus mondiaux doivent etre **DECLARES des le jour 1**
- Impact juridique majeur — a documenter clairement dans Tloush

---

## ✅ VALEURS CONFIRMEES (MATCH)

### Bituach Leumi — Confirmes

- **Kitsbat Yeladim** : 173 / 219 / 219 / 219 / 173 NIS/mois ✅
- **Maanak Leida** : 946 (2e) / 631 (3e+) / 10 514 (jumeaux) NIS ✅
- **Conge pre-accouchement** : 7 semaines max ✅
- **Paternite** : 20 semaines max / 21 jours min / 6 semaines mere min ✅
- **Retraite hommes** : 67 ans / Femmes <1960 : 62 ans ✅
- **Supplement anciennete** : 2%/an au-dela de 10 ans ✅
- **Chomage jours 1-125** : 550.76 NIS/jour ✅
- **Chomage jours 126+** : 367.17 NIS/jour ✅
- **Chomage duree par age** : 50 / 100 / 138 / 175 jours ✅
- **Chomage conditions** : 20-67 ans, 12/18 mois ✅
- **Miluim calcul** : (salaire 3 mois / 90) ✅
- **Miluim supplement bas revenu** : ~3 000 NIS/mois ✅

### Rashut HaMisim — Confirmes

- **Tax brackets 2026** : TOUS confirmes (10% → 50%) ✅
- **Gel 2025-2027** : CONFIRME ✅
- **Surtax** : 721 560 NIS/an + 3% = 53% effectif ✅
- **Nekudot Zikui** : 242 NIS/mois = 2 904 NIS/an ✅
- **Categories de base** : 2.25 pts homme / +0.5 femme / diplomes / parent isole ✅
- **BL Exemption US 5 ans** : confirme (citoyennete US, paiement SS continu) ✅
- **Combat reservist tax credit** : jusqu'a 4 points, role combat uniquement ✅
- **Loi 2026 olim** : taux progressifs 0%/0%/10%/20%/30% confirmes ✅
- **Plafond loi 2026** : 1 000 000 NIS/an confirme ✅

### Klita + Logement — Confirmes

- **Sal Klita** : 6 mensualites / compte bancaire requis ✅
- **Ulpan** : 5 mois / 5j/semaine / 5h/jour / gratuit / 18 mois max ✅

### Arnona — Confirmes

- **Tel Aviv** : 90% sur 100 m² / 12 mois (dans 24 mois) ✅
- **Jerusalem** : 90% sur 100 m² / 12 mois (dans 24 mois) ✅

---

## ⚠️ VALEURS A VERIFIER MANUELLEMENT (UNCLEAR)

Ces valeurs n'ont pas pu etre confirmees via recherche web — les sites officiels israeliens (btl.gov.il, gov.il) bloquent souvent les requetes automatisees. Il faut une **verification manuelle dans un navigateur** :

### Haute priorite

1. **Miluim plafond journalier** : 1 730.33 NIS (methodologie confirmee, chiffre exact non verifie)
2. **Miluim plafond mensuel** : 51 910 NIS (le chiffre 2023 etait 47 465 NIS)
3. **Sal Klita montants mensuels** : les valeurs 4 500-8 500 NIS sont **significativement plus elevees** que les sources tierces (1 200-4 400 NIS). A verifier imperativement.
4. **Income Support (Hashlamat Hachnasa)** : tous les montants par profil sont marques UNCLEAR
5. **Section 66 enfants** : table pere vs mere et bonus 2022-2025 prolonge en 2026 ?
6. **Oleh schedule 2022+** : approximation annualisee Annee 2 = 2.5 pts questionnable

### Priorite moyenne

7. Maanak Leida 1er enfant : 2 103 NIS non confirme explicitement
8. Maanak Leida triples : 15 771 NIS non confirme
9. Pension vieillesse femmes 1960+ : progression exacte non detaillee
10. Pension conjoint survivant et orphelin : montants exacts non trouves
11. Aide au loyer : montants par profil non confirmes officiellement
12. Mashkanta olim : Tloush dit 300 000 NIS, sources disent 200 000 NIS → POSSIBLE DIFF
13. Arnona : 6 villes sur 8 sans donnees specifiques (Haifa, Netanya, Ra'anana, Ashdod, Herzliya, Be'er Sheva)

### Priorite basse

14. Mobility allowance (pret et mensualite)
15. Handicap minimum eligibilite
16. Supplement enfant invalidite (+10%)
17. Bourses generales etudiants
18. Droits anciens combattants details

---

## 📋 RECOMMANDATIONS URGENTES

### Corrections immediates (a faire dans benefitsCatalog.ts)

1. ❌ **Attendance Allowance** : corriger les 3 niveaux (1 943 / 4 501 / 7 181 NIS)
2. ❌ **Pension invalidite 100%** : corriger a 4 771 NIS
3. ❌ **Pension vieillesse** : corriger individu a 1 795 NIS, couple a 2 762 NIS, 80+ a 103 NIS
4. ❌ **Chisachon** : corriger a 58 NIS
5. ❌ **Miluim planchers** : corriger journalier a 310.52, mensuel a 9 316 NIS
6. ❌ **Conge maternite** : reformuler "26 semaines conge total (15 payees)" au lieu de "26 semaines payees"
7. ❌ **Paternite debut** : corriger a "6e semaine" au lieu de "7e semaine"
8. ❌ **Student Authority** : corriger a "36 mois" au lieu de "10 ans"

### Ajouts au catalogue

9. ➕ **Loi 2026 piege reporting** : ajouter warning que les olim 2026+ doivent declarer TOUS les revenus etrangers des le jour 1
10. ➕ **Supplement income-tested** Kitsbat Yeladim : documenter si trouve

### Verifications manuelles requises (navigateur)

11. 🔍 Ouvrir btl.gov.il dans Chrome avec VPN israelien pour confirmer les valeurs UNCLEAR
12. 🔍 Utiliser le calculateur Sal Klita de NBN pour les montants exacts
13. 🔍 Contacter les mairies pour les taux arnona specifiques (Netanya, Ra'anana surtout)

---

## Questions en suspens

1. Le plafond BL mensuel 50 695 NIS est-il correct pour 2026 ? (Non trouve dans les sources)
2. Le seuil reduit BL 7 522 NIS est-il correct pour 2026 ? (Non trouve)
3. Le bonus Section 66 +1pt/enfant pour les 6-17 ans (reforme 2022-2025) est-il prolonge en 2026 ?
4. Le Sal Klita est-il vraiment de 4 500-8 500 NIS/mois ou ces chiffres incluent-ils d'autres aides cumulees ?
5. La mashkanta olim est-elle bien de 300 000 NIS ou de 200 000 NIS en 2026 ?

---

*Rapport genere le 13/04/2026 par verification systematique via sources web officielles israeliennes.*
*Les items marques UNCLEAR necessitent une verification manuelle sur les sites officiels (souvent bloques pour les requetes automatisees).*
