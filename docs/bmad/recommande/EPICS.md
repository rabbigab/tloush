# Tloush Recommande — Epics & User Stories

> Version: 1.0
> Date: 2026-04-09
> Parent: Tloush V3 EPICS.md

---

## EPIC R1 : Fondations techniques
**Objectif :** Base de donnees, routes, et infrastructure pour l'annuaire
**Sprint :** R0
**Priorite :** P0 — Bloquant

### Stories

#### R1.1 — Schema base de donnees
**En tant que** developpeur,
**Je dois** creer le modele de donnees pour l'annuaire,
**Pour** stocker prestataires, contacts et avis.

**Criteres d'acceptation :**
- [ ] Table `providers` : id, slug (UNIQUE), first_name, last_name, phone, email, photo_url, category, specialties TEXT[], service_areas TEXT[], languages TEXT[], description, years_experience, osek_number, is_referenced BOOLEAN, status (pending/active/delisted), average_rating, total_reviews, created_at, updated_at
- [ ] Table `provider_contacts` : id, user_id (FK auth.users), provider_id (FK providers), created_at, followup_sent_at, followup_reminder_sent_at, whatsapp_opted_in BOOLEAN — UNIQUE(user_id, provider_id)
- [ ] Table `provider_reviews` : id, user_id (FK), provider_id (FK), contact_id (FK provider_contacts), rating INTEGER (1-5), comment TEXT, provider_response TEXT, provider_responded_at, created_at — UNIQUE(user_id, provider_id)
- [ ] Table `provider_photos` : id, provider_id (FK), photo_url, caption, sort_order, created_at
- [ ] Table `provider_applications` : id, first_name, last_name, phone, email, category, specialties TEXT[], service_areas TEXT[], description, osek_number, tz_photo_url, reference_name, reference_phone, status (pending/contacted/referenced/rejected), notes, created_at, reviewed_at
- [ ] RLS active sur toutes les tables
- [ ] Policies : providers lecture publique (status=active), contacts/reviews write par user_id, admin tout
- [ ] Index sur providers(category), providers(service_areas) GIN, provider_reviews(provider_id)
- [ ] Trigger `updated_at` sur providers et provider_reviews
- [ ] Migration SQL dans `/supabase/migrations/recommande.sql`

**Effort :** 2h

---

#### R1.2 — Types TypeScript
**En tant que** developpeur,
**Je dois** definir les types TypeScript pour l'annuaire,
**Pour** avoir une base typee coherente.

**Criteres d'acceptation :**
- [ ] Fichier `/src/types/directory.ts` cree
- [ ] Type `Provider` complet avec tous les champs
- [ ] Type `ProviderCategory` = union de tous les slugs
- [ ] Type `ProviderReview` avec rating 1|2|3|4|5
- [ ] Type `ProviderContact` pour le tracking
- [ ] Type `ProviderApplication` pour le formulaire d'inscription
- [ ] Constante `PROVIDER_CATEGORIES` avec label, slug, icon, hebrewTerm, color
- [ ] Constante `PROVIDER_CITIES` avec les villes prioritaires

**Effort :** 1h

---

#### R1.3 — Routes API publiques
**En tant que** developpeur,
**Je dois** creer les endpoints API pour lister et afficher les prestataires,
**Pour** alimenter les pages publiques.

**Criteres d'acceptation :**
- [ ] `GET /api/annuaire/prestataires` — liste avec filtres (category, city, min_rating), pagination (limit/offset), tri (rating, reviews, newest)
- [ ] `GET /api/annuaire/prestataires/[id]` — detail prestataire + ses avis publies
- [ ] `GET /api/annuaire/search?q=&category=&city=` — recherche full-text sur name + description
- [ ] Reponses typees avec status 200/404/500
- [ ] Rate limiting Upstash sur les routes publiques (100 req/min par IP)

**Effort :** 2h

---

#### R1.4 — Routes API authentifiees
**En tant que** developpeur,
**Je dois** creer les endpoints proteges pour les actions utilisateur,
**Pour** tracker les contacts et collecter les avis.

