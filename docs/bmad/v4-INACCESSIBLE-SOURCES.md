# Tloush V4 — Sources officielles inaccessibles

> Version: 1.0
> Date: 2026-04-12
> Statut: Document vivant

Ce document liste toutes les sources officielles qu'il n'a pas ete
possible de verifier automatiquement (WebFetch bloque en 403, pas d'API,
etc.) et precise exactement quelles informations aller chercher a la
prochaine revue.

---

## Pourquoi cette liste existe

Notre catalogue `src/lib/benefitsCatalog.ts` contient 44+ benefices avec
des valeurs estimees. Certaines sont verifiees via Google/recherche web,
d'autres proviennent de sites tiers fiables mais nous n'avons pas pu
confirmer contre la source primaire.

Ce document permet a un admin (ou a un yoetz mas mandate) de valider
manuellement chaque valeur en un coup d'oeil.

---

## Categorie 1 : Pages BTL bloquees en WebFetch (403)

Ces pages sont la source de verite officielle mais retournent 403 sur
WebFetch. Il faut les ouvrir manuellement dans un navigateur.

### 1.1 — Page principale des baremes BL 2026
- **URL** : https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx
- **Statut** : ✅ Confirme via recherche web (Google Search)
- **A verifier** :
  - Valeurs exactes des allocations par categorie
  - Date de derniere mise a jour CPI
  - Liens vers pages detaillees par beneficiaire
- **Frequence** : 1x/an en janvier (indexation CPI)

### 1.2 — Kitsbat Yeladim
- **URL** : https://www.btl.gov.il/benefits/children/Pages/שיעורי%20הקצבה.aspx
- **Statut** : ⚠️ Chiffres 2026 (173/219) confirmes via tiers, a verifier sur BTL directement
- **A verifier** :
  - Montants exacts 2026 : 173 NIS (enfant 1), 219 NIS (enfants 2-4), 173 NIS (enfant 5+)
  - Eligibilite savings account "Chisachon LeKol Yeled" (57 NIS/mois)
  - Supplement income-tested pour familles a bas revenu
- **Frequence** : 1x/an

### 1.3 — Miluim (Tagmulei Miluim)
- **URL** : https://www.btl.gov.il/benefits/Reserve_Service/Pages/שיעורי%20הקצבה.aspx
- **Statut** : ✅ Chiffres 2026 confirmes : 1730.33 max / 328.76 min / formule 3 mois / 90
- **A verifier** :
  - Plafond mensuel 51 910 NIS
  - Plancher mensuel 9 863 NIS
  - Formule : (salaire 3 mois precedents) / 90
  - Bonus wartime : verifier si les supplements 2024-2025 sont toujours actifs en 2026
- **Frequence** : 1x/an

### 1.4 — Old Age Pension (Kitsbat Zikna)
- **URL** : https://www.btl.gov.il/benefits/Old_age/Pages/default.aspx
- **Statut** : ⚠️ Montants 2026 approximatifs dans le catalogue
- **A verifier** :
  - Montants exacts 2026 (~1 879 NIS/mois individu approximatif)
  - Supplement anciennete (2%/an)
  - Age 80+ bonus (~50 NIS/mois)
  - Seuil income test 67-70 ans
- **Frequence** : 1x/an

### 1.5 — Disability (Nekhout Klalit)
- **URL** : https://www.btl.gov.il/benefits/Disability/Pages/default.aspx
- **Statut** : ⚠️ Chiffres 2024 dans le catalogue (~4 291 NIS/mois), 2026 non confirme
- **A verifier** :
  - Taux plein 100% 2026
  - Grille proportionnelle 50/60/75%
  - Attendance allowance 2026 : 50% / 112% / 188%
  - Mobility allowance : montants exacts + seuils taxes vehicule
- **Frequence** : 1x/an (post-reforme 2021, indexe salaire moyen)

### 1.6 — Maternity (Dmei Leida)
- **URL** : https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx
- **Statut** : ✅ Duree 26/15 semaines confirmee, plafond ~12 550 NIS/mois a re-verifier
- **A verifier** :
  - Plafond salaire moyen economie 2026 (pour calcul dmei leida)
  - Duree paternite max (20 semaines confirmee)
  - Conditions exactes pour les 10/14 et 15/22 mois de cotisation
- **Frequence** : 1x/an

### 1.7 — Unemployment (Dmei Avtala)
- **URL** : https://www.btl.gov.il/benefits/Unemployment/Pages/default.aspx
- **Statut** : ✅ Chiffres 2026 confirmes (550.76 jours 1-125, 367.17 ensuite)
- **A verifier** :
  - Seuils par tranche d'age (100/138/175 jours)
  - Nombre minimum de mois cotises (12/18)
