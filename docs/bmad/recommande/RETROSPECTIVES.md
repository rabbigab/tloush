# Retrospectives — Tloush Recommande

Document vivant — une retro par sprint livre.

---

## Sprint R1 — Fondations & Pages publiques

### Livre
- Migration SQL complete : 5 tables (providers, provider_contacts, provider_reviews, provider_photos, provider_applications) + 6 index + 2 triggers (updated_at, recalcul rating) + RLS 8 policies + bucket storage
- Types TypeScript : `Provider`, `ProviderReview`, `ProviderReviewDisplay`, `ProviderContact`, `ProviderApplication`, constantes `PROVIDER_CATEGORIES` (5) et `PROVIDER_CITIES` (10)
- Library `reviewTokens.ts` : JWT HS256 via `jose` pour liens d'avis signes (7 jours)
- Middleware mis a jour : `/annuaire` + toutes les API publiques dans `PUBLIC_ROUTES`
- 7 API routes : GET prestataires (filtre, tri, pagination), GET detail + avis, GET search, POST contact (auth), POST avis (token), POST inscription, admin CRUD + moderation
- Page hub `/annuaire` : grille categories avec icones + termes hebreux, section "Comment ca marche", disclaimer juridique
- Page listing `/annuaire/[categorie]` : cards prestataires, badge "Reference", ISR 30min, `generateStaticParams`
- Page fiche `/annuaire/[categorie]/[slug]` : detail complet, avis, galerie, CTA sticky vert
- Modale gate contextuelle `DirectoryContactModal.tsx` : Google OAuth + email/tel/mdp, opt-in WhatsApp (case non pre-cochee), titre personnalise avec prenom prestataire
- Revelation contact : boutons Appeler + WhatsApp (message pre-rempli), encart cross-sell "Analysez votre devis"
- Sitemap dynamique mis a jour avec toutes les pages annuaire + prestataires

### Ce qui a bien marche
- Le pattern `PUBLIC_ROUTES` dans le middleware permet de rendre l'annuaire accessible sans session tout en gardant le gate cote client — propre et efficace
- ISR (`revalidate`) evite les requetes Supabase a chaque visite sans sacrifier la fraicheur
- La modale gate in-page (vs redirection `/auth/register`) maintient le contexte du prestataire — decision UX forte
- Le type `ProviderReviewDisplay` (lighter que `ProviderReview`) evite les problemes de typing Supabase select partiel
- `jose` pour les JWT : compatible Edge Runtime, pas de dependance Node.js lourde

### Ce qui a coince
- Erreur TS sur les reviews : le `select` partiel de Supabase ne retourne pas tous les champs de `ProviderReview` — resolu en creant le type `ProviderReviewDisplay`
- Le `supabaseAdmin` (service role) est necessaire dans les Server Components pour bypasser les RLS sur les providers — acceptable car lecture seule publique

### Actions pour les sprints suivants
- [x] Systematiser les types "Display" pour les selects partiels Supabase
- [ ] Ajouter des tests E2E pour le flow complet : visite → inscription → contact → avis
- [ ] Monitorer le taux de conversion de la modale gate (PostHog)

---

## Sprint R2 — Admin, inscription, WhatsApp, navigation

### Livre
- Onglet "Prestataires" dans AdminDashboard : sub-tabs actifs/en attente, formulaire d'ajout avec tous les champs (categorie, specialites, villes, langues, description, osek, badge reference), actions toggle reference/voir/delister
- Page inscription prestataire `/annuaire/inscription` : formulaire multi-etapes (3 etapes + confirmation), selecteurs visuels pour categories et villes, envoi vers `provider_applications`
- Cron WhatsApp `/api/cron/annuaire-followup` : check Shabbat (vendredi 14h - samedi 21h Israel time), suivi J+2 avec generation de tokens d'avis signes, relance unique J+5 si pas d'avis, logs en console (V1 sans API WhatsApp)
- Page depot d'avis `/annuaire/avis` : acces via token signe (sans login), note 1-5 cliquable avec hover, commentaire optionnel, confirmation
- Navigation : lien "Annuaire" dans le Header public (icone Star), dans AppNav desktop (SECONDARY_NAV), et dans le menu mobile Plus (section "Services")

### Ce qui a bien marche
- Le cron unique gere J+2 ET J+5 dans le meme endpoint — pas de duplication
- Le check Shabbat est simple et efficace (heure UTC+3 hardcodee — suffisant pour Israel)
- L'inscription prestataire en 3 etapes sans auth est strategique : zero friction pour recruter
- Le formulaire admin est dense mais fonctionnel — les champs virgules (specialites, villes) sont convertis en arrays cote client