**Criteres d'acceptation :**
- [ ] `POST /api/annuaire/contact` — enregistre une demande de contact (user_id + provider_id), retourne le numero de telephone
- [ ] `POST /api/annuaire/avis` — soumet un avis via token signe (sans session active requise)
- [ ] `GET /api/annuaire/mes-contacts` — liste les contacts demandes par l'utilisateur connecte
- [ ] Verification auth avec `requireAuth()` sur les routes protegees
- [ ] Token d'avis : JWT signe avec user_id + provider_id + exp (7 jours), genere dans `/src/lib/reviewTokens.ts`

**Effort :** 2h

---

#### R1.5 — Middleware et routes publiques
**En tant que** developpeur,
**Je dois** configurer le middleware pour que l'annuaire soit accessible sans login,
**Pour** permettre l'indexation SEO et le trafic non authentifie.

**Criteres d'acceptation :**
- [ ] `/annuaire` et toutes ses sous-routes ajoutees aux `PUBLIC_ROUTES` dans `middleware.ts`
- [ ] `/api/annuaire/prestataires` et `/api/annuaire/search` en public (pas de guard auth)
- [ ] `/api/annuaire/contact` et `/api/annuaire/avis` restent proteges
- [ ] Test : visiter `/annuaire` sans session ne redirige pas vers `/auth/login`

**Effort :** 30min

---

## EPIC R2 : Pages publiques (SEO)
**Objectif :** Pages indexables, visibles sur Google, qui convertissent
**Sprint :** R0-R1
**Priorite :** P0

### Stories

#### R2.1 — Page hub annuaire `/annuaire`
**En tant que** visiteur,
**Je veux** voir une page d'accueil de l'annuaire claire avec toutes les categories,
**Pour** trouver rapidement le type de prestataire dont j'ai besoin.

**Criteres d'acceptation :**
- [ ] Route `/src/app/annuaire/page.tsx` (Server Component, SSG)
- [ ] Hero : "Trouvez un prestataire francophone de confiance en Israel"
- [ ] Grille de categories avec icone, label, terme hebreu, nb de prestataires
- [ ] Section "Comment ca marche" (3 etapes : cherche → inscris-toi → contacte)
- [ ] Section "Dernieres additions" (3-4 prestataires recents)
- [ ] Metadata SEO : title, description, og:image
- [ ] Sitemap mis a jour avec `/annuaire`
- [ ] Page generee en SSG (pas de SSR dynamique)

**Effort :** 3h

---

#### R2.2 — Page listing par categorie `/annuaire/[categorie]`
**En tant que** visiteur,
**Je veux** voir tous les prestataires d'une categorie avec filtres par ville,
**Pour** comparer et choisir le meilleur.

**Criteres d'acceptation :**
- [ ] Route `/src/app/annuaire/[categorie]/page.tsx` (Server Component, ISR revalidate 3600)
- [ ] `generateStaticParams` pour les 5 categories V1
- [ ] Liste de cards prestataires : prenom, photo, note, nb avis, zone, 2-3 specialites, mini-citation
- [ ] Filtres : ville (dropdown), note min (pills), tri (select) — interactifs cote client
- [ ] Pagination ou infinite scroll (20 prestataires par page)
- [ ] Fallback si 0 prestataires : "Bientot disponible dans cette categorie"
- [ ] Metadata SEO dynamique : "[Categorie] francophone en Israel | Tloush Recommande"
- [ ] Schema JSON-LD `ItemList` avec les prestataires
- [ ] FAQ section avec 5 questions/reponses + schema `FAQPage`
- [ ] Sitemap mis a jour avec les 5 pages categories

**Effort :** 4h

---

#### R2.3 — Fiche prestataire `/annuaire/[categorie]/[slug]`
**En tant que** visiteur,
**Je veux** voir le profil complet d'un prestataire avec ses avis,
**Pour** decider si je le contacte.

