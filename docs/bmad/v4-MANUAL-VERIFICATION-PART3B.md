# Tloush V4 — Briefing de verification manuelle

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
