# Tloush V4 — Briefing de verification manuelle (DOCUMENT COMPLET)

> **Version consolidee : 1.0**
> **Date** : 2026-04-13
> **A destination** : agent AI ou humain mandate pour verifier les baremes israeliens
> **Duree estimee totale** : ~6h45 de travail attentif
> **Nombre d URLs a verifier** : 41

---

## Table des matieres

- [Partie 1 — Contexte + Instructions + Template](#partie-1)
- [Partie 2A — BL : Famille / Maternite / Retraite (URLs 1-5)](#partie-2a)
- [Partie 2B — BL : Survivants / Invalidite / Chomage / Miluim (URLs 6-10)](#partie-2b)
- [Partie 3A — Rashut HaMisim : Brackets + Nekudot + Section 66 (URLs 11-13)](#partie-3a)
- [Partie 3B — Fiscalite olim : Schedule 2022+ + Loi 2026 (URLs 14-15)](#partie-3b)
- [Partie 3C — Cas speciaux olim : BL US + Combat reservistes (URLs 16-17)](#partie-3c)
- [Partie 4A — Misrad HaKlita (URLs 18-21)](#partie-4a)
- [Partie 4B — Misrad HaShikun (URLs 22-24)](#partie-4b)
- [Partie 5A — Arnona : TLV / Jerusalem / Haifa (URLs 25-27)](#partie-5a)
- [Partie 5B — Arnona : 5 villes moyennes (URLs 28-32)](#partie-5b)
- [Partie 5C — Survivants Shoah (URLs 33-35)](#partie-5c)
- [Partie 5D — Etudiants : PERACH + Student Authority + Bourses (URLs 36-38)](#partie-5d)
- [Partie 5E — Combat reservistes + Familles endeuillees (URLs 39-41)](#partie-5e)

---

<a id="partie-1"></a>


> Version : 1.0
> Date : 2026-04-12
> A destination : agent AI ou humain mandate pour verifier les baremes israeliens
> Document en 5 parties — CECI EST LA PARTIE 1/5

---

## Partie 1 : Contexte + Instructions + Template de rapport

### 🎯 Le but de cette mission

Tloush est un SaaS qui aide les francophones olim en Israel a comprendre leurs documents administratifs en hebreu et a detecter les aides/droits auxquels ils ont droit. Au coeur du produit, nous avons un **catalogue de 44 benefices** qui mappent le profil utilisateur (age, alyah, famille, emploi, sante, etc.) vers les droits correspondants (Bituach Leumi, Rashut HaMisim, Misrad HaKlita, mairies, etc.).

**Le probleme** : nous avons cree ce catalogue en nous appuyant sur des recherches web (Google, sites tiers comme kolzchut.org.il, nbn.org.il, cwsisrael.com) parce que les pages officielles israeliennes (btl.gov.il, gov.il) retournent **HTTP 403** aux requetes automatisees — elles sont protegees par DataDome, un systeme anti-bot.

Resultat : certaines valeurs dans le catalogue sont **approximatives** ou **non verifiees contre la source primaire**. Pour un produit qui guide des clients vers des demandes d'argent reelles (remboursement d'impots, allocations, reductions), c'est un risque juridique majeur.

**Ta mission** : ouvrir chaque URL officielle listee dans ce briefing, verifier les valeurs actuelles, et nous remonter les ecarts avec nos donnees. Tu vas operer les 5 parties de ce briefing les unes apres les autres.

---

### 📋 Comment proceder (etape par etape)

**Tu vas recevoir 5 parties** en tout :

| Partie | Contenu | Estimation |
|---|---|---|
| **1** (ce doc) | Contexte + instructions + template de rapport | 10 min |
| **2** | Bituach Leumi (10 URLs a verifier) | 90 min |
| **3** | Rashut HaMisim + nouvelle loi olim 2026 (5 URLs) | 45 min |
| **4** | Misrad HaKlita + Misrad HaShikun (7 URLs) | 60 min |
| **5** | Mairies + Shoah + etudiants + reservistes (10 URLs) | 75 min |

**Total estime : ~4h30 de travail attentif.**

Pour chaque URL :

1. **Ouvre la page** dans un navigateur (Chrome, Firefox, peu importe). Tu peux aussi utiliser un traducteur hebreu → francais si tu n'es pas a l'aise.
2. **Localise l'information** que le briefing te demande (chaque section te guidera precisement)
3. **Compare** avec la valeur actuelle du catalogue Tloush
4. **Remplit le template** (voir plus bas) avec ton verdict : MATCH / DIFF / UNCLEAR / NOT_FOUND
5. **Ne suppose rien** : si tu ne trouves pas l'info, dis-le clairement

---

### 🚨 Priorites

Si tu n'as pas le temps de tout faire, concentre-toi sur ces points **critiques** (marques 🔴 dans les parties 2-5) :

1. **Kitsbat yeladim 2026** (BL) — erreurs ici = perte d'argent directe pour les familles
2. **Miluim plafond/plancher 2026** (BL) — erreurs ici = reservistes sous-payes
3. **Points credit oleh schedule 2022+** (Rashut HaMisim) — erreurs ici = olim sous-reclament l'impot
4. **Nouvelle loi 2026 "0% impot olim"** (gov.il) — verifier date d'effet exacte et plafond 1M NIS
5. **Havraa freeze law continuation 2026** (Nevo) — verifier si la reduction -1 jour continue

Les autres points sont importants mais moins sensibles financierement.

---

### 📝 Template de rapport (a utiliser pour chaque valeur verifiee)

Copie ce template pour chaque valeur que tu verifies :

```
### [NOM_DU_BENEFICE] - [SLUG]

URL source : [URL officielle]
Valeur actuelle Tloush : [ce qu'on a dans le catalogue]
Valeur trouvee sur le site : [ce que tu as lu sur la page officielle]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]

Commentaire : [optionnel, max 2 lignes]
Date de verification : [date du jour]
```

**Signification des verdicts** :

- **MATCH** : La valeur sur le site officiel correspond exactement a notre catalogue. Rien a changer.
- **DIFF** : La valeur officielle est differente. Indique la bonne valeur dans "Valeur trouvee" — on la corrigera.
- **UNCLEAR** : La page est accessible mais tu n'arrives pas a trouver la valeur precise (page mal structuree, info enfouie, etc.). Explique pourquoi.
- **NOT_FOUND** : La page renvoie une 404, une erreur, ou est vide. On changera l'URL.

---

### 📤 Format de rendu attendu

A la fin de chaque partie, tu renvoies un **rapport markdown** structure comme ca :

```markdown
# Rapport de verification — Partie [X] : [titre]

Date : [JJ/MM/AAAA]
Duree effective : [Xh Ymin]
URLs accessibles : [X] / [total]
URLs bloquees : [liste]

## Resume executif

- Valeurs MATCH : [X]
- Valeurs DIFF : [X] → [liste des slugs]
- Valeurs UNCLEAR : [X]
- Valeurs NOT_FOUND : [X]

## Detail par URL

### URL 1 : [nom + URL]
[template rempli]

### URL 2 : [nom + URL]
[template rempli]

...

## Recommandations urgentes

[Liste ordonnee des corrections a appliquer en priorite]
```

Le developpeur de Tloush (ou son agent Claude Code) utilisera ce rapport pour mettre a jour `src/lib/benefitsCatalog.ts` directement. Ton rapport doit etre suffisamment clair pour qu'il n'ait **aucune recherche supplementaire a faire**.

---

### 🔧 Outils recommandes

- **Navigateur** : Chrome ou Firefox avec extension Google Translate (hebreu → francais)
- **Alternative si un site est lent** : https://archive.org/web/ (Wayback Machine)
- **Pour les PDF officiels** : telecharger et chercher le texte avec Ctrl+F
- **Pour les sites officiels bloques** : passer par un VPN israelien (ExpressVPN, NordVPN avec serveur TLV/Jerusalem) si tu es a l'etranger — certaines pages BL sont geo-restreintes
- **Dictionnaire hebreu** : https://www.morfix.co.il/ (pour les termes techniques)

---

### ⚠️ Ce qu'il ne faut PAS faire

- **Ne pas inventer** de valeurs meme si elles "semblent logiques". Si tu ne trouves pas, marque UNCLEAR.
- **Ne pas utiliser de sources tierces** (kolzchut, nbn, cwsisrael) sauf si explicitement autorise dans le briefing pour cette ligne. On veut la source primaire officielle uniquement.
- **Ne pas arrondir** les chiffres. Si le site dit `1730.33`, ecris `1730.33`, pas `1730`.
- **Ne pas traduire** les noms hebreux des benefices (Kitsbat Yeladim reste Kitsbat Yeladim, pas "allocations familiales"). Garde le nom en francais + translitteration exactement comme dans le catalogue.
- **Ne pas editer directement le code** de Tloush. Ton rapport sera lu et applique par le developpeur.

---

### 📞 En cas de question ou de blocage

Si tu hesites sur une interpretation (ex : "est-ce que `173 NIS` inclut le compte d'epargne `Chisachon LeKol Yeled` ou pas ?"), **note ta question dans le rapport** sous une section "Questions en suspens". Tu n'as pas besoin de deviner — on te repondra apres.

Si une URL est completement bloquee (meme via VPN), marque-la **NOT_FOUND** avec le code d'erreur et continue avec les autres.

---

### 🗂️ Vue d'ensemble des parties 2 a 5

Voici ce qui sera dans les prochaines parties, pour que tu puisses estimer l'effort :

**Partie 2 — Bituach Leumi (BL)** — La source principale du catalogue
- 10 URLs officielles BL
- Benefices : Kitsbat yeladim, Maanak leida, Old age, Survivors, Disability, Unemployment, Income support, Maternity, Miluim, + page annuelle 2026
- Valeur en jeu : ~60% du catalogue

**Partie 3 — Rashut HaMisim + loi 2026 olim** — Fiscal et exemption
- 5 URLs (Tax Authority + gov.il + pages specifiques olim)
- Benefices : tax brackets, Nekudot Zikui, nouvelle loi 2026 olim, Section 66 enfants
- Valeur en jeu : ~25% du catalogue (mais risque legal eleve)

**Partie 4 — Misrad HaKlita + Misrad HaShikun** — Olim et logement
- 7 URLs
- Benefices : Sal klita, Ulpan, aide au loyer, mashkanta olim, purchase tax, public housing
- Valeur en jeu : ~10% du catalogue

**Partie 5 — Mairies + Shoah + etudiants + reservistes combat**
- 10 URLs (mairies par ville + Claims Conference + PERACH + Misrad HaBitachon)
- Benefices : Arnona reductions, Shoah, bourses etudiants, bonuses reservistes
- Valeur en jeu : ~5% du catalogue mais chacun important individuellement

---

### ✅ Validation avant de commencer

Avant de lancer la partie 2, assure-toi que tu as :

- [ ] Lu cette partie 1 en entier
- [ ] Compris le template de rapport
- [ ] Identifie les priorites critiques 🔴
- [ ] Configure ton navigateur avec un traducteur hebreu
- [ ] Prevu ~90 min pour la partie 2 (la plus longue)
- [ ] Si tu es hors Israel : active un VPN israelien pour contourner les eventuelles geo-restrictions

**Quand tu es pret, demande la partie 2 du briefing.**

---

## Annexe — Notre catalogue interne (reference)

Le fichier source que tu verifies indirectement est `src/lib/benefitsCatalog.ts` dans le repo Tloush. Il contient 44 benefices structures comme ceci :

```typescript
{
  slug: 'kitsbat_yeladim',           // Identifiant stable
  category: 'family',                // Une de 11 categories
  authority: 'bituach_leumi',        // Une de 8 autorites
  title_fr: 'Allocation enfants',    // Titre affiche
  description_fr: '...',             // Description courte
  conditions: { ... },               // Conditions d'eligibilite
  estimated_annual_value: 2076,      // Valeur annuelle NIS
  typical_monthly_amount: 173,       // Valeur mensuelle NIS
  application_url: 'https://...',    // URL officielle ← ce que tu verifies
  confidence: 'high',                // Niveau de confiance actuel
  status: 'verified',                // Etat de verification
  verified_at: '2026-04-12',         // Date de derniere verif
  tax_year: 2026,
}
```

Ton travail consiste essentiellement a **confirmer ou corriger** les champs `estimated_annual_value`, `typical_monthly_amount`, `application_url`, et a mettre a jour `confidence` / `status` / `verified_at`.

---

*Fin de la partie 1. Attends la partie 2 pour continuer.*


---

<a id="partie-2a"></a>


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


---

<a id="partie-2b"></a>


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


---

<a id="partie-3a"></a>


> Partie 3A / 5 : Rashut HaMisim — Brackets + Nekudot Zikui generaux
> Date : 2026-04-12
> Duree estimee : ~25 min

---

## Vue d'ensemble de la partie 3A

Cette partie couvre les **fondements fiscaux israeliens 2026** : les brackets d'impot et les points de credit (Nekudot Zikui) qui s'appliquent a TOUS les residents (pas specifiquement aux olim).

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 11 | Tax brackets 2025-2027 (frozen) | 🔴 P0 | 10 min |
| 12 | Nekudot Zikui — points de credit generaux | P1 | 10 min |
| 13 | Section 66 — points enfants par parent | P1 | 5 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 2A + 2B et envoye tes rapports.

**Note importante** : Rashut HaMisim publie ses informations principalement en hebreu, avec une version anglaise plus limitee. La page d'accueil https://www.gov.il/he/departments/israel_tax_authority est ton point de depart.

---

## 🔴 URL 11 : Tax brackets 2025-2027 (frozen)

**URL principale** : https://www.gov.il/he/departments/israel_tax_authority

**URL booklet deductions** : https://www.gov.il/he/pages/income-tax-monthly-deductions-booklet

**Version anglaise (resume)** : https://www.gov.il/en/departments/israel_tax_authority

**Source PwC tres fiable** : https://taxsummaries.pwc.com/israel/individual/taxes-on-personal-income

**Objectif** : 🔴 **CRITIQUE** car les brackets affectent TOUS les utilisateurs Tloush. La loi des finances 2025 a gele les brackets pour 2025-2026-2027 — il faut confirmer qu'ils n'ont pas ete modifies en 2026.

**Ce que tu dois extraire** :

### A. Brackets annuels 2026 (devraient etre identiques a 2025)

| Tranche annuelle (NIS) | Taux | Valeur actuelle Tloush | A verifier |
|---|---|---|---|
| 0 — 84 120 | 10% | ✅ | ______ |
| 84 120 — 120 720 | 14% | ✅ | ______ |
| 120 720 — 193 800 | 20% | ✅ | ______ |
| 193 800 — 269 280 | 31% | ✅ | ______ |
| 269 280 — 560 280 | 35% | ✅ | ______ |
| 560 280 — 721 560 | 47% | ✅ | ______ |
| 721 560 et + | 50% | ✅ | ______ |

### B. Surtax (mas yoter)

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Seuil declenchement annuel | **721 560 NIS** | ______ |
| Taux additionnel | **+3%** | ______ |
| Taux marginal effectif au-dessus | **53%** | ______ |

### C. Confirmation du gel 2025-2027

- **Tloush** : Les brackets sont **GELES** par la loi des finances 2025 → identiques en 2025, 2026 et 2027.
- **A verifier** : 
  1. Le gel est-il toujours en vigueur en 2026 ?
  2. Y a-t-il eu une modification surprise au cours du 1er trimestre 2026 ?
  3. Quand le degel est-il prevu ? (probablement janvier 2028)

### D. Distinction "yegia ishit" vs autres revenus

⚠️ Les brackets ci-dessus s'appliquent au revenu **du travail / yegia ishit** (effort personnel). Pour les **revenus passifs** (location, dividendes, capital), des regles differentes s'appliquent.

- **A verifier** : Tloush utilise les brackets "yegia ishit" par defaut. Confirme qu'il n'y a pas eu de changement de regime pour les revenus passifs en 2026.

### Hebrew terms
- מס הכנסה = Mas Hachnasa (impot sur le revenu)
- מדרגות מס = Madregot Mas (brackets / tranches)
- יגיעה אישית = yegia ishit (revenu du travail)
- מס יסף / מס יוסף = mas yoter (surtax 3%)
- הקפאה = hakpa'a (gel)

### Rapport a faire
```
### URL11_tax_brackets_2026 — 🔴 CRITIQUE

URL source : https://www.gov.il/he/departments/israel_tax_authority
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Brackets 2026 confirmes :
- 0 - 84 120 : ______ % (Tloush : 10%)
- 84 120 - 120 720 : ______ % (Tloush : 14%)
- 120 720 - 193 800 : ______ % (Tloush : 20%)
- 193 800 - 269 280 : ______ % (Tloush : 31%)
- 269 280 - 560 280 : ______ % (Tloush : 35%)
- 560 280 - 721 560 : ______ % (Tloush : 47%)
- 721 560 + : ______ % (Tloush : 50%)

Surtax (mas yoter) :
- Seuil : ______ NIS/an (Tloush : 721 560)
- Taux additionnel : ______ % (Tloush : +3%)

Gel :
- Brackets identiques 2025/2026/2027 : [OUI | NON]
- Modification au 1er trimestre 2026 : [OUI | NON, details si oui]
- Date prevue de degel : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 12 : Nekudot Zikui — points de credit generaux

**URL principale** : https://www.gov.il/he/service/tax-credit

**URL simulateur officiel** : https://www.gov.il/en/service/tax-credit (simulateur de points selon situation matrimoniale)

**Source secondaire (kolzchut)** : https://www.kolzchut.org.il/he/%D7%A0%D7%A7%D7%95%D7%93%D7%95%D7%AA_%D7%96%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94

**Objectif** : Confirmer la valeur d'un point de credit en 2026 et les categories de base. C'est la fondation du calcul fiscal Tloush.

**Ce que tu dois extraire** :

### A. Valeur du point de credit 2026

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Valeur mensuelle d'un point | **242 NIS** | ______ |
| Valeur annuelle d'un point | **2 904 NIS** (= 242 × 12) | ______ |
| Statut 2026 | **gele probablement (loi finances 2025)** | ______ |

### B. Categories de base

| Categorie | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Resident israelien (homme) | **2.25 points** | ______ |
| Bonus femme | **+0.5 point** (= 2.75 total) | ______ |
| Diplome academique BA | **+1 point pendant 1 an** | ______ |
| Diplome academique MA | **+1 point pendant 2 ans** | ______ |
| Diplome academique PhD | **+1 point pendant 3 ans** | ______ |
| Bonus parent isole (avec enfant) | **+1 point** | ______ |

### C. Categories speciales a verifier

| Categorie | Tloush | A verifier |
|---|---|---|
| Veuf/veuve avec enfants | **non differencie de divorce** | ______ |
| Pere isole vs mere isolee | **traite identiquement** | ______ |
| Enfant handicape | **+2 points par parent par enfant** | ______ |
| Soldat libere (haval meshuhrar) | **non reference** | ______ |
| Etudiant universitaire | **non reference** | ______ |

### D. Plafonds et limites
- **A verifier** : un employe peut-il cumuler un nombre illimite de points, ou y a-t-il un plafond ?
- **A verifier** : si les points depassent l'impot du, est-ce remboursable ou perdu ?

### Hebrew terms
- נקודות זיכוי = Nekudot Zikui (points de credit)
- נקודת זיכוי = Nekudat Zikui (un point de credit)
- תושב = toshav (resident)
- תואר אקדמי = toar academi (diplome academique)
- הורה יחיד = hore yahid (parent isole)

### Rapport a faire
```
### URL12_nekudot_zikui_general

URL source : https://www.gov.il/he/service/tax-credit
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Valeur du point 2026 :
- Mensuelle : ______ NIS (Tloush : 242)
- Annuelle : ______ NIS (Tloush : 2 904)
- Gele en 2026 : [OUI | NON]

Categories de base :
- Resident homme : ______ pts (Tloush : 2.25)
- Bonus femme : ______ pts (Tloush : +0.5)
- Diplome BA : +______ pt × ______ ans (Tloush : +1 × 1 an)
- Diplome MA : +______ pt × ______ ans (Tloush : +1 × 2 ans)
- Diplome PhD : +______ pt × ______ ans (Tloush : +1 × 3 ans)
- Parent isole + enfant : ______ pt (Tloush : +1)

Categories speciales :
- Veuf vs divorce : [identique | different] (Tloush : identique)
- Mere vs pere isolee : [identique | different]
- Enfant handicape par parent : ______ pts (Tloush : +2)
- Soldat libere : ______ pts
- Etudiant universitaire : ______ pts

Plafond cumul : ______
Remboursement si excedent : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 13 : Section 66 — points enfants par parent

**URL principale Rashut HaMisim** : https://www.gov.il/en/pages/tax-benefits-for-parents-with-small-children

**URL hebreu (kolzchut)** : https://www.kolzchut.org.il/he/%D7%A0%D7%A7%D7%95%D7%93%D7%95%D7%AA_%D7%96%D7%99%D7%9B%D7%95%D7%99_%D7%91%D7%92%D7%99%D7%9F_%D7%99%D7%9C%D7%93%D7%99%D7%9D

**Source pro francophone** : https://cpa-dray.com/he/blog/%D7%A0%D7%A7%D7%95%D7%93%D7%95%D7%AA-%D7%96%D7%99%D7%9B%D7%95%D7%99-%D7%9C%D7%94%D7%95%D7%A8%D7%99%D7%9D/

**Objectif** : C'est la table la plus complexe et la plus mal documentee de notre catalogue. Tloush utilise une simplification (mere qui travaille uniquement). Il faut la **table officielle complete** par age et par parent.

**Ce que tu dois extraire** :

### A. Table 2026 par age d'enfant (mere qui travaille)

| Age de l'enfant | Valeur actuelle Tloush (mere) | A verifier (mere) |
|---|---|---|
| Annee de naissance (0 an) | **+1.5 pt** | ______ |
| 1-5 ans | **+2.5 pts** | ______ |
| 6-12 ans | **+2 pts** (base + bonus 2022-2025) | ______ |
| 13-17 ans | **non documente precisement** | ______ |
| 18+ ans | **0** | ______ |

### B. Table 2026 par age d'enfant (pere qui travaille)

| Age de l'enfant | Valeur actuelle Tloush (pere) | A verifier (pere) |
|---|---|---|
| Annee de naissance (0 an) | **non differencie** | ______ |
| 1-5 ans | **non differencie** | ______ |
| 6-12 ans | **non differencie** | ______ |
| 13-17 ans | **non differencie** | ______ |

⚠️ Tloush traite **mere et pere identiquement** par defaut. C'est une **simplification incorrecte**. Il faut la vraie table separee.

### C. Bonus reforme 2022-2025

- **Tloush** : il existe un bonus temporaire +1 point par enfant pour les ages 6-17 ans, valide 2022-2025.
- **A verifier critique** : ce bonus est-il **prolonge en 2026** ou est-il termine ? Quels enfants y sont eligibles ?

### D. Cas particuliers
- **Famille monoparentale** : la table change-t-elle ?
- **Garde alternee** : qui recoit les points ?
- **Enfant ne en cours d'annee** : prorata ?

### Hebrew terms
- סעיף 66 = Section 66 (du code des impots)
- אם עובדת = mere qui travaille (em ovedet)
- אב עובד = pere qui travaille (av oved)
- ילד = yeled (enfant)
- שנת לידה = shnat leda (annee de naissance)

### Rapport a faire
```
### URL13_section_66_children

URL source : https://www.gov.il/en/pages/tax-benefits-for-parents-with-small-children
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Table mere qui travaille 2026 :
- Annee naissance : ______ pts (Tloush : +1.5)
- 1-5 ans : ______ pts (Tloush : +2.5)
- 6-12 ans : ______ pts (Tloush : +2)
- 13-17 ans : ______ pts
- 18+ : ______ pts (Tloush : 0)

Table pere qui travaille 2026 :
- Annee naissance : ______ pts
- 1-5 ans : ______ pts
- 6-12 ans : ______ pts
- 13-17 ans : ______ pts

Bonus reforme 2022-2025 :
- Prolonge en 2026 : [OUI | NON]
- Si oui, jusqu'a quand : ______
- Ages eligibles : ______

Cas particuliers :
- Monoparental change la table : [OUI | NON]
- Garde alternee : ______
- Enfant ne en cours d'annee : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 3A

A la fin de cette partie, tu auras verifie **3 URLs cles** et extrait **~20 valeurs** qui couvrent les fondements fiscaux israeliens.

### Checklist de sortie

- [ ] URL 11 (Tax brackets 2026) : 🔴 verdict rendu + confirmation du gel
- [ ] URL 12 (Nekudot Zikui generaux) : verdict rendu + categories de base
- [ ] URL 13 (Section 66 enfants) : verdict rendu + table par parent

### Importance de ces 3 URLs

Ces 3 URLs sont la **base mathematique** de tous les calculs Tloush :
- Le calculateur brut → net (`israeliPayroll.ts`)
- L'estimateur de remboursement d'impots (`taxRefund.ts`)
- Le rights detector (eligibilite credit points)
- Le tofes 106 analyzer

Une erreur ici se propage partout. **Sois particulierement rigoureux**.

### Prochaine etape

Une fois la partie 3A terminee et ton rapport envoye, **demande la partie 3B** qui couvre les benefices fiscaux **specifiques aux olim** :
- Schedule oleh hadash 2022+ (54 mois sur 4.5 ans)
- 🔴 Nouvelle loi 2026 d'exemption totale (0% impot 2026-2027)
- Exemption BL 5 ans pour olim americains
- Tax credit points combat reservistes (2026 nouveau)

---

*Fin de la partie 3A. ~25 min de travail attendu. Attends la partie 3B pour continuer.*


---

<a id="partie-3b"></a>


> Partie 3B / 5 : Rashut HaMisim — Olim core (schedule 2022+ & loi 2026)
> Date : 2026-04-12
> Duree estimee : ~25 min

---

## Vue d'ensemble de la partie 3B

Cette partie couvre les **2 benefices fiscaux olim les plus importants** : le schedule post-2022 des points de credit olim, et la nouvelle loi 2026 d'exemption totale.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 14 | Oleh hadash schedule 2022+ (54 mois) | 🔴 P0 | 10 min |
| 15 | Nouvelle loi 2026 — exemption totale olim | 🔴 P0 | 15 min |

**Avant de commencer** : assure-toi d'avoir termine la partie 3A (brackets + Nekudot Zikui generaux).

**Contexte** : Tloush s'adresse principalement aux olim francophones. Ces 2 benefices sont **le coeur de la valeur** qu'on apporte a nos utilisateurs. Une erreur ici = olim qui sous-reclament leur impot **ou** qui font une declaration fausse a Rashut HaMisim.

---

## 🔴 URL 14 : Oleh hadash schedule 2022+ (points de credit sur 54 mois)

**URL principale (kolzchut anglais)** : https://www.kolzchut.org.il/en/Income_Tax_Credit_Points_for_New_Immigrants

**URL kolzchut hebreu** : https://www.kolzchut.org.il/he/%D7%A0%D7%A7%D7%95%D7%93%D7%95%D7%AA_%D7%96%D7%99%D7%9B%D7%95%D7%99_%D7%9C%D7%A2%D7%95%D7%9C%D7%94_%D7%97%D7%93%D7%A9

**URL Rashut HaMisim (guide olim)** : https://www.gov.il/en/pages/immigrant-guide-1

**URL Nefesh B'Nefesh (tres fiable)** : https://www.nbn.org.il/aliyah-rights-and-benefits/

**Objectif** : 🔴 **CRITIQUE**. En 2022, la loi a ete reformee pour etendre la duree des benefices olim de 3 ans a 4.5 ans (54 mois). Tloush utilise le NOUVEAU schedule. Il faut confirmer qu'il est correct et qu'il s'applique bien a 2026.

**Ce que tu dois extraire** :

### A. Schedule officiel post-2022 (applicable aux olim arrivant en 2022+)

Notre version actuelle Tloush :

| Mois depuis alyah | Points par mois | Points cumules sur la periode | Valeur actuelle Tloush |
|---|---|---|---|
| Mois 1 a 12 (annee 0) | 1 pt/mois | 12 pts cumules | **= 1 pt annuel moyen** |
| Mois 13 a 30 (annees 1 et debut 2) | 3 pts/mois | 54 pts cumules | **= 3 pts annuels moyen pour annee 1** |
| Mois 31 a 42 (fin annee 2 et debut 3) | 2 pts/mois | 24 pts cumules | **= 2.5 pts annuel moyen** |
| Mois 43 a 54 (fin annee 3 et debut 4) | 1 pt/mois | 12 pts cumules | **= 1.5 / 0.5 pts annuels sur 2 annees partagees** |

⚠️ **Attention** : Tloush utilise une approximation "annualisee" du schedule mensuel. Il faut confirmer que cette approximation est correcte.

**Voici la simplification utilisee dans `taxRefund.ts` (a verifier)** :
- Annee 0 (annee d'alyah) : **1 pt annuel moyen**
- Annee 1 : **3 pts annuels**
- Annee 2 : **2.5 pts annuels**
- Annee 3 : **1.5 pts annuels**
- Annee 4 (premiers 6 mois seulement) : **0.5 pt annuel**
- Total sur 4.5 ans : **8.5 points cumules**

### B. Questions critiques a verifier

1. **Le schedule 2022+ est-il toujours en vigueur en 2026 ?** Aucune modification depuis sa mise en place ?
2. **Qui est eligible ?** Les olim arrives a partir de quelle date exacte (1er janvier 2022 ? autre ?) ?
3. **Les olim arrives avant 2022** ont-ils l'ancien schedule (3/2/1 sur 3 ans) ? Confirme que Tloush ne doit PAS appliquer le nouveau schedule retroactivement.
4. **Interaction avec le bonus femme (+0.5)** : un oleh femme cumule-t-elle les 2 bonus ou non ?
5. **Definition de "nouvel oleh"** : quels statuts migratoires beneficient (oleh chadash, toshav chozer, etc.) ?

### C. Valeur economique

- Valeur d'un point en 2026 : **2 904 NIS/an** (selon partie 3A)
- Valeur totale des bonus oleh sur 4.5 ans : **8.5 × 2 904 = 24 684 NIS**
- **A verifier** : ce calcul total est-il correct ?

### Hebrew terms
- עולה חדש = Oleh Hadash (nouvel olim)
- נקודות זיכוי לעולה = nekudot zikui le'oleh
- חודשי אזרחות = mois de citoyennete
- תושב חוזר = Toshav Chozer (resident qui revient)
- לוח זמנים = luach zmanim (planning)

### Rapport a faire
```
### URL14_oleh_schedule_2022 — 🔴 CRITIQUE

URL source : https://www.kolzchut.org.il/en/Income_Tax_Credit_Points_for_New_Immigrants
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Schedule officiel 2022+ :
- Mois 1-12 : ______ pts/mois (Tloush : 1)
- Mois 13-30 : ______ pts/mois (Tloush : 3)
- Mois 31-42 : ______ pts/mois (Tloush : 2)
- Mois 43-54 : ______ pts/mois (Tloush : 1)

Total cumule sur 54 mois : ______ points (Tloush : 102 points cumules)
Duree totale : ______ mois (Tloush : 54)

Questions critiques :
- Schedule 2022+ toujours en vigueur 2026 : [OUI | NON]
- Modification depuis 2022 : [OUI | NON, details si oui]
- Date de debut d'eligibilite exacte : ______
- Olim pre-2022 sur ancien schedule 3/2/1 : [OUI | NON]
- Cumul avec bonus femme autorise : [OUI | NON]
- Eligibilite toshav chozer : [OUI | NON]

Approximation annualisee Tloush :
- Annee 0 = 1 pt annuel : [CORRECT | INCORRECT]
- Annee 1 = 3 pts annuels : [CORRECT | INCORRECT]
- Annee 2 = 2.5 pts annuels : [CORRECT | INCORRECT]
- Annee 3 = 1.5 pts annuels : [CORRECT | INCORRECT]
- Annee 4 = 0.5 pt annuel : [CORRECT | INCORRECT]
- Si incorrect, proposer la bonne repartition annualisee

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 🔴 URL 15 : Nouvelle loi 2026 — Exemption totale impot olim

**URL officielle** : https://www.gov.il/en/pages/tax-reforms-for-new-olim

**URL hebreu** : https://www.gov.il/he/pages/tax-reforms-for-new-olim

**Article Times of Israel (confirmation)** : https://www.timesofisrael.com/israel-unveils-0-tax-rate-for-2026s-immigrants-and-returning-residents/

**Article Gornitzky (cabinet d'avocats)** : https://www.gornitzky.com/new-tax-incentive-e/

**Objectif** : 🔴 **PRIORITE MAXIMALE - NOUVELLE LOI**. Adoptee fin 2025 et entree en vigueur au 1er janvier 2026. Offre aux olim 2026 une exemption totale d'impot sur 5 ans. C'est la loi fiscale la plus genereuse jamais accordee aux olim. **Les utilisateurs de Tloush vont nous poser des questions la-dessus** — il faut etre exact.

**Ce que tu dois extraire** :

### A. Taux progressifs 2026-2030

| Annee fiscale | Taux | Valeur actuelle Tloush | A verifier |
|---|---|---|---|
| 2026 (annee d'alyah) | **0%** | ✅ | ______ |
| 2027 | **0%** | ✅ | ______ |
| 2028 | **10%** | ✅ | ______ |
| 2029 | **20%** | ✅ | ______ |
| 2030 | **30%** | ✅ | ______ |
| 2031+ | **taux normal brackets** | ✅ | ______ |

### B. Plafonds et limites

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Plafond annuel couvert | **1 000 000 NIS/an** | ______ |
| Au-dela du plafond | **taxe normalement** | ______ |
| Plafond cumule sur 5 ans | **non documente** | ______ |

### C. Qui est eligible (tres important) ?

| Categorie | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Olim chadashim arrivant en 2026 | **ELIGIBLE** | ______ |
| Olim chadashim arrivant 2025 ou avant | **NON ELIGIBLE** | ______ |
| Toshav chozer (resident qui revient) | **ELIGIBLE selon conditions** | ______ |
| Definition "toshav chozer" (duree absence) | **non precise** | ______ |
| Olim US payant US Social Security | **eligible + cumul possible avec BL exemption** | ______ |

### D. Conditions et obligations

- **Date exacte d'entree en vigueur** : 1er janvier 2026 — a confirmer (loi peut-etre retroactive ou future)
- **Quel formulaire deposer ?** : tofes 101 standard ou un tofes special ?
- **Declaration annuelle obligatoire ?** : les olim 2026 doivent-ils quand meme deposer une declaration fiscale chaque annee ?
- **Interaction avec Sal Klita** : cumul possible avec les 6 mois de Sal Klita ?
- **Interaction avec exemption BL 5 ans US** : cumul possible ?

### E. ⚠️ Piege important a verifier

Il existe une **modification majeure** des regles de reporting pour 2026 :

> Le droit de ne pas declarer les revenus et actifs etrangers pendant 10 ans (qui existait pour les olim) a ete **SUPPRIME** pour les personnes qui deviennent residents israeliens a partir du 1er janvier 2026. Ils doivent declarer TOUS leurs revenus et actifs etrangers des le jour 1.

**A verifier** :
- Cette suppression est-elle confirmee ?
- A qui s'applique-t-elle exactement ?
- Quelle interaction avec l'exemption 0% ?

### F. Recours et clarifications

- **Rashut HaMisim** doit publier des directives (hanhayot) pour clarifier cette nouvelle loi.
- **A verifier** : des directives officielles ont-elles ete publiees fin 2025 / debut 2026 ? Si oui, ou ?

### Hebrew terms
- רפורמת מס לעולים = reforma mas le'olim (reforme fiscale olim)
- פטור ממס = patur mi-mas (exemption de l'impot)
- עולה חדש = Oleh Hadash
- תושב חוזר = Toshav Chozer
- הכנסה שנתית = hachnasa shnatit (revenu annuel)
- תקרה = tikra (plafond)

### Rapport a faire
```
### URL15_oleh_2026_tax_exemption — 🔴 NOUVELLE LOI CRITIQUE

URL source : https://www.gov.il/en/pages/tax-reforms-for-new-olim
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Confirmation generale :
- Loi adoptee : [OUI | NON]
- Date d'adoption : ______
- Date d'entree en vigueur : ______

Taux progressifs :
- 2026 : ______ % (Tloush : 0%)
- 2027 : ______ % (Tloush : 0%)
- 2028 : ______ % (Tloush : 10%)
- 2029 : ______ % (Tloush : 20%)
- 2030 : ______ % (Tloush : 30%)

Plafonds :
- Plafond annuel : ______ NIS (Tloush : 1 000 000)
- Au-dela : [taxation normale | autre]
- Plafond cumule 5 ans : ______

Eligibilite :
- Olim 2026 : [ELIGIBLE | NON]
- Olim pre-2026 : [ELIGIBLE | NON]
- Toshav chozer : [ELIGIBLE | NON]
- Duree absence toshav chozer : ______ ans minimum
- Cumul avec exemption BL 5 ans US : [POSSIBLE | NON]

Conditions :
- Formulaire : ______ (Tloush : tofes 101)
- Declaration annuelle obligatoire : [OUI | NON]
- Cumul avec Sal Klita : [OUI | NON]

Piege reporting revenus etrangers :
- Suppression du droit de 10 ans confirmee : [OUI | NON]
- S'applique a qui exactement : ______
- Interaction avec 0% : ______

Directives Rashut HaMisim :
- Publiees fin 2025 / debut 2026 : [OUI | NON]
- URL directive : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 3B

A la fin de cette partie, tu auras verifie **2 URLs critiques** qui concernent directement la valeur business de Tloush pour les olim francophones.

### Checklist de sortie

- [ ] URL 14 (Oleh schedule 2022+) : 🔴 verdict rendu + confirmation schedule + plages cumulatives
- [ ] URL 15 (Nouvelle loi 2026) : 🔴 verdict rendu + taux progressifs + eligibilite + piege reporting etranger

### Importance de ces 2 URLs

Ces 2 URLs sont les **arguments de vente** les plus forts de Tloush pour les olim francophones :

1. **Schedule 2022+** : on montre aux olim qu'ils ont 4.5 ans de bonus (pas 3). Potentiel de ~25 000 NIS sur la duree.

2. **Loi 2026** : pour tous les futurs olim qui vont faire leur alyah cette annee ou plus tard, on peut leur dire "tu ne paies pas d'impot pendant 2 ans". **Message commercial fort**. Mais si on se trompe sur les details (plafond, eligibilite, reporting), on les met en defaut face a Rashut HaMisim.

### Prochaine etape

Une fois la partie 3B terminee et ton rapport envoye, **demande la partie 3C** qui couvre les **2 derniers benefices fiscaux olim speciaux** :
- Exemption BL 5 ans pour olim americains (loi recente)
- Tax credit points combat reservistes 2026 (NOUVEAU)

---

*Fin de la partie 3B. ~25 min de travail attendu. Attends la partie 3C pour continuer.*


---

<a id="partie-3c"></a>


> Partie 3C / 5 : Rashut HaMisim + BL — Cas speciaux olim (US + combat)
> Date : 2026-04-12
> Duree estimee : ~15 min

---

## Vue d'ensemble de la partie 3C

Cette derniere sous-partie de la partie 3 couvre **2 benefices fiscaux speciaux** qui s'ajoutent a la nouvelle loi 2026 (partie 3B). Chacun concerne une categorie specifique d'olim.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 16 | Exemption BL 5 ans pour olim americains | P1 | 8 min |
| 17 | Tax credit points combat reservistes 2026 | P1 | 7 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 3A et 3B.

**Contexte** : Ces 2 benefices sont **nouveaux** (adoptes fin 2025 / debut 2026) et **peu documentes**. Tloush les a ajoutes en se basant sur des articles tiers. Il faut confirmer les details avec les sources primaires.

---

## URL 16 : Exemption BL 5 ans pour olim americains

**URL Misrad HaOtzar (tresor)** : https://www.gov.il/en/departments/ministry_of_finance

**URL Bituach Leumi (general)** : https://www.btl.gov.il/English%20Homepage/Insurance/Pages/default.aspx

**Article source principal** : https://www.pstein.com/blog/this-is-the-best-time-to-make-aliyah/

**Article The Jerusalem Post (a chercher)** : https://www.jpost.com/

**Article Nefesh B'Nefesh (si dispo)** : https://www.nbn.org.il/life-in-israel/government-services/bituach-leumi/bituach-leumi/

**Objectif** : Confirmer que les olim americains qui continuent de payer la US Social Security (salaries) ou la Self-Employment Tax (independants) beneficient d'une exemption de 5 ans de cotisations Bituach Leumi israeliennes.

**Attention** : Cette loi est recente (adoptee en 2025-2026 apparemment) et **tres peu documentee** sur les sites officiels israeliens. La source principale est une firme americaine specialisee en alyah (P. Stein).

**Ce que tu dois extraire** :

### A. Conditions d'eligibilite

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Citoyennete requise | **americaine (US citizen ou Green Card)** | ______ |
| Duree apres alyah | **5 ans** | ______ |
| Condition cotisation US | **paiement continu US Social Security OU Self-Employment Tax** | ______ |
| Statut en Israel | **salarie OU independant** | ______ |
| Date d'entree en vigueur | **non documente precisement** | ______ |

### B. Ce qui est exempte / ce qui ne l'est pas

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Cotisation BL salariee (~7% du brut) | **EXEMPTE** | ______ |
| Cotisation employeur BL | **NON exempte (paye par employeur)** | ______ |
| Mas Briut (taxe sante, ~5%) | **NON exempte** | ______ |
| Acces Kupat Holim | **INCLUS malgre exemption BL** | ______ |
| Droit aux prestations BL apres 5 ans | **non documente** | ______ |

### C. Economie typique

- Tloush estime l'economie a environ **~7 000 NIS/an** pour un salaire moyen
- **A verifier** : l'estimation est-elle realiste ? Quelle est l'economie pour un salarie moyen ?
- **A verifier** : exemple chiffre pour un salaire de 15 000 NIS/mois

### D. Procedure de demande

- **Tloush** : procedure non documentee
- **A verifier** : 
  1. Quel formulaire deposer ?
  2. Aupres de quelle autorite (BL ou Rashut HaMisim) ?
  3. Preuves requises (paiement US Social Security des 12 derniers mois ?) ?
  4. Delai de traitement ?
  5. Rétroactivité possible si omission ?

### E. Cumul avec la nouvelle loi 2026

⚠️ **Important** : un oleh americain arrivant en 2026 pourrait cumuler :
- 0% impot sur le revenu (loi 2026 — partie 3B)
- 0% cotisation BL (cette loi)

**A verifier** : ce cumul est-il autorise ? Si oui, c'est le paquet le plus avantageux jamais offert a des olim.

### Hebrew terms
- ביטוח לאומי = Bituach Leumi
- עולה חדש אמריקאי = oleh chadash amerikai
- ביטוח סוציאלי אמריקאי = bituach sociali amerikai (US Social Security)
- פטור = patur (exemption)

### Rapport a faire
```
### URL16_oleh_us_bl_exemption

URL source : https://www.pstein.com/blog/this-is-the-best-time-to-make-aliyah/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Confirmation generale :
- Loi adoptee : [OUI | NON]
- Date d'adoption : ______
- Date d'entree en vigueur : ______
- Source primaire officielle trouvee : [OUI | NON, URL si oui]

Eligibilite :
- Citoyens americains uniquement : [OUI | NON]
- Green Card holders inclus : [OUI | NON]
- Duree exemption : ______ ans (Tloush : 5)
- Doit payer US SS/SE Tax : [OUI | NON]
- Salarie ET independant : [OUI | NON]

Exemption porte sur :
- Cotisation BL employee : [EXEMPTE | NON]
- Cotisation employeur BL : [EXEMPTE | NON]
- Mas Briut : [EXEMPTE | NON]
- Acces Kupat Holim maintenu : [OUI | NON]

Economie :
- Estimation annuelle Tloush : ~7 000 NIS
- Valeur confirmee : ______ NIS/an
- Exemple pour salaire 15k NIS/mois : ______ NIS/an economises

Procedure :
- Formulaire : ______
- Autorite : [BL | Rashut HaMisim | les 2]
- Preuves requises : ______
- Delai traitement : ______ semaines/mois
- Retroactivite : [OUI | NON]

Cumul avec loi 2026 :
- 0% impot + 0% BL possible : [OUI | NON]
- Restrictions cumul : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 17 : Tax credit points combat reservistes 2026 (NOUVEAU)

**URL officielle (a chercher)** : https://www.gov.il/en/departments/israel_tax_authority

**URL Misrad HaBitachon** : https://www.gov.il/en/pages/specialbenefits

**Article Ynet News** : https://www.ynetnews.com/article/rkvvxazqex

**Article Times of Israel** : https://www.timesofisrael.com/knesset-passes-law-expanding-financial-benefits-for-idf-reservists/

**Article Kolzchut combat** : https://www.kolzchut.org.il/he/%D7%A0%D7%A7%D7%95%D7%93%D7%95%D7%AA_%D7%96%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%9C%D7%9C%D7%95%D7%97%D7%9E%D7%99_%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D

**Objectif** : Confirmer la nouvelle regle **2026** qui accorde des **points de credit fiscal** aux reservistes en role combat, calcules sur le nombre de jours de miluim effectues.

**Contexte** : Cette loi est la consequence des reformes post-guerre (octobre 2023 et apres). Elle est entree en vigueur au 1er janvier 2026. Tloush a une regle dediee dans `rightsDetector.ts` — il faut verifier que les conditions sont correctes.

**Ce que tu dois extraire** :

### A. Eligibilite

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Reserviste actif | **OUI** | ______ |
| Role combat uniquement (lohem) | **OUI (pas les roles admin)** | ______ |
| Minimum jours de service | **non documente** | ______ |
| Annee fiscale de reference | **annee precedente** (pour declaration 2026 : jours en 2025) | ______ |

### B. Calcul des points

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Maximum de points accordes | **jusqu'a 4 points** | ______ |
| Valeur d'un point 2026 | **242 NIS/mois = 2 904 NIS/an** | ______ |
| Valeur max annuelle du credit | **4 × 2 904 = 11 616 NIS/an** | ______ |
| Taux de conversion jours → points | **non documente** | ______ |

### C. Definition de "role combat"

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Lohem ou equivalent | **OUI** | ______ |
| Unites admin / bases | **NON** | ______ |
| Intelligence / cyber | **non documente** | ______ |
| Medecins / para-medicaux / soutien | **non documente** | ______ |
| Definition "combat" officielle Tsahal | **non documente** | ______ |

### D. Procedure de declaration

- **A verifier** : comment le reserviste reclame-t-il ce credit ?
  1. Automatique via son employeur (qui applique sur le tofes 101) ?
  2. Reclamation individuelle via Rashut HaMisim (tofes dedie) ?
  3. Justificatif : attestation Tsahal ?

### E. Cumul avec autres benefices

- **A verifier** : cumulable avec les bonuses financiers reservistes (voir partie 5) ?
- **A verifier** : cumulable avec le supplement bas revenu miluim (voir partie 2B) ?
- **A verifier** : cumulable avec les points de credit standards (woman, children, oleh) ?

### Hebrew terms
- לוחם מילואים = lohem miluim (combattant reserviste)
- נקודות זיכוי ללוחמי מילואים = nekudot zikui le'lohamei miluim
- תפקיד קרבי = tafkid kravi (role combat)
- ימי שירות = yemei sherut (jours de service)

### Rapport a faire
```
### URL17_combat_reservist_tax_credit_2026

URL source : https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה_ללוחמי_מילואים
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Confirmation generale :
- Loi adoptee : [OUI | NON]
- Date d'adoption : ______
- Date d'entree en vigueur : [1er janvier 2026 | autre]
- Annee fiscale applicable : ______

Eligibilite :
- Reserviste actif : [OUI | NON requis]
- Role combat uniquement : [OUI | NON]
- Minimum jours service : ______ jours
- Annee de reference : ______

Calcul :
- Max points : ______ (Tloush : 4)
- Valeur annuelle max : ______ NIS (Tloush : 11 616)
- Conversion jours → points : ______
- Exemple : X jours service = ______ points

Definition "combat" :
- Lohem pur : [OUI | NON]
- Cyber/intelligence : [OUI | NON]
- Medics : [OUI | NON]
- Support combat : [OUI | NON]
- Definition officielle : ______

Procedure :
- Automatique via employeur : [OUI | NON]
- Reclamation individuelle : [OUI | NON]
- Formulaire : ______
- Justificatif Tsahal requis : [OUI | NON, lequel]

Cumul :
- Avec autres bonuses reservistes : [OUI | NON]
- Avec supplement bas revenu : [OUI | NON]
- Avec points standards : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 3C (+ bilan partie 3 complete)

A la fin de cette partie, tu auras verifie **2 URLs speciales** qui completent la couverture fiscale olim et reservistes.

### Checklist de sortie partie 3C

- [ ] URL 16 (BL exemption 5 ans US) : verdict rendu + conditions + cumul loi 2026
- [ ] URL 17 (Combat reservist credit) : verdict rendu + eligibilite + calcul

### Bilan partie 3 complete (3A + 3B + 3C)

| Sous-partie | URLs verifiees | Valeurs | Duree effective |
|---|---|---|---|
| 3A | 3 (brackets + Nekudot + Section 66) | ~20 | ~25 min |
| 3B | 2 (Oleh 2022+ schedule + loi 2026) | ~25 | ~25 min |
| 3C | 2 (exemption US + combat credit) | ~15 | ~15 min |
| **TOTAL 3** | **7** | **~60 valeurs** | **~65 min** |

### Importance globale de la partie 3

La partie 3 couvre **~25% du catalogue** mais represente **le risque legal le plus eleve** :
- Si Tloush donne une mauvaise info fiscale a un olim, il peut :
  - Declarer incorrectement (amende Rashut HaMisim)
  - Rater une exemption a laquelle il a droit (perte d'argent)
  - Cumuler incorrectement plusieurs benefices (suspicion de fraude)

Ton rapport doit etre **particulierement rigoureux** sur les verdicts et les commentaires. Si tu as un doute, marque `UNCLEAR` plutot que `MATCH`.

### Prochaine etape

Une fois la partie 3C terminee et ton rapport envoye, **demande la partie 4** qui couvre **Misrad HaKlita (absorption) et Misrad HaShikun (logement)** :
- Sal Klita (panier d'integration)
- Ulpan (cours d'hebreu gratuit)
- Rental assistance (aide au loyer)
- Mashkanta Le'Ole (pret immobilier olim)
- Purchase tax reduction
- Public housing (Diur Tziburi)

---

*Fin de la partie 3C. ~15 min de travail attendu. La partie 3 complete est terminee.*


---

<a id="partie-4a"></a>


> Partie 4A / 5 : Misrad HaKlita — Sal Klita + Ulpan
> Date : 2026-04-12
> Duree estimee : ~30 min

---

## Vue d'ensemble de la partie 4A

Cette partie couvre les **3 benefices core de Misrad HaKlita** (Ministere de l'Absorption) qui sont versus aux nouveaux olim pendant leurs premiers mois en Israel.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 18 | Sal Klita (panier d'integration) | 🔴 P0 | 12 min |
| 19 | Ulpan (cours d'hebreu gratuit) | P1 | 8 min |
| 20 | Page generale Misrad HaKlita (tableau d'eligibilite) | P1 | 10 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 1 a 3C.

**Contexte** : Misrad HaKlita est la porte d'entree des olim. Tous les benefices ici sont **automatiques** (versement direct sur compte bancaire ou inscription gratuite) mais avec des conditions de timing strictes (delais a respecter sous peine de perdre les droits).

---

## 🔴 URL 18 : Sal Klita (panier d'integration)

**URL principale (gov.il)** : https://www.gov.il/en/life-events/immigration-and-assimilation

**URL hebreu** : https://www.gov.il/he/departments/ministry_of_aliyah_and_integration

**URL Nefesh B'Nefesh (calculateur fiable)** : https://www.nbn.org.il/aliyah-rights-and-benefits/

**URL Welcome to Israel (montants)** : https://welcome-israel.com/sal-klita

**Objectif** : 🔴 **CRITIQUE**. C'est le premier benefice tangible que recoit un oleh (cash a l'aeroport + 6 versements mensuels). Tloush a des estimations approximatives — il faut la grille exacte 2026.

**Ce que tu dois extraire** :

### A. Structure des versements

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Versement initial (a Ben Gurion) | **non documente exactement** | ______ |
| Nombre de mensualites suivantes | **6** | ______ |
| Frequence des mensualites | **mensuelle, jour 1-15** | ______ |
| Compte bancaire requis | **OUI (israelien)** | ______ |
| Periode totale | **6 mois** | ______ |

### B. Montants par profil 2026 (a verifier)

⚠️ Les montants varient enormement selon **age + statut familial + nombre d'enfants + ville d'installation**. Voici les estimations Tloush :

| Profil type | Tloush (estimation/mois) | A verifier (officiel 2026) |
|---|---|---|
| Celibataire 18-25 ans | non documente | ______ |
| Celibataire 25-45 ans | **~4 500 NIS/mois** | ______ |
| Celibataire 45-65 ans | non documente | ______ |
| Couple sans enfant (25-65) | **~6 500 NIS/mois** | ______ |
| Couple + 1 enfant | **~7 500 NIS/mois** | ______ |
| Couple + 2 enfants | **~8 500 NIS/mois** | ______ |
| Couple + 3 enfants | non documente | ______ |
| Parent isole + 1 enfant | non documente | ______ |
| Famille nombreuse (4+ enfants) | non documente | ______ |
| Retraite (65+) | non documente | ______ |

### C. Versement initial a l'aeroport

- **A verifier** : montant exact remis en cash a Ben Gurion ?
- **A verifier** : ce montant est-il proportionnel a la famille ou fixe ?
- **A verifier** : peut-on demander un virement direct si on ne veut pas le cash ?

### D. Conditions de suspension

- **A verifier** : un oleh peut-il **perdre** ses versements Sal Klita si il quitte Israel pendant les 6 premiers mois ?
- **A verifier** : si oui, combien de jours d'absence sont toleres ?
- **A verifier** : que se passe-t-il en cas de retour aux pays d'origine pour raisons familiales ?

### E. Cumul avec autres aides

- **Tloush** : Sal Klita est cumulable avec Dmei Avtala reduit (regime olim)
- **A verifier** : cumul avec aide au loyer (qui commence au mois 7-8) ?
- **A verifier** : cumul avec une activite professionnelle (l'oleh peut-il travailler pendant ces 6 mois) ?

### Hebrew terms
- סל קליטה = Sal Klita (panier d'integration)
- מענק קליטה = Maanak Klita (subvention d'integration)
- חודשי קליטה = mois de klita
- תושב חוזר = toshav chozer (resident qui revient)

### Rapport a faire
```
### URL18_sal_klita — 🔴 CRITIQUE

URL source : https://www.gov.il/en/life-events/immigration-and-assimilation
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Structure des versements :
- Versement initial Ben Gurion : ______ NIS (Tloush : non doc)
- Nombre mensualites : ______ (Tloush : 6)
- Periode totale : ______ mois
- Compte bancaire requis : [OUI | NON]

Grille 2026 (NIS/mois) :
- Celibataire 18-25 : ______
- Celibataire 25-45 : ______ (Tloush : 4 500)
- Celibataire 45-65 : ______
- Celibataire 65+ : ______
- Couple 25-65 : ______ (Tloush : 6 500)
- Couple + 1 enfant : ______ (Tloush : 7 500)
- Couple + 2 enfants : ______ (Tloush : 8 500)
- Couple + 3 enfants : ______
- Parent isole + 1 enfant : ______
- Famille 4+ enfants : ______
- Retraite (65+) : ______

Conditions :
- Suspension si depart d'Israel : [OUI | NON]
- Jours d'absence toleres : ______
- Cumul avec Dmei Avtala : [OUI | NON]
- Cumul avec aide au loyer : [OUI | NON]
- Travail autorise pendant Sal Klita : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 19 : Ulpan (cours d'hebreu gratuit)

**URL principale** : https://www.gov.il/en/life-events/immigration-and-assimilation

**URL Shivat Zion (info pratique)** : https://shivat-zion.com/information-portal/first-steps-in-israel/ulpan/

**URL Nefesh B'Nefesh** : https://www.nbn.org.il/life-in-israel/education/ulpan/

**Objectif** : Programme d'apprentissage de l'hebreu finance par Misrad HaKlita. Critique pour l'integration mais souvent sous-utilise par manque d'info.

**Ce que tu dois extraire** :

### A. Structure standard de l'ulpan

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Duree standard | **5 mois** | ______ |
| Frequence | **5 jours/semaine** | ______ |
| Heures par jour | **5 heures** | ______ |
| Cout pour l'oleh | **GRATUIT** | ______ |
| Niveau couvert | **debutant a intermediaire** | ______ |

### B. Conditions d'eligibilite

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Statut requis | **Oleh chadash** | ______ |
| Delai max apres alyah | **18 mois** | ______ |
| Age minimum | non documente | ______ |
| Age maximum | non documente | ______ |
| Conjoint non-juif eligible | non documente | ______ |

### C. Types d'ulpan disponibles

- **Tloush** : "ulpan standard" comme reference
- **A verifier** : 
  1. **Ulpan Aleph** (debutant) — duree, ou ?
  2. **Ulpan Bet** (intermediaire) — duree, ou ?
  3. **Ulpan Gimel** (avance) — gratuit ou payant ?
  4. **Ulpan kayitz** (etudiants ete) — eligibilite ?
  5. **Ulpan specialise** (medecins, ingenieurs, artistes) — finance par qui ?
  6. **Ulpan kibboutz** (residentiel + travail) — frais ?

### D. Localisation
- **A verifier** : combien de centres ulpan dans le pays ?
- **A verifier** : ulpan dispo a Tel Aviv, Jerusalem, Haifa, Netanya, Ashdod, Be'er Sheva ?
- **A verifier** : si l'oleh habite dans une petite ville sans ulpan, est-il rembourse pour aller dans la ville la plus proche ?

### E. Echec d'ulpan ou interruption

- **A verifier** : si l'oleh echoue ou abandonne, peut-il refaire un autre ulpan ?
- **A verifier** : penalite financiere ?

### Hebrew terms
- אולפן = Ulpan (cours d'hebreu)
- אולפן עברית = Ulpan Ivrit (cours d'hebreu specifiquement)
- אולפן א' = Ulpan Aleph (niveau 1)
- אולפן ב' = Ulpan Bet (niveau 2)
- חינם = hinam (gratuit)

### Rapport a faire
```
### URL19_ulpan_free

URL source : https://shivat-zion.com/information-portal/first-steps-in-israel/ulpan/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Structure standard :
- Duree : ______ mois (Tloush : 5)
- Frequence : ______ j/semaine (Tloush : 5)
- Heures/jour : ______ (Tloush : 5)
- Cout : [GRATUIT | PAYANT, montant si oui]

Eligibilite :
- Delai max apres alyah : ______ mois (Tloush : 18)
- Age minimum : ______
- Age maximum : ______
- Conjoint non-juif : [OUI | NON]

Types disponibles :
- Aleph (debutant) : ______
- Bet (intermediaire) : ______
- Gimel (avance) : [GRATUIT | PAYANT]
- Specialise (medecins/ingenieurs/artistes) : [GRATUIT | PAYANT]
- Kibboutz : ______
- Kayitz (ete intensif) : ______

Localisation :
- Nombre de centres dans le pays : ______
- Disponible Tel Aviv/JM/Haifa/Netanya : [OUI | NON]
- Remboursement transport si pas d'ulpan local : [OUI | NON]

Echec/abandon :
- Possibilite refaire un ulpan : [OUI | NON]
- Penalite : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 20 : Page generale Misrad HaKlita (vue d'ensemble eligibilite)

**URL officielle gov.il** : https://www.gov.il/en/departments/ministry_of_aliyah_and_integration

**URL hebreu** : https://www.gov.il/he/departments/ministry_of_aliyah_and_integration

**URL aliyah benefits Belong (synthese)** : https://belong.co.il/living/aliyah-benefits/

**URL Easy Aliyah (guide complet)** : https://www.easyaliyah.com/blog/comprehensive-guide-to-government-grants-and-financial-benefits-for-new-olim-in-israel

**Objectif** : Cette URL sert de **vue d'ensemble** pour confirmer la liste de TOUS les benefices Misrad HaKlita et leurs conditions globales. C'est aussi ou tu peux trouver des benefices que Tloush a oublies.

**Ce que tu dois extraire** :

### A. Liste exhaustive des benefices Misrad HaKlita

Voici les benefices que Tloush a actuellement reference + ceux qu'on aimerait verifier comme **possiblement existants** :

| Benefice | Tloush | Existe ? |
|---|---|---|
| Sal Klita | ✅ Reference | ______ |
| Ulpan gratuit | ✅ Reference | ______ |
| Mas Rechisha reduction (purchase tax) | ✅ Reference (partie 4B) | ______ |
| Aide au loyer | ✅ Reference (partie 4B) | ______ |
| Mashkanta olim | ✅ Reference (partie 4B) | ______ |
| Diur tziburi (logement social) | ✅ Reference (partie 4B) | ______ |
| Bourse universitaire (Student Authority) | non reference | ______ |
| Aide au transport vehicule (douanes) | non reference | ______ |
| Reductions sante/prive | non reference | ______ |
| Programme Atid (jeunes 18-30) | non reference | ______ |
| Programme retraites olim | non reference | ______ |
| Aide creation entreprise (independants) | non reference | ______ |
| Reconversion professionnelle (Imaut Mikoua) | non reference | ______ |
| Aide aux acteurs/artistes (Ulpan-Atid for artists) | non reference | ______ |

⚠️ **Liste les benefices que tu trouves mais qui ne sont pas dans Tloush** — on les ajoutera au catalogue.

### B. Definitions cles a clarifier

- **Oleh chadash** : duree maximale du statut (3 ans ? 5 ans ? autre ?)
- **Toshav chozer** : duree d'absence requise (5 ans ? 6 ans ? autre ?)
- **Toshav chozer vatik** (returning resident apres 10+ ans) : benefices supplementaires ?
- **Ezrach oleh** (citoyen-olim, ne en Israel mais grandi a l'etranger) : statut hybride, eligibilite ?

### C. Bureaux Misrad HaKlita

- **A verifier** : nombre de bureaux dans le pays
- **A verifier** : possibilite de tout faire en ligne (sans deplacement) ?
- **A verifier** : numero de telephone utile pour les francophones (existe-t-il une ligne francaise ?)

### D. Documents et formulaires

- **A verifier** : liste des formulaires types (en hebreu et anglais)
- **A verifier** : documents requis a l'arrivee (passeport, teudat oleh, etc.)
- **A verifier** : delai de delivrance du **Teudat Oleh** apres alyah (cle pour tous les benefices)

### Hebrew terms
- משרד הקליטה = Misrad HaKlita
- עליה = Aliyah (immigration)
- קליטה = klita (absorption)
- תעודת עולה = Teudat Oleh (carte d'olim)

### Rapport a faire
```
### URL20_misrad_haklita_general

URL source : https://www.gov.il/en/departments/ministry_of_aliyah_and_integration
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Liste des benefices listes officiellement :
[Liste exhaustive de ce qui est mentionne sur la page]

Benefices Tloush deja references trouves : [X / 6]
Benefices manquants dans Tloush :
- ______
- ______
- ______

Definitions cles :
- Duree statut "Oleh Chadash" : ______ ans
- Duree absence pour "Toshav Chozer" : ______ ans
- "Toshav Chozer Vatik" : duree absence ______, benefices ______
- "Ezrach Oleh" : eligible aux benefices olim ? [OUI | NON]

Bureaux :
- Nombre de bureaux : ______
- Demarches en ligne possibles : [OUI | NON]
- Hotline francophone : ______

Teudat Oleh :
- Delai delivrance : ______ jours/semaines
- Documents requis : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 4A

A la fin de cette partie, tu auras verifie **3 URLs** et eventuellement **identifie de nouveaux benefices** que Tloush ne reference pas encore.

### Checklist de sortie

- [ ] URL 18 (Sal Klita) : 🔴 verdict rendu + grille de versements par profil
- [ ] URL 19 (Ulpan) : verdict rendu + types disponibles + delai
- [ ] URL 20 (Misrad HaKlita general) : verdict rendu + **liste des benefices manquants**

### Importance

Misrad HaKlita c'est ~10% du catalogue Tloush mais c'est **le premier contact** des olim avec l'administration israelienne. Si on rate des benefices ici, l'olim demarre mal son alyah et peut perdre des milliers de NIS dans les 6 premiers mois.

### Prochaine etape

Une fois la partie 4A terminee et ton rapport envoye, **demande la partie 4B** qui couvre Misrad HaShikun (Logement) :
- Aide au loyer (Siuah Sechar Dira)
- Mashkanta Le'Ole (pret immobilier reduit)
- Reduction Mas Rechisha (purchase tax)
- Diur Tziburi (logement social)

---

*Fin de la partie 4A. ~30 min de travail attendu. Attends la partie 4B pour continuer.*


---

<a id="partie-4b"></a>


> Partie 4B / 5 : Misrad HaShikun — Logement olim (loyer, mashkanta, purchase tax, public housing)
> Date : 2026-04-12
> Duree estimee : ~40 min

---

## Vue d'ensemble de la partie 4B

Cette partie couvre les **4 benefices logement** offerts par Misrad HaShikun (Ministere de la Construction et du Logement) aux olim. Ce sont des benefices importants en termes de valeur mais souvent **mal documentes** car les conditions dependent de la ville, de la taille de la famille et du niveau de besoin.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 21 | Aide au loyer (Siuah Sechar Dira) | 🔴 P0 | 12 min |
| 22 | Mashkanta Le'Ole (pret immobilier olim) | P1 | 10 min |
| 23 | Reduction Mas Rechisha (purchase tax) | P1 | 10 min |
| 24 | Diur Tziburi (logement social olim) | P2 | 8 min |

**Avant de commencer** : assure-toi d'avoir termine la partie 4A (Sal Klita + Ulpan + Misrad HaKlita).

**Contexte** : Misrad HaShikun fonctionne par **commissions regionales** (Achrai Ezori). Chaque region a ses propres plafonds. Les montants listes ci-dessous sont des **moyennes nationales** selon nos sources tierces.

---

## 🔴 URL 21 : Aide au loyer (Siuah Sechar Dira) pour olim

**URL principale gov.il** : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants

**URL hebreu** : https://www.gov.il/he/departments/ministry_of_construction_and_housing

**URL Nefesh B'Nefesh (montants)** : https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/rental-assistance/

**URL Belong** : https://belong.co.il/living/aliyah-benefits/

**Objectif** : 🔴 **CRITIQUE**. Apres la fin du Sal Klita (mois 6), c'est le principal soutien mensuel pour les olim qui louent. Les montants varient enormement (1 000 a 3 000 NIS/mois selon situation). Tloush a des estimations — il faut la grille exacte.

**Ce que tu dois extraire** :

### A. Quand l'aide commence et combien de temps elle dure

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Mois de debut apres alyah | **7e ou 8e mois** (apres Sal Klita) | ______ |
| Duree pour olim pre-mars 2024 | **jusqu'a 4-5 ans** | ______ |
| Duree pour olim post-mars 2024 | **30 mois** | ______ |
| Possibilite de prolongation | non documente | ______ |

### B. Grille des montants (selon profil + ville)

Tloush utilise des estimations moyennes. Voici la grille a confirmer :

| Profil | Tloush (moyenne) | A verifier par ville |
|---|---|---|
| Celibataire | **~1 000 NIS/mois** | ______ |
| Couple sans enfant | **~1 500 NIS/mois** | ______ |
| Couple + 1 enfant | **~2 000 NIS/mois** | ______ |
| Couple + 2 enfants | **~2 500 NIS/mois** | ______ |
| Famille nombreuse (3+ enfants) | **~3 000 NIS/mois** | ______ |
| Parent isole avec enfant | non documente | ______ |

⚠️ **Important** : L'aide varie beaucoup selon la zone geographique. Les villes du **centre** (Tel Aviv, Herzliya, Ra'anana) beneficient de moins d'aide que les villes de **peripherie** (Be'er Sheva, Yerukham, peripherie nord).

**A verifier** :
- Liste des "zones prioritaires" (izorei olifut) de Misrad HaShikun 2026
- Majoration pour les zones de peripherie (combien de % en plus ?)
- Minoration pour les zones centre (combien de % en moins ?)

### C. Conditions d'eligibilite strictes

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Avoir un bail signe officiel | **OUI** | ______ |
| Ne pas etre proprietaire | **OUI** | ______ |
| Etre oleh chadash | **OUI** | ______ |
| Revenu maximum | non documente | ______ |
| Patrimoine maximum | non documente | ______ |
| Bail minimum de X mois | non documente | ______ |

### D. Documents requis pour la demande

- **A verifier** : liste exacte des documents (bail, teudat oleh, teudat zehut, RIB bancaire, etc.)
- **A verifier** : ces documents doivent-ils etre apostilles / certifies ?
- **A verifier** : delai de traitement de la demande

### E. Cas particuliers

- **A verifier** : que se passe-t-il si l'oleh change de logement en cours d'aide ?
- **A verifier** : que se passe-t-il si l'oleh devient proprietaire en cours d'aide ?
- **A verifier** : cumul avec autres aides (Bituach Leumi income support) ?

### Hebrew terms
- סיוע בשכר דירה = Siuah Be'Sechar Dira (aide au loyer)
- שכר דירה = Sechar Dira (loyer)
- משרד הבינוי והשיכון = Misrad HaBinui VeHaShikun
- אזורי עדיפות = izorei adifut (zones prioritaires)

### Rapport a faire
```
### URL21_rental_assistance_olim — 🔴 CRITIQUE

URL source : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Periode de versement :
- Debut apres alyah : mois ______ (Tloush : 7-8)
- Duree olim pre-mars 2024 : ______ ans (Tloush : 4-5)
- Duree olim post-mars 2024 : ______ mois (Tloush : 30)
- Prolongation possible : [OUI | NON]

Grille 2026 (moyenne nationale) :
- Celibataire : ______ NIS/mois (Tloush : ~1 000)
- Couple : ______ NIS/mois (Tloush : ~1 500)
- Couple + 1 enfant : ______ NIS/mois (Tloush : ~2 000)
- Couple + 2 enfants : ______ NIS/mois (Tloush : ~2 500)
- Famille 3+ : ______ NIS/mois (Tloush : ~3 000)
- Parent isole + enfant : ______ NIS/mois

Variation geographique :
- Zones peripherie majoration : +______ %
- Zones centre minoration : -______ %
- Liste zones prioritaires 2026 : ______

Conditions :
- Bail officiel requis : [OUI | NON]
- Duree minimum bail : ______ mois
- Revenu maximum : ______ NIS/mois
- Patrimoine maximum : ______ NIS

Documents requis : ______

Cas particuliers :
- Changement logement en cours : [OK | STOP]
- Devenir proprietaire en cours : [STOP automatique | verification]
- Cumul avec income support : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 22 : Mashkanta Le'Ole (pret immobilier olim)

**URL gov.il** : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants

**URL Easy Aliyah** : https://www.easyaliyah.com/aliyah-benefits-mortgage-discount

**URL Buy It In Israel** : https://www.buyitinisrael.com/guide/what-real-estate-related-benefits-do-olim-chadashim-receive-upon-making-aliyah/

**Objectif** : Programme de pret hypothecaire a conditions preferentielles pour les olim. Valeur tres variable selon le pret souscrit.

**Ce que tu dois extraire** :

### A. Conditions du pret preferentiel

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Duree d'eligibilite apres alyah | **15 ans** | ______ |
| Apport personnel minimum | **5% a 15%** (vs 25-40% standard) | ______ |
| Montant du pret preferentiel | **jusqu'a ~300 000 NIS a taux reduit** | ______ |
| Taux d'interet vs marche | **reduit** (combien exactement ?) | ______ |
| Duree max du pret | non documente | ______ |

### B. Le Teudat Zakaut

Le **Teudat Zakaut** est le document qui ouvre le droit a ce pret. C'est une etape obligatoire.

- **A verifier** : qui delivre le Teudat Zakaut (Misrad HaShikun ? banques ?)
- **A verifier** : delai de delivrance
- **A verifier** : duree de validite du Teudat Zakaut
- **A verifier** : documents necessaires pour l'obtenir

### C. Banques agreees

- **A verifier** : quelles banques israeliennes offrent ce pret ? (Leumi, Hapoalim, Discount, Mizrahi, Binyan, FIBI, Massad ?)
- **A verifier** : toutes les banques ont les memes conditions ou elles varient ?

### D. Conditions d'eligibilite

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Etre oleh chadash | **OUI** | ______ |
| 1er achat immobilier en Israel | non documente | ______ |
| Plafond revenu | non documente | ______ |
| Limite de prix du bien | non documente | ______ |
| Obligation de resider dans le bien | non documente | ______ |

### E. Cumul avec autres benefices immobiliers

- **A verifier** : cumul avec la reduction Mas Rechisha (voir URL 23) ?
- **A verifier** : cumul avec l'aide au loyer (voir URL 21) si on devient proprietaire en cours d'aide ?

### Hebrew terms
- משכנתא לעולה חדש = Mashkanta Le'Oleh Chadash (pret immobilier olim)
- תעודת זכאות = Teudat Zakaut (certificat d'eligibilite)
- הלוואה מופחתת = halvaa moufchetet (pret reduit)

### Rapport a faire
```
### URL22_mashkanta_olim

URL source : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Conditions pret :
- Duree eligibilite apres alyah : ______ ans (Tloush : 15)
- Apport minimum : ______ % (Tloush : 5-15)
- Montant pret preferentiel : ______ NIS (Tloush : ~300 000)
- Taux reduit vs marche : ______ %
- Duree max pret : ______ ans

Teudat Zakaut :
- Delivre par : ______ (Misrad HaShikun ?)
- Delai delivrance : ______
- Duree validite : ______
- Documents requis : ______

Banques agreees :
- Liste : ______
- Conditions identiques : [OUI | NON]

Eligibilite :
- 1er achat uniquement : [OUI | NON]
- Plafond revenu : ______
- Prix max bien : ______
- Residence obligatoire : [OUI | NON]

Cumul :
- Avec reduction Mas Rechisha : [OUI | NON]
- Avec aide au loyer : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 23 : Reduction Mas Rechisha (purchase tax) pour olim

**URL Rashut HaMisim** : https://www.gov.il/he/departments/israel_tax_authority

**URL Buy It In Israel** : https://www.buyitinisrael.com/guide/what-real-estate-related-benefits-do-olim-chadashim-receive-upon-making-aliyah/

**Objectif** : Lors de l'achat d'une residence en Israel, les olim beneficient d'une reduction sur le purchase tax (Mas Rechisha). C'est parfois la plus grosse economie immobiliere pour les olim.

**Ce que tu dois extraire** :

### A. Grille de taxation reduite pour olim 2026

Tloush a cette estimation :

| Tranche de prix | Taux standard (non-olim) | Taux reduit olim Tloush | A verifier |
|---|---|---|---|
| 0 - 2 000 000 NIS | 5-8% selon barème | **0% (exempte)** | ______ |
| 2 000 000 - 6 000 000 NIS | 5-10% selon barème | **0.5%** | ______ |
| 6 000 000 - 20 000 000 NIS | 10% | **non documente** | ______ |
| 20 000 000 + NIS | 10% | **exclu du benefice olim** | ______ |

⚠️ **Important** : Les tranches ci-dessus sont des approximations. Il faut le **bareme officiel 2026** exact.

### B. Conditions d'utilisation

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Duree apres alyah | **7 ans** | ______ |
| Nombre d'utilisations | **1 seule fois** | ______ |
| Type de bien | **residence principale uniquement** | ______ |
| Residence obligatoire dans le bien | non documente | ______ |

### C. Interaction avec le Mas Rechisha standard

- **Non-olim** ont aussi des reductions sur leur 1ere residence (l'achat de la 1ere maison beneficie de tranches plus faibles).
- **A verifier** : le benefice olim est-il **plus avantageux** que le benefice 1er residence non-olim ?
- **A verifier** : peut-on choisir entre les 2 regimes au moment de l'achat ?

### D. Documents et procedure

- **A verifier** : documents requis pour beneficier du taux reduit lors de l'achat (Teudat Oleh, attestation etat civil, etc.)
- **A verifier** : delai de paiement du Mas Rechisha apres signature du contrat
- **A verifier** : consequences si on revend rapidement apres avoir utilise le benefice olim

### Hebrew terms
- מס רכישה = Mas Rechisha (purchase tax)
- דירה יחידה = Dira Yekhida (residence unique / principale)
- פטור ממס רכישה = patur mi-mas rechisha (exemption du purchase tax)

### Rapport a faire
```
### URL23_purchase_tax_reduction_olim

URL source : https://www.gov.il/he/departments/israel_tax_authority
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille reduite olim 2026 :
- 0 - 2 000 000 NIS : ______ % (Tloush : 0%)
- 2M - 6M NIS : ______ % (Tloush : 0.5%)
- 6M - 20M NIS : ______ %
- 20M+ NIS : [exclu | taux ______ %]

Grille standard non-olim (reference) :
- 0 - ______ NIS : ______ %
- ______ - ______ NIS : ______ %
- etc.

Conditions :
- Duree apres alyah : ______ ans (Tloush : 7)
- Nombre d'utilisations : ______ (Tloush : 1)
- Type de bien : [residence principale | autre]
- Residence obligatoire : [OUI | NON]

Comparaison avec benefice 1er residence non-olim :
- Plus avantageux : [OUI | NON]
- Choix possible entre 2 regimes : [OUI | NON]

Documents requis : ______

Revente rapide :
- Consequences (remboursement du benefice ?) : ______
- Delai minimum de detention : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 24 : Diur Tziburi (logement social olim)

**URL gov.il** : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants

**URL Misrad HaShikun** : https://www.gov.il/en/departments/ministry_of_construction_and_housing

**URL Merkaz Klita (centre d'absorption)** : https://www.gov.il/en/service/absorption_center

**Objectif** : Programme de logement social ou subventionne pour olim qui ne peuvent pas se loger dans le prive. Moins commun mais important pour les familles precaires.

**Ce que tu dois extraire** :

### A. Formes de logement social disponibles

| Type | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Merkaz Klita (centre d'absorption) | **reference** | ______ |
| Diur Tziburi (logement social classique) | **reference** | ______ |
| Dira be-Hinuch Zol (logement a loyer reduit) | non documente | ______ |
| Logements pour olim retraites | non documente | ______ |
| Mahol Ahid (hebergement temporaire) | non documente | ______ |

### B. Conditions d'eligibilite Diur Tziburi pour olim

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Duree d'eligibilite apres alyah | **jusqu'a 15 ans** | ______ |
| Plafond revenu | non documente | ______ |
| Composition familiale minimale | non documente | ______ |
| Priorite situations specifiques (handicap, parent isole, retraite, etc.) | non documente | ______ |

### C. Merkaz Klita (centres d'absorption)

- **A verifier** : nombre de centres dans le pays
- **A verifier** : duree max de sejour (3 mois ? 6 mois ? 1 an ?)
- **A verifier** : tarif (subventionne ? gratuit ?)
- **A verifier** : liste d'attente ?

### D. Processus de demande

- **A verifier** : demande en ligne ou en personne ?
- **A verifier** : delai de traitement
- **A verifier** : priorites entre categories

### Hebrew terms
- דיור ציבורי = Diur Tziburi (logement public/social)
- מרכז קליטה = Merkaz Klita (centre d'absorption)
- דיור מסובסד = Diur Mesobsad (logement subventionne)
- רשימת המתנה = reshimat hamtana (liste d'attente)

### Rapport a faire
```
### URL24_diur_tziburi

URL source : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Formes de logement social :
- Merkaz Klita : [OUI | NON]
- Diur Tziburi classique : [OUI | NON]
- Loyer reduit : [OUI | NON]
- Logement retraites olim : [OUI | NON]

Conditions Diur Tziburi olim :
- Duree eligibilite : ______ ans (Tloush : 15)
- Plafond revenu : ______
- Composition familiale min : ______
- Priorites : ______

Merkaz Klita :
- Nombre de centres : ______
- Duree max sejour : ______
- Tarif : [gratuit | subventionne | taux _______]
- Liste d'attente : [OUI | NON]

Processus demande :
- En ligne : [OUI | NON]
- Delai : ______
- Priorites : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 4B (+ bilan partie 4 complete)

A la fin de cette partie, tu auras verifie **4 URLs** logement et eventuellement **identifie des benefices logement manquants** dans Tloush.

### Checklist de sortie partie 4B

- [ ] URL 21 (Aide au loyer) : 🔴 verdict rendu + grille par profil + variation geographique
- [ ] URL 22 (Mashkanta Le'Ole) : verdict rendu + Teudat Zakaut + banques
- [ ] URL 23 (Mas Rechisha) : verdict rendu + grille 2026 + comparaison non-olim
- [ ] URL 24 (Diur Tziburi) : verdict rendu + Merkaz Klita + processus

### Bilan partie 4 complete (4A + 4B)

| Sous-partie | URLs | Valeurs | Duree |
|---|---|---|---|
| 4A | 3 (Sal Klita + Ulpan + HaKlita general) | ~30 | 30 min |
| 4B | 4 (Aide loyer + Mashkanta + Mas Rechisha + Diur Tziburi) | ~40 | 40 min |
| **TOTAL 4** | **7** | **~70 valeurs** | **~70 min** |

### Importance

La partie 4 couvre **~10% du catalogue** mais represente des benefices a **tres haute valeur unitaire** :
- Aide au loyer : jusqu'a 3 000 NIS/mois x 30 mois = **90 000 NIS cumules**
- Mashkanta olim : economie d'interets sur 25 ans = **plusieurs dizaines de milliers de NIS**
- Mas Rechisha reduit : **plusieurs dizaines de milliers de NIS** sur un achat standard
- Diur Tziburi : logement social = **economie massive pour les plus precaires**

Un seul client qui obtient un de ces benefices grace a Tloush = retour sur investissement x100 pour lui.

### Prochaine etape

Une fois la partie 4B terminee et ton rapport envoye, **demande la partie 5** qui couvre les **10 URLs restantes** :
- Arnona (reductions municipales par ville)
- Holocaust survivors benefits
- Students (PERACH + Student Authority + bourses)
- Combat reservists bonuses 2026
- Bereaved family rights (Misrad HaBitachon)

---

*Fin de la partie 4B. ~40 min de travail attendu. Attends la partie 5 pour continuer.*


---

<a id="partie-5a"></a>


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


---

<a id="partie-5b"></a>


> Partie 5B / 5 : Arnona — 5 villes moyennes (Ashdod, Netanya, Ra'anana, Herzliya, Be'er Sheva)
> Date : 2026-04-12
> Duree estimee : ~35 min

---

## Vue d'ensemble de la partie 5B

Cette partie couvre **5 villes moyennes** particulierement frequentees par la communaute francophone olim en Israel. Ensemble, elles representent ~1 million d'habitants et une grosse partie de notre audience Tloush.

| # | URL a verifier | Population olim FR | Priorite | Temps |
|---|---|---|---|---|
| 28 | Arnona Netanya | Tres forte (20-30% francophones) | 🔴 P0 | 8 min |
| 29 | Arnona Ra'anana | Forte (~25% francophones) | 🔴 P0 | 7 min |
| 30 | Arnona Ashdod | Moyenne (quartier Yud, Zayn, etc.) | P1 | 7 min |
| 31 | Arnona Herzliya | Moyenne (quartier Herzliya Pituach) | P1 | 7 min |
| 32 | Arnona Be'er Sheva | Faible mais ville universitaire | P2 | 6 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 1 a 5A.

**Contexte** : Pour chaque ville, le format est identique a la partie 5A. On verifie :
1. URL officielle de la section arnona
2. Grille de base 2026
3. Toutes les reductions par categorie
4. Specificites locales de chaque mairie

---

## 🔴 URL 28 : Arnona Netanya

**URL mairie principale** : https://www.netanya.muni.il/

**URL arnona** : https://www.netanya.muni.il/Resident/Payments/Pages/arnona.aspx

**URL reductions** : https://www.netanya.muni.il/Resident/Payments/Pages/arnona-discounts.aspx

**Objectif** : 🔴 **CRITIQUE pour l'audience francophone**. Netanya est **LA ville francaise d'Israel** avec une enorme population d'olim francais (~20-30% des habitants), surtout dans les quartiers Nof HaYam, Neot Shaked, Poleg, Kiryat HaSharon. C'est probablement la ville avec le **plus grand pourcentage de clients Tloush**.

**Ce que tu dois extraire** :

### A. Grille de base Netanya 2026

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Tarif residentiel (NIS/m²/an) | non hardcode | ______ |
| Zones tarifaires (Kiryat HaSharon, Poleg, etc.) | non documente | ______ |
| Date des nouveaux taux 2026 | janvier 2026 | ______ |

### B. Reductions standards Netanya

| Categorie | Tloush (moyenne) | Netanya exact |
|---|---|---|
| **Oleh chadash** | 70-90% sur 100 m² x 12 mois | ______ |
| **Handicap 50%+** | variable | ______ |
| **Handicap 100%** | variable | ______ |
| **Retraite bas revenu** | variable | ______ |
| **Retraite autonome** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant** | variable | ______ |
| **Shoah survivant** | exemption | ______ |
| **Famille nombreuse (3+ enfants)** | non documente | ______ |
| **Reserviste combat** | non documente | ______ |

### C. Specificites Netanya (important pour francophones)

- **A verifier** : existe-t-il un **guichet francophone** dedie ? (l'iria de Netanya a historiquement un service francophone)
- **A verifier** : reductions specifiques pour les residents de **Kiryat Yehudi** (quartier tres francophone) ?
- **A verifier** : conditions speciales pour les **seniors francophones** (beaucoup de retraites francais retraites a Netanya) ?
- **A verifier** : reductions pour les **bi-residents** (personnes qui partagent leur temps entre France et Israel) ?

### D. Procedure Netanya

- **A verifier** : formulaire disponible en francais ?
- **A verifier** : possibilite de demande par email / fax ?
- **A verifier** : delai et effet retroactif

### Rapport a faire
```
### URL28_arnona_netanya — 🔴 CRITIQUE (audience francophone)

URL source : https://www.netanya.muni.il/Resident/Payments/Pages/arnona-discounts.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Zones tarifaires : ______

Reductions standards :
- Oleh chadash : ______ %
- Handicap 50%+ : ______ %
- Handicap 100% : ______ %
- Retraite bas revenu : ______ %
- Retraite autonome : ______ %
- Parent isole : ______ %
- Etudiant : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %
- Reserviste combat : ______ %

Specificites Netanya (francophones) :
- Guichet francophone : [OUI | NON]
- Formulaire en francais : [OUI | NON]
- Reduction Kiryat Yehudi : ______
- Conditions seniors francophones : ______
- Bi-residents France-Israel : ______

Procedure :
- Demande en ligne : [OUI | NON]
- Demande email : [OUI | NON]
- Delai : ______
- Effet retroactif : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 🔴 URL 29 : Arnona Ra'anana

**URL mairie** : https://www.raanana.muni.il/

**URL arnona** : https://www.raanana.muni.il/residents/taxation/arnona/Pages/default.aspx

**URL reductions** : https://www.raanana.muni.il/residents/taxation/arnona/Pages/discounts.aspx

**Objectif** : 🔴 **CRITIQUE**. Ra'anana est l'autre ville tres francophone d'Israel (environ 25% de la population), avec aussi une forte population anglophone. Connue pour son centre-ville tres international et sa qualite de vie.

**Ce que tu dois extraire** :

### A. Grille de base Ra'anana 2026

| Element | A verifier |
|---|---|
| Tarif residentiel (NIS/m²/an) | ______ |
| Zones tarifaires | ______ |

### B. Reductions standards Ra'anana

| Categorie | Tloush | Ra'anana exact |
|---|---|---|
| **Oleh chadash** | 70-90% | ______ |
| **Handicap 50%+** | variable | ______ |
| **Handicap 100%** | variable | ______ |
| **Retraite bas revenu** | variable | ______ |
| **Retraite autonome** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant** | variable | ______ |
| **Shoah** | exemption | ______ |
| **Famille nombreuse (3+ enfants)** | non documente | ______ |
| **Reserviste combat** | non documente | ______ |

### C. Specificites Ra'anana

Ra'anana est une ville **riche et bien geree** avec des services premium. Les reductions sont souvent **moins genereuses** mais **mieux versees** (sans retard).

- **A verifier** : guichet francophone ? anglophone ?
- **A verifier** : conditions speciales pour les **residents de Park Ra'anana** (zone tech) ?
- **A verifier** : reductions pour les **foyers a forte valeur immobiliere** (bonus retraite avec patrimoine eleve) ?

### Rapport a faire
```
### URL29_arnona_raanana — 🔴 CRITIQUE (audience francophone)

URL source : https://www.raanana.muni.il/residents/taxation/arnona/Pages/discounts.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Zones tarifaires : ______

Reductions standards :
- Oleh chadash : ______ %
- Handicap 50%+ : ______ %
- Handicap 100% : ______ %
- Retraite bas revenu : ______ %
- Retraite autonome : ______ %
- Parent isole : ______ %
- Etudiant : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %
- Reserviste combat : ______ %

Specificites Ra'anana :
- Guichet francophone : [OUI | NON]
- Guichet anglophone : [OUI | NON]
- Zone Park Ra'anana : ______
- Bonus patrimoine eleve : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 30 : Arnona Ashdod

**URL mairie** : https://www.ashdod.muni.il/

**URL arnona** : https://www.ashdod.muni.il/Pages/arnona-payments.aspx

**URL reductions** : https://www.ashdod.muni.il/Pages/arnona-discounts.aspx

**Objectif** : Ashdod est la **5e ville d'Israel** (~240 000 habitants) avec une importante communaute francophone (quartiers Yud, Zayn, Marina). Les tarifs sont moins eleves qu'en centre, mais les reductions peuvent etre moins generouses aussi.

**Ce que tu dois extraire** :

### A. Grille de base Ashdod 2026

| Element | A verifier |
|---|---|
| Tarif residentiel (NIS/m²/an) | ______ |
| Zones tarifaires (quartiers Alef a Tet) | ______ |

### B. Reductions standards Ashdod

| Categorie | Tloush | Ashdod exact |
|---|---|---|
| **Oleh chadash** | 70-90% | ______ |
| **Handicap** | variable | ______ |
| **Retraite** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant** | variable | ______ |
| **Shoah** | exemption | ______ |
| **Famille nombreuse** | non documente | ______ |

### C. Specificites Ashdod

- **A verifier** : reductions pour les **residents pres de la Marina** (zone cherie) ?
- **A verifier** : reductions specifiques pour la **communaute georgienne** (historiquement nombreuse a Ashdod) ?
- **A verifier** : conditions speciales pour les residents des **quartiers de la peripherie d'Ashdod** ?

### Rapport a faire
```
### URL30_arnona_ashdod

URL source : https://www.ashdod.muni.il/Pages/arnona-discounts.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Zones tarifaires (Alef-Tet) : ______

Reductions standards :
- Oleh : ______ %
- Handicap : ______ %
- Retraite : ______ %
- Parent isole : ______ %
- Etudiant : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %

Specificites Ashdod :
- Zone Marina : ______
- Communaute georgienne : ______
- Peripherie : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 31 : Arnona Herzliya

**URL mairie** : https://www.herzliya.muni.il/

**URL arnona** : https://www.herzliya.muni.il/Residents/Pages/Arnona.aspx

**URL reductions** : https://www.herzliya.muni.il/Residents/Pages/Arnona-Discounts.aspx

**Objectif** : Herzliya est riche (~100 000 habitants) avec le quartier **Herzliya Pituach** (zone tres chere et expats). Population francophone presente mais minoritaire par rapport a Ra'anana / Netanya.

**Ce que tu dois extraire** :

### A. Grille de base Herzliya 2026

| Element | A verifier |
|---|---|
| Tarif residentiel (NIS/m²/an) | ______ |
| Zones (Herzliya Pituach vs ville) | ______ |

### B. Reductions standards Herzliya

| Categorie | Tloush | Herzliya exact |
|---|---|---|
| **Oleh chadash** | 70-90% | ______ |
| **Handicap** | variable | ______ |
| **Retraite** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant** | variable | ______ |
| **Shoah** | exemption | ______ |
| **Famille nombreuse** | non documente | ______ |

### C. Specificites Herzliya

- **A verifier** : les residents d'Herzliya Pituach paient-ils un tarif plus eleve ?
- **A verifier** : reduction pour les **employes de la zone tech** (hi-tech park de Herzliya Pituach) ?
- **A verifier** : conditions speciales pour les **etrangers residents** (expats tech) ?

### Rapport a faire
```
### URL31_arnona_herzliya

URL source : https://www.herzliya.muni.il/Residents/Pages/Arnona-Discounts.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Zones Pituach vs ville : ______

Reductions standards :
- Oleh : ______ %
- Handicap : ______ %
- Retraite : ______ %
- Parent isole : ______ %
- Etudiant : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %

Specificites Herzliya :
- Surcharge Herzliya Pituach : ______ %
- Reduction hi-tech employes : ______
- Expats : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 32 : Arnona Be'er Sheva

**URL mairie** : https://www.beer-sheva.muni.il/

**URL arnona** : https://www.beer-sheva.muni.il/Residents/Payments/Pages/Arnona.aspx

**URL reductions** : https://www.beer-sheva.muni.il/Residents/Payments/Pages/ArnonaDiscounts.aspx

**Objectif** : Be'er Sheva est la **capitale du sud** (~210 000 habitants), ville universitaire (Ben Gurion University). Classée en **zone prioritaire** (ezor adifut), les reductions d'arnona sont **les plus genereuses d'Israel**.

**Ce que tu dois extraire** :

### A. Grille de base Be'er Sheva 2026

| Element | A verifier |
|---|---|
| Tarif residentiel (NIS/m²/an) | ______ |
| Zone prioritaire nationale | ______ % de bonus |

### B. Reductions standards Be'er Sheva

| Categorie | Tloush | Be'er Sheva exact |
|---|---|---|
| **Oleh chadash** | 70-90% | ______ (probablement plus eleve vu zone prioritaire) |
| **Handicap** | variable | ______ |
| **Retraite** | variable | ______ |
| **Parent isole** | variable | ______ |
| **Etudiant Ben Gurion** | variable | ______ (souvent reduction speciale) |
| **Shoah** | exemption | ______ |
| **Famille nombreuse** | non documente | ______ |

### C. Specificites Be'er Sheva

- **A verifier** : statut de **zone prioritaire** (ezor adifut) → majoration de X% sur toutes les reductions
- **A verifier** : reduction **etudiant Ben Gurion** (c'est une vraie pratique courante)
- **A verifier** : reduction pour les **bedouins** (population locale historique)
- **A verifier** : reduction pour les **militaires bases dans le sud**
- **A verifier** : reduction pour les **startup du centre Sami Shamoon**

### Rapport a faire
```
### URL32_arnona_beer_sheva

URL source : https://www.beer-sheva.muni.il/Residents/Payments/Pages/ArnonaDiscounts.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Grille de base 2026 :
- Tarif residentiel moyen : ______ NIS/m²/an
- Zone prioritaire nationale : [OUI, majoration ______ % | NON]

Reductions standards :
- Oleh : ______ % (majoration zone ?)
- Handicap : ______ %
- Retraite : ______ %
- Parent isole : ______ %
- Etudiant Ben Gurion : ______ %
- Shoah : ______ %
- Famille 3+ enfants : ______ %

Specificites Be'er Sheva :
- Bonus zone prioritaire : ______ %
- Etudiant Ben Gurion : ______ %
- Bedouins : ______ %
- Militaires bases sud : ______ %
- Startup Sami Shamoon : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 5B

A la fin de cette partie, tu auras verifie **5 URLs** couvrant ~1 million d'habitants supplementaires dans 5 villes moyennes importantes pour l'audience Tloush.

### Checklist de sortie partie 5B

- [ ] URL 28 (Netanya) : 🔴 verdict rendu + specificites francophones + guichet
- [ ] URL 29 (Ra'anana) : 🔴 verdict rendu + specificites internationales
- [ ] URL 30 (Ashdod) : verdict rendu + zones par quartier
- [ ] URL 31 (Herzliya) : verdict rendu + Pituach vs ville
- [ ] URL 32 (Be'er Sheva) : verdict rendu + zone prioritaire + etudiants

### Bilan partie 5A + 5B (arnona complete)

| Sous-partie | Villes | Population cumulee |
|---|---|---|
| 5A | TLV + JM + Haifa | ~1 690 000 |
| 5B | Netanya + Ra'anana + Ashdod + Herzliya + Be'er Sheva | ~950 000 |
| **Total** | **8 villes** | **~2 640 000 (~30% de la population Israel)** |

### Importance

**Netanya et Ra'anana** sont les 2 villes les plus **strategiques** pour Tloush : beaucoup de nos utilisateurs y vivent. Les autres villes sont secondaires mais importantes pour completer la couverture.

### Action post-verification

A la fin de ton rapport 5A + 5B, **produit un tableau consolide** :
```
| Ville | Oleh % | Handicap % | Retraite % | Surface max |
|---|---|---|---|---|
| Tel Aviv | ... | ... | ... | ... |
| Jerusalem | ... | ... | ... | ... |
| ... | | | | |
```

Ce tableau servira a construire un **selecteur de ville** dans Tloush.

### Prochaine etape

Une fois la partie 5B terminee et ton rapport envoye, **demande la partie 5C** qui couvre les **benefices Holocaust survivors** (Claims Conference, Foundation for the Benefit of Holocaust Victims, Ministry of Social Equality).

---

*Fin de la partie 5B. ~35 min de travail attendu. Attends la partie 5C pour continuer.*


---

<a id="partie-5c"></a>


> Partie 5C / 5 : Holocaust Survivors (Shoah) — Claims Conference + Foundation + Ministere
> Date : 2026-04-12
> Duree estimee : ~25 min

---

## Vue d'ensemble de la partie 5C

Cette partie couvre les **3 organismes** qui versent des allocations et services aux survivants de la Shoah en Israel. C'est un domaine **complexe et sensible** car il implique :
- Plusieurs sources de financement (Allemagne, Israel, Claims Conference)
- Des categories d'eligibilite strictes (naissance avant 1945, presence dans un pays occupe)
- Des montants variables selon le dossier individuel

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 33 | Claims Conference (global + Israel) | 🔴 P0 | 10 min |
| 34 | Foundation for the Benefit of Holocaust Victims | P1 | 8 min |
| 35 | Misrad HaShivyon HaHevrati (Ministere egalite sociale) | P1 | 7 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 1 a 5B.

**Contexte** : Tloush a actuellement 3 entrees "holocaust" dans le catalogue (mensuel, in-home services, arnona exemption). Il faut verifier que les montants et les organismes responsables sont corrects. Attention particuliere : **les lois ont ete modifiees post-7 octobre 2023** pour augmenter le soutien.

---

## 🔴 URL 33 : Claims Conference (global + Israel)

**URL principale global** : https://www.claimscon.org/

**URL Israel specifique** : https://www.claimscon.org/regions/israel/

**URL benefits** : https://www.claimscon.org/what-we-do/compensation/

**URL BEG (Article 2)** : https://www.claimscon.org/what-we-do/compensation/background/article-2/

**Objectif** : 🔴 **CRITIQUE**. La Claims Conference est la **source principale** de paiements mensuels et annuels aux survivants de la Shoah. Tloush les mentionne mais sans les montants exacts.

**Ce que tu dois extraire** :

### A. Programmes de compensation Claims Conference

La Claims Conference distribue plusieurs types de paiements :

| Programme | Description | Tloush | A verifier |
|---|---|---|---|
| **Article 2 Fund** | Pension mensuelle pour certains survivants persecutes | non documente | ______ NIS/mois ou USD/mois |
| **Central and Eastern European Fund (CEEF)** | Pension mensuelle pour survivants d'Europe centrale/est | non documente | ______ |
| **Child Survivor Fund** | Paiement unique pour enfants survivants | non documente | ______ |
| **Hardship Fund (One-Time)** | Paiement unique pour survivants en difficulte | non documente | ______ |
| **Home Care Services** | Services d'aide a domicile | reference | ______ |

### B. Montants 2026 (a verifier)

- **Tloush estime** : entre 2 800 et 7 000 NIS/mois selon programme
- **Tloush** : equivalent 800-2 000 USD/mois
- **A verifier** : taux actuels par programme
- **A verifier** : solidarity payment one-time (il y a eu un paiement special "solidarity" en 2024-2025 a verifier si renouvelle en 2026)

### C. Eligibilite

| Categorie | Tloush | A verifier |
|---|---|---|
| Ne avant 1945 | **OUI** | ______ |
| Presence pays occupe nazi/antijuif 1933-1945 | **OUI** | ______ |
| Enfants caches | **inclus** | ______ |
| Refugies hors ghetto/camp | non documente | ______ |
| Conjoint survivant (meme non-juif) | non documente | ______ |
| Enfants ne pendant la Shoah | non documente | ______ |
| Descendants de 2e generation | non documente | ______ |

### D. Procedure de demande

- **A verifier** : formulaires disponibles (anglais, hebreu, allemand, russe, francais, yiddish ?)
- **A verifier** : delai moyen de traitement
- **A verifier** : possibilite d'aide juridique gratuite pour constituer le dossier
- **A verifier** : numero de telephone francophone (certains bureaux de la CC ont une ligne francaise)

### E. Coordination avec les allocations israeliennes

- **A verifier** : un survivant peut-il cumuler Claims Conference + aide du Ministere de l'egalite sociale + pension de retraite ?
- **A verifier** : y a-t-il des doubles paiements interdits ?

### Rapport a faire
```
### URL33_claims_conference — 🔴 CRITIQUE

URL source : https://www.claimscon.org/regions/israel/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Programmes disponibles :
- Article 2 Fund : ______ USD/mois (~______ NIS)
- CEEF : ______ USD/mois (~______ NIS)
- Child Survivor Fund : ______ USD paiement unique
- Hardship Fund : ______ USD paiement unique
- Home Care Services : ______ heures/semaine

Montants 2026 :
- Tarif min mensuel : ______ USD/mois
- Tarif max mensuel : ______ USD/mois
- Solidarity payment 2026 : [OUI ______ USD | NON]

Eligibilite :
- Ne avant 1945 : [OUI | NON]
- Enfants caches : [OUI | NON]
- Refugies hors ghetto : [OUI | NON]
- Conjoint non-juif : [OUI | NON]
- Enfants nes pendant Shoah : [OUI | NON]
- 2e generation : [OUI | NON]

Procedure :
- Langues formulaires : ______
- Delai moyen : ______ semaines/mois
- Aide juridique gratuite : [OUI | NON]
- Hotline francophone : [OUI ______ | NON]

Coordination :
- Cumul avec Ministere egalite sociale : [OUI | NON]
- Cumul avec pension vieillesse : [OUI | NON]
- Doubles paiements : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 34 : Foundation for the Benefit of Holocaust Victims

**URL principale** : https://k-shoa.org/

**URL anglais** : https://k-shoa.org/en/

**URL services** : https://k-shoa.org/en/services/

**Article eJewishPhilanthropy (context)** : https://ejewishphilanthropy.com/40-of-holocaust-survivors-living-in-poverty-including-a-quarter-of-those-in-israel-buoyed-by-welfare-benefits-and-nonprofits/

**Objectif** : La Foundation for the Benefit of Holocaust Victims est une organisation israelienne qui fournit des **services in-kind** (pas du cash) aux survivants : aide a domicile, activites sociales, soutien psychologique, centres de jour.

**Ce que tu dois extraire** :

### A. Services offerts par la Foundation

| Service | Tloush | A verifier |
|---|---|---|
| **Home care services** | reference | ______ heures/semaine, gratuite ? |
| **Senior day centers** | non documente | ______ nombre dans le pays |
| **Psychological support** | non documente | ______ gratuit ? |
| **Financial emergency assistance** | non documente | ______ |
| **Respite care for family caregivers** | non documente | ______ |
| **Memorial and commemoration activities** | non documente | ______ |

### B. Nombre de beneficiaires et centres

- **Tloush** : ~22 000 survivants beneficient des services a domicile
- **A verifier** : chiffre 2026
- **A verifier** : 150 centres de jour pour personnes agees ? (chiffre Claims Conference)

### C. Eligibilite

- **A verifier** : tout survivant reconnu ? Ou seulement les plus necessiteux ?
- **A verifier** : test de revenu / ressources ?
- **A verifier** : obligation d'etre resident israelien ?
- **A verifier** : delai de reconnaissance par la Foundation

### D. Comment demander

- **A verifier** : numero de telephone pour la demande
- **A verifier** : bureau a Tel Aviv et autres villes ?
- **A verifier** : langues disponibles pour la demande

### Rapport a faire
```
### URL34_foundation_holocaust

URL source : https://k-shoa.org/en/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Services offerts :
- Home care : ______ heures/semaine (Tloush : reference)
- Day centers : ______ dans le pays
- Psychological support : [GRATUIT | PAYANT]
- Financial emergency : ______
- Respite care : ______
- Commemoration activities : ______

Beneficiaires :
- Nombre de beneficiaires 2026 : ______ (Tloush : 22 000)
- Nombre de centres : ______

Eligibilite :
- Tout survivant reconnu : [OUI | NON]
- Test de revenu : [OUI | NON]
- Resident israelien requis : [OUI | NON]
- Delai reconnaissance : ______

Demande :
- Telephone : ______
- Bureaux : ______
- Langues : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 35 : Misrad HaShivyon HaHevrati (Ministere de l'egalite sociale)

**URL principale** : https://www.gov.il/he/departments/ministry_of_social_equality

**URL holocaust survivors section** : https://www.gov.il/he/departments/topics/holocaust_survivors_rights

**URL Authority for the Rights of Holocaust Survivors (RHSA)** : https://www.gov.il/en/departments/holocaust_survivors_rights_authority

**Objectif** : Le ministere de l'egalite sociale abrite la **Holocaust Survivors Rights Authority** (Rashut Lezekhyot Nitsolei Shoah), qui est l'organe gouvernemental israelien charge des droits des survivants. C'est **la source primaire cote gouvernement israelien** (vs la Claims Conference qui est internationale).

**Ce que tu dois extraire** :

### A. Programmes gouvernementaux israeliens pour survivants

| Programme | Description | Tloush | A verifier |
|---|---|---|---|
| **Pension mensuelle etat** | Pension mensuelle du gouvernement israelien | non differenciee | ______ NIS/mois |
| **Allocation chauffage** (kitsbat chimmum) | Aide annuelle pour chauffage en hiver | non documente | ______ NIS/an |
| **Allocation medicale** | Remboursement de soins | non documente | ______ |
| **Services sociaux gratuits** | Aide au quotidien | reference | ______ |
| **Exemption arnona** | Exemption totale ou majoritaire | reference | ______ |
| **Reduction Kupat Holim** | Medicaments gratuits/reduits | non documente | ______ |
| **Solidarity payment (one-time 2024-2025-2026)** | Paiement unique du gouvernement | non documente | ______ |

### B. Montants 2026

- **Tloush** : 1.2 milliard USD distribue en 2021 total
- **A verifier** : budget 2026 Misrad HaShivyon HaHevrati pour survivants
- **A verifier** : nombre de survivants benefitiaires en Israel 2026 (~165 000 selon Claims Conference 2024)
- **A verifier** : montant moyen du soutien mensuel par survivant

### C. Eligibilite cote israelien

- **A verifier** : reconnaissance officielle par l'Etat comme "Nitsol Shoah" — comment ?
- **A verifier** : processus pour obtenir un **Teudat Nitsol** (carte de survivant)
- **A verifier** : eligibilite des **survivants qui ont immigre apres 1965** (regle complexe)

### D. Services speciaux post-7 octobre

**Contexte important** : Plusieurs lois ont ete passees post-guerre pour augmenter l'aide aux survivants plus ages qui ont ete traumatises une nouvelle fois par la guerre d'octobre 2023.

- **A verifier** : y a-t-il un **bonus special "guerre"** pour les survivants qui ont vecu les evenements de 2023-2025 ?
- **A verifier** : aide psychologique renforcee ?
- **A verifier** : priorite d'acces aux services ?

### Rapport a faire
```
### URL35_misrad_hashivyon_holocaust

URL source : https://www.gov.il/he/departments/ministry_of_social_equality
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Programmes gouvernementaux :
- Pension mensuelle etat : ______ NIS/mois
- Allocation chauffage : ______ NIS/an
- Allocation medicale : ______
- Services sociaux : ______
- Exemption arnona : ______ %
- Reduction Kupat Holim : ______
- Solidarity 2026 : [OUI ______ NIS | NON]

Montants 2026 :
- Budget annuel : ______ USD/NIS
- Nombre de beneficiaires : ______ (Tloush : ~165 000)
- Soutien moyen mensuel : ______ NIS

Eligibilite :
- Reconnaissance Teudat Nitsol : ______
- Processus obtention : ______
- Survivants arrives apres 1965 : [ELIGIBLE | NON]

Post-guerre 2023 :
- Bonus special : [OUI ______ NIS | NON]
- Aide psychologique renforcee : [OUI | NON]
- Priorite d'acces : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 5C

A la fin de cette partie, tu auras verifie **3 URLs** qui couvrent **l'ensemble du systeme d'aide aux survivants de la Shoah** en Israel (3 sources de financement complementaires).

### Checklist de sortie

- [ ] URL 33 (Claims Conference) : 🔴 verdict rendu + programmes + montants 2026 + eligibilite
- [ ] URL 34 (Foundation) : verdict rendu + services + couverture geographique
- [ ] URL 35 (Misrad HaShivyon) : verdict rendu + programmes etat + post-7oct

### Importance

Les survivants de la Shoah en Israel sont **~165 000 personnes**, dont **~30% vivent en-dessous du seuil de pauvrete** (source eJewishPhilanthropy). Une partie significative est **francophone** (rescapes de France, Belgique, Afrique du Nord). Chaque euro/shekel que Tloush peut aider a reclamer pour eux a un **impact humain enorme**.

### Points d'attention

- Ce sujet est **sensible** : formulation respectueuse obligatoire dans les rapports
- Les montants **evoluent regulierement** (Claims Conference renegocie avec l'Allemagne)
- Post-guerre 2023, **plusieurs lois speciales** ont ete adoptees — il faut verifier lesquelles sont toujours en vigueur en 2026

### Prochaine etape

Une fois la partie 5C terminee et ton rapport envoye, **demande la partie 5D** qui couvre :
- PERACH (programme mentorat)
- Student Authority (etudes superieures gratuites pour olim)
- Bourses generales (universites, fondations)

---

*Fin de la partie 5C. ~25 min de travail attendu. Attends la partie 5D pour continuer.*


---

<a id="partie-5d"></a>


> Partie 5D / 5 : Etudiants — PERACH + Student Authority + Bourses generales
> Date : 2026-04-12
> Duree estimee : ~25 min

---

## Vue d'ensemble de la partie 5D

Cette partie couvre les **3 principaux benefices** disponibles pour les **etudiants** en Israel, avec un focus particulier sur les **olim etudiants**.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 36 | PERACH (programme mentorat) | P1 | 8 min |
| 37 | Student Authority pour olim | 🔴 P0 | 10 min |
| 38 | Bourses generales universites + fondations | P2 | 7 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 1 a 5C.

**Contexte** : Les etudiants sont une population **specifique** dans Tloush. Beaucoup de jeunes olim arrivent en Israel pour etudier et ont besoin d'un soutien financier. Le **Student Authority** (Minhal HaStudentim) est particulierement important car il peut **couvrir entierement** les frais de scolarite pour un olim.

---

## URL 36 : PERACH (programme mentorat / bourse)

**URL principale** : https://perach.org.il/

**URL en anglais** : https://perach.org.il/en/

**Objectif** : PERACH est un programme national de mentorat/tutorat. Les etudiants universitaires deviennent mentors pour des enfants defavorises et recoivent en retour une bourse qui couvre une partie des frais de scolarite.

**Ce que tu dois extraire** :

### A. Structure du programme 2026

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Duree mentorat par semaine | **4 heures (2 × 2h)** | ______ |
| Duree du programme annuel | non documente | ______ mois |
| Bourse annuelle | **~5 200 NIS/an** | ______ |
| Cumul avec autres bourses | possible | ______ |
| Age des enfants mentores | non documente | ______ |

### B. Eligibilite mentor

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Statut requis | **etudiant universitaire** | ______ |
| Institutions eligibles | **toutes institutions superieures** | ______ |
| Niveau (BA/MA/PhD) | non documente | ______ |
| Francophones acceptes | non documente | ______ |
| Hebreu obligatoire | non documente | ______ |

### C. Types de mentorat disponibles

- **A verifier** : il existe plusieurs "tracks" PERACH (scolaire classique, enfants en difficulte, nouveaux olim, autistes, etc.) — lister les pistes 2026
- **A verifier** : **PERACH Olim** : existe-t-il une piste speciale pour aider les enfants d'olim a l'ecole ?
- **A verifier** : piste "mentor a domicile" vs "mentor dans un centre communautaire"

### D. Procedure de candidature

- **A verifier** : quand s'inscrire (debut d'annee academique ?)
- **A verifier** : formulaire en ligne
- **A verifier** : entretien / selection
- **A verifier** : formation obligatoire

### Rapport a faire
```
### URL36_perach_program

URL source : https://perach.org.il/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Structure programme :
- Heures/semaine : ______ (Tloush : 4)
- Nb sessions : ______ (Tloush : 2)
- Duree annuelle : ______ mois
- Bourse annuelle 2026 : ______ NIS (Tloush : ~5 200)

Eligibilite mentor :
- Niveau requis : [BA | BA/MA | tous]
- Institutions eligibles : ______
- Francophones acceptes : [OUI | NON]
- Hebreu minimum requis : [OUI ______ | NON]

Types de mentorat :
- Piste scolaire classique : [OUI | NON]
- Piste enfants difficulte : [OUI | NON]
- Piste PERACH Olim : [OUI | NON]
- Piste autistes : [OUI | NON]
- A domicile vs centre : ______

Procedure :
- Periode inscription : ______
- Formulaire en ligne : [OUI | NON]
- Selection : ______
- Formation : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 🔴 URL 37 : Student Authority (Minhal HaStudentim) pour olim

**URL principale** : https://www.gov.il/he/departments/units/student_authority

**URL anglais** : https://www.gov.il/en/departments/units/student_authority

**URL Nefesh B'Nefesh** : https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/student-authority-tuition-benefits/

**URL Shivat Zion** : https://shivat-zion.com/information-portal/aliyah-benefits/aliyah-benefits-hatavot-zakaut-upratim/

**Objectif** : 🔴 **CRITIQUE**. Le **Minhal HaStudentim** est une unite du Misrad HaKlita qui **couvre entierement les frais de scolarite** des olim chadashim qui poursuivent des etudes superieures en Israel. **C'est un des benefices olim les plus genereux** et sous-utilises car peu connu.

**Ce que tu dois extraire** :

### A. Couverture offerte par le Student Authority

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Frais de scolarite couverts | **100% dans les institutions publiques** | ______ |
| Institutions eligibles (publiques) | **toutes universites israeliennes publiques** | ______ |
| Institutions eligibles (privees) | non documente | ______ |
| Niveaux couverts (BA/MA/PhD) | **BA uniquement** ou tous ? | ______ |
| Duree d'eligibilite apres alyah | **10 ans** | ______ |
| Bourses de vie (stipend) | non documente | ______ NIS/mois |

### B. Services inclus

| Service | Tloush | A verifier |
|---|---|---|
| **Counseling educatif** | reference | ______ |
| **Mechinat Olim** (preparation universite) | reference | ______ |
| **TAKA** (preparation pre-academique) | reference | ______ |
| **Support hebreu pour etudes** | non documente | ______ |
| **Aide psychologique etudiant olim** | non documente | ______ |
| **Bourse de vie supplementaire** | non documente | ______ NIS/mois |
| **Aide au logement etudiant** | non documente | ______ |

### C. Conditions d'eligibilite detaillees

- **A verifier** : age maximum pour etre eligible (souvent <30 ans ?)
- **A verifier** : statut oleh chadash obligatoire (vs citoyen israelien)
- **A verifier** : niveau minimum d'hebreu requis
- **A verifier** : exigence de bagrout ou equivalent etranger
- **A verifier** : inscription directe universite ou pre-selection Student Authority ?

### D. Procedure

- **A verifier** : quand demander (avant d'arriver en Israel ? apres ?)
- **A verifier** : formulaires
- **A verifier** : delai de reponse
- **A verifier** : possibilite de demande en francais

### E. Montant economise

- Frais de scolarite moyens en 2026 :
  - Universite publique : ~15 000 NIS/an
  - Universite privee : ~30 000 - 50 000 NIS/an
  - College (michlala) : ~20 000 NIS/an
- **Tloush** : 15 000 NIS/an estimation
- **A verifier** : chiffres actualises 2026

### Rapport a faire
```
### URL37_student_authority_olim — 🔴 CRITIQUE

URL source : https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/student-authority-tuition-benefits/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Couverture :
- Frais scolarite publiques : ______ % (Tloush : 100%)
- Institutions privees : [OUI | NON]
- Niveaux : [BA | BA/MA | BA/MA/PhD]
- Duree eligibilite : ______ ans (Tloush : 10)
- Bourse vie mensuelle : ______ NIS/mois

Services inclus :
- Mechinat Olim : ______
- TAKA : ______
- Support hebreu : [OUI | NON]
- Aide psycho : [OUI | NON]
- Logement etudiant : ______

Eligibilite :
- Age max : ______ ans
- Hebreu minimum : ______
- Bagrout/equivalent : [OUI | NON]
- Processus selection : ______

Frais scolarite 2026 :
- Universite publique : ______ NIS/an (Tloush : 15 000)
- Universite privee : ______ NIS/an
- College : ______ NIS/an

Procedure :
- Quand demander : ______
- Formulaire francais : [OUI | NON]
- Delai : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 38 : Bourses generales — universites et fondations

**URL Council for Higher Education** : https://che.org.il/en/scholarships-grants-students-faculty/student-scholarships/

**URL Hillel Israel** : https://www.hillel.org/jewish-scholarships-portal/

**URL universites majeures** :
- Hebrew University : https://en.huji.ac.il/en/page/dean-students
- Tel Aviv University : https://en-humanities.tau.ac.il/scholarships
- Bar-Ilan : https://dean-students.biu.ac.il/
- Technion : https://students.technion.ac.il/en/
- Ben-Gurion : https://in.bgu.ac.il/en/dean-students/pages/default.aspx

**Objectif** : Lister les principales **sources de bourses** disponibles pour etudiants en Israel. Tloush ne peut pas maintenir une liste exhaustive, mais une vue d'ensemble aidera les utilisateurs a savoir **ou chercher**.

**Ce que tu dois extraire** :

### A. Bourses Council for Higher Education (CHE)

- **A verifier** : quels programmes de bourses offre le CHE en 2026 ?
- **A verifier** : bourses pour etudiants olim specifiquement ?
- **A verifier** : bourses pour etudiants en situation difficile ?
- **A verifier** : bourses d'excellence academique ?

### B. Bourses universitaires (Dean of Students offices)

Chaque universite a son bureau des etudiants qui distribue des bourses internes. **A verifier pour chaque universite** :
- Existe-t-il un bureau dedie aux olim francophones ?
- Montants typiques des bourses ?
- Conditions d'attribution ?

### C. Bourses de fondations (US, France, etc.)

| Fondation | Focus | Tloush | A verifier |
|---|---|---|---|
| **JUF (Jewish United Fund)** | USA, bourses 500-5000 USD | non documente | ______ |
| **Hillel** | Global, variees | non documente | ______ |
| **Foundation Jewish Philanthropies** | USA-Israel | non documente | ______ |
| **Kerem Kayemet (KKL)** | Projets Israel | non documente | ______ |
| **JNF France** | Francophones | non documente | ______ |

### D. Bourses sociales / d'engagement

- **A verifier** : Union Nationale des Etudiants d'Israel (Histadrut HaStudentim) offre-t-elle des bourses en echange d'engagement social ?
- **A verifier** : bourses pour service civique (Sherut Leumi) ?
- **A verifier** : bourses pour benevolat ?

### Rapport a faire
```
### URL38_scholarships_general

URL source : https://che.org.il/en/scholarships-grants-students-faculty/student-scholarships/
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Bourses CHE :
- Programmes olim : ______
- Programmes difficulte : ______
- Excellence : ______
- Montants typiques : ______

Bourses universitaires (liste d'institutions verifiees) :
- Hebrew University : ______
- Tel Aviv University : ______
- Bar-Ilan : ______
- Technion : ______
- Ben-Gurion : ______
- Bureau olim francophones dispo : [OUI dans ______ | NON]

Bourses fondations (verifiees accessibles) :
- JUF : ______ USD (Tloush : non doc)
- Hillel : ______
- Foundation Jewish Phil : ______
- KKL : ______
- JNF France : ______

Bourses sociales :
- Union etudiants Israel : ______
- Sherut Leumi : ______
- Benevolat : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 5D

A la fin de cette partie, tu auras verifie **3 URLs** couvrant les **principales sources de soutien financier** pour les etudiants en Israel.

### Checklist de sortie

- [ ] URL 36 (PERACH) : verdict rendu + bourse annuelle + eligibilite + pistes
- [ ] URL 37 (Student Authority) : 🔴 verdict rendu + couverture + conditions + delais
- [ ] URL 38 (Bourses generales) : verdict rendu + liste des sources disponibles

### Importance

Les olim qui arrivent en Israel pour **etudier ou se reconvertir** sont une categorie **tres rentable** pour Tloush :
- Ils sont **jeunes** et actifs sur le web
- Ils ont besoin de **beaucoup d'aide administrative** (documents, formulaires)
- Ils sont **sous-informes** de leurs droits (ils passent plus de temps en cours que dans les bureaux)
- Un olim qui reclame **tous ses droits etudiants** peut avoir **~50 000 NIS** de benefices cumules sur une licence

Le **Student Authority** a lui seul peut couvrir **l'integralite** des frais de scolarite d'un olim — c'est un argument de vente **enorme** qu'on doit mettre en avant.

### Prochaine etape

Une fois la partie 5D terminee et ton rapport envoye, **demande la partie 5E** qui est la **derniere** du briefing. Elle couvre :
- Bonus financiers reservistes combat 2026 (Misrad HaBitachon)
- Droits des familles endeuillees IDF / victimes du terrorisme

---

*Fin de la partie 5D. ~25 min de travail attendu. Attends la partie 5E pour continuer.*


---

<a id="partie-5e"></a>


> Partie 5E / 5 : Reservistes combat 2026 + Familles endeuillees IDF
> Date : 2026-04-12
> Duree estimee : ~25 min

---

## Vue d'ensemble de la partie 5E

Cette **derniere** partie du briefing couvre les **3 derniers benefices** du catalogue, tous lies au service militaire et a ses consequences : bonus financiers pour reservistes, et droits des familles endeuillees.

| # | URL a verifier | Priorite | Temps |
|---|---|---|---|
| 39 | Bonus financiers reservistes 2026 (Misrad HaBitachon) | 🔴 P0 | 10 min |
| 40 | Droits anciens combattants IDF | P1 | 7 min |
| 41 | Familles endeuillees IDF / terrorisme | P1 | 8 min |

**Avant de commencer** : assure-toi d'avoir termine les parties 1 a 5D.

**Contexte** : Ces 3 benefices sont **extremement importants** en Israel, surtout post-guerre 2023-2025. Le gouvernement a multiplie les bonus pour les reservistes qui ont ete mobilises massivement. Tloush doit pouvoir detecter automatiquement quand un utilisateur est **eligible** a ces aides.

---

## 🔴 URL 39 : Bonus financiers reservistes combat 2026

**URL Misrad HaBitachon (Ministere de la Defense)** : https://www.gov.il/en/departments/ministry_of_defense

**URL benefices reservistes** : https://www.gov.il/en/pages/specialbenefits

**Article Ynet (vue d'ensemble)** : https://www.ynetnews.com/article/rkvvxazqex

**Article Jerusalem Post** : https://www.jpost.com/tags/idf-reserves

**URL Rights of Reservists (Kolzchut)** : https://www.kolzchut.org.il/he/%D7%94%D7%98%D7%91%D7%95%D7%AA_%D7%9C%D7%97%D7%99%D7%99%D7%9C%D7%99_%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D

**Objectif** : 🔴 **CRITIQUE POST-GUERRE**. Depuis octobre 2023, le gouvernement israelien a augmente **massivement** les benefices pour les reservistes. Tloush a ajoute 3 entrees dans le catalogue (tagmoul, combat tax credit, low income supplement) — il faut verifier qu'on n'a rien oublie.

**Ce que tu dois extraire** :

### A. Liste exhaustive des bonus reservistes 2026

Il existe **plusieurs packages cumulatifs**. Liste tout ce que tu trouves :

| Bonus | Description | Tloush | A verifier |
|---|---|---|---|
| **Tagmulei Miluim** | Compensation BL standard (deja couvert en partie 2B) | ✅ | ______ |
| **Bonus "per day"** (Maanak Yom) | Prime journaliere pendant le service | partiellement | ______ NIS/jour |
| **Bonus "per period"** (Maanak Tkufa) | Prime par periode de service | non documente | ______ NIS/periode |
| **Vouchers vacances** | Bons de vacances multi-milliers NIS | partiellement | ______ NIS valeur |
| **Bonus parental** | Aide financiere reservistes avec enfants | partiellement | ______ NIS/enfant |
| **Bonus conjoint** | Soutien au conjoint pendant le service | non documente | ______ |
| **Supplement mensuel bas revenu** | Bring up to ~9 800 NIS/mois | ✅ couvert partie 2B | ______ |
| **Tax credit points combat** | Jusqu'a 4 points (partie 3C) | ✅ couvert | ______ |
| **Bonus "wartime"** (Maanak Milchama) | Package special post-7oct | non documente | ______ |
| **Retroactive payment for past service** | Paiement retroactif pour services anciens | non documente | ______ |

### B. Eligibilite per bonus

| Element | Valeur actuelle Tloush | A verifier |
|---|---|---|
| Definition "combat role" | **role combat uniquement** | ______ |
| Jours minimum | non documente | ______ |
| Periode de reference | **annee civile 2026** | ______ |
| Rang militaire | non documente | ______ |
| Unites speciales (8200, etc.) | non documente | ______ |
| Medecins/para-medicaux | non documente | ______ |

### C. Procedure de demande

- **A verifier** : automatique via employeur / l'armee / le Misrad HaBitachon ?
- **A verifier** : quel formulaire pour chaque bonus ?
- **A verifier** : delai de paiement apres demande
- **A verifier** : possibilite de retroactivite pour 2024-2025 non demande a temps
- **A verifier** : existence d'une application mobile "Miluim" du Misrad HaBitachon

### D. Cumul

- **A verifier** : tous les bonus sont-ils cumulables entre eux ?
- **A verifier** : cumul avec tagmoulei miluim standard (partie 2B) ?
- **A verifier** : cumul avec points de credit combat (partie 3C) ?

### Rapport a faire
```
### URL39_combat_reservist_bonuses_2026 — 🔴 CRITIQUE

URL source : https://www.gov.il/en/pages/specialbenefits
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Liste des bonus 2026 :
- Maanak Yom : ______ NIS/jour
- Maanak Tkufa : ______ NIS/periode
- Vouchers vacances : ______ NIS valeur
- Bonus parental : ______ NIS/enfant
- Bonus conjoint : ______
- Bonus wartime (post-7oct) : ______
- Retroactif 2024-2025 : [OUI | NON]
- Autres bonus trouves : ______

Eligibilite combat :
- Definition officielle : ______
- Jours minimum : ______
- Periode reference : ______
- Rang min : ______
- Unites speciales : ______
- Medecins : [OUI | NON]

Procedure :
- Automatique ou demande : ______
- Formulaires : ______
- Delai paiement : ______
- App mobile Misrad HaBitachon : [OUI | NON]
- Retroactivite : ______ mois

Cumul :
- Cumul interne bonuses : [OUI | NON]
- Cumul avec tagmoulei miluim : [OUI | NON]
- Cumul avec tax credit combat : [OUI | NON]

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 40 : Droits anciens combattants IDF (veterans)

**URL Misrad HaBitachon veterans** : https://www.gov.il/en/departments/topics/idf-veterans

**URL Organization of Disabled IDF Veterans (Beit Halochem)** : https://www.bh-il.org/

**URL Zahal Disabled Veterans** : https://www.zdvo.org/

**Objectif** : Couvrir les droits des anciens combattants IDF (ceux qui ne sont plus en service) : reductions, aides speciales, reconnaissance.

**Ce que tu dois extraire** :

### A. Categories d'anciens combattants

| Categorie | Description | Tloush | A verifier |
|---|---|---|---|
| **Haval Meshuhrar** | Ancien combattant simple | non documente | ______ |
| **Neche Tsahal** | Invalide de Tsahal | reference partielle | ______ |
| **Nifga Peulot Eiva** | Victime actes hostiles | non documente | ______ |
| **Lohamim Vatikim** | Anciens combattants des guerres historiques | non documente | ______ |
| **Michrachim** | Lies aux forces de securite (police, Shabak, etc.) | non documente | ______ |

### B. Droits specifiques par categorie

| Droit | Tloush | A verifier |
|---|---|---|
| **Reductions transport** | non documente | ______ |
| **Reductions arnona** | partiellement | ______ |
| **Reductions sante / medicaments** | non documente | ______ |
| **Pensions et allocations** | partiellement | ______ NIS/mois |
| **Aide emploi / reconversion** | non documente | ______ |
| **Aide education enfants** | non documente | ______ |
| **Logement subventionne** | non documente | ______ |
| **Acces gratuit Beit Halochem** (centres de rehabilitation) | non documente | ______ |

### C. Procedure de reconnaissance

- **A verifier** : comment obtenir le statut d'ancien combattant reconnu ?
- **A verifier** : delai
- **A verifier** : difference entre "Haval Meshuhrar" et "Vatik"

### Rapport a faire
```
### URL40_combat_veteran_rights

URL source : https://www.gov.il/en/departments/topics/idf-veterans
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Categories couvertes :
- Haval Meshuhrar : ______
- Neche Tsahal : ______
- Nifga Peulot Eiva : ______
- Lohamim Vatikim : ______
- Michrachim : ______

Droits par categorie :
- Transport : ______ % reduction
- Arnona : ______ %
- Sante : ______
- Pensions : ______ NIS/mois
- Aide emploi : ______
- Education enfants : ______
- Logement : ______
- Beit Halochem : [OUI gratuit | PAYANT]

Procedure reconnaissance :
- Statut "Haval Meshuhrar" : ______
- Delai : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## URL 41 : Familles endeuillees IDF / victimes du terrorisme

**URL Misrad HaBitachon families department** : https://www.mod.gov.il/Defence-and-Security/Pages/Families.aspx

**URL Rehabilitation Department** : https://www.mod.gov.il/English/Units/Rehab/Pages/RehabilitationDepartment.aspx

**URL IDF Widows and Orphans Organization** : https://www.idfwo.org/

**URL OneFamilyFund** : https://www.onefamilyfund.org/

**Objectif** : Ce domaine est **extremement sensible** mais tres important. Les familles endeuillees (mishpachot shkulot) beneficient de **droits a vie** et de **pensions a vie**. Tloush a une entree basique dans le catalogue — il faut la completer.

**Attention** : formulation **tres respectueuse** obligatoire dans les rapports.

**Ce que tu dois extraire** :

### A. Pensions a vie pour familles endeuillees

| Beneficiaire | Tloush | A verifier |
|---|---|---|
| **Veuf/veuve** | reference | ______ NIS/mois |
| **Parents** (kimat horim shkulim) | reference | ______ NIS/mois |
| **Enfants mineurs** | non documente | ______ NIS/mois jusqu'a age X |
| **Orphelins apres 18 ans** | non documente | continuation oui/non |
| **Freres/soeurs** (bonus special) | non documente | ______ |

### B. Aides additionnelles

| Aide | Tloush | A verifier |
|---|---|---|
| **Couverture sante complete** | reference | ______ |
| **Aide au logement** | reference | ______ |
| **Soutien psychologique** | reference | gratuit ? |
| **Bonus annuel** (jour du souvenir) | non documente | ______ NIS/an |
| **Reductions transport et loisirs** | non documente | ______ |
| **Aide scolarite enfants** | non documente | ______ |
| **Aide universitaire enfants** | non documente | ______ |
| **Retraite anticipee pour parents** | non documente | ______ |

### C. Coordinateur assigne

Tloush mentionne que chaque famille endeuillee a un **coordinateur** Misrad HaBitachon qui l'accompagne. A verifier :
- **Coordinateur disponible pour toutes les familles** : OUI/NON ?
- **Combien de temps dure l'accompagnement** : a vie ? 5 ans ? sur demande ?
- **Numero dedie pour les familles** : ______

### D. Organismes d'aide complementaires

- **IDF Widows and Orphans Organization** : offre quoi ?
- **OneFamilyFund** : focus victimes terrorisme, offre quoi ?
- **Autres associations** (Yad LeBanim, etc.) : a decouvrir

### E. Post-7 octobre 2023

Apres l'attaque du 7 octobre 2023 et la guerre qui a suivi, des **lois exceptionnelles** ont ete adoptees pour les nouvelles familles endeuillees. **A verifier** :
- Nouveaux bonus crees specifiquement pour les victimes/familles de 2023-2025
- Aide psychologique intensive
- Aide pour les families des otages
- Status special pour les enfants orphelins de la guerre

### Rapport a faire
```
### URL41_bereaved_families_idf

URL source : https://www.mod.gov.il/Defence-and-Security/Pages/Families.aspx
Accessibilite : [ACCESSIBLE | BLOQUE | 404]

Pensions a vie :
- Veuf/veuve : ______ NIS/mois
- Parents : ______ NIS/mois
- Enfants mineurs : ______ NIS/mois jusqu'a age ______
- Orphelins 18+ : [continue | stop]
- Freres/soeurs : ______

Aides additionnelles :
- Couverture sante : [COMPLETE | partielle]
- Logement : ______
- Psycho : [GRATUIT | PAYANT]
- Bonus annuel : ______ NIS/an
- Reductions transport : ______
- Scolarite enfants : ______
- Universite enfants : ______
- Retraite parents : ______

Coordinateur :
- Systematique : [OUI | NON]
- Duree accompagnement : ______
- Numero dedie : ______

Organismes :
- IDF Widows : ______
- OneFamilyFund : ______
- Autres : ______

Post-7 octobre 2023 :
- Nouveaux bonus 2023-2025 : ______
- Aide otages : ______
- Orphelins de guerre : ______

Verdict : [MATCH | DIFF | UNCLEAR | NOT_FOUND]
Commentaire : ______
Date de verification : JJ/MM/AAAA
```

---

## 📊 Resume de la partie 5E (+ bilan partie 5 complete)

A la fin de cette partie, tu auras verifie les **3 dernieres URLs** du briefing et complete l'audit complet de 41 URLs officielles.

### Checklist de sortie partie 5E

- [ ] URL 39 (Combat reservistes 2026) : 🔴 verdict rendu + liste exhaustive des bonus + cumul
- [ ] URL 40 (Anciens combattants) : verdict rendu + categories + droits
- [ ] URL 41 (Familles endeuillees) : verdict rendu + pensions + post-7oct

### Bilan partie 5 complete (5A + 5B + 5C + 5D + 5E)

| Sous-partie | Theme | URLs | Duree |
|---|---|---|---|
| 5A | Arnona 3 grandes villes | 3 | 30 min |
| 5B | Arnona 5 villes moyennes | 5 | 35 min |
| 5C | Holocaust survivors | 3 | 25 min |
| 5D | Etudiants | 3 | 25 min |
| 5E | Reservistes + familles endeuillees | 3 | 25 min |
| **Total partie 5** | **Mairies + cas speciaux** | **17** | **~140 min** |

### Bilan global du briefing complet (parties 1 a 5E)

| Partie | URLs | Duree |
|---|---|---|
| 1 (contexte) | 0 | 10 min |
| 2A (BL famille/maternite/retraite) | 5 | 45 min |
| 2B (BL survivors/invalidite/chomage/miluim) | 5 | 45 min |
| 3A (tax brackets + Nekudot + Section 66) | 3 | 25 min |
| 3B (Oleh schedule + loi 2026) | 2 | 25 min |
| 3C (BL US + combat credit) | 2 | 15 min |
| 4A (Klita: Sal Klita + Ulpan) | 3 | 30 min |
| 4B (HaShikun: loyer + mashkanta + mas rechisha + diur) | 4 | 40 min |
| 5A (Arnona 3 grandes villes) | 3 | 30 min |
| 5B (Arnona 5 villes moyennes) | 5 | 35 min |
| 5C (Holocaust) | 3 | 25 min |
| 5D (Etudiants) | 3 | 25 min |
| 5E (Reservistes + endeuilles) | 3 | 25 min |
| **TOTAL GLOBAL** | **41 URLs** | **~6h45** |

### Importance finale

Ces 41 URLs couvrent **l'integralite** du catalogue de benefices Tloush (44 entrees). A la fin de ce travail, tu auras produit un rapport complet qui permettra :

1. De **corriger** les valeurs inexactes dans `src/lib/benefitsCatalog.ts`
2. D'**ajouter** les benefices manquants que tu aurais decouverts
3. De **mettre a jour** la confidence de chaque entree
4. De **renouveler** les dates de verification (`verified_at`)
5. De **raffiner** les conditions d'eligibilite avec les vrais criteres

### Action finale : consolidation

Apres ton rapport 5E, **demande le document consolide** qui rassemble toutes les parties (1 a 5E) en un seul fichier a utiliser comme reference primaire.

---

*Fin de la partie 5E. ~25 min de travail attendu. C'est la DERNIERE partie du briefing.*

**Merci pour ton travail de verification.** Ton rapport permettra de rendre Tloush juridiquement fiable et d'aider concretement des milliers d'olim francophones a ne plus perdre de droits.


---

## Fin du document consolide

**Merci pour ton travail de verification.** Ton rapport permettra de rendre Tloush juridiquement fiable et d aider concretement des milliers d olim francophones a ne plus perdre de droits.

*Document consolide genere le 2026-04-13 a partir de 13 parties (4 639 lignes, 41 URLs).*