**Criteres d'acceptation :**
- [ ] Route `/src/app/annuaire/[categorie]/[slug]/page.tsx` (ISR revalidate 1800)
- [ ] Hero : photo, prenom + initiale, badge "Reference par Tloush", categorie, zone
- [ ] Note en etoiles + nb d'avis
- [ ] Description + specialites (tags) + langues + annees d'experience
- [ ] Galerie photos de realisations (si disponibles, carrousel swipeable)
- [ ] Section avis : note, commentaire, prenom auteur, date — max 10 avis
- [ ] Bouton CTA "Obtenir le contact de [Prenom]" (sticky bas sur mobile, vert)
- [ ] Sous le CTA : "X personnes ont contacte ce prestataire ce mois-ci"
- [ ] Si utilisateur connecte avec telephone : afficher directement le numero + boutons Appeler/WhatsApp
- [ ] Tooltip "Que signifie Reference ?" sur le badge
- [ ] Metadata SEO : "[Prenom] — [Categorie] francophone a [Ville] | Tloush"
- [ ] Schema JSON-LD `LocalBusiness` + `AggregateRating`
- [ ] `generateStaticParams` pour prestataires actifs
- [ ] Sitemap mis a jour avec toutes les fiches prestataires

**Effort :** 5h

---

#### R2.4 — Modale gate d'inscription contextuelle
**En tant que** visiteur non connecte,
**Je veux** voir une modale d'inscription contextualisee quand je clique "Obtenir le contact",
**Pour** creer mon compte sans perdre le contexte du prestataire.

**Criteres d'acceptation :**
- [ ] Composant `DirectoryContactModal.tsx` (Client Component)
- [ ] S'ouvre en overlay avec fond flou (le prestataire reste visible derriere)
- [ ] Titre personnalise : "Dernier pas pour contacter [Prenom]"
- [ ] Bouton Google OAuth en premier (1 tap sur mobile)
- [ ] Formulaire email + telephone (+972) + mot de passe
- [ ] Case opt-in WhatsApp suivi **non pre-cochee** : "J'accepte de recevoir un message de suivi par WhatsApp apres l'intervention"
- [ ] Mini-temoignage en bas de modale (preuve sociale)
- [ ] Lien "Deja un compte ? Se connecter" en bas
- [ ] Apres inscription reussie : fermer la modale + reveler le numero directement
- [ ] Si utilisateur connecte sans telephone : version simplifiee (juste le champ telephone)
- [ ] Tracking PostHog : `directory_contact_gate_shown`, `directory_contact_gate_signup_completed`

**Effort :** 4h

---

#### R2.5 — Revelation du contact et boutons d'action
**En tant que** utilisateur inscrit,
**Je veux** voir le numero du prestataire et pouvoir le contacter directement,
**Pour** lancer la conversation.

**Criteres d'acceptation :**
- [ ] Numero remplace le bouton CTA apres inscription/connexion
- [ ] Format : `+972-XX-XXX-XXXX` lisible
- [ ] Bouton "Appeler" : lien `tel:+972XXXXXXXXX`
- [ ] Bouton "WhatsApp" : lien `https://wa.me/972XXXXXXXXX?text=Bonjour+[Prenom],+je+vous+contacte+via+Tloush+Recommande...`
- [ ] Encart cross-sell : "David vous a envoye un devis ? Analysez-le avec Tloush" → lien `/inbox`
- [ ] `POST /api/annuaire/contact` appele une seule fois (UNIQUE sur user+provider)
- [ ] Tracking PostHog : `directory_contact_revealed`, `directory_provider_whatsapped`

**Effort :** 2h

---

## EPIC R3 : Inscription et gestion des prestataires
**Objectif :** Permettre aux prestataires de rejoindre l'annuaire et aux admins de les gerer
**Sprint :** R1
**Priorite :** P0

### Stories

#### R3.1 — Page d'inscription prestataire
**En tant que** prestataire francophone,
**Je veux** pouvoir m'inscrire sur l'annuaire via un formulaire simple,
**Pour** etre visible aupres des clients francophones.

