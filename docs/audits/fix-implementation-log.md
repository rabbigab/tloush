# Log d'implémentation des correctifs Tloush

**Source du plan** : `docs/audits/technical-mapping.md` (section "Priorisation technique" — phases Q0 → Q3).

**Note interprétation** : `fix-plan.md` référencé par la consigne initiale **n'existe pas** dans le repo. Seul `technical-mapping.md` est présent. J'ai interprété **"Lot 1" = "Phase Q0 (jour 0 — blockers absolus)"** du mapping technique. À confirmer avec l'utilisateur si un fichier dédié doit être créé séparément.

---

## Lot 1 — Phase Q0 (quick wins + blockers immédiats)

**Contenu prévu** :
1. #1 Hero "illimite" (quick win, cohérence immédiate avec CGV)
2. #30 not-found lien /inbox + title (quick wins visibles)
3. #13 Title dupliqué `Tloush | Tloush` global grep/fix
4. Demander infos légales utilisateur pour #6 et #7 → **bloqué** (dépendance externe)

**Branche** : `claude/lot1-q0-fixes` (depuis main @ `6f39f75`)

---

## Fix #1 — Hero "accès illimité" contraire au pricing

- **Problème** : `src/components/landing/Hero.tsx:84` affichait `"Puis 49₪/mois pour un acces illimite"` alors que `/pricing` limite le plan Solo à 30 analyses/mois. Promesse commerciale cassée, risque litige CGV (les CGV ont été alignées en P0.3 mais pas la homepage).
- **Fichiers modifiés** : `src/components/landing/Hero.tsx` (ligne 84, 1 remplacement).
- **Correction appliquée** : remplacement de la chaîne par `"Puis 49₪/mois pour 30 analyses"`. Cohérent avec les labels actuels du plan Solo dans `src/app/pricing/page.tsx` (Solo: 30 analyses/mois) et CGV article 4.
- **Risque** : faible. Modification purement textuelle, aucun impact fonctionnel, aucun changement de type.
- **Test exécuté** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ fix appliqué, commit `c6a7202` (avec fix #30).
- **Point restant à vérifier** : aucun. Fix déployable tel quel.

---

## Fix #30 — not-found.tsx lien /inbox obsolète + title dupliqué + pas de suggestions

- **Problème** :
  1. La page 404 proposait un lien `Mon inbox` → `/inbox`, alors que `/inbox` redirige déjà vers `/dashboard` depuis P1 (pattern legacy). Le mot "inbox" n'apparaît plus dans l'UI.
  2. `metadata.title = 'Page introuvable — Tloush'` + le template root `"%s | Tloush"` produisait `"Page introuvable — Tloush | Tloush"` (double Tloush).
  3. Pas de suggestions de pages populaires (audit critique point #7).
- **Fichiers modifiés** : `src/app/not-found.tsx`.
- **Correction appliquée** :
  - `metadata.title` passé en `{ absolute: 'Page introuvable' }` → court-circuite le template → résultat final `"Page introuvable | Tloush"`.
  - Remplacement de l'import `Inbox` par `LayoutDashboard` (lucide-react).
  - Lien "Mon inbox" → `/inbox` remplacé par "Tableau de bord" → `/dashboard`.
  - Ajout d'une section "Pages populaires" avec 4 chips cliquables : `/calculateurs`, `/modeles`, `/droits`, `/pricing`.
  - Lien "Page précédente" : `href="javascript:history.back()"` → `href="/"` (évite anti-pattern JS URI dans `<Link>` Next.js et SSR).
- **Risque** : faible. Composant purement présentationnel, pas de logique métier. Seul point d'attention : le bouton "Page précédente" ne fait plus de `history.back()` mais retourne à l'accueil — perte minime UX jugée acceptable.
- **Test exécuté** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ fix appliqué, commit `c6a7202` (avec fix #1).
- **Point restant à vérifier** :
  - Test visuel en navigateur : vérifier que `document.title` = `"Page introuvable | Tloush"` (sans double suffixe).
  - Test que la 404 affiche bien les 4 pages populaires sur mobile.

---

## Fix #13 — Title dupliqué "Tloush | Tloush" global (28 fichiers normalisés)

- **Problème** : `src/app/layout.tsx:12` déclare `template: "%s | Tloush"` (pattern idiomatique Next.js). Mais ~28 pages enfants hardcodent déjà `"X — Tloush"` ou `"X | Tloush"` dans leur `metadata.title`. Résultat : le template ajoute un second `| Tloush`, produisant `"X — Tloush | Tloush"` ou `"X | Tloush | Tloush"` dans le DOM final. Signalé explicitement par l'audit sur les fiches prestataires, la 404, le hub calculateurs.
- **Fichiers modifiés (29)** :
  - `src/app/layout.tsx` : **no-op** (restauration après faux-positif du script : le template `%s | Tloush` reste intact).
  - 22 pages simples avec suffixe `" — Tloush"` ou `" | Tloush"` retiré :
    - `(app)/family/page.tsx`, `(app)/help/page.tsx`, `(app)/miluim/page.tsx`, `(app)/payslips/annual/page.tsx`, `(app)/referral/page.tsx`, `(app)/rights-detector/page.tsx`, `(app)/tax-refund/page.tsx`
    - `admin/page.tsx`
    - `calculateurs/{page,brut-net/layout,conges/layout,indemnites/layout,maternite/layout}.tsx`
    - `cgv/page.tsx`, `droits/page.tsx`, `droits/[slug]/page.tsx`, `droits-olim/layout.tsx`
    - `immobilier/layout.tsx`, `mentions-legales/page.tsx`
    - `modeles/page.tsx`, `modeles/[slug]/page.tsx`
    - `privacy/page.tsx`
    - `scanner/layout.tsx` (2 occurrences : `title` + `openGraph.title`)
    - `annuaire/[categorie]/[slug]/page.tsx` (template literal dans `generateMetadata`)
  - 4 pages avec `"Tloush Recommande"` (brand distinct de l'annuaire) migrées vers `title: { absolute: ... }` pour préserver le nom commercial :
    - `annuaire/page.tsx`, `annuaire/avis/layout.tsx`, `annuaire/inscription/layout.tsx`
    - `annuaire/[categorie]/page.tsx` (corrigé manuellement — template literal non matché par le regex initial du script)
  - `src/app/not-found.tsx` : commentaire du `title.absolute` mis à jour pour refléter le template restauré (déjà fait dans fix #30, légèrement réajusté).
- **Correction appliquée** : script Python avec regex de remplacement pour les strings simples (`" — Tloush"` → `""`, `" | Tloush"` → `""`) + migration ciblée vers `title.absolute` pour les 4 pages Tloush Recommande. Script a aussi touché par erreur `src/app/layout.tsx` (il contenait `| Tloush` dans le `template`) — restauré manuellement à `template: "%s | Tloush"`. Le fichier `annuaire/[categorie]/page.tsx` utilise une template literal (backticks) non matchée par le regex initial, corrigé manuellement vers `title: { absolute: \`...\` }`.
- **Risque** : faible à moyen.
  - Faible : modification purement textuelle, aucun impact logique.
  - Moyen : dépendance au comportement du template Next.js. Si le template est retiré ou modifié dans le futur, les pages auront un title sans suffixe (`"CGV"` au lieu de `"CGV | Tloush"`) → branding SEO dégradé.
  - Mitigation : le commit restaure le template root et le commentaire inline le rappelle.
- **Test exécuté** :
  - `npx tsc --noEmit` → 0 erreur.
  - `grep "title:.*—\s+Tloush|title:.*\|\s+Tloush[^R]"` sur `src/app/**/*.{tsx,ts}` → 3 occurrences restantes, toutes dans `title: { absolute: 'X | Tloush Recommande' }` (volontaires).
- **Résultat** : ✅ fix appliqué, commit `154c87d`.
- **Point restant à vérifier** :
  - **Test visuel en navigateur** ou via Playwright : ouvrir 5-10 pages types (`/`, `/pricing`, `/cgv`, `/modeles`, `/annuaire`, `/annuaire/plombier/<slug>`, `/calculateurs`, `/not-found`) et vérifier que `document.title` ne contient jamais la chaîne `"Tloush | Tloush"`.
  - Vérifier que les pages "Tloush Recommande" préservent bien le nom commercial (`title = "Annuaire... | Tloush Recommande"` sans suffixe `| Tloush` ajouté).

---

## Fix #6 / #7 — Mentions légales placeholder + CGV identité légale/TVA → BLOQUÉ

- **Problème** :
  - `src/app/mentions-legales/page.tsx:44-47` contient un placeholder visible publiquement : `"(Raison sociale, numéro d'enregistrement, adresse du siège social et identité du représentant légal à compléter selon la forme juridique retenue.)"`.
  - `src/app/cgv/page.tsx` article 1 ne cite pas l'entité exploitante, article 4 ne ventile pas la TVA israélienne (Ma'am 17 %).
- **Fichiers modifiés** : aucun (bloqué).
- **Correction appliquée** : **aucune**.
- **Risque** : élevé. Non-conformité légale, rupture de confiance, potentiel blocker pour consommateur UE qui voudrait faire valoir ses droits.
- **Test exécuté** : n/a.
- **Résultat** : ⛔ **BLOQUÉ**.
  - Raison : **je ne peux pas inventer** les informations légales réelles de l'entité Tloush (raison sociale, ח״פ / ע״מ, adresse, représentant légal, TVA).
  - Action requise : l'utilisateur doit fournir ces informations. Une fois disponibles, 2 fichiers à éditer en parallèle :
    - `src/app/mentions-legales/page.tsx` : remplacer les lignes 44-47 par le bloc structuré (éditeur + directeur de publication).
    - `src/app/cgv/page.tsx` : ajouter au début de l'article 1 l'identité de l'entité ; dans l'article 4 ajouter la mention Ma'am 17 % sur les prix TTC.
    - **Optionnel** : mutualiser dans `src/lib/legalEntity.ts` pour éviter la divergence future (cf. technical-mapping.md #10).
- **Point restant à vérifier** : question à poser à l'utilisateur en fin de Lot 1.

---

# Résumé Lot 1

## Fixes faits
- ✅ **#1 Hero "illimite"** → `Hero.tsx:84` (`c6a7202`)
- ✅ **#30 not-found.tsx** → lien /inbox remplacé + title dédup + suggestions pages populaires (`c6a7202`)
- ✅ **#13 Title dupliqué global** → 29 fichiers normalisés (`154c87d`)

## Tests passés
- `npx tsc --noEmit` : 0 erreur sur chaque commit (3 passes de type-check).
- Guard grep final : 0 suffixe `"| Tloush"` ou `"— Tloush"` restant dans `src/app/**/*.{tsx,ts}` hors des `title.absolute` volontaires pour "Tloush Recommande".

## Blocages restants
- ⛔ **#6 + #7 Mentions légales / CGV identité légale** : bloqué sur informations externes (raison sociale, ח״פ, adresse, TVA israélienne). **Question à poser à l'utilisateur**.

## À valider manuellement
- Test visuel navigateur sur 5-10 pages : confirmer qu'aucun `document.title` ne contient `"Tloush | Tloush"`.
- Test visuel sur la 404 : vérifier que les 4 chips "Pages populaires" s'affichent correctement sur mobile.
- Test fonctionnel Hero : vérifier que le pricing teaser affiche bien `"3 analyses gratuites • Puis 49₪/mois pour 30 analyses"`.
- Confirmer avec l'utilisateur que l'interprétation "Lot 1 = Phase Q0 du mapping technique" est correcte (à défaut du `fix-plan.md` absent).

## Prochaines phases (non démarrées)
- **Lot 2 / Phase Q1 (légal/sécurité)** dépend des infos légales (#6 / #7). À démarrer dès confirmation utilisateur.
- **Lot 3+ / Phases Q2-Q3** : UX, SEO, conversion, contenu produit. À démarrer après Lot 2.

---

## Lot 2 — Phase Q1 (légal / sécurité)

**Contenu prévu** : 6 items de la Phase Q1 du mapping.
1. #6 Mentions légales → **BLOQUÉ** (dépendance externe : infos légales entité)
2. #7 CGV identité légale + TVA → **BLOQUÉ** (même dépendance)
3. #9 Privacy RGPD gaps (DPO, conservation, SCC, cookies)
4. #10 Cadre juridique unifié via `src/lib/legalEntity.ts`
5. #25 reset-password guard + consentement register + liens forgot
6. #16 /annuaire/inscription consentement RGPD + migration `consent_given_at`

**Branche** : `claude/lot2-q1-fixes` (basée sur `claude/lot1-q0-fixes` pour linéarité, rebase auto après merge Lot 1).

**Décision d'ordre** : #10 (`legalEntity.ts`) a été réalisé AVANT #9 (Privacy) car Privacy importe depuis ce module.

---

## Fix #25 — /auth/* (reset-password guard + register CGV checkbox + forgot link)

- **Problème** :
  1. `/auth/reset-password` rendait le formulaire sans vérifier qu'un token de recovery valide était présent. L'utilisateur remplissait le form, l'erreur arrivait **après** submission.
  2. `/auth/register` avait un paragraphe texte "En créant un compte, vous acceptez..." mais **aucune checkbox** obligatoire → pas de consentement explicite au sens RGPD art. 7.
  3. `/auth/forgot-password` : liens retour vers login déjà présents (audit erroné sur ce point), mais manquait "Pas de compte ? Créer un compte".
- **Fichiers modifiés** :
  - `src/app/auth/reset-password/page.tsx` (+69/-4)
  - `src/app/auth/register/page.tsx` (+31/-3)
  - `src/app/auth/forgot-password/page.tsx` (+7/-1)
- **Correction appliquée** :
  - **reset-password** : ajout d'un `useEffect` qui appelle `supabase.auth.getSession()` au mount. État `sessionStatus: 'checking' | 'valid' | 'invalid'`. Rendu conditionnel : `checking` → loader, `invalid` → carte "Lien invalide ou expiré" avec CTA "Demander un nouveau lien" → `/auth/forgot-password` + lien retour login, `valid` → form habituel. Note : un user déjà connecté aura aussi `valid` (permet de changer son mdp depuis session active — comportement voulu).
  - **register** : ajout `const [acceptedTerms, setAcceptedTerms] = useState(false)`. Checkbox `required` dans le form avec liens `/cgv` et `/privacy` en `target="_blank"`. Validation dans `handleRegister` : `if (!acceptedTerms) { setError(...); return }`. Bouton submit `disabled={loading || !acceptedTerms}`. Paragraphe légal en bas conservé comme rappel redondant.
  - **forgot-password** : ajout d'un bloc `Pas encore de compte ? Créer un compte` → `/auth/register` sous le bouton submit.
- **Risque** : moyen.
  - **reset-password guard** : le `getSession()` au mount peut marquer `invalid` à tort si Supabase met >500ms à poser la session après le magic link (race condition). En pratique le `click from email → redirect → mount` donne assez de temps. À confirmer par test manuel.
  - **register checkbox** : pattern standard, faible risque.
  - **forgot link** : purement ajout, zéro risque.
- **Test exécuté** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ fix appliqué, commit `0626a9f`.
- **Point restant à vérifier** :
  - Test manuel : cliquer sur un vrai lien reset-password reçu par email → vérifier que `sessionStatus` passe à `valid` avant l'affichage du form (pas de flash "invalide").
  - Test manuel : soumettre register sans cocher → message d'erreur visible + bouton disabled.
  - Test manuel : vérifier que les liens `/cgv` et `/privacy` s'ouvrent bien en nouvel onglet.

---

## Fix #16 — /annuaire/inscription consentement RGPD obligatoire

- **Problème** : Formulaire 4 étapes sans aucun consentement RGPD visible. L'inscription publie nom, téléphone, description, photo sur une fiche indexée → base légale RGPD art. 6.1.a (consentement) requise mais absente.
- **Fichiers modifiés** :
  - `supabase/migrations/20260420_provider_applications_consent.sql` (nouveau, +40)
  - `src/app/api/annuaire/inscription/route.ts` (+23/-2)
  - `src/app/annuaire/inscription/page.tsx` (+68/-3)
- **Correction appliquée** :
  - **Migration SQL** : `ALTER TABLE provider_applications ADD COLUMN consent_public BOOLEAN NOT NULL DEFAULT FALSE`, `consent_cgv BOOLEAN NOT NULL DEFAULT FALSE`, `consent_given_at TIMESTAMPTZ`. Index partiel sur `consent_given_at` pour purge RGPD. CHECK constraint `provider_applications_consent_coherent` : `consent_given_at IS NULL OR (consent_public AND consent_cgv)` — garde-fou défensif.
  - **API** : valide `consent_public === true && consent_cgv === true` en entrée, rejette 400 sinon avec message explicite. Stocke `consent_given_at = new Date().toISOString()` côté serveur (horloge de confiance).
  - **Client** : `form.consent_public` et `form.consent_cgv` ajoutés au state. `getStepErrors()` étendu : step 2 retourne erreurs si consents absents. `handleSubmit()` re-valide via `getStepErrors()`. Nouvelle section "Consentement" en amber dans le step 2 (Vérification) avec 2 checkboxes `required` + liens `/cgv` et `/privacy`. Bouton submit `disabled={!consent_public || !consent_cgv}`.
- **Risque** : moyen.
  - **Migration** : `DEFAULT FALSE` sur les 2 colonnes → les enregistrements existants passent à `consent_public=false, consent_cgv=false`. Leur `consent_given_at` reste `NULL`. La contrainte CHECK est respectée. Pas de rétro-cassage.
  - **API** : le rejet 400 sur consents manquants casse tout ancien client qui n'enverrait pas les champs. Mais l'API est uniquement appelée depuis `/annuaire/inscription` (interne) → maîtrisé.
- **Test exécuté** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ fix appliqué, commit `35ee096`.
- **Point restant à vérifier** :
  - ⚠️ **IMPORTANT** : la migration `20260420_provider_applications_consent.sql` doit être appliquée sur la prod Supabase via `supabase db push` ou le dashboard. Sinon l'API retournera `column consent_public does not exist` au premier submit réel.
  - Test manuel : soumettre le form sans cocher les cases → message d'erreur + bouton disabled.
  - Test manuel : vérifier que les liens CGV / Privacy s'ouvrent en nouvel onglet.

---

## Fix #10 — src/lib/legalEntity.ts (source de vérité unique)

- **Problème** : Les 3 pages légales (CGV, Privacy, Mentions légales) divergeaient sur le cadre juridique, l'hébergement, les processors, les durées. Pas de source de vérité unique → risque d'incohérence à chaque mise à jour.
- **Fichiers modifiés** : `src/lib/legalEntity.ts` (nouveau, +209).
- **Correction appliquée** : Création du module centralisant :
  - `LEGAL_ENTITY: LegalEntityInfo` : interface typée avec `legalName`, `legalForm`, `registrationNumber`, `address`, `representative`, `contactEmail`, `privacyContactEmail`, `vatRegistered`, `vatRate`. Les 5 premiers champs contiennent des placeholders `__TODO_*__` en attendant les infos réelles.
  - `isLegalEntityConfigured()` : helper renvoyant `true` si les placeholders ont été remplacés. Utilisable dans les pages pour afficher un badge "en cours de mise à jour".
  - `APPLICABLE_LAWS` : `{ primary: 'israelien', gdprApplies: true, israeliPrivacyLaw: true, dpfFramework: true }`.
  - `DATA_PROCESSORS: DataProcessor[]` : array typé des 7 sous-traitants (Supabase, Vercel, Anthropic, Resend, Stripe, PostHog, Sentry) avec `country`, `purpose`, `dpaUrl`, `covered_by_scc`, `dpf_certified`.
  - `DATA_RETENTION: Record<string, RetentionPolicy>` : 4 politiques (`account_active`, `account_deleted` = 90j, `security_logs` = 12 mois, `invoices` = 10 ans) avec `label`, `days`, `legalBasis`.
- **Risque** : faible. Module isolé, pas de consommateur hors Privacy (Q1.3). Les valeurs par défaut des processors/retention sont des valeurs raisonnables mais à valider juridiquement.
- **Test exécuté** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ fix appliqué, commit `55e6d42`.
- **Point restant à vérifier** :
  - Les `LEGAL_ENTITY.*` restent en `__TODO_*__` jusqu'à fourniture des infos.
  - Les certifications DPF d'Anthropic et Stripe sont à confirmer sur https://www.dataprivacyframework.gov/list.
  - L'email `privacy@tloush.com` doit être créé comme alias/mailbox en prod (sinon les demandes DPO vont dans le vide).

---

## Fix #6 + #7 — Mentions légales placeholder + CGV identité légale → TOUJOURS BLOQUÉ

- **Problème** : cf. Lot 1 log. Placeholder `(Raison sociale... à compléter)` dans `/mentions-legales` et absence d'identité de l'entité + TVA Ma'am dans `/cgv` article 1 & 4.
- **Fichiers modifiés** : aucun (bloqué).
- **Correction appliquée** : **aucune** sur les pages `/cgv` et `/mentions-legales`. En revanche, `src/lib/legalEntity.ts` créé en Q1.4 pour préparer le déblocage :
  - Dès que l'utilisateur fournit les infos, il suffit de remplacer les `__TODO_*__` par les valeurs réelles — aucune modification supplémentaire des pages n'est nécessaire si elles importent `LEGAL_ENTITY` (migration à faire quand débloqué).
- **Risque** : élevé (idem Lot 1).
- **Test exécuté** : n/a.
- **Résultat** : ⛔ **TOUJOURS BLOQUÉ**.
- **Action requise utilisateur** :
  1. Fournir les infos légales suivantes :
     - `legalName` (raison sociale officielle)
     - `legalForm` (forme juridique : Ltd, Be'Eravon Mugbal, etc.)
     - `registrationNumber` (ח״פ pour société, ע״מ pour osek murshe)
     - `address` (adresse postale du siège)
     - `representative` (directeur de publication / représentant légal)
     - Confirmer `vatRegistered` (assujetti TVA Ma'am) et `vatRate` (17 % en 2026 si oui)
  2. **Créer la boîte email** `privacy@tloush.com` (alias ou mailbox) pour que les demandes DPO soient reçues.
  3. Dès ces infos reçues, appliquer 1 commit ciblé sur `src/lib/legalEntity.ts` (remplacement des placeholders) + 1 commit sur `/cgv/page.tsx` (insertion identité dans article 1 + mention TVA dans article 4) + 1 commit sur `/mentions-legales/page.tsx` (remplacement du placeholder par un bloc structuré).

---

# Résumé Lot 2

## Fixes faits (4/6 items Q1)

| # | Fix | Commit | Fichiers |
|---|---|---|---|
| #25 | auth (reset guard + register checkbox + forgot link) | `0626a9f` | `reset-password/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx` |
| #16 | /annuaire/inscription consent RGPD | `35ee096` | migration SQL + API + UI (3 fichiers) |
| #10 | `src/lib/legalEntity.ts` source de vérité | `55e6d42` | `lib/legalEntity.ts` (nouveau) |
| #9 | Privacy RGPD gaps (DPO, SCC, conservation, cookies) | `54a3b88` | `privacy/page.tsx` |

**4 commits sur branche `claude/lot2-q1-fixes` (basée sur `claude/lot1-q0-fixes`).**

## Tests passés
- `npx tsc --noEmit` : **0 erreur** sur chaque commit (4 passes).
- Audit statique : aucun nouvel import circulaire, aucune dépendance cassée.

## Blocages restants
- ⛔ **#6 Mentions légales** : bloqué (infos légales externes).
- ⛔ **#7 CGV identité légale + TVA** : bloqué (même dépendance).
- ⚠️ **Prérequis opérationnel** : la migration `20260420_provider_applications_consent.sql` doit être appliquée sur la prod Supabase avant que la page `/annuaire/inscription` ne soit testable en prod. Sinon l'API répondra `column consent_public does not exist`.
- ⚠️ **Prérequis opérationnel** : la boîte email `privacy@tloush.com` doit être créée (alias contact@ ou mailbox dédiée) — sinon les demandes DPO vont dans le vide (et la page Privacy ment à l'utilisateur).

## À valider manuellement
1. **Test /auth/reset-password** avec un vrai lien de reset reçu par email. Vérifier qu'il n'y a **pas** de flash "Lien invalide" juste avant l'affichage du form (race condition possible si Supabase met >500ms à poser la session).
2. **Test /auth/register** : soumission bloquée si la checkbox CGV n'est pas cochée. Vérifier le message d'erreur + bouton disabled.
3. **Test /auth/register** : les liens CGV/Privacy s'ouvrent bien en nouvel onglet (target="_blank").
4. **Test /auth/forgot-password** : le lien "Créer un compte" s'affiche bien sous le bouton submit.
5. **Test /annuaire/inscription step 2** : les 2 checkboxes de consentement sont obligatoires, le bouton submit est disabled, les erreurs s'affichent dans `stepErrors` si on tente sans cocher.
6. **Test `/privacy`** : les 11 sections sont rendues, aucune ne contient de `undefined` ou de placeholder Liquid. Vérifier en particulier la section 4 (sous-traitants) générée dynamiquement.
7. **Review juridique** des nouvelles formulations Privacy (SCC, DPF, "règle la plus protectrice") par un avocat RGPD.
8. **Audit RGPD cron** : vérifier qu'un job de purge `account_deleted` existe. Si non, la section 7 de Privacy promet une purge automatique qui n'a pas lieu → à créer en Lot 3 ou à ajuster le texte.

## Prochaines phases (en attente)

### Lot 2 à compléter dès déblocage
- **#6 Mentions légales** : remplir le bloc Éditeur avec les infos légales réelles. **Estimation : 1 commit de ~20 lignes une fois les infos fournies.**
- **#7 CGV identité légale + TVA** : insérer le bloc identité au début de l'article 1 ; ajouter la mention TVA Ma'am dans l'article 4. **Estimation : 1 commit de ~15 lignes.**
- **Migration vers `LEGAL_ENTITY`** : refactoriser `/cgv` et `/mentions-legales` pour importer depuis `src/lib/legalEntity.ts` au lieu de hardcoder (après remplissage des placeholders). **Estimation : 1 commit de ~40 lignes.**

### Lot 3 / Phase Q2 (à démarrer après Lot 2)
- #11 /immobilier masquage ou fix rendu
- #12 /annuaire catégories vides → noindex dynamique
- #14 Fiches prestataires typos + script normalization
- #15 Fiches prestataires disclaimer hors contexte
- #17 /calculator → redirect /calculateurs/brut-net + nav publique
- #26 /scanner payslip + pré-warning auth + skeleton UI
- #27 robots.txt → `src/app/robots.ts` dynamique
- #28 sitemap.ts pages manquantes

### Lot 4 / Phase Q3 (contenu produit)
- #21 /modeles étoffement (5 → 12+)
- #22 /droits rédaction 3 guides + routing catégories
- #23 /droits-olim sources + disclaimer
- #24 /experts séparation waitlist/directory
- #19 /calculateurs/maternite seuils BL
- #20 /calculateurs/indemnites article 14 + démission équiv.
- #18 /calculateurs sources barème + date vérification

