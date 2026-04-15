# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Le projet en une phrase

**Tloush** est un outil Next.js 14 qui aide les francophones en Israël à comprendre leurs documents administratifs en hébreu (fiches de paie, contrats, courriers, baux, impôts) via une analyse IA (Claude), des calculateurs juridiques, un détecteur de droits et un annuaire de prestataires.

---

## Commandes essentielles

```bash
npm run dev              # Next dev server sur http://localhost:3000
npm run build            # Build de production Next.js
npm run start            # Démarre le build de production
npm run lint             # ESLint (next lint)
npm run test             # Vitest (one-shot)
npm run test:watch       # Vitest en watch mode
npx tsc --noEmit         # Type-check (obligatoire avant chaque merge)
```

Pour lancer un seul test : `npx vitest run src/__tests__/lib/parsers.test.ts`.

**Type-check avant merge est obligatoire** (voir CLAUDE.md règles ci-dessous).

---

## Architecture haut niveau

### Routage Next.js 14 (app router)

Deux zones fonctionnelles coexistent dans `src/app/` :

- **Pages publiques** (sans préfixe URL) : `/`, `/pricing`, `/cgv`, `/privacy`, `/mentions-legales`, `/scanner`, `/calculateurs/*`, `/droits`, `/droits-olim`, `/modeles`, `/annuaire/*`, `/auth/*`, `/contact`, `/a-propos`, `/faq`, etc.
- **Zone authentifiée** : `src/app/(app)/` — route group Next.js (les parenthèses n'apparaissent pas dans l'URL). Contient `/dashboard`, `/scanner` (résultats), `/assistant`, `/profile`, `/documents/[id]`, `/folders`, `/rights-detector`, `/rights-check`, `/experts`, `/miluim`, etc. Toutes ces pages sont server components qui vérifient l'auth Supabase (`if (!user) redirect('/auth/login')`) en tête de fichier.

La source de vérité pour le routage auth est `src/middleware.ts` qui expose deux listes :
- `PROTECTED_ROUTES` : routes nécessitant une session auth.
- `PUBLIC_ROUTES` : bypass complet du middleware Supabase.

### Stack

- **Next.js 14** app router (React 18, TypeScript)
- **Tailwind CSS** + `clsx` + `tailwind-merge` + `framer-motion`
- **Supabase** pour auth, DB PostgreSQL, storage (documents utilisateurs dans bucket privé)
- **Anthropic SDK** (Claude Sonnet 4.5) pour l'analyse des documents téléversés
- **Stripe** pour les abonnements (plans Free / Solo / Famille)
- **Upstash Redis** pour le rate limiting (dégradation gracieuse si absent)
- **Zustand** pour le store client (p.ex. `listingsStore`)
- **Resend** pour les emails transactionnels
- **PostHog** + **Sentry** pour analytics anonymisés + erreurs
- **Vitest** + `@testing-library/react` + `jsdom` pour les tests
- **Leaflet** + `react-leaflet` pour la carte immobilier (dynamic import `ssr: false`)
- **Tesseract.js** + `@sparticuz/chromium` pour OCR local + scraping scripté

### Flux d'analyse document (scanner)

1. `/scanner` (public) → select type (6 types dans `src/types/scanner.ts:DOCUMENT_TYPES`)
2. Upload fichier → `POST /api/scan` (auth requise, rate-limit 10/h, quota subscription-based)
3. `src/app/api/scan/route.ts` appelle Claude via `ANTHROPIC_API_KEY` avec le prompt correspondant au type (`src/lib/prompts/scan.ts:SCAN_SYSTEM_PROMPTS` + `SCAN_USER_PROMPTS`)
4. Retour JSON typé selon `DocumentAnalysis` (union discriminée sur `documentType`)
5. Rendu client dans `src/app/scanner/page.tsx` via `ScanResultsDisplay` (switch sur `documentType`)

Ajouter un nouveau type de document nécessite de modifier : `types/scanner.ts` (type + interface + DOCUMENT_TYPES), `lib/prompts/scan.ts` (system + user prompts), et `scanner/page.tsx` (case render).

### Benefits catalog et détection de droits

- `src/lib/benefitsCatalog.ts` (~2500 lignes) contient 58+ droits/aides israéliens structurés par `BenefitDefinition`. C'est la **source de vérité légale** du produit.
- `(app)/rights-detector/` scanne le profil utilisateur + ses documents pour détecter automatiquement les droits non réclamés (AI-based).
- `(app)/rights-check/` est un formulaire manuel de vérification des droits du travail (utilise `src/lib/employeeRights.ts`).
- `(app)/tax-refund/` utilise `src/lib/taxRefund.ts` pour estimer les remboursements d'impôt.

### Pages légales et entité

La source de vérité unique est `src/lib/legalEntity.ts` (créée pour résoudre les divergences entre CGV / Privacy / Mentions légales). Elle expose :
- `LEGAL_ENTITY` : infos de l'entité (placeholders `__TODO_*__` en attendant les vraies infos)
- `APPLICABLE_LAWS`, `DATA_PROCESSORS`, `DATA_RETENTION`
- `isLegalEntityConfigured()` helper

