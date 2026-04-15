# Mapping technique — Audit public Tloush

**Sources** :
- Audit public fourni le 2026-04-15 (35 pages auditées, public only)
- Connaissance directe du repo post-merges P0/P1/P2 (PRs #11/#12/#13, main au sha `6f39f75`)

**Note** : l'audit référence un "audit connecté" (cité pour `/calculator`, Pitzouim 8.33%, etc.) qui n'est pas fourni. Les findings qui s'appuient sur ce document sont tracés avec `à confirmer`.

**Légende** :
- Source : `public` = fichier routage public / `authenticated` = route `(app)/`
- Risque : `élevé` (blocker légal/UX/prod) / `moyen` (défaut visible) / `faible` (polish)

---

## 1. Homepage — promesse "acces illimite" contraire au pricing

- Source : public
- Référence du finding : Homepage #1 (problème 1), Synthèse critique #2
- Symptôme : Hero dit `3 analyses gratuites • Puis 49₪/mois pour un acces illimite` alors que `/pricing` limite Solo à 30 analyses/mois. Promesse cassée, risque litige CGV.
- Cause probable : texte hardcodé dans Hero, non branché sur une source de vérité `/pricing`. Oubli lors du commit P0.3 `fix(cgv): align section 4 plans with /pricing` qui a aligné les CGV mais PAS la homepage.
- Route(s) concernée(s) : `/`
- Fichier(s) probable(s) : `src/components/landing/Hero.tsx:84` (confirmé par grep)
- Composant(s) / hook(s) / service(s) : `Hero` (Server/Client component), aucun hook — chaîne littérale
- Niveau de risque : élevé
- Correctif recommandé : remplacer `pour un acces illimite` par `jusqu'a 30 analyses/mois`. Idéalement déplacer la phrase dans une constante partagée avec `src/app/pricing/page.tsx` (ex. `src/lib/pricingCopy.ts`).
- Test à ajouter / vérifier : snapshot Playwright sur homepage hero text + test unitaire qui vérifie que la chaîne contenant `49` matche `30 analyses` (guard anti-régression). Alternative : grep CI bloquant `illimit` dans `src/components/landing/`.
- Dépendances / impacts potentiels : aucun. Modif purement textuelle.
- Niveau de confiance : élevé

---

## 2. Homepage — Plan Famille absent alors que mentionné dans témoignages

- Source : public
- Référence du finding : Homepage #2
- Symptôme : Aucune mention du plan Famille (99₪/mois) sur la homepage, mais 2 témoignages l'évoquent.
- Cause probable : section pricing-teaser de la homepage construite avant l'ajout du plan Famille ; les témoignages ont été actualisés sans maj du teaser.
- Route(s) concernée(s) : `/`
- Fichier(s) probable(s) : `src/components/landing/Hero.tsx` (pricing teaser), `src/components/landing/Testimonials.tsx` (6 entrées hardcodées — confirmé par lecture antérieure)
- Composant(s) / hook(s) / service(s) : `Hero`, `Testimonials`
- Niveau de risque : moyen
- Correctif recommandé : ajouter une ligne courte `Plan Famille : 99₪/mois jusqu'a 5 membres` dans le pricing teaser ou la section "Why Tloush", OU supprimer les références Famille des témoignages. Cohérence simple.
- Test à ajouter / vérifier : test d'intégrité — si une constante `TESTIMONIALS` contient une entrée `plan: "Plan Famille"`, alors la homepage doit rendre un bloc `Plan Famille`. Guard unit test.
- Dépendances / impacts potentiels : aucun.
- Niveau de confiance : élevé

---

## 3. Homepage — témoignages non vérifiables

- Source : public
- Référence du finding : Homepage #3
- Symptôme : 6 témoignages hardcodés avec prénom + initiale uniquement (ex. `Maud C.`), aucune photo, aucun lien, aucun rôle, aucun identifiant.
- Cause probable : tableau statique `TESTIMONIALS` dans `Testimonials.tsx` utilisé pour gagner du temps au MVP ; jamais remplacé par de vraies données.
- Route(s) concernée(s) : `/`
- Fichier(s) probable(s) : `src/components/landing/Testimonials.tsx` (lignes 6-43)
- Composant(s) / hook(s) / service(s) : `Testimonials`
- Niveau de risque : moyen (confiance, pas blocker)
- Correctif recommandé : 2 options.
  1. Brancher sur une table Supabase `testimonials` avec `author_name`, `author_photo_url`, `author_linkedin`, `verified: boolean`, et rendre `unverified → opacité 60 %` ou masquer.
  2. Marquer explicitement `Avis collecte en decembre 2025` + ajouter un disclaimer "prenoms modifies a la demande des utilisateurs".
- Test à ajouter / vérifier : si source DB, test qu'il y a ≥1 `verified: true`. Si disclaimer, guard CI grep.
- Dépendances / impacts potentiels : si migration vers DB → impact build (fetch sur page homepage SSR). Attention à ne pas ralentir le Hero.
- Niveau de confiance : élevé

---

## 4. Homepage — "15+ outils" non étayé + CTA doublons + ancre risque-404

- Source : public
- Référence du finding : Homepage #4, #5, #6, #7
- Symptôme :
  - Stat "15+ outils intégrés" ni listée ni cliquable.
  - CTA secondaires en double (`Voir les plans`, `Commencer maintenant`) sans hiérarchie.
  - Ancre footer `#how-it-works` potentiellement orpheline si la section n'a pas cet id.
  - Absence de preuve sociale chiffrée (nb utilisateurs, nb documents analysés).
- Cause probable : itérations UX successives sans audit final.
- Route(s) concernée(s) : `/`
- Fichier(s) probable(s) :
  - `src/components/landing/HowItWorks.tsx` → vérifier `id="how-it-works"` sur la section
  - `src/components/landing/Hero.tsx` → CTAs
  - `src/components/landing/Testimonials.tsx` → section stats bas de page (déjà vu : `[{value:'5', label:...}, {value:'15+', label:'Outils integres'}, ...]`)
  - `src/components/layout/Footer.tsx:28` → lien `/#how-it-works`
- Composant(s) / hook(s) / service(s) : landing components, Footer
- Niveau de risque : faible-moyen
- Correctif recommandé :
  - Vérifier que `HowItWorks` a `<section id="how-it-works">`. Si absent, ajouter.
  - Rendre le "15+ outils" cliquable → link vers `/calculateurs` (ou section Features).
  - Supprimer 1 des 2 CTA secondaires, garder hiérarchie claire primaire/secondaire.
  - Remplacer `15+` par un vrai compteur (ex. `6 calculateurs + scanner + droits-olim + ...`) généré depuis nav source.
- Test à ajouter / vérifier : test navigation Playwright `click footer → scroll to how-it-works`. Test unit qui vérifie `<section id="how-it-works">` présent.
- Dépendances / impacts potentiels : aucun.
- Niveau de confiance : moyen (sections Footer et HowItWorks non relues cette passe)

---

## 5. Pricing — gaps annuel / comparatif / € / FAQ facturation

- Source : public
- Référence du finding : Tarifs #2-#7
- Symptôme :
  - Pas de toggle mensuel/annuel.
  - Pas de tableau comparatif clair.
  - Pas de prix en € à côté du ₪ (audience francophone expat).
  - Pas de FAQ spécifique facturation (TVA Ma'am 17 %, remboursement, devise).
  - Ambiguïté "3 analyses gratuites" = trial ou plan Free ?
  - Pas de CTA "Me contacter" pour cas > 5 membres.
- Cause probable : page pricing minimale de MVP, non étoffée.
- Route(s) concernée(s) : `/pricing`
- Fichier(s) probable(s) : `src/app/pricing/page.tsx` (const `PLANS` ligne 10-67, FAQ existante lignes 192-220)
- Composant(s) / hook(s) / service(s) : page server-side statique, pas de hook
- Niveau de risque : moyen (impact conversion)
- Correctif recommandé :
  - Ajouter 2 lignes de FAQ : "Puis-je avoir une facture avec TVA Ma'am?" + "Les prix sont-ils en € ou ₪?".
  - Ajouter tableau comparatif sous les cards (markdown table ou grid CSS).
  - Ajouter conversion `~12€` à côté de `49₪` et `~25€` à côté de `99₪` (approximation hardcodée ou calcul fixe).
  - Clarifier : `Gratuit (3 analyses offertes a vie, puis passage obligatoire au plan Solo)`.
  - Toggle annuel : hors scope minimal, à faire séparément si Stripe est configuré.
- Test à ajouter / vérifier : test qu'aucun des 3 plans n'a de chaîne `unlimit` / `illimit`. Test que "TVA" ou "Ma'am" apparaît dans la FAQ.
- Dépendances / impacts potentiels : le toggle annuel nécessite 2 nouveaux `priceId` Stripe côté env + handler — refactor non minimal.
- Niveau de confiance : élevé

---

## 6. Mentions légales — placeholder "[à compléter]" visible publiquement

- Source : public
- Référence du finding : Mentions légales #1, Synthèse CRITIQUE #1, Priorité #1
- Symptôme : la page contient le texte "(Raison sociale, numéro d'enregistrement, adresse du siège social et identité du représentant légal à compléter selon la forme juridique retenue.)" — placeholder en prod.
- Cause probable : page déployée avec le template initial jamais rempli. Confirmé par lecture du fichier, lignes 45-46.
- Route(s) concernée(s) : `/mentions-legales`
- Fichier(s) probable(s) : `src/app/mentions-legales/page.tsx:44-47`
- Composant(s) / hook(s) / service(s) : server component statique
- Niveau de risque : élevé (non-conformité légale, rupture de confiance immédiate)
- Correctif recommandé :
  - **BLOCKER** : demander à l'utilisateur les infos légales réelles (forme juridique ח״פ/ע״מ, numéro, adresse, représentant). **Je ne peux pas inventer ces données.**
  - Une fois fournies : remplacer le bloc placeholder par un paragraphe structuré + ajouter un bloc `Directeur de la publication`.
  - En attendant : ajouter une bannière `Page en cours de mise a jour — contactez contact@tloush.com pour toute demande` ou retirer la page du menu footer.
- Test à ajouter / vérifier : guard CI grep `à compléter` ou `to complete` dans `src/app/mentions-legales/` → bloquer le build si trouvé.
- Dépendances / impacts potentiels : aucun technique. 100% dépendant de la fourniture des infos légales par l'utilisateur.
- Niveau de confiance : élevé

---

## 7. CGV — identité légale + TVA israélienne absentes

- Source : public
- Référence du finding : CGV #1, #2, #4
- Symptôme :
  - Aucune raison sociale, aucun numéro d'enregistrement, aucune adresse dans les CGV.
  - Pas de mention TVA israélienne (Ma'am 17%) dans les prix TTC.
  - Pas d'identité du représentant légal.
- Cause probable : idem Mentions légales — template initial non rempli. CGV déclare `prix TTC` sans détailler la TVA applicable.
- Route(s) concernée(s) : `/cgv`
- Fichier(s) probable(s) : `src/app/cgv/page.tsx` — array `SECTIONS` (15 entrées). Article 1 "Objet" ne cite pas l'entité exploitante, article 4 "Plans et tarification" ne ventile pas la TVA.
- Composant(s) / hook(s) / service(s) : server component statique, rendering markdown-like
- Niveau de risque : élevé (même blocker légal que #6)
- Correctif recommandé :
  - Ajouter en tête de l'article 1 : `Le Service est edite par [raison sociale], [forme juridique], [numero enregistrement], [adresse siege].`
  - Dans l'article 4 : ajouter `Les prix indiques incluent la TVA israelienne (Ma'am 17 %). Une facture electronique est disponible sur demande.`
  - Une fois ces données disponibles, mutualiser avec `mentions-legales` dans `src/lib/legalEntity.ts` pour éviter la divergence future.
- Test à ajouter / vérifier : même guard grep `[raison sociale]` ou `à compléter`. Test que la chaîne `Ma'am` apparaît dans les CGV.
- Dépendances / impacts potentiels : dépend des infos légales (finding #6). Une fois fournies, les 2 pages sont corrigées en parallèle.
- Niveau de confiance : élevé

---

## 8. CGV — droit de rétractation flou (article L221-18 français vs droit israélien)

- Source : public
- Référence du finding : CGV #3
- Symptôme : article "Droit de rétractation" présent (14 jours) alors que les CGV invoquent le droit israélien qui n'a pas d'équivalent strict à l'art. L221-18 du Code conso français.
- Cause probable : rédaction inspirée de templates SaaS FR sans adaptation au droit local.
- Route(s) concernée(s) : `/cgv`
- Fichier(s) probable(s) : `src/app/cgv/page.tsx` — article 7 "Droit de rétractation" (rédaction actuelle : "14 jours + renonciation tacite à l'utilisation active").
- Composant(s) / hook(s) / service(s) : idem
- Niveau de risque : moyen (flou juridique, potentiel contestation)
- Correctif recommandé : reformuler en citant explicitement la **Loi israélienne sur la protection du consommateur (חוק הגנת הצרכן 1981)** article 14ה (distance contract) qui prévoit un délai de 14 jours mais avec des exceptions différentes. Ou supprimer l'article et renvoyer à la Loi israélienne applicable.
  - **À confirmer par avocat israélien**. Tant que non confirmé, maintenir la formulation actuelle avec note interne.
- Test à ajouter / vérifier : aucun automatisable. Review humaine.
- Dépendances / impacts potentiels : affecte la cohérence juridique globale (voir finding #10).
- Niveau de confiance : moyen (cause probable)

---

## 9. Privacy — RGPD gaps (DPO, durée conservation, SCC, cookies)

- Source : public
- Référence du finding : Confidentialité #1-5
- Symptôme :
  - Aucun DPO ni point de contact "données" spécifique.
  - Durée de conservation floue ("tant que le compte est actif", pas de max ni purge).
  - Pas de politique cookies détaillée (PostHog + Sentry = traceurs) alors que la homepage dit "pas de tracking publicitaire".
  - Transferts hors UE (Anthropic US, Vercel US) sans mention des clauses contractuelles types (SCC) ni du cadre DPF.
- Cause probable : rédaction initiale focalisée sur le narratif "on respecte la vie privée", sans check RGPD formel.
- Route(s) concernée(s) : `/privacy`
- Fichier(s) probable(s) : `src/app/privacy/page.tsx` — array `SECTIONS` (non relu cette passe, mais structure identique à CGV).
- Composant(s) / hook(s) / service(s) : server component statique
- Niveau de risque : moyen-élevé (exposition RGPD)
- Correctif recommandé :
  - Ajouter section "Point de contact données" : `Pour toute demande relative a vos donnees, contactez privacy@tloush.com (ou contact@tloush.com).`
  - Préciser durée : `Les documents et donnees analysees sont conserves tant que le compte est actif, et jusqu'a 90 jours apres la suppression du compte (delai de purge automatique).`
  - Ajouter section "Transferts hors UE" : mentionner que Anthropic (US) et Vercel (US) sont couverts par les **Standard Contractual Clauses (SCC)** et par le cadre **EU-US Data Privacy Framework (DPF)** s'ils y sont adhérents.
  - Ajouter section "Cookies et analytics" : lister PostHog (comportement) + Sentry (erreurs), préciser qu'ils ne servent pas à de la publicité, et retirer la mention "pas de tracking" qui est ambiguë → remplacer par "pas de cookies publicitaires tiers".
- Test à ajouter / vérifier : guard grep que `privacy@` OU `contact@` apparaît dans privacy/page.tsx. Test qu'il y a une section `Cookies`.
- Dépendances / impacts potentiels : la maj de durée (90j post-suppression) nécessite de vérifier/ajouter un cron job Supabase qui fait la purge. Hors scope minimal — documenter d'abord, implémenter le cron ensuite.
- Niveau de confiance : moyen (Privacy non relue cette passe)

---

## 10. Cadre juridique incohérent entre CGV / Privacy / Mentions légales

- Source : public
- Référence du finding : CGV #5, Privacy #5, Synthèse Incohérences #4, #5
- Symptôme :
  - CGV : `droit applicable = droit israélien`.
  - Privacy : RGPD uniquement.
  - Mentions légales : `Supabase en Irlande`.
  - Privacy : `Europe-based servers Supabase`.
  - Homepage : "chiffrement de bout en bout" (non vérifié code).
- Cause probable : 3 documents écrits à des moments différents par des rédacteurs (ou prompts) différents, sans source de vérité unique.
- Route(s) concernée(s) : `/cgv`, `/privacy`, `/mentions-legales`
- Fichier(s) probable(s) :
  - `src/app/cgv/page.tsx` (article 13 "Droit applicable")
  - `src/app/privacy/page.tsx`
  - `src/app/mentions-legales/page.tsx`
- Composant(s) / hook(s) / service(s) : aucun, pages statiques
- Niveau de risque : moyen (pas blocker immédiat, mais audit RGPD risqué)
- Correctif recommandé :
  - Créer `src/lib/legalEntity.ts` avec les constantes : `APPLICABLE_LAW`, `HOSTING_LOCATION`, `DATA_PROCESSORS[]`, `ENTITY_INFO`.
  - Importer ces constantes dans les 3 pages au lieu de hardcoder.
  - Décider d'un seul cadre : le produit est pour olim francophones résidant en Israël → **droit israélien applicable** (cohérent avec CGV) MAIS **le RGPD s'applique aussi** (résidents UE ou données transitant via UE). Ajouter un paragraphe commun dans Privacy : `Nous appliquons a la fois le RGPD (residence UE) et la Loi israelienne sur la protection de la vie privee (חוק הגנת הפרטיות 1981).`
- Test à ajouter / vérifier : import check que les 3 pages utilisent `legalEntity.ts`. Test qu'aucune des 3 pages ne hardcode "Irlande" ou "Supabase".
- Dépendances / impacts potentiels : ne bloque pas le build, mais touche 3 fichiers.
- Niveau de confiance : élevé

---

## 11. /immobilier — page vide + bug rendu + non indexée

- Source : public
- Référence du finding : Immobilier #1-5, Synthèse critique #3
- Symptôme :
  - Page affiche 0 annonce en état initial sans aucun filtre restrictif.
  - Message "Aucune annonce trouvée. Essayez d'élargir vos critères" incohérent avec 0 critère posé.
  - Fragments de code Next.js visibles dans le rendu (probablement hydration non terminée ou SSR absent).
  - Pas de CTA de repli (alerte email, exploration Tel Aviv).
  - Absente du sitemap.xml (voir finding #25).
- Cause probable :
  - Page entièrement `'use client'` + `ssr: false` pour Leaflet → premier paint = état Zustand vide + message d'erreur par défaut.
  - `fetchListings()` dans un `useEffect` retourne 0 résultat (DB `listings` probablement vide ou table inexistante).
  - Les "fragments Next.js visibles" = peut-être du server component embarqué mal hydraté.
- Route(s) concernée(s) : `/immobilier`
- Fichier(s) probable(s) :
  - `src/app/immobilier/page.tsx` (client, confirmé ligne 1 `'use client'`)
  - `src/store/listingsStore.ts`
  - `src/components/listings/ListingsMap.tsx` (dynamic import ssr: false)
  - API backing : probablement `src/app/api/listings/search/route.ts` (vu via grep antérieur)
- Composant(s) / hook(s) / service(s) : `useListingsStore`, `ListingCard`, `ListingsFilters`, `ListingsMap`, `ListingsPagination`
- Niveau de risque : élevé (page publique cassée, perte SEO + confiance)
- Correctif recommandé (ordre d'impact) :
  1. Quick win : masquer la page `/immobilier` tant que `listings` est vide → redirect vers `/` OU page `en construction` avec formulaire "prevenez-moi".
  2. OU publier un dataset minimum (5-10 listings de test sur 3 villes phares).
  3. Investiguer les "fragments Next.js visibles" — probable problème SSR fallback. À confirmer en ouvrant la page en navigateur.
  4. Corriger le message : si `total === 0 && !hasFilters`, afficher "Aucune annonce disponible pour le moment" au lieu de "elargir vos criteres".
- Test à ajouter / vérifier :
  - Test API `GET /api/listings/search` qui vérifie que la table existe et renvoie une liste (peut être vide, mais pas une erreur).
  - Test Playwright sur `/immobilier` : vérifier qu'aucun fragment `__next_f` ou `<script>` orphelin n'apparaît dans le DOM rendu.
- Dépendances / impacts potentiels : si la table `listings` est vide en prod (aucun scraping Yad2 actif), le fix cosmétique ne résoudra pas le problème de fond. À clarifier avec l'utilisateur : feature active ou en pause ?
- Niveau de confiance : moyen (les "fragments Next.js" nécessitent inspection navigateur)

---

## 12. /annuaire — 3 catégories vides publiées (electricien, serrurier, bricoleur)

- Source : public
- Référence du finding : Annuaire Électricien, Serrurier, Bricoleur ; Synthèse critique #4, Priorité #3
- Symptôme : 3 sous-pages `/annuaire/{electricien,serrurier,bricoleur}` affichent "0 prestataire, Bientôt disponible". Publiées dans le sitemap (PROVIDER_CATEGORY_SLUGS contient les 6 catégories) → coquilles SEO.
- Cause probable : catégories déclarées statiquement dans `src/types/directory.ts` (PROVIDER_CATEGORIES = 6 entrées, confirmé par grep) ET dans `src/app/sitemap.ts:4` (PROVIDER_CATEGORY_SLUGS = 6 slugs hardcodés). Le sitemap itère les 6 catégories même si la DB `providers` n'en contient aucun pour certaines.
- Route(s) concernée(s) : `/annuaire/electricien`, `/annuaire/serrurier`, `/annuaire/bricoleur` (et par extension les 3 autres moins vides)
- Fichier(s) probable(s) :
  - `src/types/directory.ts` lignes 107-159 (PROVIDER_CATEGORIES)
  - `src/app/sitemap.ts:4` (PROVIDER_CATEGORY_SLUGS hardcodé)
  - `src/app/annuaire/[categorie]/page.tsx` (template catégorie)
- Composant(s) / hook(s) / service(s) : template catégorie + fetch Supabase `providers` filtré par catégorie
- Niveau de risque : élevé (SEO + confiance)
- Correctif recommandé :
  1. Dans `sitemap.ts`, remplacer le bloc PROVIDER_CATEGORY_SLUGS statique par une requête Supabase qui ne pousse que les catégories avec `COUNT(providers where status='active') > 0`. Les catégories vides restent dans la nav mais ne sont pas dans le sitemap.
  2. Dans `src/app/annuaire/[categorie]/page.tsx`, si `providers.length === 0`, ajouter `export const metadata = { robots: { index: false } }` dynamique → noindex Google + landing `Recrutement prestataires` avec formulaire capture email.
  3. Dans `src/types/directory.ts`, ajouter un champ `launched: boolean` par catégorie → filtrer côté nav `/annuaire`.
- Test à ajouter / vérifier : test que le sitemap ne contient que les catégories avec `≥1` prestataire actif. Test HTTP que les catégories vides renvoient un meta `robots: noindex`.
- Dépendances / impacts potentiels : nécessite accès à la DB au moment du build (déjà le cas via `SUPABASE_SERVICE_ROLE_KEY` dans sitemap.ts).
- Niveau de confiance : élevé

---

## 13. /annuaire — fiches prestataires : title meta dupliqué "Tloush | Tloush"

- Source : public
- Référence du finding : Fiche Stéphane, Fiche Yossi, Fiche Benjamin ; Calculateurs hub #2 (title "Tloush" dupliqué aussi)
- Symptôme : Plusieurs pages (fiches prestataires, hub calculateurs, probablement d'autres) affichent un title final du type `X — Y | Tloush | Tloush` avec le suffixe Tloush écrit deux fois.
- Cause probable : **CONFIRMÉ par grep `src/app/layout.tsx:10-12`** :
  ```
  title: { default: "...", template: "%s | Tloush" }
  ```
  ET dans `src/app/annuaire/[categorie]/[slug]/page.tsx:31` :
  ```
  title: `${first_name} ${last_name.charAt(0)}. — ${cat.label} francophone a ${city} | Tloush`
  ```
  Le template root ajoute `%s | Tloush` → `"X | Tloush" + " | Tloush"` = `"X | Tloush | Tloush"`.
- Route(s) concernée(s) : `/annuaire/[categorie]/[slug]`, `/calculateurs`, `/not-found`, probablement `/modeles`, `/droits`, etc.
- Fichier(s) probable(s) :
  - `src/app/layout.tsx:10-12` (template `"%s | Tloush"`)
  - `src/app/annuaire/[categorie]/[slug]/page.tsx:31` (ajoute `| Tloush` manuellement)
  - `src/app/calculateurs/page.tsx` (metadata title = "Calculateurs salaire Israël — Tloush" — confirmé audit antérieur)
  - À vérifier : toutes les pages avec `metadata.title` contenant `Tloush` en suffixe
- Composant(s) / hook(s) / service(s) : metadata API Next.js
- Niveau de risque : moyen (SEO + polish, pas blocker)
- Correctif recommandé :
  - Décision : garder le `template: "%s | Tloush"` du root layout (pattern idiomatique Next.js) **et** retirer tous les `| Tloush` hardcodés dans les `metadata.title` enfants.
  - Les pages qui veulent un titre SANS suffixe (ex. homepage elle-même) utilisent `title: { absolute: "..." }`.
  - Grep systématique `\| Tloush` dans `src/app/**/page.tsx` pour lister toutes les occurrences.
- Test à ajouter / vérifier :
  - Guard CI grep : `rg "title:.*\| Tloush" src/app/` doit retourner 0 ligne (sauf root layout).
  - Test Playwright sur 5 pages types : vérifier que `document.title` ne contient pas `Tloush | Tloush`.
- Dépendances / impacts potentiels : refactor sur ~10-15 fichiers. Aucune casse fonctionnelle.
- Niveau de confiance : élevé

---

## 14. /annuaire — fiches prestataires : typos systématiques ("electrien", "a" au lieu de "à", etc.)

- Source : public
- Référence du finding : Fiche Stéphane #2, #3 ; Fiche Yossi #1-3 ; Fiche Benjamin #2, #3 ; Annuaire Peintre #2
- Symptôme :
  - "Stephane" sans accent (meta title)
  - "a Netanya" sans accent (meta title + meta description)
  - "electrien" au lieu de "électricien" (description prestataire)
  - "Recommande" sans accent
  - Description français cassée ("à la Français au niveau des climatisations")
  - Disclaimer "En demandant ces coordonnees, vous reconnaissez que Tloush agit uniquement comme intermediaire" (accents manquants)
  - "Benjamin l." (minuscule) vs "Benjamin L." (majuscule) → casse inconsistante
- Cause probable (double) :
  1. **Template meta hardcodé sans accents** : `src/app/annuaire/[categorie]/[slug]/page.tsx:31` : `` `${first_name} ${last_name.charAt(0)}. — ${cat.label} francophone a ${city}` `` → `a` hardcodé sans accent.
  2. **Données prestataires en DB non relues** (descriptions, noms) : saisies manuellement par les prestataires ou par un admin sans relecture éditoriale.
  3. **`.charAt(0)`** ne forcera pas la majuscule → si la DB a `lellouche` (minuscule), l'affichage sera `l.` au lieu de `L.`.
- Route(s) concernée(s) : toutes les fiches `/annuaire/[categorie]/[slug]`
- Fichier(s) probable(s) :
  - `src/app/annuaire/[categorie]/[slug]/page.tsx:31-32` (template meta, hardcodé sans accent)
  - `src/app/annuaire/[categorie]/[slug]/DirectoryProviderClient.tsx` (rendu des champs description, à confirmer)
  - DB : table `providers` (champs `first_name`, `last_name`, `description`, etc.)
- Composant(s) / hook(s) / service(s) : metadata API + Supabase providers fetch
- Niveau de risque : moyen (confiance + conversion SEO)
- Correctif recommandé :
  1. **Quick win code** : dans le template meta, remplacer `a ${city}` → `à ${city}`. Faire `.charAt(0).toUpperCase()` sur `last_name`. Traquer le disclaimer dans `DirectoryProviderClient.tsx` et le corriger.
  2. **Données** : ajouter un script d'admin qui normalise les champs prestataires :
     - `first_name` + `last_name` → `.trim()` + capitalisation
     - `description` → passage à un LLM pour correction orthographique FR + garde-fou longueur
  3. **Préventif** : ajouter un check Zod sur l'API d'inscription prestataire qui refuse les descriptions contenant des motifs cassés.
- Test à ajouter / vérifier :
  - Unit test : `capitalizeLastInitial("lellouche") === "L."`.
  - Test que le template meta contient `à` (accent grave) et pas le simple `a`.
  - Test de sanity DB : `SELECT COUNT(*) FROM providers WHERE description ILIKE '% electrien %'` → doit être 0 après fix.
- Dépendances / impacts potentiels : le fix code ne suffit pas si la DB contient les typos — il faut aussi un script data migration.
- Niveau de confiance : élevé (cause code confirmée, cause data à confirmer)

---

## 15. /annuaire — fiches prestataires : disclaimer juridique hors contexte + 0 avis

- Source : public
- Référence du finding : Fiche Stéphane #3, #4, #5
- Symptôme :
  - Le disclaimer `pas un cabinet juridique ni expert-comptable` apparaît sur une fiche de plombier → hors sujet.
  - 0 avis sur toutes les fiches → aucune preuve de compétence.
  - Gating des coordonnées non annoncé avant clic "Obtenir le numero".
- Cause probable :
  - Disclaimer : probablement inséré par le `Footer` global ou par un composant `DisclaimerBlock` utilisé partout sans contexte. À confirmer.
  - 0 avis : table `provider_reviews` vide ou feature non activée.
  - Gating : comportement du CTA "Obtenir le numero" qui redirige vers login sans preview.
- Route(s) concernée(s) : toutes les fiches `/annuaire/[categorie]/[slug]`
- Fichier(s) probable(s) :
  - `src/app/annuaire/[categorie]/[slug]/DirectoryProviderClient.tsx`
  - `src/components/shared/DisclaimerBlock.tsx` (probable) — à vérifier
  - `src/app/annuaire/avis/` (contient la logique des avis — vu via ls)
- Composant(s) / hook(s) / service(s) : `DisclaimerBlock`, `DirectoryProviderClient`, reviews fetcher
- Niveau de risque : moyen
- Correctif recommandé :
  1. Retirer le `DisclaimerBlock` (juridique/comptable) des fiches prestataires non-juridiques. Remplacer par un disclaimer spécifique : `Tloush ne verifie pas les licences et assurances des prestataires. Demandez les justificatifs avant tout engagement.`
  2. Ajouter une mention claire sur le CTA : `Obtenir le numero de X (compte gratuit requis)` → l'utilisateur sait qu'il va être redirigé vers login.
  3. Pour les 0 avis : afficher `Aucun avis pour le moment. Soyez le premier !` au lieu de rien.
- Test à ajouter / vérifier :
  - Test qu'une fiche prestataire ne contient pas la chaîne `cabinet juridique`.
  - Test que le CTA contient `compte gratuit` ou `inscription`.
- Dépendances / impacts potentiels : si `DisclaimerBlock` est utilisé partout, il faut bien cibler uniquement les fiches prestataires.
- Niveau de confiance : moyen (à confirmer par inspection `DirectoryProviderClient.tsx`)

---

## 16. /annuaire/inscription — consentement CGV/RGPD absent

- Source : public
- Référence du finding : Annuaire — Inscription #1-3
- Symptôme : Formulaire 4 étapes (Identité / Activité / Vérification / Confirmation) sans case visible "j'accepte les CGV / politique de confidentialité". Pas de mention RGPD spécifique (fiche publique = données personnelles). Pas de promesse claire (délai validation, critères refus).
- Cause probable : formulaire construit au MVP sans revue légale. L'inscription publie des données personnelles (nom, photo, téléphone, adresse) → nécessite consentement explicite au titre du RGPD art. 6.1.a.
- Route(s) concernée(s) : `/annuaire/inscription`
- Fichier(s) probable(s) : `src/app/annuaire/inscription/page.tsx` (et possibles sous-composants étape)
- Composant(s) / hook(s) / service(s) : formulaire multi-étapes, API `POST /api/annuaire/inscription` (vu dans `middleware.ts` PUBLIC_ROUTES)
- Niveau de risque : élevé (RGPD)
- Correctif recommandé :
  1. Ajouter à l'étape "Confirmation" 2 checkboxes **obligatoires** :
     - `J'accepte que ma fiche (nom, photo, description, zones, contact) soit publiee publiquement sur tloush.com et indexee par les moteurs de recherche.` (base légale : consentement)
     - `J'ai lu et accepte les CGV et la politique de confidentialite.`
  2. Bloquer la submission si l'une est décochée (form validation côté client + côté API).
  3. Ajouter un paragraphe en tête : `Votre fiche sera validee sous 48h. Delai de retractation : 14 jours.`
  4. Sur l'API `POST /api/annuaire/inscription`, stocker `consent_given_at: timestamptz` dans la table `providers` (migration nécessaire).
- Test à ajouter / vérifier :
  - Test API que POST sans `consent_cgv: true` renvoie 400.
  - Test Playwright que le bouton submit est `disabled` si les checkboxes ne sont pas cochées.
- Dépendances / impacts potentiels : migration DB mineure (ajout colonne `consent_given_at`).
- Niveau de confiance : élevé

---

## 17. /calculateurs — doublon de routes brut-net ↔ /calculator + nav absente

- Source : public + authenticated (doublon entre les deux)
- Référence du finding : Calculateurs Hub #1, #3 ; Synthèse critique #5
- Symptôme :
  - `/calculateurs/brut-net` (route publique) et `/calculator` (route `(app)/calculator/`) produisent le même outil de simulation brut→net. Deux URLs, SEO dupliqué, incohérence produit.
  - `/calculateurs` hub n'est pas dans la navigation principale — accessible uniquement via `#how-it-works` et le footer.
- Cause probable :
  - Historique : `/calculateurs/brut-net` a été créé pour SEO public, `/calculator` pour la version connectée avec sauvegarde éventuelle. Les deux ont divergé sans consolidation.
  - Nav : `AppNav.tsx` (zone auth) liste `/calculator` mais la nav publique (`Header.tsx`) ne liste pas `/calculateurs` à voir.
- Route(s) concernée(s) : `/calculateurs/brut-net`, `/calculator`, `/calculateurs` (hub)
- Fichier(s) probable(s) :
  - `src/app/calculateurs/brut-net/page.tsx` (public, confirmé)
  - `src/app/(app)/calculator/page.tsx` + `CalculatorClient.tsx` (confirmé par ls)
  - `src/app/(app)/calculator/CalculatorClient.tsx` utilise `calculateNetSalary` de `src/lib/israeliPayroll.ts` (même lib que brut-net)
  - `src/components/layout/Header.tsx` (nav publique)
- Composant(s) / hook(s) / service(s) : `calculateNetSalary` (partagé), deux clients différents pour le même calcul
- Niveau de risque : moyen (SEO + UX dev)
- Correctif recommandé (option canonique) :
  1. **Garder `/calculateurs/brut-net` comme canonique** (meilleure URL SEO).
  2. Dans `src/app/(app)/calculator/page.tsx`, remplacer par un `redirect('/calculateurs/brut-net')` simple.
  3. Si le `/calculator` connecté ajoute une fonctionnalité spécifique (sauvegarde, comparaison), l'intégrer dans `/calculateurs/brut-net` via une détection auth : si user connecté, afficher boutons "Sauvegarder", sinon les cacher.
  4. Ajouter `/calculateurs` dans la nav publique `Header.tsx` (menu dropdown "Outils" comme côté auth).
- Test à ajouter / vérifier :
  - Test HTTP : GET `/calculator` → 307 → `/calculateurs/brut-net`.
  - Test que `/calculateurs` apparaît dans le DOM du header public.
- Dépendances / impacts potentiels : potentiellement casse les bookmarks internes qui pointent vers `/calculator`. Vérifier les liens dans le dashboard et ailleurs — remplacer par `/calculateurs/brut-net`.
- Niveau de confiance : moyen (à confirmer : `/calculator` propose-t-il une feature non présente dans brut-net ?)

---

## 18. /calculateurs — sur-promesse "Nouveau" freelance/mashkanta + sources absentes brut-net

- Source : public
- Référence du finding : Calculateurs Hub #4 ; Brut→Net #3, #4
- Symptôme :
  - Hub liste `/freelance` et `/mashkanta` avec badge "Nouveau" alors que (selon audit connecté, à confirmer) ces outils sont basiques.
  - `/calculateurs/brut-net` dit "barèmes 2026" sans source ni date de mise à jour.
  - Pas de mention du gel des tranches d'IR jusqu'à 2027.
- Cause probable :
  - Badges "Nouveau" posés à l'ajout de la feature sans date d'expiration.
  - Source des barèmes connue uniquement dans `src/lib/israeliPayroll.ts` (commentaires), pas exposée à l'utilisateur.
- Route(s) concernée(s) : `/calculateurs`, `/calculateurs/brut-net`, `/freelance`, `/mashkanta`
- Fichier(s) probable(s) :
  - `src/app/calculateurs/page.tsx` (hub — CALCULATORS array avec badge `Nouveau`)
  - `src/app/calculateurs/brut-net/page.tsx` (hero subtitle + disclaimer)
  - `src/lib/israeliPayroll.ts` (source de vérité bareme)
- Composant(s) / hook(s) / service(s) : pages statiques
- Niveau de risque : faible-moyen
- Correctif recommandé :
  1. Retirer les badges "Nouveau" ou leur donner une date d'expiration (ex. champ `added_at` + filtre "< 60 jours").
  2. Dans `/calculateurs/brut-net`, ajouter une ligne sous le hero : `Baremes Rashut HaMisim en vigueur (tranches gelees par la loi des finances 2025-2027). Source : btl.gov.il, taxes.gov.il. Derniere verification : avril 2026.`
  3. Exporter la date de vérification depuis `israeliPayroll.ts` : `export const LAST_VERIFIED = '2026-04-01'` → afficher dynamiquement.
- Test à ajouter / vérifier : guard que `LAST_VERIFIED` est renseigné et < 6 mois.
- Dépendances / impacts potentiels : aucun.
- Niveau de confiance : moyen

---

## 19. /calculateurs/maternite — seuils cotisation Bituach Leumi absents + split père/conjoint

- Source : public
- Référence du finding : Maternite #1, #3
- Symptôme :
  - Pas de test d'éligibilité cotisation BL avant calcul (10/14 derniers mois ou 15/22 mois requis pour toucher les indemnités).
  - Option "Père/Conjoint" présente dans le form mais pas d'explication du split légal possible (transfert partiel à partir de la 7e semaine).
- Cause probable : MVP du calculateur (P1.1 dans cette session) s'est concentré sur le bug du `-6 jours` → oubli des règles d'éligibilité.
- Route(s) concernée(s) : `/calculateurs/maternite`
- Fichier(s) probable(s) : `src/app/calculateurs/maternite/page.tsx`
- Composant(s) / hook(s) / service(s) : form + useState, aucun hook externe
- Niveau de risque : moyen (calcul affiché peut être trompeur pour ~20 % des cas)
- Correctif recommandé :
  1. Ajouter un champ `Mois de cotisation Bituach Leumi au cours des 14 derniers mois` (number input 0-14) et un warning si `< 10` : `Attention : vous n'avez peut-etre pas droit aux indemnites BL. Verification recommandee aupres du centre Bituach Leumi.`
  2. Ajouter un paragraphe d'explication sur le transfert mère → père : `A partir de la 7e semaine post-naissance, la mere peut transferer jusqu'a 8 semaines de conge paye au pere (conditions : couple legal, mere au travail).`
  3. Citer la source : Loi 1954 articles 6-7 (חוק עבודת נשים) + Loi 1995 (חוק הביטוח הלאומי).
- Test à ajouter / vérifier : test qu'un input `cotisation_months < 10` déclenche un warning dans le DOM.
- Dépendances / impacts potentiels : touche uniquement le client page, pas d'API.
- Niveau de confiance : élevé

---

## 20. /calculateurs/indemnites — article 14 sans explication + démission équivalente

- Source : public
- Référence du finding : Indemnites #1-3
- Symptôme :
  - Les 3 niveaux d'Article 14 (0% / 72% / 100%) sont présentés sans explication pédagogique.
  - Motif "Démission équivalente à un licenciement" regroupe des cas très différents (santé, naissance, déménagement 40km, non-paiement salaire, aggravation conditions) → user ne sait pas si son cas s'applique.
  - Pas de champ "dernier salaire déterminant" séparé du "salaire mensuel moyen".
- Cause probable : MVP du calculateur (P1.4 dans cette session) a produit une version fonctionnelle mais sans contenu pédagogique détaillé.
- Route(s) concernée(s) : `/calculateurs/indemnites`
- Fichier(s) probable(s) : `src/app/calculateurs/indemnites/page.tsx`
- Composant(s) / hook(s) / service(s) : form + useState
- Niveau de risque : moyen
- Correctif recommandé :
  1. Sous chaque option Article 14, ajouter 1 ligne d'explication :
     - `Non : votre pension ne contient pas de Keren Pitzuim — pitzuim intégral dû par l'employeur.`
     - `Partiel 72% : votre pension contient une Keren Pitzuim partielle — 28% du pitzuim reste dû par l'employeur.`
     - `Complet 100% : votre pension contient une Keren Pitzuim complète — aucun pitzuim dû, la pension couvre tout.`
  2. Éclater `Démission équivalente` en sous-options (radio group) : santé / naissance / déménagement / non-paiement / aggravation. Chaque sous-option affiche un disclaimer spécifique.
  3. Ajouter un champ optionnel `Dernier salaire déterminant (si différent du salaire moyen)`.
- Test à ajouter / vérifier : unit test que les 3 options article 14 produisent des totaux différents pour mêmes inputs.
- Dépendances / impacts potentiels : ne touche pas la logique de calcul (déjà correcte en P1.4), juste le contenu pédagogique.
- Niveau de confiance : élevé

---

## 21. /modeles — bibliothèque sous-dotée + nav absente + pas de version hébreu

- Source : public
- Référence du finding : Modeles #1-5 ; Synthèse importantes (ajouter nav)
- Symptôme :
  - 5 modèles publiés alors que les besoins francophones en Israël couvrent ≥15 cas classiques (bail, résiliation assurance, opposition PV, contestation amende, etc.).
  - Pas de catégorie Immobilier / Fiscal / Famille (actuelles : salaire, licenciement, heures-sup, documents).
  - Pas de date de dernière mise à jour sur les modèles.
  - Pas de version hébreu en parallèle (utile pour envoi RH/Bituach).
  - `/modeles` n'est pas dans la nav principale publique.
- Cause probable : feature livrée en P1.6 avec 5 templates minimum viables, pas étoffée depuis.
- Route(s) concernée(s) : `/modeles`, `/modeles/[slug]`
- Fichier(s) probable(s) :
  - `src/data/templates.ts` (5 templates hardcodés + type `LetterTemplate`)
  - `src/app/modeles/page.tsx` (hub)
  - `src/app/modeles/[slug]/page.tsx` + `TemplateFiller.tsx`
  - `src/components/layout/Header.tsx` (nav publique à ajouter)
- Composant(s) / hook(s) / service(s) : `TemplateFiller` (client interactif), templates statiques
- Niveau de risque : moyen (SEO + valeur produit)
- Correctif recommandé :
  1. **Quick win nav** : ajouter `/modeles` au Header public → 1 ligne de nav.
  2. **Contenu** : étoffer `templates.ts` de 5 à 12+ modèles. Ajouter 4 nouvelles catégories (`immobilier`, `fiscal`, `famille`, `consommation`). Chaque `LetterTemplate` reçoit un champ `updated_at: string` et `template_he?: string` (optionnel).
  3. Dans `TemplateFiller.tsx`, si `template_he` existe, ajouter un bouton "Voir version hébreu" qui affiche le rendu RTL.
  4. Ajouter sous chaque titre de modèle : `Derniere mise a jour : ${updated_at}`.
- Test à ajouter / vérifier :
  - Test que `templates.ts` contient ≥10 entrées.
  - Test que chaque template a un champ `updated_at` non vide.
  - Test que le header public contient un lien vers `/modeles`.
- Dépendances / impacts potentiels : les nouveaux modèles nécessitent vérification juridique (avocat) si ils citent la loi.
- Niveau de confiance : élevé

---

## 22. /droits — 5 catégories promises / 2 articles publiés + /droits/[slug] 404

- Source : public
- Référence du finding : Droits public #1-4 ; Synthèse critique #8
- Symptôme :
  - Hub `/droits` annonce 5 catégories (Congés, Salaire, Licenciement, Cotisations, Avantages) mais seulement 2 articles réellement publiés (Chofsha 5 min, Heures sup 4 min).
  - `/droits/conges-payes` retourne 404 alors que Congés est une catégorie visible → URLs non propres.
  - Pas de date de MAJ, pas d'auteur, pas de source officielle.
- Cause probable :
  - **Confirmé par lecture `src/app/droits/[slug]/page.tsx`** : `generateStaticParams` itère `guides` depuis `@/data/guides`. Si la catégorie "Congés" a 1 seul guide dont le slug diffère de `conges-payes`, l'URL `/droits/conges-payes` appelle `notFound()` (pas de match).
  - Les catégories affichées dans le hub ne correspondent pas à des pages réelles — ce sont des filtres, pas des URLs.
- Route(s) concernée(s) : `/droits`, `/droits/[slug]`
- Fichier(s) probable(s) :
  - `src/data/guides.ts` (contient les guides — à vérifier le nombre réel)
  - `src/app/droits/page.tsx` (hub avec filtres)
  - `src/app/droits/[slug]/page.tsx` (détail, utilise `notFound()` si slug manquant)
- Composant(s) / hook(s) / service(s) : server components, markdown simple renderer (`renderMarkdown`)
- Niveau de risque : moyen (SEO + crédibilité juridique)
- Correctif recommandé :
  1. **Étoffer `src/data/guides.ts`** de 2 à ≥5 guides (1 par catégorie minimum). Pour chaque guide, ajouter `author`, `updated_at`, `legal_sources: string[]`.
  2. Dans `src/app/droits/[slug]/page.tsx`, afficher l'en-tête : `Par ${author} · Mis à jour le ${updated_at} · Sources : ${legal_sources.join(", ")}`.
  3. **Redirections de catégorie** : créer `/droits/categorie/[cat]/page.tsx` qui liste les guides d'une catégorie. Le hub filtre déjà via `?categorie=` mais des URLs canoniques `/droits/categorie/conges` sont meilleures SEO.
  4. Côté hub, afficher un badge `En construction` sur les catégories avec 0 guide.
- Test à ajouter / vérifier :
  - Test que `guides.length >= 5`.
  - Test que chaque catégorie du hub a au moins un guide OU le badge "En construction".
  - Test HTTP qu'aucune catégorie cliquable depuis le hub ne renvoie 404.
- Dépendances / impacts potentiels : rédaction de 3 nouveaux guides juridiques — nécessite review juridique.
- Niveau de confiance : élevé

---

## 23. /droits-olim — pas de sources officielles ni de disclaimer avant soumission

- Source : public
- Référence du finding : Droits Olim #2-4
- Symptôme : Formulaire 5 questions sans source officielle (Misrad HaKlita, Bituah Leumi), pas de date de mise à jour, pas de disclaimer "non contractuel" avant soumission, pas de lien vers ressources tierces (Nefesh B'Nefesh, etc.).
- Cause probable : page construite comme un quiz de génération de leads, focalisée sur la conversion et pas sur la crédibilité.
- Route(s) concernée(s) : `/droits-olim`
- Fichier(s) probable(s) :
  - `src/app/droits-olim/page.tsx` (client component confirmé)
  - `src/data/olim-rights.ts` (catalogue de droits, modifié en P2.7)
- Composant(s) / hook(s) / service(s) : `DroitsOlimPage`, `filterRightsByProfile`
- Niveau de risque : moyen
- Correctif recommandé :
  1. Dans `olim-rights.ts`, ajouter à `OlimRight` les champs : `source_url?: string`, `source_label?: string`, `updated_at?: string`.
  2. Dans la page, avant le bouton "Découvrir mes droits", afficher : `Les resultats sont indicatifs et bases sur les baremes Misrad HaKlita / Bituah Leumi en vigueur au ${oldest_updated_at}. Consultez un expert pour confirmation.`
  3. Dans l'affichage de chaque droit, ajouter : `Source : <a href="${source_url}">${source_label}</a>` en petit en bas de carte.
  4. Ajouter une section "Ressources officielles" en bas de page avec liens vers Nefesh B'Nefesh, Misrad HaKlita, Bituah Leumi.
- Test à ajouter / vérifier : test qu'au moins 80 % des entrées de `olim-rights.ts` ont un `source_url`.
- Dépendances / impacts potentiels : nécessite recherche des URLs officielles pour chaque droit (20+ entrées).
- Niveau de confiance : élevé

---

## 24. /experts (public) — 0 profil affiché + pollution sitemap + catégories limitées

- Source : public
- Référence du finding : Experts public #1-3 ; Experts Rejoindre #2
- Symptôme :
  - `/experts` affiche "Annuaire en construction" avec 0 profil réel.
  - Référencée dans le sitemap → crawlée par Google avec contenu vide.
  - 2 catégories seulement (Comptable, Avocat) → exclut notaires, fiscalistes, assureurs, banquiers.
- Cause probable :
  - Feature livrée en P0.2 avec waitlist email mais sans contenu réel (aucun expert vérifié).
  - Catégories hardcodées dans `CATEGORIES` array du client.
- Route(s) concernée(s) : `/experts`, `/experts/rejoindre`
- Fichier(s) probable(s) :
  - `src/app/(app)/experts/page.tsx` (client, confirmé par lecture antérieure)
  - NOTE : `/experts` est dans `(app)/` mais listée dans `PUBLIC_ROUTES` middleware → accessible sans auth
  - `src/app/sitemap.ts:21` (entry `/experts` statique)
  - Table DB `experts_waitlist` (créée en P0.2)
- Composant(s) / hook(s) / service(s) : `ExpertsPage` client, `WaitlistBanner`, API `POST /api/experts/waitlist`
- Niveau de risque : moyen (SEO pollué + confiance)
- Correctif recommandé :
  1. **Tant que 0 profil en DB** : retirer `/experts` du sitemap ET ajouter `metadata.robots = { index: false }` à la page. Garder la page accessible via lien direct mais la rendre non indexable.
  2. Une fois `>=3` profils vérifiés en DB : réindexer.
  3. Étendre `CATEGORIES` : `comptable`, `avocat`, `notaire`, `fiscaliste`, `assureur`, `banquier`, `conseiller_immobilier`.
  4. Alimenter la page avec les profils réels depuis une nouvelle table `experts_directory` (distincte de `experts_waitlist`).
- Test à ajouter / vérifier :
  - Test meta `robots` sur `/experts` → `noindex` tant que DB vide.
  - Test que `experts_waitlist` n'est pas confondue avec `experts_directory` (séparation claire).
- Dépendances / impacts potentiels : nécessite nouvelle table `experts_directory` + API lister/créer. Scope non minimal.
- Niveau de confiance : élevé

---

## 25. /auth/* — client-side only + reset-password sans token + consentement register

- Source : public
- Référence du finding : Connexion, Inscription, Mot de passe oublié, Reset password, Synthèse importante #4, #5
- Symptôme :
  - `/auth/login` et `/auth/register` rendus client-side → mauvais SEO + pas de fallback JS désactivé.
  - `/auth/reset-password` accessible sans token → devrait afficher "lien invalide ou expiré".
  - `/auth/register` : consentement CGV/Privacy visible ajouté en P1.2 mais **pas de checkbox obligatoire** (juste un texte "En créant un compte, vous acceptez...").
  - `/auth/forgot-password` : pas de lien retour vers login ni vers créer un compte.
  - `/auth/reset-password` : pas de règles visibles sur robustesse mot de passe.
- Cause probable :
  - `'use client'` en tête de fichier → Next.js ne rend pas en SSR le contenu, uniquement le squelette.
  - Absence de validation de token côté reset-password.
- Route(s) concernée(s) : `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`
- Fichier(s) probable(s) :
  - `src/app/auth/login/page.tsx` (client)
  - `src/app/auth/register/page.tsx` (client, modifié P1.2)
  - `src/app/auth/forgot-password/page.tsx`
  - `src/app/auth/reset-password/page.tsx`
- Composant(s) / hook(s) / service(s) : `createClient` (Supabase browser), formulaires avec useState
- Niveau de risque : moyen-élevé (reset-password sans token = sécurité + SSR = SEO)
- Correctif recommandé :
  1. **Reset-password guard** : dans `page.tsx`, lire `searchParams.code` (Supabase magic link) → si absent, afficher `Lien invalide ou expire. Demandez un nouveau lien de reinitialisation.` avec bouton retour vers `/auth/forgot-password`.
  2. **Règles password** : utiliser le même pattern que register (check ≥8 chars, strong/weak live indicator — déjà présent en register).
  3. **Consentement register** : transformer le texte en checkbox explicite (`<input type="checkbox" required />` + label avec liens CGV/Privacy). Le `required` bloque la submission.
  4. **Liens retour** : ajouter dans `/auth/forgot-password` un `<Link href="/auth/login">Retour a la connexion</Link>` et `<Link href="/auth/register">Pas de compte ? Creer un compte</Link>`.
  5. **SSR** : scope important, à reporter. Le pattern Next 14 permet de rendre le titre + description en server component + déléguer le form à un client component. Refactor non minimal — laisser comme polish futur.
- Test à ajouter / vérifier :
  - Test HTTP : `/auth/reset-password` sans token → contient "invalide" dans le DOM.
  - Test Playwright : submission register sans checkbox cochée → bouton submit disabled.
  - Test existence liens retour sur forgot-password.
- Dépendances / impacts potentiels : la checkbox CGV sur register change le UX, attention aux utilisateurs existants en cours d'inscription.
- Niveau de confiance : élevé

---

## 26. /scanner — types divergents homepage + loader prolongé + friction auth

- Source : public
- Référence du finding : Scanner #1-3
- Symptôme :
  - `/scanner` propose 5 types (contrat, lettre officielle, avis fiscal, bail, lettre de licenciement) mais la homepage mentionne 5 autres types (fiches de paie, contrats, lettres, factures, courriers). **"Fiche de paie" absente de scanner alors que c'est le produit phare.**
  - Loader "Chargement du scanner..." prolongé → mauvais signal perçu.
  - L'utilisateur démarre le flow sans savoir qu'il sera redirigé vers login → friction non annoncée.
- Cause probable :
  - `DOCUMENT_TYPES` dans `src/types/scanner.ts` ne contient pas `payslip`, alors que le vrai flow payslip est géré par une chaîne différente (peut-être supprimée en P1.3 avec le dead code /analyze). À confirmer.
  - Loader = composant `ScannerContent` wrappé dans `<Suspense>` — le fallback s'affiche jusqu'à la résolution.
  - Pas de guard auth côté page — l'erreur 401 arrive après l'upload (déjà flaggé dans audit initial session P0).
- Route(s) concernée(s) : `/scanner`
- Fichier(s) probable(s) :
  - `src/app/scanner/page.tsx` (lignes ~405 pour Suspense fallback)
  - `src/types/scanner.ts` (DOCUMENT_TYPES array)
  - `src/components/landing/Features.tsx` ou `Hero.tsx` (liste des 5 types côté homepage)
- Composant(s) / hook(s) / service(s) : `ScannerContent`, `DOCUMENT_TYPES`, API `/api/scan`
- Niveau de risque : élevé (product-market promise cassée — le payslip = promesse core)
- Correctif recommandé :
  1. **Aligner les types** : choisir une liste canonique (ex. `src/types/scanner.ts:DOCUMENT_TYPES`) et l'utiliser dans la homepage via import. Ajouter `payslip` au scanner si c'est le produit phare.
  2. **OU** : séparer scanner (documents divers) et payslip analyzer (fiche de paie dédiée) en 2 routes distinctes explicitement marquées `/scanner/payslip` vs `/scanner/documents`.
  3. **Pre-auth warning** : avant l'étape 1 de scanner, afficher une ligne `Compte gratuit requis pour lancer l'analyse. Vous serez redirige vers l'inscription apres selection du type.`
  4. **Loader** : remplacer le fallback "Chargement du scanner..." par une skeleton UI (cards type grid en gris) qui matche le layout final.
- Test à ajouter / vérifier :
  - Test que `DOCUMENT_TYPES` contient bien `payslip` OU qu'une route dédiée existe.
  - Test que la homepage et scanner affichent la même liste de types (via import partagé).
- Dépendances / impacts potentiels : si on ajoute `payslip` au scanner, il faut que `/api/scan` sache le traiter — à vérifier côté backend prompt.
- Niveau de confiance : moyen (nécessite lecture de DOCUMENT_TYPES + Features.tsx)

---

## 27. robots.txt — routes obsolètes + routes manquantes

- Source : public
- Référence du finding : Robots.txt #1-3, Synthèse Priorité #7
- Symptôme :
  - `/inbox` disallow dans `public/robots.txt` alors que la route est un redirect vers `/dashboard` (conservée pour legacy links) → techniquement pas un bug, mais obsolète.
  - Routes authentifiées non listées : `/folders`, `/expenses`, `/bank-import`, `/rights-check`, `/calculator`, `/freelance`, `/mashkanta`, `/search`, `/help` → crawlables par Google si liées publiquement.
  - `/immobilier` pas de Disallow alors que vide (voir finding #11).
- Cause probable :
  - `public/robots.txt` est un fichier statique qui n'a pas été maintenu en parallèle du routing.
  - Pas de source de vérité unique "routes authentifiées".
- Route(s) concernée(s) : toutes routes (app)/
- Fichier(s) probable(s) : `public/robots.txt` (confirmé par cat)
- Composant(s) / hook(s) / service(s) : aucun (fichier statique)
- Niveau de risque : moyen (SEO)
- Correctif recommandé :
  1. **Option A — fichier statique maintenu** : mettre à jour `public/robots.txt` manuellement avec la liste complète des routes `(app)/` en Disallow. Attention : liste à maintenir.
  2. **Option B — robots dynamique** : remplacer `public/robots.txt` par `src/app/robots.ts` (Next.js 14 metadata route) qui génère dynamiquement le fichier depuis une source de vérité. Exemple :
     ```ts
     export default function robots(): MetadataRoute.Robots {
       return {
         rules: { userAgent: '*', allow: '/', disallow: PROTECTED_ROUTES },
         sitemap: 'https://tloush.com/sitemap.xml'
       }
     }
     ```
     où `PROTECTED_ROUTES` vient de `src/middleware.ts`.
  3. **Retirer `/inbox`** du disallow (redirect, pas crawlable).
  4. Ajouter `/immobilier` en Disallow tant que la page est vide (finding #11).
- Test à ajouter / vérifier : test que `robots.ts` importe la même liste que `middleware.ts` (source unique). Test HTTP `GET /robots.txt` contient chaque route `(app)/`.
- Dépendances / impacts potentiels : si migration `public/robots.txt` → `src/app/robots.ts`, il faut supprimer le fichier statique sinon Next.js 14 prend le statique en priorité.
- Niveau de confiance : élevé

---

## 28. sitemap.ts — pages manquantes (/immobilier, /help, /calculateurs/{freelance,mashkanta})

- Source : public
- Référence du finding : Sitemap.xml #1-5 ; Synthèse Priorité #7
- Symptôme :
  - `/immobilier` absente du sitemap alors que promue dans la nav (peut être volontaire vu finding #11).
  - `/help` absente alors que la page existe (6 guides + 6 FAQ).
  - `/calculateurs/freelance` et `/calculateurs/mashkanta` absents alors que annoncés "Nouveau" dans le hub — mais ces routes n'existent pas sous `/calculateurs/` (elles sont sous `(app)/freelance` et `(app)/mashkanta`). Incohérence de naming.
  - Aucun `lastmod` dynamique (tout est `new Date()` à chaque build → même date pour toutes les pages).
- Cause probable :
  - **Confirmé par lecture `src/app/sitemap.ts`** : liste `staticPages` hardcodée lignes 9-27. `/immobilier`, `/help`, `/calculateurs/freelance`, `/calculateurs/mashkanta` absents.
  - `lastModified: new Date()` pour tout → pas de différenciation.
- Route(s) concernée(s) : `/sitemap.xml`
- Fichier(s) probable(s) : `src/app/sitemap.ts` (73 lignes, confirmé)
- Composant(s) / hook(s) / service(s) : `sitemap` Next.js metadata route
- Niveau de risque : moyen (SEO)
- Correctif recommandé :
  1. Ajouter à `staticPages` : `/help` (si auth-gatée, la mettre en Disallow robots OU ne pas la lister). À vérifier d'abord si `/help` est publique ou authenticated.
  2. **NE PAS** ajouter `/calculateurs/freelance` et `/calculateurs/mashkanta` car elles n'existent pas — soit les créer (aliases), soit retirer les badges "Nouveau" du hub qui promettent ces routes.
  3. **Pour `/immobilier`** : soit l'ajouter (si on corrige le finding #11), soit la laisser hors sitemap ET ajouter un Disallow robots.
  4. **Lastmod dynamique** : utiliser une map `{ route → last_modified_date }` remplie manuellement OU lire les dates git des fichiers via un script de build.
- Test à ajouter / vérifier :
  - Test que le sitemap contient toutes les routes publiques listées dans `middleware.ts:PUBLIC_ROUTES` (mis à jour dans cette session).
  - Test que les lastmod ne sont pas toutes identiques.
- Dépendances / impacts potentiels : le sitemap fetch déjà Supabase pour les providers → pas de nouveau coût.
- Niveau de confiance : élevé

---

## 29. Pages manquantes — /contact, /a-propos, /faq, /aide

- Source : public
- Référence du finding : Pages 404 #1-4 ; Synthèse critique #6, #7 ; Priorité #6
- Symptôme :
  - `/contact` → 404 (aucun canal de support visible hors `contact@tloush.com` caché dans les CGV).
  - `/a-propos` et `/about` → 404 (aucune mention équipe / mission / fondatrice).
  - `/blog`, `/faq`, `/guides` → 404 (au-delà du hub /droits vide).
  - `/aide` → 404 alors que `/help` existe (site 100 % francophone).
- Cause probable :
  - `/contact`, `/a-propos`, `/blog`, `/faq` : pages jamais créées.
  - `/aide` : oubli d'alias francophone pour `/help`.
- Route(s) concernée(s) : créer `src/app/contact/`, `/a-propos/`, `/faq/`, `/aide/`
- Fichier(s) probable(s) : aucun existant — à créer
- Composant(s) / hook(s) / service(s) : server components statiques
- Niveau de risque : moyen (confiance + SEO + support)
- Correctif recommandé :
  1. **Quick win `/aide`** : créer `src/app/aide/page.tsx` = `redirect('/help')`. Attention : `/help` est dans `(app)/` donc auth-gated — peut-être créer plutôt un hub d'aide public qui liste FAQ + lien vers /help pour l'aide connectée.
  2. **`/contact`** : page minimale avec formulaire (name, email, subject, message) qui POST vers `/api/contact` (à créer, mutualisable avec `/api/feedback` existant) + réexpose `contact@tloush.com`.
  3. **`/a-propos`** : page statique avec mission Tloush + équipe (à remplir par l'utilisateur — je ne peux pas inventer l'équipe).
  4. **`/faq`** : extraire les 4 FAQ de `/pricing` + ajouter les questions fréquentes des CGU / support, centraliser en source unique `src/data/faq.ts` consommée par `/pricing` et `/faq`.
- Test à ajouter / vérifier :
  - Test HTTP 200 sur `/contact`, `/a-propos`, `/faq`, `/aide`.
  - Test que `/aide` redirige vers `/help` OU renvoie une page publique cohérente.
- Dépendances / impacts potentiels : `/a-propos` nécessite contenu réel (mission, équipe) → bloquant sans infos utilisateur.
- Niveau de confiance : élevé (manque uniquement confirmé par audit)

---

## 30. not-found.tsx — lien /inbox obsolète + title dupliqué + pas de recherche

- Source : public
- Référence du finding : Pages 404 #5, #6, #7
- Symptôme :
  - La 404 propose un lien "Mon inbox" → `/inbox` qui redirige vers `/dashboard` (pattern legacy). Le mot "inbox" n'apparaît plus nulle part dans l'UI connectée.
  - Titre meta `Page introuvable — Tloush | Tloush` → dédup "Tloush" (cause confirmée en finding #13 : root template ajoute `%s | Tloush` au titre qui a déjà `— Tloush`).
  - Pas de champ de recherche ni suggestion d'articles depuis la 404.
- Cause probable :
  - `src/app/not-found.tsx:42` : lien `/inbox` hardcodé, séquelle du vieux flow.
  - `src/app/not-found.tsx:7` : `metadata.title = 'Page introuvable — Tloush'` → le template `%s | Tloush` ajoute `| Tloush` → `Page introuvable — Tloush | Tloush`.
- Route(s) concernée(s) : toutes URLs invalides → not-found
- Fichier(s) probable(s) : `src/app/not-found.tsx` (62 lignes, confirmé)
- Composant(s) / hook(s) / service(s) : server component minimal
- Niveau de risque : faible (polish + SEO)
- Correctif recommandé :
  1. Remplacer le lien `Mon inbox` par un lien `Tableau de bord` → `/dashboard` (plus pertinent et moins obscur).
  2. **Title** : utiliser `metadata.title = { absolute: 'Page introuvable — Tloush' }` pour court-circuiter le template, OU retirer `— Tloush` du titre pour laisser le template faire son travail → résultat `Page introuvable | Tloush`.
  3. **Recherche** : ajouter un `<input type="search" placeholder="Rechercher une page, un modele, un calculateur..." />` qui soumet vers `/search?q=` (si /search est accessible public) OU vers une page de recherche publique.
  4. **Suggestions** : lister 4-5 pages populaires (Hero CTAs) sous la 404 : `/calculateurs`, `/modeles`, `/droits`, `/pricing`.
- Test à ajouter / vérifier :
  - Test HTTP GET `/url-inexistante` → title DOM ne contient pas `Tloush | Tloush`.
  - Test qu'aucun lien ne pointe vers `/inbox` dans not-found.
- Dépendances / impacts potentiels : `/search` actuellement sous `(app)/search/` donc auth-gated → il faut soit une page de recherche publique, soit supprimer l'option recherche.
- Niveau de confiance : élevé

---

# Priorisation technique

## Quick wins (≤15 min chacun, faible risque, haut impact)

1. **#1 Hero "illimite"** → remplacer 1 ligne dans `Hero.tsx:84`.
2. **#13 Title dupliqué "Tloush | Tloush"** → grep + edit des `metadata.title` enfants (retirer `| Tloush` manuels).
3. **#30 not-found lien /inbox obsolète** → 1 ligne dans `not-found.tsx:42`.
4. **#30 not-found title dupliqué** → 1 ligne, `title: { absolute: ... }`.
5. **#27 robots.txt — retirer `/inbox`** → 1 ligne dans `public/robots.txt`.
6. **#17 /calculator → redirect vers /calculateurs/brut-net** → 5 lignes.
7. **#2 Plan Famille homepage** → 1 ligne dans Hero pricing teaser.
8. **#28 sitemap.ts — lastmod dynamique** → retirer les mentions `/calculateurs/{freelance,mashkanta}` du hub qui promettent des routes inexistantes.
9. **#25 /auth/forgot-password — liens retour** → 2 liens à ajouter.
10. **`/aide` → `/help` redirect** → 3 lignes (finding #29, item 1).

## Correctifs critiques (légaux / sécurité / promesse cassée)

1. **#6 Mentions légales placeholder** → BLOCKER, nécessite infos légales utilisateur.
2. **#7 CGV identité légale + TVA** → même dépendance que #6.
3. **#9 Privacy RGPD gaps** (DPO, durée conservation, SCC) → impact RGPD audit.
4. **#11 /immobilier page vide + fragments Next.js** → blocker UX + SEO.
5. **#25 /auth/reset-password sans token** → faille UX potentielle + sécurité.
6. **#16 /annuaire/inscription sans consentement RGPD** → faille RGPD.
7. **#26 /scanner — payslip absent des types alors que promesse core** → feature-product mismatch.

## Correctifs à risque (scope > 1 commit, refactor)

1. **#11 /immobilier** : si la feature est active, nécessite scraping/population de la table `listings` + investigation des "fragments Next.js visibles" (possible bug SSR/hydration).
2. **#25 /auth/* SSR** : refactor page.tsx pour split server/client → touche 4 routes + regression risk.
3. **#22 /droits hub + /droits/[slug]** : nécessite rédaction juridique de 3 guides + refonte routing catégorie.
4. **#24 /experts** : séparation `experts_waitlist` vs `experts_directory` + nouveaux endpoints.
5. **#21 /modeles** : étoffer catalogue à 12+ modèles + traductions hébreu (review juridique).
6. **#12 /annuaire catégories vides** : refactor sitemap.ts pour générer dynamiquement depuis Supabase + noindex des pages vides.

## Points à confirmer manuellement

1. **"Audit connecté"** cité dans l'audit public : non fourni dans le repo ni la conversation. Nécessaire pour confirmer findings #17 (bug Pitzouim 8.33 %), #18 (hypothèses freelance/mashkanta), #26 (divergence scanner types).
2. **Contenu DB providers** : combien de prestataires réels par catégorie, combien de descriptions contenant `electrien`, etc. → nécessite requête SQL prod.
3. **Contenu DB listings** : la table a-t-elle des entrées ? → requête SQL.
4. **Fragments Next.js visibles sur /immobilier** : à confirmer en ouvrant la page en navigateur réel (non reproductible via grep).
5. **/help public ou auth-gated ?** : à confirmer par lecture du fichier (middleware ne le liste pas → probablement authenticated).
6. **Informations légales de l'entité Tloush** : raison sociale, ח״פ, adresse, représentant → BLOCKER pour findings #6 et #7.
7. **Le "chiffrement de bout en bout" mentionné sur la homepage** : est-ce exact techniquement (Supabase ne fait pas du E2E par défaut) ou marketing ? → potentielle claim à ajuster.

## Ordre recommandé d'implémentation

**Phase Q0 (jour 0 — blockers absolus)**
1. #1 Hero "illimite" (quick win, cohérence immédiate avec CGV)
2. #30 not-found lien /inbox + title (quick wins visibles)
3. #13 Title dupliqué `Tloush | Tloush` global grep/fix
4. Demander infos légales utilisateur pour #6 et #7

**Phase Q1 (jour 1-2 — légal/sécurité une fois infos reçues)**
5. #6 Mentions légales (dès infos reçues)
6. #7 CGV identité légale + TVA
7. #9 Privacy RGPD gaps (DPO, conservation, SCC, cookies)
8. #10 Cadre juridique unifié via `src/lib/legalEntity.ts`
9. #25 reset-password sans token + consentement register + liens forgot
10. #16 /annuaire/inscription consentement RGPD + migration `consent_given_at`

**Phase Q2 (jour 3-5 — UX / SEO / conversion)**
11. #11 /immobilier masquage OU fix rendu (décision utilisateur)
12. #12 /annuaire catégories vides → noindex dynamique
13. #14 Fiches prestataires typos (fix template + normalization script)
14. #15 Fiches prestataires disclaimer hors contexte
15. #17 /calculator → redirect /calculateurs/brut-net + nav publique
16. #26 /scanner payslip + pré-warning auth + skeleton UI
17. #27 robots.txt → `src/app/robots.ts` dynamique
18. #28 sitemap.ts → ajout `/immobilier` (si corrigé) ou retrait clair

**Phase Q3 (semaine 2 — contenu produit)**
19. #21 /modeles étoffement catalogue + nav publique
20. #22 /droits rédaction 3 guides + routing catégories
21. #23 /droits-olim sources + disclaimer + liens tiers
22. #24 /experts séparation waitlist/directory + nouveau schéma
23. #19 /calculateurs/maternite seuils BL
24. #20 /calculateurs/indemnites article 14 + démission équiv.
25. #18 /calculateurs sources bareme + date vérification

**Phase Q4 (semaine 3 — polish)**
26. #3 Témoignages vérifiables (ou disclaimer)
27. #4 CTA / "15+ outils" / ancre how-it-works
28. #5 Pricing FAQ TVA + € + comparatif
29. #29 Pages /contact, /a-propos, /faq, /aide

---

## Notes de méthodologie

- **Périmètre exclu de ce mapping** : zone authentifiée au-delà de ce qui transparaît dans l'audit public. Un audit authenticated dédié est nécessaire pour couvrir dashboard, assistant, documents/[id], scanner upload flow, etc.
- **Absence du 2e document d'audit** : les findings qui citent "/calculator connecté" sont marqués `à confirmer`. Demander à l'utilisateur le fichier d'audit authenticated s'il existe.
- **État du repo** : main est au sha `6f39f75` (post-merge P2). Les findings couvrent du code déjà déployé — certains problèmes étaient déjà partiellement adressés (P0 CGV, P1 calculateurs, P2 cleanup) mais l'audit les retrouve partiellement, ce qui est normal : l'audit public a été fait indépendamment.
- **Test coverage** : la plupart des fixes sont testables en unit / guard grep CI. Quelques findings (immobilier, auth SSR) nécessitent Playwright ou inspection navigateur.


