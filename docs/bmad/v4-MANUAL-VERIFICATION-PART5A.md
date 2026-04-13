# Tloush V4 — Briefing de verification manuelle

> Partie 5A / 5 : Arnona — 3 mairies principales (Tel Aviv, Jerusalem, Haifa)
> Date : 2026-04-12
> Duree estimee : ~30 min

---

## Vue d'ensemble de la partie 5A

Cette partie couvre les **baremes d'Arnona** (taxe municipale) des **3 plus grandes villes d'Israel**. L'Arnona est municipale : chaque commune a ses propres tarifs, ses propres reductions et ses propres conditions. **Impossible de centraliser** dans un catalogue global, mais les 3 villes ci-dessous concernent **~40% de la population israelienne**.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 25 | Arnona Tel Aviv-Yafo | 🔴 P0 | 10 min |
| 26 | Arnona Jerusalem | 🔴 P0 | 10 min |
| 27 | Arnona Haifa | P1 | 10 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 1 a 4B.

**Contexte** : Tloush ne hardcode pas les baremes par ville (trop volatile). Pour chaque ville, on veut :
1. **Confirmer que l'URL officielle de l'iria (mairie) est toujours valide**
2. **Extraire les reductions disponibles** pour chaque categorie (olim, handicap, retraite, parent isole, etudiant, Shoah)
3. **Noter les ecarts notables** par rapport aux baremes "moyens" documentes dans le catalogue

Pour chaque ville, il y a une page "hanachot arnona" (reductions arnona) qui liste tous les taux.

---

## 🔴 URL 25 : Arnona Tel Aviv-Yafo

**URL mairie principale** : https://www.tel-aviv.gov.il/

**URL arnona (section hanachot)** : https://www.tel-aviv.gov.il/Residents/Payment/Arnona/Pages/Benefits.aspx

**URL hebreu (alternative)** : https://www.tel-aviv.gov.il/Residents/Payment/Arnona/Pages/Default.aspx

**Objectif** : Tel Aviv-Yafo a environ **460 000 habitants** et les tarifs d'arnona les plus eleves d'Israel (zone centre). Les reductions sont donc **proportionnellement plus importantes** en valeur.

**Ce que tu dois extraire** :

### A. Grille de base Arnona Tel Aviv 2026

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Tarif residentiel (moyenne NIS/m²/an) | non hardcode | ______ |
| Difference centre-ville vs peripherie | non hardcode | ______ |
| Date des nouveaux taux 2026 | janvier 2026 | ______ |

### B. Reductions disponibles Tel Aviv

Pour chaque categorie Tloush, confirme si la reduction existe a Tel Aviv **et son taux exact** :

| Categorie | Tloush (moyenne) | Tel Aviv exact |
|---|---|---|
| **Oleh chadash** | 70-90% sur 100 m² x 12 mois | ______ |
| **Handicap (50%+)** | variable (25-80%) | ______ |
| **Handicap 100%** | variable | ______ |
| **Retraite (67+) bas revenu** | variable (25-100%) | ______ |
| **Retraite (67+) autonome** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant** | variable (10-30%) | ______ |
| **Shoah survivant** | exemption totale/majeure | ______ |
| **Famille nombreuse (3+ enfants)** | non documente | ______ |
| **Famille nombreuse (4+ enfants)** | non documente | ______ |
| **Chomeur longue duree** | non documente | ______ |
| **Aidant familial** | non documente | ______ |

### C. Conditions specifiques Tel Aviv

