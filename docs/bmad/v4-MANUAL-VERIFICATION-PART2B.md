# Tloush V4 — Briefing de verification manuelle

> Partie 2B / 5 : Bituach Leumi — Survivors, Invalidite, Chomage & Miluim
> Date : 2026-04-12
> Duree estimee : ~50 min

---

## Vue d'ensemble de la partie 2B

Cette partie couvre les **5 derniers groupes de benefices Bituach Leumi**, tous a fort impact financier :

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 6 | Survivor Pension (Kitsbat Sheirim) | P1 | 8 min |
| 7 | Disability + Attendance + Mobility | P1 | 15 min |
| 8 | Unemployment (Dmei Avtala) | P1 | 8 min |
| 9 | Income Support (Hashlamat Hachnasa) | P1 | 7 min |
| 10 | Miluim 2026 (Tagmulei Miluim) | 🔴 P0 | 12 min |

**Avant de commencer** : assure-toi d'avoir termine la partie 2A et envoye ton rapport.

---

## URL 6 : Survivor Pension (Kitsbat Sheirim)

**URL principale** : https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx

**URL montants** : https://www.btl.gov.il/benefits/Survivors/Pages/%D7%A9%D7%99%D7%A2%D7%95%D7%A8%D7%99%20%D7%94%D7%A7%D7%A6%D7%91%D7%94.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Survivors%20Insurance/Pages/default.aspx

**Objectif** : Pension versee aux conjoints survivants et aux enfants orphelins suite au deces d'un assure BL. Sensible car concerne des familles en deuil.

**Ce que tu dois extraire** :

### A. Pension du conjoint survivant 2026

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Veuf/veuve sans enfant | **~1 879 NIS/mois** | ______ |
| Veuf/veuve avec enfant(s) | **~2 350 NIS/mois** | ______ |
| Supplement par enfant | **non documente precisement** | ______ |
| Supplement anciennete | **2%/an au-dela de 10 ans cotisation** | ______ |
| Supplement veuve enceinte / conge maternite | **+30%** | ______ |

