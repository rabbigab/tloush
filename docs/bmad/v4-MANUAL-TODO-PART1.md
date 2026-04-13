# Tloush V4 — A verifier manuellement (Partie 1/2 : PRIORITE 1) — ✅ RESOLU

> **Date** : 13/04/2026
> **Statut** : ✅ **TOUTES LES VALEURS ONT ETE VERIFIEES ET APPLIQUEES**
>
> Claude cowork a verifie les 3 items via navigateur reel sur les sites officiels
> (nbn.org.il, gov.il) et transmis les valeurs en clair dans le chat.
> Les corrections ont ete appliquees au catalogue le 13/04/2026.
>
> Voir `docs/bmad/v4-COWORK-REPORT.md` pour le rapport source complet.

## Resolution

**Sal Klita** : 21 694 NIS (celib) / 41 359 (couple) / 50 888 (couple pre-retraite) /
35 071 (parent isole) / 26 785 (retraite seul 67+) + supplements enfants 0-4/4-17/18-21.
Appliques dans `benefitsCatalog.ts` entree `sal_klita`.

**Rental Assistance** : 24 versements auto mois 7-30, pas de test de revenus.
Centre 363/659/739 NIS, Nord/Haifa/Sud 1336/2000/2239 NIS.
Appliques dans `benefitsCatalog.ts` entree `rental_assistance_olim`.

**Mashkanta** : 300 000 NIS max (pas 200 000), taux BoI-0.5% plafonne a 3%, 30 ans,
fenetre eligibilite 15 ans. Teudat Zakaut delivre par la banque.
Appliques dans `benefitsCatalog.ts` entree `mashkanta_olim`.

---

## 📜 Contenu original de la Partie 1 (pour reference)

> **Duree estimee** : ~45 min
> **Objectif** : verifier les 3 items les plus critiques pour debloquer
> les olim en production.

## 📋 Contexte

Apres l'audit du 13/04/2026, 3 entrees du catalogue ont un ecart significatif
entre sources et ont ete **masquees en production** (le rights detector ne
les affiche plus aux utilisateurs).

Pour les **reactiver en production**, il faut :
1. Ouvrir l'URL officielle dans un navigateur (VPN israelien si necessaire)
2. Trouver les valeurs exactes 2026
3. Mettre a jour `src/lib/benefitsCatalog.ts`
4. Passer `status: 'verified'` + `confidence: 'high'`

---

## 🔴 P1.1 — Sal Klita (panier d'integration)

**Slug** : `sal_klita`
**Autorite** : Misrad HaKlita

### Probleme
Ecart enorme entre les sources :
- Tloush avait : 4 500 / 6 500 / 8 500 NIS/mois (celibataire / couple / couple+2)
- Sources tierces : 1 200 / 2 800 / 4 400 NIS/mois
- Ratio : x2 a x3 de difference

### Sources officielles

- **Calculateur NBN (le plus fiable)** : https://www.nbn.org.il/life-in-israel/aliyah-rights-and-benefits/sal-klita-calculator/
- **Page gov.il** : https://www.gov.il/en/life-events/immigration-and-assimilation
- **Misrad HaKlita** : https://www.gov.il/en/departments/units/aliyah-integration-ministry

### Valeurs a trouver (2026)

Simuler chaque profil dans le calculateur NBN :

| Profil | Valeur a trouver |
|--------|-----------------|
| Celibataire 25 ans | ____ NIS/mois × 6 |
| Celibataire 40 ans | ____ NIS/mois × 6 |
| Couple 30-35 ans | ____ NIS/mois × 6 |
| Couple + 1 enfant | ____ NIS/mois × 6 |
| Couple + 2 enfants | ____ NIS/mois × 6 |
| Couple + 3 enfants | ____ NIS/mois × 6 |
| Famille monoparentale + 2 enfants | ____ NIS/mois × 6 |
| Retraite seul (65+) | ____ NIS/mois × 6 |
| Retraite couple (65+) | ____ NIS/mois × 6 |

### Comment reactiver

Une fois les valeurs trouvees, ouvrir `src/lib/benefitsCatalog.ts` ligne ~1148
et remplacer l'entree `sal_klita` par :

