---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/project-context.md']
status: 'complete'
---

# Architecture — Tloush v3

**Date :** 2026-04-02
**Basé sur :** PRD v1.0

---

## 1. Vue d'Ensemble

### 1.1 Diagramme Haut Niveau

```
Utilisateur (navigateur)
    │
    ├── Next.js App (Vercel)
    │     ├── App Router (Server Components + Client Components)
    │     ├── Middleware (auth guard)
    │     └── API Routes (/api/*)
    │           ├── /api/documents/upload  → Supabase Storage + Claude
    │           └── /api/assistant/chat    → Claude (avec contexte doc)
    │
    ├── Supabase
    │     ├── Auth (email/password)
    │     ├── PostgreSQL (documents, conversations, messages)
    │     └── Storage (bucket "documents" — privé)
    │
    └── Anthropic API
          └── claude-sonnet-4-5
```

### 1.2 Flux Principal

1. L'utilisateur s'authentifie via Supabase Auth
2. Il uploade un document → API Route reçoit le fichier
3. L'API Route stocke le fichier dans Supabase Storage
4. L'API Route envoie le fichier à Claude pour analyse (base64)
5. Le résultat JSON est sauvegardé dans la table `documents`
6. L'inbox affiche le document analysé en temps réel
7. L'utilisateur chatte avec l'assistant → l'API Route charge le contexte du document + l'historique

---

## 2. Décisions d'Architecture (ADRs)

### ADR-001 : Next.js 14 App Router

**Décision :** Utiliser l'App Router de Next.js 14 (Server Components par défaut).

**Justification :**
- Server Components pour le fetching de données (zéro JS client pour les pages de lecture)
- Middleware natif pour la protection des routes
- RSC (React Server Components) évite de passer les clés API au client
- Cohérence avec la v1 existante

**Conséquences :**
- `createClient()` côté serveur est async — toujours `await`
- Les composants interactifs nécessitent `'use client'` explicite
- Pattern Server Page → Client Component pour chaque feature interactive

---

### ADR-002 : Supabase comme Backend Complet

**Décision :** Supabase pour auth + base de données + storage (tout-en-un).

**Justification :**
- Auth intégrée avec RLS natif
- Stockage de fichiers privés dans le même écosystème
- Pas de backend séparé à maintenir
- Tier gratuit généreux pour le démarrage

**Conséquences :**
- Deux clients distincts : `@/lib/supabase/client.ts` (navigateur) et `@/lib/supabase/server.ts` (serveur)
- RLS activé sur toutes les tables — sécurité implicite par user_id
- `SUPABASE_SERVICE_ROLE_KEY` uniquement dans les API Routes pour les opérations Storage

---

### ADR-003 : Claude claude-sonnet-4-5 pour Toute l'IA

**Décision :** Un seul modèle Claude (`claude-sonnet-4-5`) pour l'analyse et le chat.

**Justification :**
- Excellent rapport qualité/coût pour ce cas d'usage
- Support natif des PDFs (beta) et des images
- Réponses en français de haute qualité
- Suffisamment rapide pour une UX acceptable (< 30s)

**Conséquences :**
- Coût variable selon usage (surveiller les dépenses Anthropic)
- Max tokens : 2048 pour l'analyse, 1024 pour le chat
- L'API key doit être présente en prod

---

### ADR-004 : Zustand Limité aux Features v1

**Décision :** Zustand uniquement pour les stores existants de la v1. Les nouvelles features v3 utilisent React state local (`useState`) ou les props.

**Justification :**
- Éviter la complexité inutile pour des features simples
- Server Components rendent beaucoup de state management côté client inutile
- Facilite la maintenance par des agents IA

**Conséquences :**
- Pas de nouveau store Zustand pour l'inbox ou l'assistant
- Les données sont fetchées côté serveur et passées en props

---

### ADR-005 : Pas de Tests Automatisés en Phase 1

**Décision :** Phase 1 sans tests automatisés. Tests manuels via le serveur de dev.

**Justification :**
- MVP brownfield en mode vitesse
- Le projet est petit et les surfaces de test sont limitées
- Les tests seront ajoutés en Phase 2 avec le premier framework de test