`/privacy` consomme déjà ces constantes dynamiquement. `/cgv` et `/mentions-legales` attendent les infos réelles pour être refactorisées.

### Supabase : migrations et tables clés

Les migrations sont dans `supabase/migrations/` avec le format `YYYYMMDD_description.sql`. Il faut **toujours** ajouter une migration lors d'un changement de schéma.

Tables principales :
- `documents` : fichiers uploadés + analyses IA
- `user_profiles` : profil enrichi (aliya year, family status, etc.) pour le rights detector
- `providers` + `provider_applications` : annuaire prestataires
- `experts_waitlist` : waitlist /experts
- `detected_rights` : droits détectés par l'IA
- `listings` : annonces immobilières (feature en pause)

L'accès admin se fait via `src/lib/supabase/admin.ts` (`getAdminClient()`) qui utilise la `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement.

### Variables d'environnement critiques

Copier `.env.example` vers `.env.local`. **Obligatoires** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET`. **Optionnels** (dégradation gracieuse) : `UPSTASH_REDIS_REST_URL/TOKEN`, `STRIPE_*`, `POSTHOG_*`, `SENTRY_*`.

---

## Conventions de ce repo

### Metadata titles

`src/app/layout.tsx` applique `title.template = "%s | Tloush"`. **Ne jamais** hardcoder `" — Tloush"` ou `" | Tloush"` dans les `metadata.title` des pages enfants — le template root ajoute automatiquement le suffixe. Les pages qui veulent préserver un nom commercial distinct (ex. "Tloush Recommande" pour l'annuaire) utilisent `title: { absolute: "..." }`.

### Provider display names

Toute référence publique au nom d'un prestataire (annuaire) doit passer par `src/lib/providerDisplay.ts` (`getProviderDisplayName`, `normalizeFirstName`, `getProviderInitial`). La DB peut contenir des noms mal capitalisés (`"lellouche"` vs `"LELLOUCHE"`) — le helper normalise en "Prenom L." cohérent.

### Dynamic sitemap et robots

- `src/app/sitemap.ts` est dynamique : fetch Supabase pour filtrer les catégories d'annuaire vides et injecter les URLs de prestataires actifs.
- `src/app/robots.ts` est une metadata route Next.js (pas de fichier statique `public/robots.txt`). La liste `DISALLOW_ROUTES` doit être maintenue en parallèle de `middleware.ts:PROTECTED_ROUTES`.

### Audit docs

Les documents d'audit et de plan de correction sont dans `docs/audits/` :
- `technical-mapping.md` : 30 findings techniques avec fichiers concernés et correctifs recommandés.
- `fix-implementation-log.md` : log incrémental des fixes appliqués par lot (Q0→Q3).

Lors de l'ajout d'un nouveau fix, **référencer le finding** dans le message de commit (ex. `Reference : docs/audits/technical-mapping.md #17`) et ajouter une entrée dans le log.

---

## Workflow de déploiement

**Déploiement automatique sans demander confirmation** :
- Modification → commit → push → PR → merge vers `main` → Vercel déploie automatiquement.
- Ne pas demander la permission de créer une PR ou de merger vers main.
- Si le build/type-check échoue après merge, corriger immédiatement avec un second commit.

Règle demandée par l'utilisateur le 14/04/2026 pour accélérer le workflow.

### Règles qui restent en vigueur

- Ne jamais `git push --force` sur main.
- Ne jamais `git reset --hard` sur des commits publiés.
- Ne jamais skip les hooks (`--no-verify`).
- Ne jamais commiter de secrets (.env, credentials.json).
- Toujours faire le type-check avant de merger.

---

## Fractionnement des tâches (anti-timeout)

**Toujours splitter les grandes tâches en sous-étapes de 5-15 min max** :
- Pour chaque section logique : un commit + un push + un type-check.
- Ne jamais accumuler 10+ edits sans intermédiaire (risque de message tronqué ou context lost).
- Utiliser TodoWrite pour tracker chaque sous-tâche.
- Un gros catalogue (ex. 14 bénéfices à ajouter) = 1 sous-commit par groupe de 2-3 entrées.
- Si un fichier fait > 500 lignes à éditer, splitter en plusieurs Edit tool calls.

Règle demandée par l'utilisateur le 14/04/2026 suite à un bug sur une grande opération.

---

## Post-merge audit léger

Après chaque merge vers main :
1. `npx tsc --noEmit` passe.
2. Si changements dans le catalogue de droits : vérifier que `BENEFITS_CATALOG` inclut toutes les nouvelles sections.
3. Si changements dans le schéma DB : vérifier que la migration existe dans `supabase/migrations/`.
4. Si changements UI : confirmer que les nouvelles pages sont reachables depuis la navigation (`Header.tsx` publique + `AppNav.tsx` authenticated).
