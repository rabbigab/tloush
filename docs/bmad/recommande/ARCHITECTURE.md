---
status: 'complete'
inputDocuments: ['docs/bmad/recommande/PRD.md', '_bmad-output/project-context.md', '_bmad-output/planning-artifacts/architecture.md']
---

# Architecture — Tloush Recommande

**Date :** 2026-04-09
**Base sur :** PRD Recommande v1.0 + Architecture Tloush V3

---

## 1. Vue d'Ensemble

### 1.1 Diagramme

```
Visiteur (Google "plombier francophone")
    │
    ├── Next.js App (Vercel) — pages publiques SSG/ISR
    │     ├── /annuaire                    → Hub (SSG)
    │     ├── /annuaire/[categorie]         → Listing (ISR 3600s)
    │     ├── /annuaire/[categorie]/[slug]  → Fiche (ISR 1800s)
    │     ├── /annuaire/inscription         → Formulaire prestataire (public)
    │     ├── /annuaire/avis               → Depot d'avis via token (public)
    │     │
    │     └── API Routes (/api/annuaire/*)
    │           ├── GET  /prestataires          → Liste publique
    │           ├── GET  /prestataires/[id]     → Detail public
    │           ├── GET  /search                → Recherche full-text
    │           ├── POST /contact               → Tracker demande (auth)
    │           ├── POST /avis                  → Soumettre avis (token)
    │           ├── POST /inscription            → Demande prestataire (public)
    │           └── /api/cron/annuaire-followup → Cron WhatsApp J+2/J+5
    │
    ├── Supabase
    │     ├── PostgreSQL (5 nouvelles tables)
    │     │     ├── providers
    │     │     ├── provider_contacts
    │     │     ├── provider_reviews
    │     │     ├── provider_photos
    │     │     └── provider_applications
    │     └── Storage (bucket "provider-photos")
    │
    ├── Infrastructure existante (inchange)
    │     ├── Anthropic API (claude-sonnet-4-6) — pas utilise pour cette feature
    │     ├── Stripe — pas utilise pour cette feature
    │     ├── Resend — emails de confirmation inscription prestataire
    │     ├── Upstash Redis — rate limiting sur les routes publiques
    │     └── PostHog — tracking analytics
    │
    └── WhatsApp (messages texte simples en V1)
          ├── V1 : messages manuels par l'equipe OU via bot existant
          └── V2 : WhatsApp Business API (Twilio/360dialog)
```

### 1.2 Flux Principal Client

```
1. Visiteur arrive sur /annuaire/plombier (Google, Facebook, direct)
2. Voit la liste des plombiers avec notes et avis (public, pas d'auth)
3. Clique sur une fiche → /annuaire/plombier/david-m
4. Voit les details : photo, description, avis, CTA "Obtenir le contact"
5. Clique CTA → modale DirectoryContactModal.tsx
6. S'inscrit (Google OAuth ou email+tel+mdp) avec opt-in WhatsApp
7. Numero revele immediatement + boutons Appeler/WhatsApp
8. POST /api/annuaire/contact enregistre la demande (user_id + provider_id)
9. J+2 : cron Vercel envoie message WhatsApp avec liens de note
10. Utilisateur clique un lien → /annuaire/avis?token=XXX&rating=4
11. Soumet avis → admin valide → score prestataire mis a jour
```

### 1.3 Flux Principal Prestataire

```
1. Prestataire decouvre l'annuaire (groupes Facebook, bouche-a-oreille)
2. Clique "Rejoindre l'annuaire" → /annuaire/inscription
3. Remplit le formulaire en 4 etapes
4. POST /api/annuaire/inscription → provider_applications (status=pending)
5. Admin recoit une alerte email (Resend)
6. Admin valide dans /admin → cree la fiche dans providers (status=active)
7. Prestataire recoit email de confirmation avec son URL personnalisee
8. Il commence a recevoir des demandes de contact
```

---

## 2. Decisions d'Architecture