- **Frequence** : 1x/an

### 1.8 — Survivor Benefits (Kitsbat Sheirim)
- **URL** : https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx
- **Statut** : ⚠️ Montants 2026 approximatifs
- **A verifier** :
  - Montant veuf sans enfant (~1 879)
  - Montant veuf avec enfants (~2 350)
  - Pension orphelin par enfant (~1 400)
  - Supplement grossesse (+30%)
- **Frequence** : 1x/an

### 1.9 — Maanak Leida (prime de naissance)
- **URL** : https://www.btl.gov.il/benefits/Maternity/Pages/MaanakLeyda.aspx
- **Statut** : ✅ Chiffres 2026 confirmes
- **A verifier** :
  - Enfant 1 : 2 103 NIS
  - Enfant 2 : 946 NIS
  - Enfant 3+ : 631 NIS
  - Jumeaux : 10 514 NIS
  - Triples : 15 771 NIS
- **Frequence** : 1x/an

---

## Categorie 2 : Tax Authority (Rashut HaMisim)

### 2.1 — Page principale 2026
- **URL** : https://www.gov.il/he/departments/israel_tax_authority
- **Statut** : ⚠️ Partiellement accessible
- **A verifier** :
  - Valeur point de credit 2026 (242 NIS/mois en 2025, probablement gele)
  - Salaire minimum 2026
  - Seuils brackets d'impot (geles 2025-2027 par la loi)

### 2.2 — Oleh 2026 Tax Exemption (NOUVELLE LOI)
- **URL** : https://www.gov.il/en/pages/tax-reforms-for-new-olim
- **Statut** : ✅ Confirme via Times of Israel + recherche web
- **A verifier** :
  - 0% 2026-2027
  - 10% 2028
  - 20% 2029
  - 30% 2030
  - Plafond 1M NIS/an
  - Date d'effet (1er janvier 2026 confirmee)
- **Note** : LOI NOUVELLE FIN 2025. A faire valider par un yoetz mas.

### 2.3 — Nekudot Zikui pour enfants
- **URL** : Section 66 du code des impots + circulaire MS
- **Statut** : ⚠️ Simplification dans le catalogue
- **A verifier** :
  - Table exacte par parent (mere/pere)
  - Par age exact (0, 1-5, 6-12, 13-17)
  - Bonus reforme 2022-2025 (eventuelle prolongation 2026)
  - Acces via kolzchut : https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה

---

## Categorie 3 : Misrad HaKlita (Ministere de l'Absorption)

### 3.1 — Sal Klita
- **URL** : https://www.gov.il/en/life-events/immigration-and-assimilation
- **Statut** : ⚠️ Montants approximatifs dans le catalogue (~4 500/6 500/8 500 NIS/mois)
- **A verifier** :
  - Grille exacte 2026 par age et statut familial
  - Nombre de versements (6)
  - Dates de versement (1-15 chaque mois)
  - Conditions de suspension

### 3.2 — Ulpan
- **URL** : https://shivat-zion.com/information-portal/first-steps-in-israel/ulpan/
- **Statut** : ✅ Structure confirmee (5 mois, 5j/semaine, 5h/jour)
- **A verifier** :
  - Liste des ulpans disponibles par ville
  - Dates de demarrage
  - Ulpans specialises (medecins, ingenieurs, artistes)

### 3.3 — Rental Assistance (Siuah Sechar Dira)
- **URL** : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants
- **Statut** : ⚠️ Fourchette 1 000 - 3 000 NIS/mois dans le catalogue
- **A verifier** :
  - Grille exacte 2026 par ville/famille/niveau
  - Duree : 30 mois vs 5 ans (changement mars 2024)
  - Date de debut post-Sal Klita (7e ou 8e mois)

### 3.4 — Mashkanta Le'Ole
- **URL** : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants
- **Statut** : ⚠️ Montants approximatifs
- **A verifier** :
  - Taux d'interet 2026 vs marche
  - Plafond du pret preferentiel (~300 000 NIS)
  - Apport minimum requis (5-15%)
  - Duree de validite (15 ans post-alyah)

---

## Categorie 4 : Arnona (mairies)

Chaque mairie a ses propres baremes — impossible de tout lister.

### 4.1 — Tel Aviv-Yafo
- **URL** : https://www.tel-aviv.gov.il/
- **Statut** : ❌ Non verifie
- **A verifier** : Baremes specifiques olim, handicap, retraite, etudiant