```typescript
{
  slug: 'sal_klita',
  // ...
  estimated_annual_value: VALEUR_MOY * 6,  // total sur 6 mois
  typical_monthly_amount: VALEUR_MOY,
  value_unit: 'NIS/mois sur 6 mois',
  confidence: 'high',
  status: 'verified',
  verified_at: '2026-MM-JJ',
  notes: 'Verifie via calculateur NBN le MM/JJ/2026',
}
```

---

## 🔴 P1.2 — Aide au loyer olim (rental_assistance_olim)

**Slug** : `rental_assistance_olim`
**Autorite** : Misrad HaShikun

### Probleme
Montants exacts par profil non confirmes dans les sources tierces.

### Sources officielles

- **Page gov.il** : https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants
- **NBN rental assistance** : https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/rental-assistance/
- **Misrad HaShikun** : https://www.gov.il/en/departments/ministry_of_construction_and_housing

### Valeurs a trouver (2026)

| Profil + ville | Valeur a trouver |
|----------------|------------------|
| Celibataire, Tel Aviv | ____ NIS/mois |
| Celibataire, Jerusalem | ____ NIS/mois |
| Celibataire, Be'er Sheva (peripherie) | ____ NIS/mois |
| Couple sans enfant, Tel Aviv | ____ NIS/mois |
| Couple + 2 enfants, Tel Aviv | ____ NIS/mois |
| Couple + 2 enfants, Haifa | ____ NIS/mois |
| Couple + 2 enfants, Ashdod | ____ NIS/mois |

### Questions a clarifier

1. **Duree exacte 2026** : pour un oleh arrivant en 2026, est-ce que c'est 30 mois ou
   4-5 ans ? La reforme mars 2024 a-t-elle change cela ?
2. **Plafond revenu** : y a-t-il un seuil de revenu au-dessus duquel l'aide est supprimee ?
3. **Cumul** : est-ce cumulable avec Sal Klita les 6 premiers mois ?

### Comment reactiver

Ouvrir `src/lib/benefitsCatalog.ts` ligne ~1215 et remplacer l'entree `rental_assistance_olim`
avec les valeurs moyennes + un tableau par profil dans `full_description_fr`.

---

## 🔴 P1.3 — Mashkanta Olim (pret immobilier olim)

**Slug** : `mashkanta_olim`
**Autorite** : Misrad HaShikun

### Probleme
Divergence entre les sources sur le montant du pret preferentiel :
- Source A : 200 000 NIS
- Source B : 300 000 NIS

Un facteur 1.5x entre les deux chiffres — il faut trancher.

### Sources officielles

- **Misrad HaShikun — Mashkanta Olim** : https://www.gov.il/en/service/mashkanta_benefits_olim
- **Easy Aliyah (context)** : https://www.easyaliyah.com/aliyah-benefits-mortgage-discount
- **Nefesh B'Nefesh guide** : https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/mortgages/

### Valeurs a trouver (2026)

| Element | Valeur a trouver |
|---------|------------------|
| Montant du pret preferentiel (en NIS) | ____ |
| Taux d'interet applique | ____ % |
| Apport personnel minimum | ____ % |
| Duree maximum du pret | ____ ans |
| Delai apres alyah pour en beneficier | ____ ans (Tloush : 15) |
| Teudat Zakaut obligatoire avant demande bancaire | [OUI / NON] |

### Questions a clarifier

1. Le pret preferentiel est-il **additionnel** a la mashkanta standard ou
   **remplace-t-il** une partie de la mashkanta ?
2. Y a-t-il des conditions de revenu ?
3. Peut-on cumuler avec l'exemption purchase tax olim ?

### Comment reactiver

Ouvrir `src/lib/benefitsCatalog.ts` ligne ~1246 et mettre la vraie valeur
dans `full_description_fr` + `estimated_annual_value`.

---

## ✅ Checklist P1

- [ ] Sal Klita : 9 profils verifies dans le calculateur NBN
- [ ] Rental assistance : 7 profils verifies + duree + plafond
- [ ] Mashkanta : montant + taux + apport + duree confirmes
- [ ] 3 entrees passees en `status: 'verified'` + `confidence: 'high'`
- [ ] Commit + push

**Quand tu as fini la Partie 1, demande la Partie 2** (priorites P2 et P3).

---

*Partie 1/2 — duree estimee ~45 min. A completer avant de passer a la Partie 2.*
