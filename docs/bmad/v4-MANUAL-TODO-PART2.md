# Tloush V4 — A verifier manuellement (Partie 2/2 : PRIORITES 2 et 3) — ✅ RESOLU

> **Date** : 13/04/2026
> **Statut** : ✅ **TOUS LES ITEMS P2/P3 ONT ETE VERIFIES ET APPLIQUES**
>
> Claude cowork a verifie les items via navigateur reel sur les sites officiels
> (kolzchut.org.il, btl.gov.il, gov.il, che.org.il, ynetnews, cpa-dray.com)
> et transmis les valeurs en clair dans le chat.
> Les corrections ont ete appliquees au catalogue le 13/04/2026.
>
> Les plafonds Miluim (1 730.33 NIS/jour, 51 910 NIS/mois) ont ete confirmes
> par recoupement : SMB officiel 2026 × coefficients legaux = memes chiffres
> sur plusieurs sources.
>
> Voir `docs/bmad/v4-COWORK-REPORT.md` pour le rapport source complet.

## Resolution detaillee

### ✅ RESOLUS
- **Hashlamat Hachnasa** : seuils 4 375 / 6 912 NIS + plafonds patrimoine
  → appliques dans `old_age_income_supplement`
- **Survivor spouse** : 1 381 / 1 838 / 1 941 (sans enfant par age) + 2 700 / 3 562 (avec enfants)
  → appliques dans `survivor_pension_spouse`
- **Survivor orphan** : 1 142 (seul) / 862 (multi) / 2 284 (double orphelin)
  → appliques dans `survivor_pension_orphan`
- **Mobility allowance** : 1 807-6 493 NIS/mois + pret 90 000 NIS
  → appliques dans `mobility_allowance`
- **Arnona olim** : TLV/JM/Haifa/BS/Rishon 90%, Netanya 81%, Ashdod 70-90% selon zone
  → appliques dans `arnona_olim`
- **Bereaved families** : 10 525-18 512 NIS + supplement post-7/10/2023 de +13 566 NIS
  → appliques dans `bereaved_family_benefits`
- **Combat reservist bonuses** : credit 5 000 + 80/jour + voucher 3 500-4 500 + aide parentale 10 000
  → appliques dans `combat_reservist_bonuses_2026`
- **Combat veteran rights** : remise terrain 100 000 NIS HT + zone 10/20/35%
  → appliques dans `combat_veteran_rights`
- **Student scholarships** : Keren Sahaf 4 000/6 240/12 480 + prets 7 000
  → appliques dans `student_scholarships_general`
- **PERACH** : ~6 430 NIS/an + bonus reservistes 10j +2 600 NIS
  → applique dans `perach_scholarship`
- **Section 66 young child** : bonus 2022 "mere +1 pt 6-17 ans" NON reconduit en 2026
  → applique dans `credit_young_child`
- **Nekoudot schedule 2022+** : mois 1-12=1pt, 13-30=3pts, 31-42=2pts, 43-54=1pt
  → applique dans `israeliPayroll.ts` (nouvelle fonction `computeOlehPoints`)
  → applique dans `employeeRights.ts` (calcul par mois et non plus par annee)
- **Miluim plafonds** : 1 730.33 NIS/jour + 51 910 NIS/mois confirmes par recoupement
  (SMB 2026 × coefficients legaux = memes chiffres sur plusieurs sources)
  → deja presents dans `tagmulei_miluim` (commit 6836715)

## 📋 Contexte original

Ces entrees etaient **masquees en production** avant la resolution Claude cowork.
Elles peuvent attendre une 2e iteration apres la stabilisation du catalogue.

---

## 🟡 PRIORITE 2 — Items avec impact moyen

### P2.1 — Hashlamat Hachnasa (Income Support retraites)

**Slug** : `old_age_income_supplement`
**URL** : https://www.btl.gov.il/benefits/Old_age/IncomeSupplement/Pages/default.aspx
**Kolzchut** : https://www.kolzchut.org.il/he/השלמת_הכנסה_לקצבת_זקנה

**Valeurs a trouver (2026)** :
- Seuil minimum individu
- Seuil minimum couple
- Seuil minimum couple + enfants
- Seuil patrimoine disqualifiant (epargne max)
- Plafond revenus autres sources

