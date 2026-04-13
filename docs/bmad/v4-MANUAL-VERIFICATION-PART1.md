# Tloush V4 — Briefing de verification manuelle

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