**Conséquences :**
- Phase 2 doit inclure Vitest ou Jest avant d'ajouter des features complexes
- Les API Routes doivent être testées manuellement avant chaque déploiement

---

### ADR-006 : Vercel pour le Déploiement

**Décision :** Vercel comme plateforme de déploiement.

**Justification :**
- Intégration native Next.js (zero config)
- Déploiements automatiques sur push
- Edge functions pour le middleware
- Tier gratuit suffisant pour le MVP

**Conséquences :**
- Les variables d'environnement doivent être configurées dans le dashboard Vercel
- Les limites de la fonction serverless (5MB body par défaut) peuvent affecter les gros fichiers

---

### ADR-007 : Email Transactionnel via Resend (Phase 2)

**Décision :** Resend pour l'envoi d'emails (confirmations, digests hebdomadaires).

**Justification :**
- Excellente intégration Next.js / React Email
- Tier gratuit : 3 000 emails/mois
- API simple

**Conséquences :**
- Ajouter `RESEND_API_KEY` en Phase 2
- Créer les templates d'email avec React Email

---

### ADR-008 : Stripe pour l'Abonnement (Phase 2)

**Décision :** Stripe pour la gestion des abonnements.

**Justification :**
- Standard de l'industrie
- Webhooks robustes pour les changements d'état
- Support des paiements israéliens

**Conséquences :**
- Table `subscriptions` à ajouter en Phase 2
- Webhook `/api/stripe/webhook` à créer
- Logique de freemium (limite de documents par mois en free tier)

---

## 3. Modèle de Données

### 3.1 Tables Actuelles (Phase 1)

```sql
-- Utilisateurs gérés par Supabase Auth (table auth.users)

documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  file_name    TEXT NOT NULL,
  file_path    TEXT NOT NULL,        -- chemin dans Storage: {user_id}/{timestamp}.{ext}
  file_type    TEXT NOT NULL,        -- 'pdf' | 'image'
  document_type TEXT DEFAULT 'other', -- 'payslip'|'official_letter'|'contract'|'tax'|'other'
  status       TEXT DEFAULT 'analyzed',
  is_urgent    BOOLEAN DEFAULT false,
  action_required BOOLEAN DEFAULT false,
  action_description TEXT,
  summary_fr   TEXT,
  period       TEXT,                 -- ex: 'Mars 2026'
  analysis_data JSONB,               -- analyse complète de Claude
  analyzed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)

conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  document_id  UUID REFERENCES documents,
  title        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)

messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID REFERENCES conversations NOT NULL,
  role             TEXT CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
)
```

### 3.2 Tables Phase 2 (à créer)

```sql
subscriptions (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES auth.users NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan          TEXT DEFAULT 'free',  -- 'free' | 'pro'
  status        TEXT DEFAULT 'active', -- 'active' | 'canceled' | 'past_due'
  current_period_end TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
)

user_preferences (
  user_id       UUID REFERENCES auth.users PRIMARY KEY,
  digest_enabled BOOLEAN DEFAULT true,
  digest_day    TEXT DEFAULT 'monday',
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
```

### 3.3 RLS Policies

```sql
-- documents : chaque user voit uniquement les siens
CREATE POLICY "Users can CRUD own documents"
  ON documents FOR ALL USING (auth.uid() = user_id);

-- conversations : idem
CREATE POLICY "Users can CRUD own conversations"
  ON conversations FOR ALL USING (auth.uid() = user_id);

-- messages : via conversation ownership
CREATE POLICY "Users can access messages in own conversations"
  ON messages FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );
```

---

## 4. Structure du Projet

