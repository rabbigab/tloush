# 📥 Rights Drafts — Fiches de documentation en attente

Ce dossier contient les fiches de documentation d'aides israéliennes **avant** leur intégration dans `src/lib/benefitsCatalog.ts`.

## Structure

```
docs/rights-drafts/
├── README.md              ← ce fichier
├── AGENT_PROMPT.md        ← prompt à donner à l'agent de recherche
├── _pending/              ← fiches en attente d'intégration au catalogue
│   └── {slug}.md
└── _done/                 ← fiches déjà intégrées (archive consultable)
    └── {slug}.md
```

## Workflow

1. **Recherche** : l'agent de recherche utilise `AGENT_PROMPT.md` pour documenter une aide → produit un fichier `_pending/{slug}.md`
2. **Intégration** : une session Claude spécialisée rights-catalog transforme le draft en entrée `BenefitDefinition` dans `src/lib/benefitsCatalog.ts`
3. **Archivage** : une fois mergé en main, le fichier est déplacé de `_pending/` vers `_done/`

## Format attendu

Chaque fiche doit suivre le **template complet** : `docs/rights-catalog-template.md`

## Nommage des fichiers

`{slug}.md` où `{slug}` correspond exactement au futur slug dans le catalogue (snake_case, anglais/hébreu translittéré).

Exemples :
- `maonot_yom.md`
- `hachzar_mas.md`
- `reforme_fiscale_olim_2026.md`
- `rav_kav_senior_free.md`

## Règle anti-doublon

Avant de créer une fiche, vérifier qu'elle n'existe pas déjà :
1. Dans `src/lib/benefitsCatalog.ts` (catalogue actif)
2. Dans `_pending/` (en attente)
3. Dans `_done/` (déjà intégré)

En cas de doublon : mettre à jour la fiche existante au lieu d'en créer une nouvelle.