### 4.2 — Jerusalem
- **URL** : https://www.jerusalem.muni.il/
- **Statut** : ❌ Non verifie

### 4.3 — Haifa
- **URL** : https://www.haifa.muni.il/
- **Statut** : ❌ Non verifie

### 4.4 — Ashdod / Netanya / Ra'anana / Herzliya
- **Statut** : ❌ Non verifies

**Action recommandee** : Pour chaque utilisateur declarant une municipalite, ajouter un lien direct vers la page arnona de sa mairie dans le rights detector, plutot que d'essayer de hardcoder les baremes.

---

## Categorie 5 : Loi nouvelle 2026 (priorite haute)

### 5.1 — Olim 2026 Full Tax Exemption
- **URL source** : https://www.gov.il/en/pages/tax-reforms-for-new-olim
- **Article source** : https://www.timesofisrael.com/israel-unveils-0-tax-rate-for-2026s-immigrants-and-returning-residents/
- **Statut** : ✅ Confirme via plusieurs sources tierces
- **A verifier URGENT** :
  - Texte exact de la loi (Reshumot / Nevo)
  - Date d'entree en vigueur exacte
  - Definition "returning resident" (toshav chozer)
  - Interaction avec autres exemptions (BL pour americains)
  - Cas d'exclusions

### 5.2 — Combat Reservists Tax Credit Points
- **Statut** : ⚠️ Nouveaute 2026, details incertains
- **A verifier** :
  - Maximum de points (4 ?)
  - Taux de conversion jours service -> points
  - Definition "combat role"
  - Procedure de declaration (tofes special ?)

### 5.3 — BL Exemption for American Olim (5 ans)
- **Statut** : ⚠️ Confirme via P. Stein mais details incomplets
- **A verifier** :
  - Seuil de revenu (si applicable)
  - Procedure de demande (tofes specifique)
  - Interaction avec Mas Briut (taxe sante) — elle est separee ?

### 5.4 — Havraa Freeze Law 2025
- **Statut** : ✅ Confirme pour 2025 (-1 jour retenu)
- **A verifier** : Est-ce que la reduction continue en 2026 ?

---

## Categorie 6 : Informations clairement manquantes

Ces informations n'ont pas pu etre trouvees via recherche web et
necessiteraient un expert local.

### 6.1 — Montant exact des arnona pour 100m² a Jerusalem en 2026
### 6.2 — Liste officielle des kupat holim qui ont le Silver/Gold/Platinum levels
### 6.3 — Procedure exacte pour obtenir le Teudat Zakaut (mashkanta olim)
### 6.4 — Date effective de l'exemption BL 5 ans pour olim americains
### 6.5 — Difference exacte entre "hore yachid" et "hore gaurouch" (points credit)

---

## Checklist de verification trimestrielle

A faire chaque trimestre par l'admin ou par un yoetz mas mandate :

- [ ] Ouvrir chaque URL de la Categorie 1 (BTL) et verifier les valeurs
- [ ] Mettre a jour `src/lib/benefitsCatalog.ts` avec les nouvelles valeurs
- [ ] Mettre a jour `src/lib/legalWatch.ts` pour le tracking admin
- [ ] Incrementer `verified_at` sur chaque constante verifiee
- [ ] Commit avec message `chore(legal-watch): refresh Q[X] [YEAR]`
- [ ] Execute `npx tsc --noEmit` pour valider
- [ ] Deploy

---

## Script de verification recommande (non implemente)

Pour une verification semi-automatique, il faudrait :

1. Un proxy WebFetch contournant le 403 (ex: Browserless.io, Scrapfly)
2. Un script qui va chercher chaque page des Categories 1-5
3. Extraction des montants via regex ou IA (Claude API)
4. Comparaison avec le catalogue actuel
5. Alerte email si divergence

**Estimation** : ~4h de dev + ~$15/mois (Browserless.io tier basique)

---

## Contacts utiles pour validation manuelle

- **Bituach Leumi** : 6050* ou https://www.btl.gov.il/he/service/personal_service
- **Rashut HaMisim** : 4954*
- **Misrad HaKlita** : 2970*
- **Nefesh B'Nefesh** : https://www.nbn.org.il/ (service gratuit pour olim francophones)
- **Chaim V'Chessed** : https://chaimvchessed.com/ (service gratuit)
- **Associations francophones en Israel** : consulats + KKL + OSM

---

## Historique des revisions

| Date | Version | Par | Changes |
|---|---|---|---|
| 2026-04-12 | 1.0 | Claude Code | Document initial cree |