```
tloush-v3BMAD-code/
├── src/
│   ├── app/                          # App Router
│   │   ├── page.tsx                  # Landing (v1)
│   │   ├── layout.tsx                # Root layout
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # Page de connexion
│   │   │   ├── register/page.tsx     # Page d'inscription
│   │   │   └── callback/route.ts    # OAuth callback
│   │   ├── inbox/
│   │   │   ├── page.tsx              # Server: fetch documents
│   │   │   └── InboxClient.tsx       # Client: UI interactive
│   │   ├── assistant/
│   │   │   ├── page.tsx              # Server: fetch doc + all docs
│   │   │   └── AssistantClient.tsx   # Client: chat UI
│   │   └── api/
│   │       ├── documents/
│   │       │   └── upload/route.ts  # Upload + analyse Claude
│   │       └── assistant/
│   │           └── chat/route.ts    # Chat avec contexte
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts             # Client navigateur
│   │       └── server.ts             # Client serveur (async)
│   ├── middleware.ts                  # Protection des routes
│   └── types/
│       └── index.ts                  # Types TypeScript partagés
├── _bmad/                            # Framework BMAD (ne pas modifier)
├── _bmad-output/                     # Artefacts BMAD
│   ├── project-context.md
│   └── planning-artifacts/
│       ├── prd.md
│       ├── architecture.md           # Ce fichier
│       └── epics/                    # Créés prochainement
├── .env.local                        # Variables d'environnement (gitignored)
└── package.json
```

---

## 5. Patterns d'Implémentation Obligatoires

### 5.1 Pattern Server Page → Client Component

```typescript
// TOUJOURS ce pattern pour les pages avec état interactif

// page.tsx (Server Component — fetch data)
export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)

  return <InboxClient documents={documents || []} userEmail={user.email || ''} />
}

// InboxClient.tsx (Client Component — interactions)
'use client'
export default function InboxClient({ documents, userEmail }) {
  const [state, setState] = useState(...)
  // ... UI interactive
}
```

### 5.2 Pattern API Route

```typescript
// TOUJOURS cette structure dans les API routes

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check (TOUJOURS en premier)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // 2. Validation des inputs
    const body = await req.json()
    if (!body.message) return NextResponse.json({ error: 'Message manquant' }, { status: 400 })

    // 3. Business logic

    // 4. Response
    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('[/api/xxx]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}
```

### 5.3 Pattern Rendu Markdown Simple

```typescript
// Pour les réponses de l'assistant (trusted content uniquement)
function renderMessage(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
// Usage: dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
// ⚠️ UNIQUEMENT pour le contenu généré par Claude, jamais pour le contenu utilisateur
```

---

## 6. Architecture de Sécurité

### 6.1 Flux d'Authentification

```
Navigateur → /auth/login (form) → supabase.auth.signInWithPassword()
    → Supabase retourne session cookie
    → Middleware lit le cookie sur chaque requête protégée
    → Si valide : continue vers la page
    → Si invalide : redirect vers /auth/login?redirect={pathname}
```

### 6.2 Isolation des Données

- Supabase RLS garantit qu'un utilisateur ne peut jamais accéder aux données d'un autre
- Les fichiers Storage sont dans des dossiers `{user_id}/` — isolés par convention
- Les API Routes vérifient `user.id` avant toute opération DB

### 6.3 Variables d'Environnement

| Variable | Exposition | Usage |
|----------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (client) | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (client) | Clé anonyme (RLS protège) |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement | Upload Storage (bypasse RLS) |
| `ANTHROPIC_API_KEY` | Serveur uniquement | Appels à l'API Claude |

---

## 7. Plan d'Évolution Technique

### Phase 2 — Priorités Techniques

1. **Rate Limiting** : Activer Upstash Redis (déjà installé) sur `/api/documents/upload` (5 uploads/heure en free tier)
2. **Webhooks Stripe** : `/api/stripe/webhook` avec validation de signature
3. **Email** : Installer `resend` + `@react-email/components`
4. **Tests** : Installer Vitest + Testing Library avant les nouvelles features
5. **Monitoring** : Activer Sentry (déjà dans `package.json`)

### Phase 3 — Considérations Architecturales

- **WhatsApp** : Webhook Twilio/WhatsApp Business → API Route qui déclenche le même pipeline d'analyse
- **Comparaison fiches de paie** : Nouvelle fonction SQL ou logique en API Route, avec index sur `user_id + document_type + period`
- **Experts** : Nouveau domaine `/experts` avec table `experts` et `contact_requests` — indépendant du reste