- **A verifier** : Tel Aviv a-t-elle une reduction specifique pour les **francophones** ou pour des communautes particulieres ?
- **A verifier** : existe-t-il un **plafond de surface** differencie ? (Tloush : 100 m² pour les olim)
- **A verifier** : la reduction olim Tel Aviv peut-elle etre **prolongee** au-dela des 12 mois dans certains cas ?
- **A verifier** : y a-t-il une reduction pour **creche a domicile** (famille d'accueil) ?

### D. Procedure de demande Tel Aviv

- **A verifier** : demande en ligne possible ?
- **A verifier** : documents requis (copie bail, teudat oleh, RIB, etc.)
- **A verifier** : delai de traitement
- **A verifier** : effet retroactif ? (si je demande en juin, ca s'applique aussi a janvier-mai ?)

### Hebrew terms
- ארנונה = Arnona
- הנחה בארנונה = Hanaha BeArnona (reduction arnona)
- עיריית תל אביב-יפו = Iriyat Tel Aviv-Yafo
- תושב = Toshav (resident)
- מבקש = Mevakesh (demandeur)

### Rapport a faire
```
### URL25_arnona_tel_aviv — 🔴 CRITIQUE

URL source : https://www.tel-aviv.gov.il/Residents/Payment/Arnona/Pages/Benefits.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Variation centre-peripherie : ______
- Date nouveaux taux : ______

Reductions Tel Aviv :
- Oleh chadash : ______ % × ______ m² × ______ mois
- Handicap 50%+ : ______ %
- Handicap 100% : ______ %
- Retraite bas revenu : ______ %
- Retraite autonome : ______ %
- Parent isole : ______ %
- Etudiant : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %
- Famille 4+ enfants : ______ %
- Chomeur longue duree : ______ %
- Aidant familial : ______ %

Conditions specifiques :
- Reduction francophone specifique : [OUI | NON]
- Plafond surface olim : ______ m²
- Prolongation olim au-dela 12 mois : [POSSIBLE | NON]
- Reduction creche a domicile : ______ %

Procedure :
- Demande en ligne : [OUI | NON]
- Documents requis : ______
- Delai traitement : ______
- Effet retroactif : [OUI | NON, combien de mois]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 🔴 URL 26 : Arnona Jerusalem

**URL mairie principale** : https://www.jerusalem.muni.il/

**URL arnona** : https://www.jerusalem.muni.il/%D7%AA%D7%95%D7%A9%D7%91%D7%99%D7%9D/%D7%AA%D7%A9%D7%9C%D7%95%D7%9E%D7%99%D7%9D/%D7%90%D7%A8%D7%A0%D7%95%D7%A0%D7%94/

**URL reductions hebreu** : https://www.jerusalem.muni.il/he/residents/payments/arnona/discounts/

**Objectif** : Jerusalem est la capitale avec ~950 000 habitants et une forte population d'olim francophones (quartiers Talpiot, Nayot, Baka, Katamon, etc.). Les reductions y sont souvent plus genereuses que Tel Aviv car la ville est moins riche fiscalement.

**Ce que tu dois extraire** :

### A. Grille de base Arnona Jerusalem 2026

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Tarif residentiel (moyenne NIS/m²/an) | non hardcode | ______ |
| Zones tarifaires differentes (A/B/C) | non documente | ______ |
| Zones est-ouest differentes | non documente | ______ |

⚠️ **Important** : Jerusalem utilise un **decoupage par zones** (azorim) avec des tarifs differents selon le quartier. Certains quartiers de l'est ont des tarifs reduits d'office.

### B. Reductions disponibles Jerusalem

| Categorie | Tloush (moyenne) | Jerusalem exact |
|---|---|---|
| **Oleh chadash** | 70-90% sur 100 m² x 12 mois | ______ |
| **Handicap 50%+** | variable | ______ |
| **Handicap 100%** | variable | ______ |
| **Retraite (67+) bas revenu** | variable | ______ |
| **Retraite (67+) autonome** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant** | variable | ______ |
| **Shoah survivant** | exemption | ______ |
| **Famille nombreuse (3+ enfants)** | non documente | ______ |
| **Orthodoxe avec Kollel** | non documente | ______ |
| **Reserviste combat** | non documente | ______ |
| **Nouveau marie** | non documente | ______ |

### C. Reductions specifiques Jerusalem

Jerusalem offre quelques reductions **uniques** qu'on veut confirmer :

- **A verifier** : reduction pour les **avrech Kollel** (etudiants orthodoxes pour rabbinat)
- **A verifier** : reduction pour les **residents des quartiers juifs de la vieille ville**
- **A verifier** : reduction pour **nouvellement maries** (jeunes couples)
- **A verifier** : reduction pour **familles de soldats** pendant leur service

### D. Conditions specifiques Jerusalem

- **A verifier** : la ville a-t-elle un systeme de priorite ou de queue pour les demandes ?
- **A verifier** : possibilite de cumuler plusieurs reductions ?
- **A verifier** : effet retroactif ?

### E. Plafonds Jerusalem

- **A verifier** : plafond surface pour les olim (probablement 100 m² comme national)
- **A verifier** : plafond surface pour handicap
- **A verifier** : plafond surface pour retraite

### Rapport a faire
```
### URL26_arnona_jerusalem — 🔴 CRITIQUE

URL source : https://www.jerusalem.muni.il/he/residents/payments/arnona/discounts/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Zones tarifaires (A/B/C) : ______
- Zones est-ouest : ______

Reductions standard :
- Oleh chadash : ______ % × ______ m² × ______ mois
- Handicap 50%+ : ______ %
- Handicap 100% : ______ %
- Retraite bas revenu : ______ %
- Retraite autonome : ______ %
- Parent isole : ______ %
- Etudiant : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %

Reductions specifiques Jerusalem :
- Avrech Kollel : ______ %
- Vieille ville juive : ______ %
- Nouveaux maries : ______ %
- Famille de soldat : ______ %
- Reserviste combat : ______ %

Conditions :
- Cumul plusieurs reductions : [OUI | NON]
- Effet retroactif : [OUI | NON, combien de mois]

Plafonds surface :
- Olim : ______ m²
- Handicap : ______ m²
- Retraite : ______ m²

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 27 : Arnona Haifa

**URL mairie principale** : https://www.haifa.muni.il/

**URL arnona** : https://www.haifa.muni.il/Services/Finance/Arnona/Pages/default.aspx

**URL reductions** : https://www.haifa.muni.il/Services/Finance/Arnona/Pages/Discounts.aspx

**Objectif** : Haifa est la 3e ville (~280 000 habitants) avec une forte population d'olim russes et francophones. Les reductions y sont souvent plus accessibles qu'a Tel Aviv (ville plus sociale).

**Ce que tu dois extraire** :

### A. Grille de base Arnona Haifa 2026

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Tarif residentiel (NIS/m²/an) | non hardcode | ______ |
| Zones par quartier (Carmel, Hadar, etc.) | non documente | ______ |
| Date des nouveaux taux | janvier 2026 | ______ |

### B. Reductions disponibles Haifa

| Categorie | Tloush (moyenne) | Haifa exact |
|---|---|---|
| **Oleh chadash** | 70-90% sur 100 m² x 12 mois | ______ |
| **Handicap 50%+** | variable | ______ |
| **Handicap 100%** | variable | ______ |
| **Retraite bas revenu** | variable | ______ |
| **Retraite autonome** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant** | variable | ______ |
| **Shoah** | exemption | ______ |
| **Famille nombreuse (3+ enfants)** | non documente | ______ |
| **Minorites druzes/arabes** (reductions specifiques) | non documente | ______ |

### C. Specificites Haifa

- **A verifier** : Haifa offre-t-elle des reductions **specifiques** pour les **petits metiers** ou travailleurs precaires (vu la tradition ouvriere de la ville) ?
- **A verifier** : reductions pour les **pecheurs** de la marina ?
- **A verifier** : reduction pour les residents du **Technion** ?

### D. Procedure Haifa

- **A verifier** : demande en ligne vs en personne
- **A verifier** : documents requis
- **A verifier** : delai

### Rapport a faire
```
### URL27_arnona_haifa

URL source : https://www.haifa.muni.il/Services/Finance/Arnona/Pages/Discounts.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Zones par quartier : ______

Reductions standard :
- Oleh chadash : ______ % × ______ m² × ______ mois
- Handicap 50%+ : ______ %
- Handicap 100% : ______ %
- Retraite bas revenu : ______ %
- Retraite autonome : ______ %
- Parent isole : ______ %
- Etudiant : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %
- Minorites : ______ %

Reductions specifiques Haifa :
- Petits metiers : ______ %
- Technion : ______ %
- Autres : ______

Procedure :
- Demande en ligne : [OUI | NON]
- Documents : ______
- Delai : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 5A

A la fin de cette partie, tu auras verifie **3 URLs** correspondant aux 3 plus grandes villes d'Israel, qui representent **~40% de la population**.

### Checklist de sortie partie 5A

- [ ] URL 25 (Tel Aviv-Yafo) : 🔴 verdict rendu + toutes les reductions par categorie
- [ ] URL 26 (Jerusalem) : 🔴 verdict rendu + specificites (Kollel, vieille ville, soldats, etc.)
- [ ] URL 27 (Haifa) : verdict rendu + specificites (petits metiers, Technion, etc.)

### Importance

L'arnona represente **~5% du catalogue** en nombre de regles (vs 44 benefices au total) mais c'est un **benefice que TOUS les utilisateurs paient**, et donc une reduction meme modeste fait une difference visible dans leur budget. Pour un olim qui loue a Tel Aviv, une reduction de 70% d'arnona pendant 12 mois peut representer **6 000 - 12 000 NIS** economises.

### Action post-verification

Dans le rapport, **identifie pour chaque ville** :
1. L'URL officielle fiable qu'on peut lier dans Tloush (pour chaque utilisateur qui declare sa ville)
2. Les reductions **specifiques** qu'on n'a pas en national et qu'on pourrait documenter au cas par cas
3. Les **cumuls** possibles entre reductions (tres important, souvent meconnu)

### Prochaine etape

Une fois la partie 5A terminee et ton rapport envoye, **demande la partie 5B** qui couvre :
- Arnona autres villes (Ashdod, Netanya, Ra'anana, Herzliya, Be'er Sheva)

Puis les parties 5C (Shoah), 5D (etudiants) et 5E (reservistes combat + endeuilles) suivront.

---

*Fin de la partie 5A. ~30 min de travail attendu. Attends la partie 5B pour continuer.*