### ADR-R001 : Pages publiques hors du layout authentifie

**Decision :** Les routes `/annuaire/*` sont placees dans `src/app/annuaire/` (hors du group route `(app)`) et ajoutees aux `PUBLIC_ROUTES` dans `middleware.ts`.

**Justification :**
- L'annuaire doit etre accessible et indexable par Google sans session
- Le group route `(app)` applique le layout avec la sidebar auth — pas adapte pour les pages SEO
- Le gate (inscription) est gere cote client via la modale, pas cote serveur via le middleware

**Implementation :**
```
src/app/
  (app)/          ← layout authentifie (dashboard, inbox, etc.)
    dashboard/
    inbox/
    assistant/
  annuaire/       ← layout public independant
    page.tsx
    [categorie]/
      page.tsx
      [slug]/
        page.tsx
    inscription/
      page.tsx
    avis/
      page.tsx
```

**middleware.ts — ajout :**
```typescript
const PUBLIC_ROUTES = [
  // ... routes existantes
  '/annuaire',
  '/annuaire/(.*)',
  '/api/annuaire/prestataires',
  '/api/annuaire/search',
  '/api/annuaire/inscription',
  '/api/annuaire/avis',
]
```

---

### ADR-R002 : SSG + ISR pour les pages annuaire

**Decision :** Utiliser `generateStaticParams` pour la generation statique et `revalidate` pour l'ISR.

**Justification :**
- Les pages prestataires ne changent pas en temps reel (revalidation 30-60 min suffit)
- SSG/ISR = meilleur Core Web Vitals = meilleur SEO
- Evite des requetes Supabase a chaque visite

**Configuration par page :**
```typescript
// /annuaire/page.tsx — Hub
export const revalidate = 3600 // 1h

// /annuaire/[categorie]/page.tsx — Listing
export const revalidate = 1800 // 30min
export async function generateStaticParams() {
  return PROVIDER_CATEGORIES.map(c => ({ categorie: c.slug }))
}

// /annuaire/[categorie]/[slug]/page.tsx — Fiche
export const revalidate = 1800 // 30min
export async function generateStaticParams() {
  // Generer les slugs de tous les prestataires actifs au build
  const providers = await fetchActiveProviders()
  return providers.map(p => ({ categorie: p.category, slug: p.slug }))
}
```

---

### ADR-R003 : Token JWT pour les liens d'avis WhatsApp

**Decision :** Utiliser des JWT signes HS256 pour les liens d'avis, valides 7 jours, sans necessite de session.

**Justification :**
- L'utilisateur doit pouvoir noter sans se reconnecterspecifiquement depuis WhatsApp
- Le token prouve que l'utilisateur a bien effectue une demande de contact
- 7 jours = largement suffisant pour noter apres une prestation

**Implementation (`/src/lib/reviewTokens.ts`) :**
```typescript
import jwt from 'jsonwebtoken'

const SECRET = process.env.REVIEW_TOKEN_SECRET!

export function generateReviewToken(userId: string, providerId: string): string {
  return jwt.sign({ userId, providerId }, SECRET, { expiresIn: '7d' })
}

export function verifyReviewToken(token: string): { userId: string; providerId: string } {
  return jwt.verify(token, SECRET) as { userId: string; providerId: string }
}
```

**Variable d'environnement a ajouter :**
```
REVIEW_TOKEN_SECRET=<random 64 chars>
```

---

### ADR-R004 : Gate d'inscription en modale, pas en redirection

**Decision :** La modale `DirectoryContactModal.tsx` s'ouvre in-page plutot que de rediriger vers `/auth/register`.

**Justification :**
- Maintenir le contexte du prestataire visible derriere la modale
- Reduire le taux d'abandon (l'utilisateur voit pourquoi il s'inscrit)
- Le prenom du prestataire dans le titre de la modale = motivation forte
- Pattern : même approche que les modales de parement Stripe embed