---

### P2.2 — Pension survivant conjoint

**Slug** : `survivor_pension_spouse`
**URL** : https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx
**Kolzchut** : https://www.kolzchut.org.il/he/קצבת_שאירים

**Valeurs a trouver** :
- Pension base conjoint seul
- Pension conjoint avec 1 enfant
- Pension conjoint avec 2+ enfants
- Supplement grossesse/conge maternite (+30% ?)
- Supplement anciennete (2%/an ?)

---

### P2.3 — Pension survivant orphelin

**Slug** : `survivor_pension_orphan`
**URL** : https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx

**Valeurs a trouver** :
- Pension par enfant mineur
- Age limite (18 ans ou 20 ans si etudes ?)
- Cumulable avec pension conjoint ?

---

### P2.4 — Mobility Allowance (allocation mobilite)

**Slug** : `mobility_allowance`
**URL** : https://www.btl.gov.il/benefits/Mobility/Pages/default.aspx
**Kolzchut** : https://www.kolzchut.org.il/he/קצבת_ניידות

**Valeurs a trouver** :
- Taux minimum d'incapacite mobilite requis (40% ?)
- Allocation mensuelle niveau 1 / 2 / 3
- Plafond pret vehicule (etait 92 000 NIS)
- Taux d'interet du pret vehicule
- Montant reduction taxe vehicule

---

### P2.5 — Miluim — plafonds a confirmer

**Slug** : `tagmulei_miluim`
**URL** : https://www.btl.gov.il/benefits/Reserve_Service/Pages/default.aspx

**Valeurs actuelles (a confirmer)** :
- Plafond journalier 2026 : **1 730.33 NIS** (methodologie confirmee, chiffre a valider)
- Plafond mensuel 2026 : **51 910 NIS**

**Note** : les planchers (310.52 / 9 316 NIS) ont deja ete corriges dans
l'audit du 13/04. Il reste a confirmer les plafonds.

---

## 🟢 PRIORITE 3 — Items a faire quand on a le temps

### P3.1 — Arnona autres villes (hors TLV/JM)

**Slug** : `arnona_olim` (entree generique deja en production pour TLV/JM)

**Villes a verifier individuellement** :

| Ville | URL mairie | % reduction | m² max | Duree |
|-------|------------|-------------|--------|-------|
| Haifa | https://www.haifa.muni.il/ | ____ | ____ | ____ |
| Netanya | https://www.netanya.muni.il/ | ____ | ____ | ____ |
| Ra'anana | https://www.raanana.muni.il/ | ____ | ____ | ____ |
| Ashdod | https://www.ashdod.muni.il/ | ____ | ____ | ____ |
| Herzliya | https://www.herzliya.muni.il/ | ____ | ____ | ____ |
| Be'er Sheva | https://www.beer-sheva.muni.il/ | ____ | ____ | ____ |
| Ramat Gan | https://www.ramat-gan.muni.il/ | ____ | ____ | ____ |
| Rishon LeTsion | https://www.rishonlezion.muni.il/ | ____ | ____ | ____ |

