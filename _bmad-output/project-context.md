---
project_name: 'Tloush v3'
date: '2026-04-02'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents — Tloush v3

_Ce fichier contient les règles critiques que les agents IA doivent suivre pour implémenter du code dans ce projet. Focus sur les détails non-évidents que les agents pourraient manquer._

---

## Contexte Produit

**Tloush** est une application web pour les francophones vivant en Israël. Elle leur permet de comprendre leurs documents administratifs israéliens (fiches de paie hébraïques, courriers officiels, contrats, documents fiscaux). L'objectif v3 : transformer l'outil ponctuel en produit à abonnement avec inbox persistante, assistant IA contextuel, et tableau de bord hebdomadaire.

**Langue de l'UI et des outputs IA** : toujours en **français**. Les documents sources sont en hébreu.

---

## Stack Technologique & Versions

- **Next.js** 14.2.5 — App Router (PAS Pages Router)
- **React** 18
- **TypeScript** 5 — `strict: true` obligatoire
- **Tailwind CSS** 3.4.1
- **Supabase** — auth + PostgreSQL + Storage (bucket `documents`)
  - `@supabase/supabase-js`
  - `@supabase/ssr` — OBLIGATOIRE pour le SSR/middleware
- **Anthropic SDK** `@anthropic-ai/sdk ^0.24.3` — modèle `claude-sonnet-4-5`
- **Zustand** 4.5.2 — state management (features v1 existantes uniquement)
- **Lucide React** 0.383.0 — icônes
- **Framer Motion** 11.2.12 — animations

---

## Règles d'Implémentation Critiques

### TypeScript

- `strict: true` dans `tsconfig.json` — jamais de `any` implicite
- Alias `@/*` → `./src/*` — toujours utiliser `@/` pour les imports internes
- `moduleResolution: bundler` — ne pas utiliser les extensions `.js` dans les imports
- Gérer tous les cas `undefined`/`null` explicitement

### Architecture Next.js App Router

- **Server Components** par défaut pour les pages — data fetching côté serveur
- **`'use client'`** explicitement en haut des composants interactifs
- **Pages = Server Components** : `src/app/**/page.tsx` fetch les données et passent en props au Client Component
- **Client Components** : nommés `XxxClient.tsx` (ex: `InboxClient.tsx`, `AssistantClient.tsx`)
- **API Routes** : `src/app/api/**/route.ts` — export des fonctions HTTP nommées (`POST`, `GET`, etc.)

### Supabase — Patterns Obligatoires

**Client navigateur** (dans les composants `'use client'`) :
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient() // synchrone
```

**Client serveur** (dans les Server Components et API routes) :
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // ASYNC — toujours await
```

**Vérification auth** — TOUJOURS en premier dans les API routes :
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
```

**Service role key** — uniquement pour les opérations Storage (upload/delete) dans les API routes :
- Variable : `SUPABASE_SERVICE_ROLE_KEY`
- Ne JAMAIS exposer côté client
- Ne JAMAIS utiliser dans les Server Components (utiliser le client normal avec RLS)

**RLS (Row Level Security)** — activé sur toutes les tables. Toujours filtrer par `user_id` dans les requêtes même si RLS l'impose déjà (pour la clarté).

### Tables de base de données

```
documents(id, user_id, file_name, file_path, file_type, document_type, status,
          is_urgent, action_required, action_description, summary_fr, period,
          analysis_data JSONB, analyzed_at, created_at)

conversations(id, user_id, document_id, title, created_at)

messages(id, conversation_id, role CHECK IN ('user','assistant'), content, created_at)
```

### Claude API — Patterns

```typescript
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Toujours vérifier le type avant d'accéder au texte
const text = response.content[0].type === 'text' ? response.content[0].text : ''

// Modèle standard pour ce projet
model: 'claude-sonnet-4-5'

// Pour les PDFs — utiliser le beta
betas: mimeType === 'application/pdf' ? ['pdfs-2024-09-25'] : undefined
```

**JSON depuis Claude** — nettoyer les backticks markdown :
```typescript
const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
```

### Middleware & Routes Protégées

Routes protégées : `/inbox`, `/assistant`
Redirection : `/auth/login?redirect={pathname}`

Pour ajouter une route protégée, modifier `PROTECTED_ROUTES` dans `src/middleware.ts`.

### Storage Supabase

- Bucket : `documents` (privé)
- Pattern de chemin : `{user_id}/{timestamp}.{ext}`
- Upload avec `Buffer.from(arrayBuffer)`

### Style & UI

- **Palette** : `slate-*` pour les neutres, `blue-600/700` pour les actions primaires, `red-*` pour l'urgent, `amber-*` pour les alertes
- **Border radius** : `rounded-xl` (éléments), `rounded-2xl` (cartes/panneaux)
- **Typo** : `text-sm` standard, `text-xs` pour les métadonnées, `font-semibold/bold` pour les titres
- **Layout** : `max-w-3xl` (inbox), `max-w-5xl` (assistant avec sidebar)
- Aucun CSS custom — uniquement des classes Tailwind

### Convention de Nommage des Fichiers

| Type | Convention | Exemple |
|------|-----------|---------|
| Pages (App Router) | `page.tsx` dans dossier kebab-case | `app/auth/login/page.tsx` |
| Client Components | PascalCase | `InboxClient.tsx` |
| API Routes | `route.ts` | `app/api/documents/upload/route.ts` |
| Lib/Utils | camelCase | `supabase/server.ts` |
| Types | `index.ts` ou `scanner.ts` | `src/types/index.ts` |

---

## Anti-patterns à Éviter Absolument

- ❌ `createClient()` sans `await` côté serveur — provoque des erreurs d'auth
- ❌ `SUPABASE_SERVICE_ROLE_KEY` dans un composant client ou Server Component — fuite de sécurité
- ❌ `dangerouslySetInnerHTML` avec du contenu utilisateur non-sanitisé
- ❌ Modifier `_bmad/` ou `_bmad-output/` dans le code de l'app
- ❌ Utiliser Pages Router (`pages/`) — ce projet utilise App Router (`app/`)
- ❌ Appeler l'API Anthropic côté client (navigateur) — toujours via une API route
- ❌ Stocker des données sensibles dans `localStorage` ou `sessionStorage`
- ❌ Requêtes DB sans filtre `user_id` dans les API routes

---

## Variables d'Environnement

```
# Obligatoires en production
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://bqpjioreodhgnknukujn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optionnels (rate limiting - dev peut être vide)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Workflow de Développement

- **Branche principale** : `master` (repo actuel), `main` (convention PR)
- Les artefacts BMAD vont dans `_bmad-output/planning-artifacts/` (planification) et `_bmad-output/implementation-artifacts/` (stories/code)
- Le serveur de dev se lance avec `npm run dev` dans `tloush-v3BMAD-code/`
- Déploiement cible : Vercel (branche `main`)

---

## Usage Guidelines

**Pour les agents IA :**
- Lire ce fichier avant toute implémentation
- Suivre le pattern Server/Client Component scrupuleusement
- Toujours `await createClient()` côté serveur
- Toujours vérifier l'auth en premier dans les API routes
- Toujours écrire les outputs en français

**Pour les humains :**
- Mettre à jour quand la stack change
- Ajouter les nouvelles conventions dès qu'elles émergent

Last Updated: 2026-04-02