**State management :**
```typescript
// Dans la fiche prestataire (Client Component)
const [showContactModal, setShowContactModal] = useState(false)
const [contactRevealed, setContactRevealed] = useState(false)
const { user } = useAuth() // hook Supabase existant

// Logique :
// user == null → ouvrir la modale
// user != null && !user.phone → modale simplifiee (juste le tel)
// user != null && user.phone → appeler /api/annuaire/contact directement
```

---

### ADR-R005 : Bucket Supabase dedie pour les photos prestataires

**Decision :** Creer un bucket `provider-photos` separe du bucket `documents` existant.

**Justification :**
- Separation des responsabilites (docs utilisateurs vs photos prestataires)
- RLS differente : photos prestataires sont publiques en lecture, documents utilisateurs sont prives
- Pas de risque de melange de contenu

**Configuration :**
```sql
-- Bucket public en lecture
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-photos', 'provider-photos', true);

-- Policy lecture publique
CREATE POLICY "provider_photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-photos');

-- Policy upload admin uniquement
CREATE POLICY "provider_photos_admin_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-photos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);
```

---

## 3. Schema de Base de Donnees

### 3.1 Tables

```sql
-- Prestataires
CREATE TABLE providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  category TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{fr,he}',
  description TEXT,
  years_experience INTEGER,
  osek_number TEXT,
  is_referenced BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'delisted')),
  average_rating NUMERIC(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts deverrouilles
CREATE TABLE provider_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  whatsapp_opted_in BOOLEAN DEFAULT false,
  followup_sent_at TIMESTAMPTZ,
  followup_reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Avis
CREATE TABLE provider_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES provider_contacts(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  provider_response TEXT,
  provider_responded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Photos de realisations
CREATE TABLE provider_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demandes d'inscription
CREATE TABLE provider_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  description TEXT,
  osek_number TEXT,
  tz_photo_url TEXT,
  reference_name TEXT,
  reference_phone TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'referenced', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
```

### 3.2 Index et Triggers

```sql
-- Index performances
CREATE INDEX idx_providers_category ON providers(category) WHERE status = 'active';
CREATE INDEX idx_providers_service_areas ON providers USING GIN(service_areas);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_provider_contacts_user ON provider_contacts(user_id);
CREATE INDEX idx_provider_contacts_followup ON provider_contacts(created_at)
  WHERE followup_sent_at IS NULL AND whatsapp_opted_in = true;
CREATE INDEX idx_provider_reviews_provider ON provider_reviews(provider_id)
  WHERE status = 'published';

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger recalcul rating
CREATE OR REPLACE FUNCTION recalculate_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE providers SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM provider_reviews
      WHERE provider_id = NEW.provider_id AND status = 'published'
    ),
    total_reviews = (
      SELECT COUNT(*) FROM provider_reviews
      WHERE provider_id = NEW.provider_id AND status = 'published'
    )
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_rating_on_review
  AFTER INSERT OR UPDATE ON provider_reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_provider_rating();
```

### 3.3 RLS Policies

```sql
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;

-- providers : lecture publique (actifs seulement)
CREATE POLICY "providers_public_read" ON providers
  FOR SELECT USING (status = 'active');

-- provider_contacts : par utilisateur
CREATE POLICY "contacts_own" ON provider_contacts
  FOR ALL USING (auth.uid() = user_id);

-- provider_reviews : lecture publique (publies), ecriture par user
CREATE POLICY "reviews_public_read" ON provider_reviews
  FOR SELECT USING (status = 'published');
CREATE POLICY "reviews_insert" ON provider_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- provider_photos : lecture publique
CREATE POLICY "photos_public_read" ON provider_photos
  FOR SELECT USING (true);

-- provider_applications : insert public, lecture admin
CREATE POLICY "applications_insert" ON provider_applications
  FOR INSERT WITH CHECK (true);
```

---

## 4. Structure des Fichiers

### Nouveaux fichiers a creer