**Comment verifier** : aller sur le site de chaque mairie, section
"הנחה בארנונה" (hanacha be'arnona), chercher "עולה חדש" (oleh chadash).

Si toutes les villes ont le meme taux (90%), creer une variable
`ARNONA_OLIM_RATE = 90` dans le catalogue. Si ecart, creer un tableau
par ville.

---

### P3.2 — Section 66 enfants (fiscal)

**Question** : le bonus 2022-2025 de **+1 point par enfant 6-17 ans pour la mere**
est-il prolonge en 2026 ?

**URL** : https://www.gov.il/en/departments/israel_tax_authority
**Kolzchut** : https://www.kolzchut.org.il/he/נקודות_זיכוי_לאמא_עבור_ילדים

**Valeurs a confirmer** :
- Table pere : points par enfant selon age
- Table mere : points par enfant selon age
- Bonus +1 point mere pour enfants 6-17 ans en 2026 : [OUI / NON]
- Ou trouver le formulaire tofes 101 officiel

---

### P3.3 — Oleh schedule 2022+ (verifier annee 2)

**Question** : la valeur annualisee **Annee 2 = 2.5 points** est-elle exacte ?

**Contexte** : le schedule 2022+ est de 1 / 3 / 2.5 / 1.5 / 0.5 points
sur 4.5 ans. Mais "2.5 points annee 2" est une approximation annualisee.
Les sources officielles donnent parfois :
- Annee 2 mois 1-6 : 3 points
- Annee 2 mois 7-12 : 2 points
- Moyenne = 2.5 points

**A verifier** : la moyenne annualisee est-elle bien 2.5 ou faut-il
decomposer par semestre ?

---

### P3.4 — Combat reservist bonuses 2026

**Slug** : `combat_reservist_bonuses_2026`
**URL** : https://www.gov.il/en/pages/specialbenefits
**Ynet article** : https://www.ynetnews.com/article/rkvvxazqex

**Valeurs a trouver** :
- Bonus financier exact par jour de miluim combat
- Aide parentale (montant et conditions)
- Vouchers vacances (montant)
- Duree minimum miluim pour declencher les benefits
- Notification 2-3 mois avant miluim : automatique ?

---

### P3.5 — Combat veteran rights

**Slug** : `combat_veteran_rights`
**URL** : https://www.mod.gov.il/

**Valeurs a trouver** :
- Reductions transport (%)
- Reductions arnona (%)
- Couverture sante (Kupat Holim ?)
- Bourses education
- Aide logement

---

### P3.6 — Bereaved family benefits

**Slug** : `bereaved_family_benefits`
**URL** : https://www.mod.gov.il/
**Kolzchut** : https://www.kolzchut.org.il/he/זכויות_משפחות_שכולות

**Valeurs a trouver** :
- Pension mensuelle exacte pour veufs/veuves de soldats
- Pension par enfant orphelin
- Aide parentale (kimat horim shkulim)
- Couverture sante complete (Kupat Holim ?)
- Aide au logement

---

### P3.7 — Student scholarships (general)

**Slug** : `student_scholarships_general`
**URL** : https://che.org.il/en/scholarships-grants-students-faculty/student-scholarships/

**Sources a explorer** :
- Tel Aviv University : dean of students
- Hebrew University : dean of students
- Bar Ilan : dean of students
- Fondations privees francophones (JUF, Israel Sci-Tech)

**A extraire** : liste des bourses les plus courantes pour olim francophones.

---

## 📝 Comment reactiver une entree

Une fois qu'une valeur est confirmee, ouvrir `src/lib/benefitsCatalog.ts` et :

```typescript
// AVANT (masque en production)
{
  slug: 'EXEMPLE',
  // ...
  confidence: 'low',
  status: 'needs_verification',
  verified_at: '2026-04-13',
}

// APRES (affiche en production)
{
  slug: 'EXEMPLE',
  // ... avec les vraies valeurs
  estimated_annual_value: XXX,
  typical_monthly_amount: XXX,
  confidence: 'high',
  status: 'verified',
  verified_at: '2026-MM-JJ',
  notes: 'Confirme via [source] le MM/JJ/2026',
}
```

Puis commit + push :
```bash
git add src/lib/benefitsCatalog.ts
git commit -m "feat(catalog): verify and enable [slug]"
git push
```

---

## 📊 Resume global

### Etat actuel du catalogue (post-audit 13/04/2026)

| Status | Nombre |
|--------|-------|
| ✅ `verified` (affiche en production) | ~28 |
| 🔴 `needs_verification` (masque) | ~14 |
| **Total** | **~42** |

### Entrees masquees par priorite

- **P1 (Partie 1)** : 3 entrees — Sal Klita, Rental Assistance, Mashkanta
- **P2 (Partie 2)** : 5 entrees — Hashlamat, Survivor spouse, Survivor orphan, Mobility, Miluim plafonds
- **P3 (Partie 2)** : 6 entrees — Arnona villes, Section 66, Oleh schedule, Combat bonuses, Veteran rights, Bereaved, Scholarships

### Objectif

Passer toutes les entrees P1 a `verified` pour debloquer les olim en
production (P1 = items qui touchent **directement** le porte-monnaie).

Les entrees P2/P3 peuvent suivre en iteration 2.

---

*Partie 2/2 — duree estimee ~1h30. A faire apres la Partie 1.*
