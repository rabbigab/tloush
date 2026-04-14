# CLAUDE.md — Instructions projet Tloush

## Workflow de déploiement

**Déploiement automatique sans demander confirmation** :
- Quand je fais une modification, je la pousse directement et la mets en ligne
- Ça implique : commit → push → création PR → merge vers `main` → Vercel déploie
- **SEULE CONDITION** : après chaque merge, je fais un audit léger pour vérifier que rien d'autre n'est cassé (type-check, recherche de régressions évidentes)
- Je ne demande PAS la permission de créer une PR ou de merger vers main
- Si le build/type-check échoue après merge, je corrige immédiatement avec un second commit

Cette règle a été explicitement demandée par l'utilisateur le 14/04/2026 pour accélérer le workflow.

## Règles qui restent en vigueur

- Ne jamais `git push --force` sur main
- Ne jamais `git reset --hard` sur des commits publiés
- Ne jamais skip les hooks (`--no-verify`)
- Ne jamais commiter de secrets (.env, credentials.json)
- Toujours faire le type-check avant de merger

## Fractionnement des tâches (anti-timeout)

**Toujours splitter les grandes tâches en sous-étapes de 5-15 min max** :
- Pour chaque section logique : un commit + un push + un type-check
- Ne jamais accumuler 10+ edits sans intermédiaire (risque de message tronqué ou context lost)
- Utiliser TodoWrite pour tracker chaque sous-tâche
- Un gros catalogue (ex. 14 bénéfices à ajouter) = 1 sous-commit par groupe de 2-3 entrées
- Si un fichier fait > 500 lignes à éditer, splitter en plusieurs Edit tool calls

Cette règle a été demandée par l'utilisateur le 14/04/2026 suite à un bug sur une grande opération.

## Post-merge audit léger (checklist)

Après chaque merge vers main :
1. `npx tsc --noEmit` passe
2. Si changements dans le catalogue de droits : vérifier que `BENEFITS_CATALOG` inclut toutes les nouvelles sections
3. Si changements dans le schéma DB : vérifier que la migration existe dans `supabase/migrations/`
4. Si changements UI : confirmer que les nouvelles pages sont reachables depuis la navigation
