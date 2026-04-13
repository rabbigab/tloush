# Tloush V4 — Briefing de verification manuelle

> Partie 2A / 5 : Bituach Leumi — Famille, Maternite & Retraite
> Date : 2026-04-12
> Duree estimee : ~45 min

---

## Vue d'ensemble de la partie 2A

Cette partie couvre **5 groupes de benefices** sur bituach leumi (BL), tous lies a la **famille**, la **maternite**, et la **retraite**. Ce sont les valeurs les plus consultees par les utilisateurs de Tloush.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 1 | Page des baremes 2026 (vue d'ensemble) | P1 | 5 min |
| 2 | Kitsbat Yeladim (allocation enfants) | 🔴 P0 | 10 min |
| 3 | Maanak Leida (prime naissance) | P1 | 5 min |
| 4 | Dmei Leida (maternite / paternite) | P1 | 10 min |
| 5 | Old Age Pension + Income Supplement | P1 | 15 min |

**Avant de commencer** : assure-toi d'avoir lu la partie 1/5 (contexte + template de rapport).

---

## 🔗 URL 1 : Page des baremes BL 2026

**URL** : https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx

**Version anglaise** (si hebreu trop difficile) : https://www.btl.gov.il/English%20Homepage/About/News/Pages/hadasaidkonkitzva2026.aspx

**Objectif** : C'est la page d'atterrissage officielle BL pour l'annee 2026. Elle contient un resume de TOUS les baremes indexes pour cette annee (CPI + salaire moyen). C'est notre **source primaire** pour la plupart des valeurs Tloush.

**Ce que tu dois extraire** :

1. **Date de publication** de l'annonce (janvier 2026 normalement)
2. **Liste des baremes** mis a jour pour 2026
3. **Salaire moyen de l'economie 2026** (`sachar memutsa bamashek` / שכר ממוצע במשק) — chiffre critique car beaucoup d'autres baremes en dependent

### Hebrew terms pour naviguer :
- הביטוח הלאומי = Bituach Leumi
- קצבה = allocation / pension
- שכר ממוצע = salaire moyen
- מדד = indice (CPI)
- עדכון = mise a jour

### Valeurs actuelles Tloush (a confirmer)
Dans `src/lib/benefitsCatalog.ts` nous avons :
- Kitsbat yeladim enfant 1 : **173 NIS/mois**
- Kitsbat yeladim enfants 2-4 : **219 NIS/mois chacun**
- Kitsbat yeladim enfant 5+ : **173 NIS/mois**
- Plafond miluim journalier 2026 : **1730.33 NIS**
- Plancher miluim journalier 2026 : **328.76 NIS**
- Plafond BL mensuel : **50 695 NIS** (verifier si change en 2026)
- Seuil reduit BL : **7 522 NIS** (verifier si change en 2026)

### Rapport a faire
```
### URL1_btl_rates_2026

URL source : https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx

Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Donnees trouvees :
- Date de publication : ______
- Salaire moyen economie 2026 : ______ NIS/mois
- Plafond BL 2026 : ______ NIS/mois
- Seuil reduit BL 2026 : ______ NIS/mois
- Autres baremes cites : ______

Verdict general : [MATCH | DIFF | UNCLEAR | NOT_FOUND]

Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 🔴 URL 2 : Kitsbat Yeladim (allocation enfants)

**URL principale** : https://www.btl.gov.il/benefits/children/Pages/%D7%A9%D7%99%D7%A2%D7%95%D7%A8%D7%99%20%D7%94%D7%A7%D7%A6%D7%91%D7%94.aspx

**URL alternative** (si la premiere ne fonctionne pas) : https://www.btl.gov.il/benefits/children/Pages/default.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Children/Pages/default.aspx

**Objectif** : PRIORITE MAXIMALE. C'est le benefice le plus consulte (chaque famille olim avec enfants en beneficie). Une erreur ici = perte d'argent directe pour le client.

**Ce que tu dois extraire** :

### A. Montants mensuels par rang d'enfant (2026)

| Rang | Valeur actuelle Tloush | A verifier sur BL |
|---|---|---|
| 1er enfant | **173 NIS/mois** | ______ |
| 2e enfant | **219 NIS/mois** | ______ |
| 3e enfant | **219 NIS/mois** | ______ |
| 4e enfant | **219 NIS/mois** | ______ |
| 5e enfant et + | **173 NIS/mois** (retombe !) | ______ |

**Attention** : la regle "5e enfant retombe au tarif du 1er" est contre-intuitive. Confirme qu'elle existe toujours en 2026.

### B. Chisachon LeKol Yeled (compte d'epargne par enfant)

**URL** : https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx

- **Valeur actuelle Tloush** : 57 NIS/mois verses en plus dans un compte epargne par enfant
- **A verifier** : montant 2026 + conditions d'eligibilite

### C. Supplement pour familles a faible revenu (income-tested)

Certaines familles recoivent un supplement a l'allocation enfants si elles percoivent `hashlamat hachnasa` (complement de revenu). **Non reference dans notre catalogue actuel — a documenter si tu trouves les montants.**

### Hebrew terms
- קצבת ילדים = Kitsbat Yeladim
- סכום הקצבה = montant de l'allocation
- ילד = enfant
- חיסכון לכל ילד = Chisachon LeKol Yeled (compte epargne)

### Rapport a faire
```
### URL2_kitsbat_yeladim — 🔴 CRITIQUE

URL source : https://www.btl.gov.il/benefits/children/Pages/...

Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Donnees trouvees (2026) :
- 1er enfant : ______ NIS/mois (Tloush : 173)
- 2e enfant : ______ NIS/mois (Tloush : 219)
- 3e enfant : ______ NIS/mois (Tloush : 219)
- 4e enfant : ______ NIS/mois (Tloush : 219)
- 5e enfant+ : ______ NIS/mois (Tloush : 173)
- Chisachon LeKol Yeled : ______ NIS/mois (Tloush : 57)
- Supplement income-tested : ______ NIS/mois (Tloush : non reference)

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]

Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 3 : Maanak Leida (prime de naissance)

