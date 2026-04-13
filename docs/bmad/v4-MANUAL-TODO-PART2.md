# Tloush V4 — A verifier manuellement (Partie 2/2 : PRIORITES 2 et 3)

> **Date** : 13/04/2026
> **Duree estimee** : ~1h30
> **Prerequis** : avoir complete la Partie 1 (P1 items urgents)

## 📋 Contexte

Ces entrees sont **masquees en production** (moins critiques que la Partie 1).
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
