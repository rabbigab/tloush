# Audit de fraîcheur — Guides & sources Tloush

**Date d'audit** : 2026-04-16
**Scope** : `src/lib/benefitsCatalog.ts` (125 entrées) + `memory/glossary.md` (116 entrées) + constantes fiscales/BTL (`src/lib/israeliPayroll.ts`, `taxRefund.ts`, `freelanceMode.ts`)
**Méthodologie** : extraction du champ `verified_at` de chaque entrée, classification selon l'ancienneté à la date du jour.

---

## Grille de classification

| Badge | Ancienneté | Signification |
|---|---|---|
| ✅ **Frais** | < 18 mois | Source fraîche, pas d'action requise |
| ⚠️ **À vérifier** | 18-24 mois | Revue recommandée sous 3-6 mois |
| ❌ **Périmé** | > 24 mois OU date inconnue | Revue prioritaire obligatoire |

Une entrée peut être "fraîche" en date de vérification mais **needs_verification** en statut de modélisation (problème d'éligibilité distinct de la fraîcheur du montant/source).

---

## Synthèse globale

### Fraîcheur brute (basée sur `verified_at`)

| Classification | Nombre | Pourcentage |
|---|---:|---:|
| ✅ Frais (< 18 mois) | **125 / 125** | **100 %** |
| ⚠️ À vérifier (18-24 mois) | 0 / 125 | 0 % |
| ❌ Périmé (> 24 mois ou inconnu) | 0 / 125 | 0 % |

**Toutes les entrées du catalogue ont été vérifiées entre le 2026-04-12 et le 2026-04-16** (soit entre 0 et 4 jours avant la date d'audit).

### Répartition par date de vérification

| Date | Nb entrées |
|---|---:|
| 2026-04-12 | 10 |
| 2026-04-13 | 23 |
| 2026-04-14 | 24 |
| 2026-04-16 | 68 |
| **Total** | **125** |

### Métadonnées catalogue

- `CATALOG_METADATA.version` = `2.0.0`
- `CATALOG_METADATA.last_updated` = `2026-04-16` (aujourd'hui)
- `CATALOG_METADATA.total_benefits` = `125`
- Glossaire (`memory/glossary.md`) : "Dernière mise à jour : 2026-04-16"

### Confidence & statut de modélisation

| Dimension | Valeur | Nb |
|---|---|---:|
| confidence | `high` | 99 |
| confidence | `medium` | 25 |
| confidence | `low` | 1 (`hanaka_mitaamei_tzedek`) |
| status | `verified` | 119 |
| status | `needs_verification` | 6 |
| status | `estimated` | 0 |

**Les 6 entrées `needs_verification`** (modélisation imparfaite — faux positifs possibles, date de vérification OK) :

| Slug | Motif |
|---|---|
| `kitzvat_leyda_rav_ubarit` | manque `is_multiple_birth` |
| `kitzva_yeled_pag` | manque `is_premature_birth` |
| `horim_meametzim` | manque `is_adoptive_parent` |
| `dmei_omna` | manque `is_foster_parent` |
| `maanak_histaglut_nashim_alimut` | manque `is_domestic_violence_victim` |
| `yetom_alimut_mishpakha` | manque `is_orphan_of_domestic_violence` |

### Conclusion fraîcheur catalogue

> **Rien n'est périmé sur la base du `verified_at`.** Le catalogue a bénéficié d'un cycle d'audit massif les 12-16 avril 2026 (Étape C du chantier 3 qui a doublé le catalogue de 57 à 125 entrées). Prochain rappel d'audit recommandé : **Q3 2026** (octobre 2026), pour rester sous le seuil 18 mois.

---

<!-- Détails par autorité ajoutés en sous-étape 2 -->
<!-- Audit constantes 2026 ajouté en sous-étape 3 -->
<!-- Audit glossary + recos ajoutés en sous-étape 4 -->