### B. Pension orphelin 2026

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Par enfant mineur (< 18 ans) | **~1 400 NIS/mois** | ______ |
| Si poursuit etudes secondaires (jusqu'a 20 ans) | **~1 400 NIS/mois** | ______ |
| Cumulable avec pension conjoint | **OUI** | ______ |

### C. Conditions
- Le defunt devait etre resident israelien assure a BL
- Avoir cotise au moins **12 mois sur les 5 dernieres annees** (a confirmer)
- Demande dans les **12 mois suivant le deces** sinon perte de droits retroactifs

### Hebrew terms
- קצבת שאירים = Kitsbat Sheirim (pension survivants)
- אלמן/אלמנה = veuf/veuve
- יתום = orphelin
- בן/בת זוג = conjoint
- ותק ביטוח = anciennete d'assurance

### Rapport a faire
```
### URL6_survivor_pension

URL source : https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Pension conjoint 2026 :
- Sans enfant : ______ NIS/mois (Tloush : ~1 879)
- Avec enfants : ______ NIS/mois (Tloush : ~2 350)
- Supplement par enfant : ______ NIS/mois (Tloush : non documente)
- Tx anciennete : ______ %/an (Tloush : 2%)
- Bonus grossesse : ______ % (Tloush : +30%)

Pension orphelin 2026 :
- Par enfant mineur : ______ NIS/mois (Tloush : ~1 400)
- Limite age : ______ ans (Tloush : 18 ou 20 si etudes)
- Cumulable avec conjoint : [OUI | NON]

Conditions :
- Min cotisation defunt : ______ mois sur ______ annees
- Delai prescription demande : ______ mois

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 7 : Disability — Nekhout Klalit + Attendance + Mobility

**URL principale** : https://www.btl.gov.il/benefits/Disability/Pages/default.aspx

**URL montants nekhout klalit** : https://www.btl.gov.il/benefits/Disability/Pages/%D7%A9%D7%99%D7%A2%D7%95%D7%A8%D7%99%20%D7%94%D7%A7%D7%A6%D7%91%D7%94.aspx

**URL attendance allowance** : https://www.btl.gov.il/benefits/Disability/attendance_allowance/Pages/default.aspx

**URL mobility** : https://www.btl.gov.il/benefits/Mobility/Pages/default.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Disability%20Insurance/Pages/default.aspx

**Objectif** : 3 prestations distinctes pour personnes handicapees. Beaucoup de valeurs a verifier mais critique car les chiffres post-reforme 2021 sont indexes sur le salaire moyen et evoluent chaque annee.

**Ce que tu dois extraire** :

### A. Nekhout Klalit (invalidite generale)

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Pension pleine (100% incapacite) | **~4 480 NIS/mois** | ______ |
| Pension 75% | **proportionnel** | ______ |
| Pension 60% | **proportionnel** | ______ |
| Pension 50% | **proportionnel** | ______ |
| Min eligibilite | **50% incapacite gain** | ______ |
| Age min eligibilite | **18 ans** | ______ |
| Age max (passage retraite) | **67 ans** | ______ |
| Supplement conjoint | **+20%** | ______ |
| Supplement par enfant (jusqu'a 4) | **+10%** | ______ |

⚠️ Le **~4 480 NIS** est une estimation 2024. Confirme la valeur exacte 2026 indexee sur le salaire moyen.

### B. Attendance Allowance (Sheirutei Cheirut)

| Niveau | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Niveau 1 (50%) | **~2 240 NIS/mois** | ______ |
| Niveau 2 (112%) | **~5 017 NIS/mois** | ______ |
| Niveau 3 (188%) | **~8 422 NIS/mois** | ______ |
| Condition de base | **100% invalidite + besoin aide quotidienne** | ______ |
| Evaluation | **par travailleur social BL a domicile** | ______ |

### C. Mobility Allowance (Kitsbat Nayadut)

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Pret achat vehicule (taux 0) | **jusqu'a ~92 000 NIS** | ______ |
| Allocation mensuelle moyenne | **~1 500 a 4 000 NIS/mois** (variable) | ______ |
| Min taux invalidite mobilite | **40%** | ______ |
| Exemption taxe vehicule adapte | **partielle ou totale selon taux** | ______ |
| Carte stationnement | **incluse** | ______ |

### Hebrew terms
- נכות כללית = Nekhout Klalit (invalidite generale)
- שירותים מיוחדים = Sheirutei Meyuhadim (attendance allowance / SHARAM)
- ניידות = Nayadut (mobilite)
- אחוזי נכות = pourcentages d'invalidite
- ועדה רפואית = commission medicale

### Rapport a faire
```
### URL7_disability

URL source : https://www.btl.gov.il/benefits/Disability/Pages/default.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

A. Nekhout Klalit 2026 :
- Pension 100% : ______ NIS/mois (Tloush : ~4 480)
- Pension 75% : ______ NIS/mois
- Pension 60% : ______ NIS/mois
- Pension 50% : ______ NIS/mois
- Min eligibilite : ______ % (Tloush : 50%)
- Bonus conjoint : ______ % (Tloush : +20%)
- Bonus enfant : ______ % (Tloush : +10%)

B. Attendance Allowance (Sheirutei Cheirut) 2026 :
- Niveau 1 (50%) : ______ NIS/mois (Tloush : ~2 240)
- Niveau 2 (112%) : ______ NIS/mois (Tloush : ~5 017)
- Niveau 3 (188%) : ______ NIS/mois (Tloush : ~8 422)

C. Mobility Allowance 2026 :
- Pret max : ______ NIS (Tloush : ~92 000)
- Allocation mensuelle min-max : ______ NIS/mois (Tloush : 1 500 - 4 000)
- Min taux mobilite : ______ % (Tloush : 40%)

Verdict global : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 8 : Unemployment (Dmei Avtala)

**URL principale** : https://www.btl.gov.il/benefits/Unemployment/Pages/default.aspx

**URL taux et montants** : https://www.btl.gov.il/benefits/Unemployment/Amount/Pages/Benefitrates.aspx

**URL conditions** : https://www.btl.gov.il/benefits/Unemployment/Conditionsofeligibility/Pages/default.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Unemployment%20Insurance/Pages/default.aspx

**Objectif** : Allocation chomage. Notre catalogue affiche des valeurs **DEJA confirmees** via recherche web pour 2026, mais on veut une confirmation primaire.

**Ce que tu dois extraire** :

### A. Montants journaliers 2026

| Periode | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Jours 1-125 (= salaire moyen economie) | **550.76 NIS/jour** | ______ |
| Jours 126+ (= 2/3 salaire moyen) | **367.17 NIS/jour** | ______ |

### B. Duree maximale par tranche d'age

| Age | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Moins de 28 ans (sans dependants) | **50 jours** | ______ |
| 28-35 ans | **100 jours** | ______ |
| 35-45 ans | **138 jours** | ______ |
| 45+ ans | **175 jours** | ______ |
| Supplement par enfant a charge | **+ jours** (a verifier exactement) | ______ |

### C. Conditions d'eligibilite

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Age min | **20 ans** | ______ |
| Age max | **67 ans** | ______ |
| Mois de travail requis | **12 mois sur 18 derniers** | ______ |
| Type de fin de contrat | **licenciement OU demission justifiee** | ______ |
| Inscription Lishkat Ta'asuka | **dans 30 jours** | ______ |

### D. Cas special olim chadashim
- **Tloush** : conditions assouplies pendant les 12 premiers mois (pas besoin des 12 mois cotises)
- **A verifier** : la regle existe-t-elle toujours en 2026 ? Quel est le taux verse ?

### Hebrew terms
- דמי אבטלה = Dmei Avtala (allocation chomage)
- מובטל = chomeur
- שכר ממוצע = salaire moyen
- לשכת תעסוקה = Lishkat Ta'asuka (Pole Emploi)
- מפרנס = soutien de famille / dependants

### Rapport a faire
```
### URL8_dmei_avtala

URL source : https://www.btl.gov.il/benefits/Unemployment/Pages/default.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Montants 2026 :
- Jours 1-125 : ______ NIS/jour (Tloush : 550.76)
- Jours 126+ : ______ NIS/jour (Tloush : 367.17)

Duree :
- Moins de 28 ans : ______ jours (Tloush : 50)
- 28-35 ans : ______ jours (Tloush : 100)
- 35-45 ans : ______ jours (Tloush : 138)
- 45+ ans : ______ jours (Tloush : 175)
- Bonus par enfant : ______ jours

Conditions :
- Min mois travail : ______ / ______ derniers mois (Tloush : 12/18)
- Age : ______ - ______ (Tloush : 20-67)
- Inscription Lishkat dans : ______ jours (Tloush : 30)

Olim chadashim :
- Conditions assouplies : [OUI | NON]
- Taux verse pendant 1ere annee : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 9 : Income Support (Hashlamat Hachnasa / Havtahat Hachnasa)

**URL principale** : https://www.btl.gov.il/benefits/Income_support/Pages/default.aspx

**URL montants** : https://www.btl.gov.il/benefits/Income_support/Pages/%D7%A9%D7%99%D7%A2%D7%95%D7%A8%D7%99%20%D7%94%D7%A7%D7%A6%D7%91%D7%94.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Income%20Support%20Benefit/Pages/default.aspx

**Objectif** : Filet de securite de dernier recours. Conditions strictes. Important pour familles en grande precarite.

**Ce que tu dois extraire** :

### A. Montants 2026 par configuration familiale (niveau ordinaire)

| Cas | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Individu | **~2 800 NIS/mois** | ______ |
| Couple sans enfant | **~4 500 NIS/mois** | ______ |
| Couple + 1 enfant | **~5 500 NIS/mois** | ______ |
| Couple + 2 enfants ou + | **~6 200 NIS/mois** | ______ |
| Parent isole + 1 enfant | **~4 200 NIS/mois** | ______ |
| Parent isole + 2 enfants ou + | **non documente** | ______ |

⚠️ Tous ces montants sont **estimatifs** dans notre catalogue. Confirme avec la grille officielle 2026.

### B. Conditions

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Age min | **20 ans** | ______ |
| Avoir epuise Dmei Avtala | **OUI si eligible** | ______ |
| Inscription Lishkat Ta'asuka | **OUI** | ______ |
| Test de ressources patrimoine | **OUI strict** | ______ |
| Plafond epargne | **a documenter** | ______ |
| Plafond patrimoine immobilier | **residence principale uniquement** | ______ |

### C. Distinction "ordinaire" vs "majoree"
- BL distingue plusieurs niveaux d'income support selon l'age, la situation familiale, et l'incapacite de travail
- **A verifier** : les niveaux 2026 et leurs montants exacts

### Hebrew terms
- הבטחת הכנסה = Havtahat Hachnasa
- השלמת הכנסה = Hashlamat Hachnasa (parfois utilise comme synonyme)
- מבחן הכנסות = test de ressources
- מבחן רכוש = test de patrimoine
- יחיד / זוג = individu / couple
- הורה יחיד = parent isole

### Rapport a faire
```
### URL9_hashlamat_hachnasa

URL source : https://www.btl.gov.il/benefits/Income_support/Pages/default.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Montants 2026 :
- Individu : ______ NIS/mois (Tloush : ~2 800)
- Couple : ______ NIS/mois (Tloush : ~4 500)
- Couple + 1 enfant : ______ NIS/mois (Tloush : ~5 500)
- Couple + 2 enfants+ : ______ NIS/mois (Tloush : ~6 200)
- Parent isole + 1 : ______ NIS/mois (Tloush : ~4 200)
- Parent isole + 2+ : ______ NIS/mois (Tloush : non documente)

Conditions strictes :
- Plafond epargne : ______ NIS
- Plafond patrimoine immobilier : ______
- Age min : ______ (Tloush : 20)
- Niveau ordinaire vs majoree : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 🔴 URL 10 : Miluim 2026 (Tagmulei Miluim)

**URL principale** : https://www.btl.gov.il/benefits/Reserve_Service/Pages/default.aspx

**URL taux et montants 2026** : https://www.btl.gov.il/benefits/Reserve_Service/Pages/%D7%A9%D7%99%D7%A2%D7%95%D7%A8%D7%99%20%D7%94%D7%A7%D7%A6%D7%91%D7%94.aspx

**URL supplement bas revenu** : https://www.btl.gov.il/benefits/Reserve_Service/TosefetTAGMOL/Pages/SecomHtagmol.aspx

**Version anglaise** : https://www.btl.gov.il/English%20Homepage/Benefits/Reserve%20Service%20Benefit/Pages/default.aspx

**Objectif** : 🔴 PRIORITE MAXIMALE. Erreurs ici = reservistes sous-payes. Notre catalogue contient des chiffres precis 2026 confirmes via recherche web — il faut une **confirmation primaire**.

**Ce que tu dois extraire** :

### A. Plafond et plancher journaliers 2026

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Plafond journalier | **1 730.33 NIS** | ______ |
| Plancher journalier | **328.76 NIS** | ______ |
| Plafond mensuel (= plafond × 30) | **51 910 NIS** | ______ |
| Plancher mensuel | **9 863 NIS** | ______ |

⚠️ **Si ces chiffres sont differents, c'est CRITIQUE.** Documente immediatement.

### B. Formule de calcul

- **Tloush** : `(salaire brut des 3 mois precedents) / 90 jours = taux journalier`
- **A verifier** : la formule est-elle exactement celle-la ? Quels elements de salaire sont inclus (primes, heures sup) ?

### C. Supplement bas revenu (NOUVEAU 2025-2026)

- **Tloush** : supplement mensuel pour reservistes a bas revenu (~3 000 NIS/mois)
- **A verifier** : seuils, montants exacts, conditions, duree

### D. Tax credit points pour combattants 2026 (NOUVEAU)

- **Tloush** : credit fiscal pour reservistes en role combat, jusqu'a 4 points (= 968 NIS/mois max)
- **A verifier** : la regle existe-t-elle ? Comment se calcule-t-elle ? Quel formulaire ?

### E. Plafond legal "270 jours / 3 ans"

- **Tloush** : RETIRE car non verifiable
- **A verifier** : existe-t-il vraiment un plafond cumule en jours sur 3 ans ? Si oui, lequel ?

### F. Reformes 2026
- **Reduction du nombre maximum de jours par appel** : 60 jours en 2026 (vs 72 prevus initialement). Confirmer.
- **Notification minimum avant appel** : 2-3 mois. Confirmer.
- **Bonus wartime** : les supplements 2024-2025 lies a la guerre sont-ils encore en vigueur en 2026 ?

### Hebrew terms
- תגמולי מילואים = Tagmulei Miluim
- שירות מילואים = Shirut Miluim
- מילואים פעיל = miluim actif
- צו 8 = Tzav 8 (ordre d'urgence)
- לוחם = combattant (lohem)
- תעריף יומי = taux journalier
- תקרה = plafond
- רצפה = plancher

### Rapport a faire
```
### URL10_miluim_2026 — 🔴 CRITIQUE

URL source : https://www.btl.gov.il/benefits/Reserve_Service/Pages/default.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Plafond et plancher 2026 :
- Plafond journalier : ______ NIS (Tloush : 1 730.33)
- Plancher journalier : ______ NIS (Tloush : 328.76)
- Plafond mensuel : ______ NIS (Tloush : 51 910)
- Plancher mensuel : ______ NIS (Tloush : 9 863)

Formule :
- Base de calcul : ______ (Tloush : 3 mois precedents / 90)
- Elements inclus : [salaire base / primes / heures sup / autres]

Supplement bas revenu :
- Existe en 2026 : [OUI | NON]
- Montant : ______ NIS/mois
- Seuil eligibilite : ______ NIS/mois revenu
- Duree : ______

Tax credit points combattants 2026 :
- Existe : [OUI | NON]
- Max points : ______ (Tloush : 4)
- Calcul : ______
- Formulaire : ______

Plafond cumule jours :
- Existe une regle 270j/3ans : [OUI | NON]
- Si non, quelle est la vraie limite : ______

Reformes 2026 :
- Max jours par appel : ______ jours (Tloush : 60)
- Notification min avant appel : ______ mois (Tloush : 2-3)
- Bonus wartime encore actif : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 2B

A la fin de cette partie, tu auras verifie **5 URLs cles** et extrait **~30 valeurs** qui couvrent les benefices BL restants.

### Checklist de sortie

- [ ] URL 6 (Survivors) : verdict rendu
- [ ] URL 7 (Disability + Attendance + Mobility) : verdict rendu (3 sous-elements)
- [ ] URL 8 (Dmei Avtala) : verdict rendu
- [ ] URL 9 (Hashlamat Hachnasa) : verdict rendu
- [ ] URL 10 (Miluim 2026) : 🔴 verdict rendu + valeurs exactes confirmees

### Bilan partie 2 complete (2A + 2B)

- 10 URLs verifiees au total
- ~55 valeurs extraites
- Couverture : ~60% du catalogue (les benefices BL principaux)
- 2 priorites critiques 🔴 : Kitsbat Yeladim (2A) + Miluim 2026 (2B)

### Prochaine etape

Une fois la partie 2B terminee et ton rapport envoye, **demande la partie 3** qui couvre **Rashut HaMisim (Tax Authority) + nouvelle loi olim 2026**. Cette partie est **a fort risque legal** car elle concerne :
- Les brackets d'impot (geles 2025-2027 mais a confirmer)
- Les Nekudot Zikui (points de credit)
- La nouvelle loi 2026 d'exemption totale pour olim
- L'exemption BL pour olim americains

---

*Fin de la partie 2B. ~50 min de travail attendu. Avec la partie 2A, tu as couvert tout Bituach Leumi.*