**Criteres d'acceptation :**
- [ ] Route `/src/app/annuaire/inscription/page.tsx` (public)
- [ ] Hero : "Recevez des clients francophones qualifies. Sans commission. Gratuit."
- [ ] Arguments : gratuit, pas de commission, badge Reference, URL personnalisee, visibilite Google
- [ ] Formulaire multi-etapes avec `ProgressStepper` (pattern existant) :
  - Etape 1 : Prenom, nom, telephone (+972), email, photo (upload)
  - Etape 2 : Categorie (select), specialites (multi-select max 5), zones d'intervention (multi-select villes), langues, description (textarea 500 car max), annees d'experience
  - Etape 3 : Numero Osek, upload Teudat Zehut (recto), reference client (nom + telephone)
  - Etape 4 : Confirmation avec next steps
- [ ] Upload photo vers bucket Supabase `provider-photos`
- [ ] `POST /api/annuaire/inscription` → insert dans `provider_applications` (status=pending)
- [ ] Email de confirmation envoye au prestataire via Resend
- [ ] Email d'alerte envoye a l'admin

**Effort :** 5h

---

#### R3.2 — Panel admin prestataires
**En tant que** administrateur,
**Je veux** voir et gerer toutes les demandes et fiches prestataires,
**Pour** valider les inscriptions et moderer la qualite.

**Criteres d'acceptation :**
- [ ] Nouvel onglet "Prestataires" dans `AdminDashboard.tsx`
- [ ] Sous-onglets : "Demandes en attente" / "Prestataires actifs" / "Delistes"
- [ ] Tableau demandes : prenom, categorie, ville, date, statut → actions "Approuver" / "Rejeter"
- [ ] Formulaire creation/edition prestataire : tous les champs + statut + is_referenced
- [ ] Action "Delister" avec motif obligatoire
- [ ] Compteur de contacts recus par prestataire
- [ ] Note moyenne et nb d'avis par prestataire
- [ ] Route `GET/POST/PATCH/DELETE /api/admin/prestataires` avec `requireAdmin()`

**Effort :** 4h

---

#### R3.3 — Moderation des avis
**En tant que** administrateur,
**Je veux** valider et moderer les avis avant publication,
**Pour** maintenir la qualite et eviter les abus.

**Criteres d'acceptation :**
- [ ] Sous-onglet "Avis" dans le panel admin prestataires
- [ ] Avis en attente de validation (status=pending)
- [ ] Actions : "Publier" / "Rejeter" (avec motif) / "Signaler comme suspect"
- [ ] Droit de reponse prestataire : champ editable `provider_response` visible dans l'admin
- [ ] Detection basique de faux avis : flag automatique si >5 avis du meme prestataire en 24h
- [ ] Route `PATCH /api/admin/avis/[id]` pour changer le statut

**Effort :** 3h

---

## EPIC R4 : Suivi qualite WhatsApp
**Objectif :** Collecter des avis post-prestation via WhatsApp de maniere automatisee
**Sprint :** R1-R2
**Priorite :** P1

### Stories

#### R4.1 — Cron job de suivi J+2
**En tant que** utilisateur ayant demande un contact,
**Je veux** recevoir un message WhatsApp 48h apres,
**Pour** partager mon experience facilement.