```
src/
  types/
    directory.ts                        ← Types TypeScript (R1.2)

  lib/
    reviewTokens.ts                     ← JWT tokens d'avis (R4.2)

  app/
    annuaire/
      page.tsx                          ← Hub (R2.1)
      layout.tsx                        ← Layout public (header simplifie)
      [categorie]/
        page.tsx                        ← Listing (R2.2)
        [slug]/
          page.tsx                      ← Fiche (R2.3)
          DirectoryProviderClient.tsx   ← Client Component interactif
      inscription/
        page.tsx                        ← Formulaire prestataire (R3.1)
        InscriptionClient.tsx
      avis/
        page.tsx                        ← Depot d'avis (R4.3)

    api/
      annuaire/
        prestataires/
          route.ts                      ← GET liste (R1.3)
          [id]/
            route.ts                    ← GET detail (R1.3)
        search/
          route.ts                      ← GET search (R1.3)
        contact/
          route.ts                      ← POST contact (R1.4)
        avis/
          route.ts                      ← POST avis (R1.4)
        inscription/
          route.ts                      ← POST inscription prestataire (R3.1)
      admin/
        prestataires/
          route.ts                      ← CRUD admin (R3.2)
          [id]/
            route.ts
        avis/
          [id]/
            route.ts                    ← Moderation (R3.3)
      cron/
        annuaire-followup/
          route.ts                      ← Cron WhatsApp J+2/J+5 (R4.1/R4.4)

  components/
    directory/
      ProviderCard.tsx                  ← Card dans le listing
      ProviderSchema.tsx                ← JSON-LD (R6.1)
      DirectoryContactModal.tsx         ← Modale gate (R2.4)
      ContactReveal.tsx                 ← Numero + boutons (R2.5)
      ReviewForm.tsx                    ← Formulaire avis (R4.3)

  data/
    directory-content.ts               ← Contenu editorial (R6.2)

supabase/
  migrations/
    recommande.sql                      ← Migration complete (R1.1)
```

### Fichiers existants a modifier

```
src/middleware.ts                       ← Ajouter /annuaire aux PUBLIC_ROUTES (R1.5)
src/app/(app)/admin/AdminDashboard.tsx  ← Ajouter onglet Prestataires (R3.2)
src/app/(app)/dashboard/page.tsx        ← Ajouter widget annuaire (R5.2)
src/components/analysis/AnalysisSummaryCard.tsx ← Cross-promo (R5.3)
src/app/sitemap.ts                      ← Inclure pages annuaire (R6.1)
.env.example                            ← Ajouter REVIEW_TOKEN_SECRET
```

---

## 5. Variables d'Environnement

Ajouter dans `.env.local` et Vercel :

```bash
# Token pour les liens d'avis WhatsApp (obligatoire)
REVIEW_TOKEN_SECRET=<64 chars aleatoires>

# WhatsApp Business API (optionnel V1, obligatoire V2)
# WHATSAPP_ACCESS_TOKEN=xxx  (deja present pour le bot existant)
# WHATSAPP_PHONE_NUMBER_ID=xxx
```

---

## 6. Considerations de Performance

### Core Web Vitals
- **LCP** : images prestataires en WebP, lazy loading, taille max 400px thumbnail
- **CLS** : skeleton loaders `animate-pulse` pour preserver le layout pendant le chargement
- **FID** : modale gate en Client Component, interactions non-bloquantes

### Caching
- Pages SSG/ISR avec `revalidate` = 0 requete Supabase en production pour les visites normales
- API publiques avec `Cache-Control: s-maxage=300` (5 min) sur les listings
- Rate limiting Upstash sur les API routes publiques (100 req/min/IP)

### Securite
- Token d'avis signe HS256 — invalide apres 7 jours
- UNIQUE constraint sur `provider_contacts(user_id, provider_id)` — impossible d'obtenir le numero deux fois
- UNIQUE constraint sur `provider_reviews(user_id, provider_id)` — un seul avis par paire
- RLS active sur toutes les tables
- `SUPABASE_SERVICE_ROLE_KEY` uniquement dans les API routes admin