**URL** : https://www.btl.gov.il/benefits/Maternity/Pages/MaanakLeyda.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Maternity/Pages/MaanakLeyda.aspx

**Objectif** : Prime unique versee apres chaque accouchement. Moins critique car versement automatique, mais il faut confirmer les montants.

**Ce que tu dois extraire** :

### Montants 2026 par rang d'enfant et multiple births

| Cas | Valeur actuelle Tloush | A verifier sur BL |
|---|---|---|
| 1er enfant | **2 103 NIS** (versement unique) | ______ |
| 2e enfant | **946 NIS** | ______ |
| 3e enfant et + | **631 NIS** | ______ |
| Jumeaux | **10 514 NIS** | ______ |
| Triples | **15 771 NIS** | ______ |
| Quadruples et + | **non reference** | ______ |

### Conditions d'eligibilite a confirmer
1. La mere ou son conjoint doivent etre assures a BL ?
2. Accouchement doit avoir lieu dans un hopital israelien reconnu ?
3. Delai de versement (automatique apres hopital) ?
4. Delai de prescription pour reclamer si non verse ?

### Hebrew terms
- מענק לידה = Maanak Leida
- תאומים = jumeaux
- שלישייה = triples
- תשלום חד-פעמי = paiement unique

### Rapport a faire
```
### URL3_maanak_leida

URL source : https://www.btl.gov.il/benefits/Maternity/Pages/MaanakLeyda.aspx

Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Donnees trouvees (2026) :
- 1er enfant : ______ NIS (Tloush : 2 103)
- 2e enfant : ______ NIS (Tloush : 946)
- 3e enfant+ : ______ NIS (Tloush : 631)
- Jumeaux : ______ NIS (Tloush : 10 514)
- Triples : ______ NIS (Tloush : 15 771)
- Quadruples+ : ______ NIS (Tloush : non reference)
- Conditions nouvelles 2026 : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]

Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 4 : Dmei Leida (conge maternite / paternite)

**URL principale** : https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx

**URL conge de paternite** : https://www.btl.gov.il/benefits/Maternity/AbsencFromWork/FullAllowance/Pages/default.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Maternity%20Insurance/Pages/default.aspx

**Objectif** : Conge maternite et paternite paye par BL. Valeur critique car beaucoup d'utilisatrices en beneficient.

**Ce que tu dois extraire** :

### A. Duree du conge maternite

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Anciennete >= 12 mois | **26 semaines** paye | ______ |
| Anciennete < 12 mois | **15 semaines** paye | ______ |
| Periode pre-accouchement possible | **jusqu'a 7 semaines avant** | ______ |
| Periode minimum obligatoire | **14 semaines** | ______ |

### B. Montant du dmei leida
- **Calcul** : base sur le salaire moyen des 3 derniers mois
- **Plafond** : salaire moyen de l'economie 2026 (~12 550 NIS/mois selon notre estimation)
- **A verifier** : le plafond exact 2026 (depend du salaire moyen economie)

### C. Conge de paternite (shared parental leave)

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Duree max paternite | **jusqu'a 20 semaines** | ______ |
| Duree minimum | **21 jours consecutifs** | ______ |
| Debut du conge pere | **a partir de la 7e semaine post-accouchement** | ______ |
| Semaines obligatoires pour la mere | **6 minimum** | ______ |

### D. Conditions de cotisation pour conge court
- **Tloush** : 10 mois cotises sur 14 derniers OU 15 mois sur 22 derniers
- **A verifier** : conditions exactes 2026

### Hebrew terms
- דמי לידה = Dmei Leida
- חופשת לידה = conge maternite
- חופשת לידה לאב = conge paternite
- ותק = anciennete
- שכר ממוצע = salaire moyen

### Rapport a faire
```
### URL4_dmei_leida

URL source : https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx

Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Donnees trouvees (2026) :

Duree maternite :
- Anciennete ≥ 12 mois : ______ semaines (Tloush : 26)
- Anciennete < 12 mois : ______ semaines (Tloush : 15)
- Pre-accouchement max : ______ semaines (Tloush : 7)