**Criteres d'acceptation :**
- [ ] Cron Vercel quotidien : `GET /api/cron/annuaire-followup` a 10h00
- [ ] Cherche dans `provider_contacts` les lignes ou `created_at` = J-2 AND `followup_sent_at` IS NULL AND `whatsapp_opted_in` = true
- [ ] Respecte `shabbatScheduler.ts` existant (pas d'envoi vendredi 14h - samedi 21h)
- [ ] Pour chaque contact eligible : envoie le message WhatsApp structure avec 5 liens de note
- [ ] Met a jour `followup_sent_at` apres envoi
- [ ] Log des envois dans la console (Sentry en prod)

**Effort :** 2h

---

#### R4.2 — Tokens d'avis signes
**En tant que** developpeur,
**Je dois** creer un systeme de tokens securises pour les liens d'avis,
**Pour** que les utilisateurs puissent noter sans se reconnecter.

**Criteres d'acceptation :**
- [ ] Fichier `/src/lib/reviewTokens.ts`
- [ ] `generateReviewToken(userId, providerId, daysValid)` → JWT HS256 signe avec `REVIEW_TOKEN_SECRET`
- [ ] `verifyReviewToken(token)` → retourne `{ userId, providerId }` ou throw
- [ ] Token valide 7 jours
- [ ] Dans les liens WhatsApp : `/annuaire/avis?token=XXX&rating=N`
- [ ] Variable d'environnement `REVIEW_TOKEN_SECRET` a ajouter dans Vercel

**Effort :** 1h

---

#### R4.3 — Page de depot d'avis
**En tant que** utilisateur ayant recu un lien WhatsApp,
**Je veux** laisser mon avis en 1 clic sur un formulaire simple,
**Pour** aider la communaute sans effort.

**Criteres d'acceptation :**
- [ ] Route `/src/app/annuaire/avis/page.tsx` (public, acces via token)
- [ ] Extraction du token et pre-remplissage de la note depuis `?rating=N`
- [ ] Formulaire : note 1-5 (modifiable), commentaire optionnel (textarea)
- [ ] Affichage du prenom du prestataire et de la categorie
- [ ] Submit → `POST /api/annuaire/avis` → insert dans `provider_reviews` (status=pending)
- [ ] Confirmation : "Merci ! Votre avis aide la communaute francophone."
- [ ] Si token expire : message explicatif + lien vers l'annuaire
- [ ] Recalcul de `average_rating` et `total_reviews` dans `providers` apres insert (trigger SQL ou dans l'API)

**Effort :** 3h

---

#### R4.4 — Relance unique a J+5
**En tant que** utilisateur n'ayant pas repondu au premier suivi,
**Je veux** recevoir un rappel discret,
**Pour** avoir une deuxieme chance de noter si j'ai oublie.

**Criteres d'acceptation :**
- [ ] Dans le meme cron `/api/cron/annuaire-followup` : chercher aussi les contacts ou `followup_sent_at` = J-3 AND `followup_reminder_sent_at` IS NULL AND pas de review associee
- [ ] Message court : "Bonjour [Prenom], avez-vous pu joindre [Prestataire] ? Votre retour aide la communaute. [lien]"
- [ ] Met a jour `followup_reminder_sent_at`
- [ ] Pas de 3e relance (respecter le silence)

**Effort :** 1h

---

## EPIC R5 : Navigation et integration dans l'app
**Objectif :** Integrer l'annuaire dans l'experience Tloush existante
**Sprint :** R1
**Priorite :** P1

### Stories

#### R5.1 — Navigation et accès depuis l'app
**En tant que** utilisateur Tloush,
**Je veux** acceder a l'annuaire depuis la navigation principale,
**Pour** le decouvrir naturellement.

**Criteres d'acceptation :**
- [ ] Ajout d'un item "Annuaire" dans `AppNav.tsx` (desktop nav + mobile bottom bar)
- [ ] Icone `Star` ou `Users` de Lucide
- [ ] Position : entre "Dashboard" et "Assistant" dans la nav mobile (4e slot)
- [ ] Lien vers `/annuaire`
- [ ] Badge "Nouveau" pendant les 30 premiers jours apres le lancement

**Effort :** 30min

---

#### R5.2 — Widget annuaire sur le dashboard
**En tant que** utilisateur connecte,
**Je veux** voir mes derniers contacts et un acces rapide a l'annuaire depuis le dashboard,
**Pour** y retourner facilement.

**Criteres d'acceptation :**
- [ ] Nouveau widget dans `/dashboard` : "Tloush Recommande"
- [ ] Affiche les 2 derniers prestataires contactes (prenom, categorie, date)
- [ ] Bouton "Laisser un avis" pour les contacts sans avis
- [ ] Bouton "Voir l'annuaire" en bas du widget
- [ ] Widget visible uniquement si l'utilisateur a au moins 1 contact (sinon : CTA "Decouvrez nos prestataires")

**Effort :** 2h

---

#### R5.3 — Cross-promotion dans les rapports d'analyse
**En tant que** utilisateur qui vient d'analyser un document,
**Je veux** voir une suggestion de prestataire quand le document y fait reference,
**Pour** trouver facilement un professionnel.

**Criteres d'acceptation :**
- [ ] Dans `AnalysisSummaryCard.tsx` : detection des documents de type `invoice`, `quote`, `contract` lies a un metier
- [ ] Si detectable (plombier, electricien, etc.) : afficher un encart "Besoin d'un professionnel ?"
- [ ] Encart : texte contextuel + bouton "Voir les [metier]s recommandes" → `/annuaire/[categorie]`
- [ ] Si document analyse contient une anomalie de prix : "Ce devis semble eleve — comparez avec nos prestataires"
- [ ] Tracking PostHog : `directory_cross_promo_clicked`

**Effort :** 2h

---

## EPIC R6 : SEO et contenu editorial
**Objectif :** Generer du trafic organique Google sur les requetes francophones
**Sprint :** R2
**Priorite :** P1

### Stories

#### R6.1 — Schema JSON-LD et metadata
**En tant que** proprietaire du produit,
**Je dois** implementer le balisage schema.org,
**Pour** obtenir des rich snippets dans Google (etoiles, notes).

**Criteres d'acceptation :**
- [ ] Composant `ProviderSchema.tsx` qui genere le JSON-LD `LocalBusiness` + `AggregateRating`
- [ ] Schema `ItemList` sur les pages categorie
- [ ] Schema `FAQPage` sur les pages categorie (5 questions par metier)
- [ ] Sitemap dynamique mis a jour : `/annuaire`, `/annuaire/[categorie]`, `/annuaire/[categorie]/[slug]`
- [ ] `robots.txt` : autoriser le crawl de `/annuaire/*`
- [ ] `canonical` correct sur chaque page pour eviter le duplicate content
- [ ] OpenGraph : og:title, og:description, og:image pour chaque page

**Effort :** 2h

---

#### R6.2 — Contenu editorial par categorie
**En tant que** visiteur cherchant un prestataire,
**Je veux** trouver des informations utiles sur le metier en Israel,
**Pour** faire un choix eclaire.

**Criteres d'acceptation :**
- [ ] Section "Guide" en bas de chaque page categorie (apres la liste)
- [ ] Contenu editorial : "Comment choisir un [metier] en Israel", fourchette de prix, termes cles en hebreu
- [ ] FAQ : 5 questions/reponses specifiques au metier (avec schema FAQPage)
- [ ] Glossaire hebreu-francais : terms du metier (ex: "אינסטלטור = plombier")
- [ ] Contenu stocke dans `/src/data/directory-content.ts` (pas en base)
- [ ] 5 fichiers de contenu pour les 5 categories V1

**Effort :** 3h

---

#### R6.3 — Pages ville+categorie
**En tant que** visiteur cherchant un plombier a Netanya,
**Je veux** trouver une page dediee a ma ville,
**Pour** des resultats pertinents a ma localisation.

**Criteres d'acceptation :**
- [ ] Route `/annuaire/[categorie]?city=netanya` OU `/annuaire/[categorie]/[ville]` (a valider)
- [ ] Filtrage automatique par ville dans le listing
- [ ] Metadata SEO dynamique : "[Categorie] francophone a [Ville] | Tloush"
- [ ] Si 0 prestataires dans la ville : "Bientot disponible a [Ville] — recevez une alerte" (formulaire email)
- [ ] `generateStaticParams` pour les combinaisons categorie+ville ayant au moins 1 prestataire

**Effort :** 2h

---

## Recapitulatif des epics

| Epic | Titre | Sprint | Effort total | Priorite |
|------|-------|--------|-------------|----------|
| R1 | Fondations techniques | R0 | ~8h | P0 |
| R2 | Pages publiques SEO | R0-R1 | ~18h | P0 |
| R3 | Inscription et admin prestataires | R1 | ~12h | P0 |
| R4 | Suivi qualite WhatsApp | R1-R2 | ~7h | P1 |
| R5 | Navigation et integration | R1 | ~4.5h | P1 |
| R6 | SEO et contenu editorial | R2 | ~7h | P1 |
| **Total** | | | **~56.5h** | |