### Ce qui a coince
- Rien de bloquant sur ce sprint — execution fluide grace aux patterns etablis en R1

### Actions pour les sprints suivants
- [x] Integrer l'annuaire dans la navigation
- [ ] Remplacer les console.log du cron par l'envoi reel via WhatsApp Business API (Twilio/360dialog)
- [ ] Ajouter un email de notification a l'admin quand une demande d'inscription arrive
- [ ] Ajouter la moderation des avis dans l'onglet admin (actuellement le PATCH existe mais pas l'UI de listing des avis en attente)

---

## Sprint R3 — SEO, contenu editorial, dashboard, cross-promo

### Livre
- `ProviderSchema.tsx` : 3 composants JSON-LD (`ProviderJsonLd` pour LocalBusiness + AggregateRating, `CategoryListJsonLd` pour ItemList, `FAQJsonLd` pour FAQPage)
- Schemas injectes dans les pages fiche prestataire et listing categorie
- `directory-content.ts` : contenu editorial complet pour 5 categories (plombier, electricien, peintre, serrurier, climatisation) avec : guide ("Comment choisir un X en Israel"), fourchettes de prix, glossaire hebreu-francais (5-6 termes par metier), 5 FAQ par categorie
- Section editoriale integree dans la page categorie : guide, prix, glossaire en grille, FAQ avec `<details>` expandables
- `DirectoryWidget.tsx` : widget client-side sur le dashboard, affiche les 3 derniers prestataires contactes ou un CTA decouverte, fetch via `/api/annuaire/mes-contacts`
- Endpoint `GET /api/annuaire/mes-contacts` : retourne les contacts enrichis (nom prestataire, categorie) pour l'utilisateur connecte
- `DirectoryCrossPromo.tsx` : banner contextuel avec message adapte (devis/facture/general) + lien vers l'annuaire
- Cross-promo integree dans `/results` (page d'analyse) avant le disclaimer

### Ce qui a bien marche
- Le contenu editorial est substantiel et unique : les fourchettes de prix israeliennes et le glossaire hebreu sont introuvables ailleurs en francais
- Le widget dashboard est autonome (fetch cote client) — pas de modification du Server Component `DashboardPage`
- Les JSON-LD sont generes cote serveur (Server Components) — SEO optimal
- La cross-promo est discrete (un encart, pas un popup) — respecte l'UX existante

### Ce qui a coince
- Rien de technique — le sprint etait principalement du contenu et de l'integration
- Le contenu editorial est statique (fichier TS) — a terme, migrer vers un CMS ou la DB pour permettre l'edition sans deploiement

### Decisions d'architecture notables
1. **"Reference" au lieu de "Verifie"** — decision juridique (Consumer Protection Law 5741-1981) pour eviter l'obligation de diligence
2. **Opt-in WhatsApp non pre-coche** — conformite Amendement 40 (risque 1000 NIS/message)
3. **Pages publiques hors du group route `(app)`** — permet l'indexation SEO sans session
4. **Gate en modale, pas en redirection** — maintient le contexte du prestataire, reduit l'abandon

### Metriques a suivre (post-lancement)
- [ ] Impressions Google Search Console sur `/annuaire/*` (cible : 50+/mois a 1 mois)
- [ ] Taux de conversion modale gate (cible : >10%)
- [ ] Nombre de prestataires inscrits via le formulaire (cible : 20+ en 1 mois)
- [ ] Taux de reponse avis WhatsApp (cible : >30%)
- [ ] Conversion annuaire → abonne payant (cible : >3% a 3 mois)

---

## Bilan global — Tloush Recommande V1

### Chiffres
- **4 commits**, **~4,500 lignes** de code
- **35 fichiers** crees ou modifies
- **5 tables SQL** + 8 policies RLS + 2 triggers
- **8 API routes** (6 publiques/auth + 2 admin)
- **6 pages** publiques SEO-optimisees
- **5 composants** directory reutilisables
- **5 categories** avec contenu editorial complet
- **0 erreurs TypeScript** a chaque commit

### Stack utilisee
- Next.js 14 App Router (SSG + ISR)
- Supabase (PostgreSQL + RLS + Storage)
- jose (JWT tokens)
- Tailwind CSS + Lucide icons (coherent avec l'existant)

### Ce qui manque pour V2
1. Envoi reel des messages WhatsApp (API Business)
2. UI de moderation des avis dans l'admin
3. Pages ville+categorie dediees (`/annuaire/plombier/netanya`)
4. Upload de photos par les prestataires
5. Dashboard prestataire (stats de visites, contacts recus)
6. Categories V2 (demenagement, comptable, avocat, assurance, cours d'hebreu)
7. Automatisation email inscription prestataire (notification admin + confirmation prestataire)