Montant :
- Calcul base sur ______ derniers mois (Tloush : 3)
- Plafond 2026 : ______ NIS/mois

Paternite :
- Duree max : ______ semaines (Tloush : 20)
- Minimum consecutif : ______ jours (Tloush : 21)
- Debut pere : apres ______ semaines (Tloush : 7)

Conditions cotisation conge court : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]

Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 5 : Old Age Pension (Kitsbat Zikna) + Income Supplement retraites

**URL pension** : https://www.btl.gov.il/benefits/Old_age/Pages/default.aspx

**URL montants** : https://www.btl.gov.il/benefits/Old_age/Pages/%D7%A9%D7%99%D7%A2%D7%95%D7%A8%D7%99%20%D7%94%D7%A7%D7%A6%D7%91%D7%94.aspx

**URL supplement** : https://www.btl.gov.il/benefits/Old_age/IncomeSupplement/Pages/default.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Old%20Age%20Insurance/Pages/default.aspx

**Objectif** : Pension vieillesse + complement de revenu pour retraites a bas revenu. Important car beaucoup d'olim arrivent a l'age de la retraite.

**Ce que tu dois extraire** :

### A. Age d'eligibilite 2026

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Hommes | **67 ans** | ______ |
| Femmes (nees < 1960) | **62 ans** | ______ |
| Femmes (nees 1960+) | **62-65 progressif** | ______ |
| Age universel (sans income test) | **70 ans** | ______ |

### B. Montants de la pension 2026

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Individu de base | **~1 879 NIS/mois** | ______ |
| Couple (si 2 pensions) | **~2 824 NIS/mois** | ______ |
| Supplement anciennete | **2%/an au-dela de 10 ans** | ______ |
| Supplement age 80+ | **~50 NIS/mois** | ______ |

⚠️ Les montants ~1 879 et ~2 824 sont **approximatifs** dans notre catalogue. **Confirme les montants exacts 2026.**

### C. Income test 67-70 ans
- **Tloush** : les revenus du travail peuvent reduire ou annuler la pension entre 67 et 70 ans
- **A verifier** : seuils exacts 2026 (a partir de quel revenu mensuel la pension est reduite ?)

### D. Hashlamat Hachnasa pour retraites (supplement de revenu)

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Individu (total avec pension) | **~3 500 NIS/mois** | ______ |
| Couple (total) | **~5 500 NIS/mois** | ______ |

⚠️ Ces montants sont **estimations**. Confirme sur la page officielle.

### Hebrew terms
- קצבת זקנה = Kitsbat Zikna (pension vieillesse)
- גיל פרישה = age de la retraite
- השלמת הכנסה = Hashlamat Hachnasa (supplement de revenu)
- מבחן הכנסה = income test
- תוספת ותק = supplement anciennete

### Rapport a faire
```
### URL5_old_age_pension

URL source : https://www.btl.gov.il/benefits/Old_age/Pages/default.aspx

Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Donnees trouvees (2026) :

Age d'eligibilite :
- Hommes : ______ ans (Tloush : 67)
- Femmes : ______ ans (Tloush : 62-65)
- Age universel : ______ ans (Tloush : 70)

Montants :
- Individu de base : ______ NIS/mois (Tloush : ~1 879)
- Couple : ______ NIS/mois (Tloush : ~2 824)
- Tx supplement anciennete : ______ %/an (Tloush : 2%)
- Bonus age 80+ : ______ NIS/mois (Tloush : ~50)

Income test 67-70 :
- Seuil de reduction : ______ NIS/mois
- Seuil d'annulation totale : ______ NIS/mois

Hashlamat Hachnasa retraites :
- Individu total (avec pension) : ______ NIS/mois (Tloush : ~3 500)
- Couple total : ______ NIS/mois (Tloush : ~5 500)

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]

Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 2A

A la fin de cette partie, tu auras verifie **5 URLs cles** et extrait **~25 valeurs** qui couvrent les benefices famille, maternite et retraite de Bituach Leumi.

### Checklist de sortie

- [ ] URL 1 (rates 2026) : verdict rendu
- [ ] URL 2 (Kitsbat yeladim) : 🔴 verdict rendu + valeurs exactes
- [ ] URL 3 (Maanak leida) : verdict rendu
- [ ] URL 4 (Dmei leida / paternite) : verdict rendu
- [ ] URL 5 (Old age + supplement) : verdict rendu

### Si tu as rencontre des difficultes

Documente dans ton rapport :
- Les URLs qui ont retourne une erreur (403, 404, timeout)
- Les pages hebreu que tu n'as pas pu traduire correctement
- Les valeurs que tu n'as pas trouvees sur la page officielle (marquer `UNCLEAR`)

### Prochaine etape

Une fois la partie 2A terminee et ton rapport envoye, **demande la partie 2B** qui couvre les benefices BL restants :
- Survivors (Kitsbat Sheirim)
- Disability (Nekhout Klalit + Attendance + Mobility)
- Unemployment (Dmei Avtala)
- Income Support (Hashlamat Hachnasa)
- Miluim 2026 🔴

---

*Fin de la partie 2A. ~45 min de travail attendu. Attends la partie 2B pour continuer.*
