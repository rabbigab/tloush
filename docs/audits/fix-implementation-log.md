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

### Lot 3 / Phase Q2 (UX / SEO / conversion) — FAIT
- #11 /immobilier masquage noindex + landing "en construction" → Q2.7
- #12 /annuaire catégories vides → noindex dynamique → Q2.4
- #14 Fiches prestataires typos + helper providerDisplay → Q2.2
- #15 Fiches prestataires disclaimer hors contexte + 0 avis → Q2.3
- #17 /calculator → redirect + nav publique → Q2.1
- #26 /scanner payslip + pré-warning auth → Q2.6
- #27 robots.txt → `src/app/robots.ts` dynamique → Q2.5
- #28 sitemap.ts filtre catégories vides → Q2.4

### Lot 4 / Phase Q3 (contenu produit) — FAIT
- #18 /calculateurs sources barème + date → Q3.1
- #19 /calculateurs/maternite seuils BL → Q3.2
- #20 /calculateurs/indemnites article 14 + démission → Q3.3
- #23 /droits-olim sources officielles + liens tiers → Q3.4
- #24 /experts noindex + extension catégories → Q3.5
- #22 /droits ajout 3 guides + sources → Q3.6
- #21 /modeles ajout 3 templates + date → Q3.7
- #29 pages manquantes /contact /a-propos /faq /aide → Q3.8

---

## Lot 4 — Phase Q3 (contenu produit)

**Contenu prévu** : 8 items Q3 (scopés minimums pour rester actionnables).
**Branche** : `claude/lot4-q3-fixes` (basée sur `claude/lot3-q2-fixes`).

---

## Fix #18 — /calculateurs sources barème + date vérification

- **Problème** : pages calculateurs sans aucune source officielle ni date de vérification → manque de crédibilité juridique.
- **Fichiers modifiés** :
  - `src/lib/israeliPayroll.ts` (exports `LAST_VERIFIED_DATE` + `OFFICIAL_SOURCES`)
  - `src/app/calculateurs/brut-net/page.tsx` (bandeau source)
  - `src/app/calculateurs/page.tsx` (hub bandeau source)
- **Correction** : nouvelle constante `LAST_VERIFIED_DATE = '2026-04-01'` + array `OFFICIAL_SOURCES` (3 sources : taxes.gov.il, btl.gov.il, nevo.co.il). Bandeau de transparence affiché sous le hero des 2 pages : "Barèmes vérifiés le 1 avril 2026 · Tranches gelées jusqu'en 2027 · Rashut HaMisim ⧉ · Bituah Leumi ⧉".
- **Risque** : faible, purement textuel.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `0fdd9cd`.

---

## Fix #19 — /calculateurs/maternite seuils cotisation Bituah Leumi

- **Problème** : calcul `monthsDiff >= 10` trop simpliste, ne couvrait pas le seuil partiel 6 mois (7 semaines d'allocation).
- **Fichiers modifiés** : `src/app/calculateurs/maternite/page.tsx`.
- **Correction** : nouvelle constante `BL_MATERNITY_THRESHOLDS` avec 2 niveaux (full 10/14, partial 6/14), type `BlEligibility = 'full' | 'partial' | 'none'`, nouveau state `contributedMonths` (champ optionnel). `blPaidWeeks` calculé selon l'éligibilité (15 / 7 / 0). Section Bituach Leumi réécrite avec tableau récapitulatif des 3 seuils + affichage différencié selon le niveau. Source documentée : Loi 1995 art. 50 + Loi 1954.
- **Risque** : faible-moyen (calcul juridique, à valider par un expert).
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `c9dc130`.

---

## Fix #20 — /calculateurs/indemnites article 14 + démission équivalente

- **Problème** : 3 niveaux Article 14 sans explication, motif "démission équivalente" regroupait 6 cas distincts.
- **Fichiers modifiés** : `src/app/calculateurs/indemnites/page.tsx`.
- **Correction** : nouvelles constantes `ARTICLE_14_EXPLANATIONS` (3 messages pédagogiques), type `DismissalReason` avec 7 valeurs, `DISMISSAL_REASON_LABELS` + `DISMISSAL_REASON_NOTES` (conditions / justificatifs par motif). Le select "Motif" passe de 2 à 7 options avec hint dynamique. Simplification logique : `finalAmount = employerPitzuim` (tous les cas donnent droit au pitzuim, différence purement pédagogique).
- **Risque** : faible (text + UI, pas de change logique).
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `8d6b598`.

---

## Fix #23 — /droits-olim sources officielles + liens tiers

- **Problème** : pas de source officielle, date de mise à jour floue, pas de liens vers ressources tierces (Nefesh B'Nefesh, Misrad HaKlita, etc.).
- **Fichiers modifiés** :
  - `src/data/olim-rights.ts` (types étendus + `OLIM_RIGHTS_VERIFIED_AT` + `OFFICIAL_OLIM_RESOURCES`)
  - `src/app/droits-olim/page.tsx`
- **Correction** :
  - `OlimRight` interface étendue avec `sourceUrl`, `sourceLabel`, `verifiedAt` (champs optionnels, à remplir progressivement).
  - `OFFICIAL_OLIM_RESOURCES` : 6 ressources officielles (Misrad HaKlita, BL, Misrad HaShikun, Rashut HaMisim, Nefesh B'Nefesh, Agence Juive).
  - Info box pre-submission reformulée avec date de vérification + rappel indicatif.
  - Nouvelle section "Ressources officielles" dans le step summary : 6 liens cliquables avec description courte.
  - Disclaimer final enrichi avec la date.
- **Risque** : faible, contenu additif.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `43cea9a`.

---

## Fix #24 — /experts noindex + extension catégories (2 → 7)

- **Problème** : `/experts` indexable avec 0 profil réel, 2 catégories seulement (comptable, avocat).
- **Fichiers modifiés** :
  - `src/app/(app)/experts/layout.tsx` (nouveau)
  - `src/app/(app)/experts/page.tsx`
- **Correction** :
  - Nouveau `layout.tsx` avec `metadata.robots = { index: false, follow: true }` tant que la DB experts est vide. Commentaire explicatif pour la réactivation.
  - `CATEGORIES` étendu de 2 à 7 : + notaire, fiscaliste, assureur, banquier, conseiller_immobilier. Chaque catégorie a icon lucide + 4 exemples de demandes.
- **Risque** : faible. Scope minimal : la vraie séparation `experts_waitlist` vs `experts_directory` (nouvelle table + API + admin) reste un chantier plus gros, reporté.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `d6dd303`.

---

## Fix #22 — /droits hub : 3 nouveaux guides + sources légales

- **Problème** : 2 guides publiés / 5 catégories promises + pas de sources légales citées.
- **Fichiers modifiés** :
  - `src/data/guides.ts` (+327 lignes)
  - `src/app/droits/[slug]/page.tsx` (section Sources légales)
- **Correction** :
  - Nouvelle interface `GuideLegalSource` + champ optionnel `legalSources` sur `Guide`.
  - Les 2 guides existants reçoivent leurs sources (Loi 1951 + amendement 2017 + Loi 1951 heures).
  - 3 nouveaux guides ajoutés :
    - `comprendre-sa-fiche` (salaire, 6 min) : 10 sections obligatoires d'un tlush + signaux d'alerte.
    - `pitzuim-licenciement` (licenciement, 6 min) : formule, éligibilité, 6 cas de démission, article 14, plafond fiscal.
    - `bituah-leumi-cotisations` (cotisations, 5 min) : taux 2026, ce que finance BL et santé, exemples de calcul.
  - Chaque nouveau guide a ses `legalSources` (Loi 1958, Loi 1963, Loi 1995, Loi 1994).
  - Page détail affiche dynamiquement les sources en bas du contenu avec disclaimer court.
- **Risque** : moyen. **Les 3 nouveaux guides n'ont pas été validés juridiquement.** Le disclaimer est explicite. Une review par un avocat est à prévoir avant promotion.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `09f51c4`.

---

## Fix #21 — /modeles : 3 nouveaux templates + date de mise à jour

- **Problème** : 5 modèles insuffisants, pas de catégorie Immobilier / Consommation, pas de date de mise à jour visible.
- **Fichiers modifiés** :
  - `src/data/templates.ts` (+246 lignes)
  - `src/app/modeles/page.tsx` (catégories + bandeau date)
  - `src/app/modeles/[slug]/page.tsx` (ligne Mis à jour)
- **Correction** :
  - `TemplateCategory` étendu : + `immobilier` + `consommation`.
  - Nouveau champ optionnel `updatedAt` sur `LetterTemplate` + constante globale `TEMPLATES_VERIFIED_AT`.
  - 3 nouveaux templates :
    - `resiliation-bail` (immobilier) : référence Loi 1971.
    - `resiliation-assurance` (consommation) : référence Loi 1981.
    - `contestation-pv` (consommation) : référence Loi 1985 + délai 30 jours.
  - `/modeles` hub : ordre de catégories étendu + emojis (🏠 🛒) + bandeau "Catalogue vérifié le X · 8 modèles disponibles".
  - `/modeles/[slug]` : ligne "Mis à jour le X" sous la description.
- **Risque** : faible. Même note que #22 : pas de validation juridique, disclaimer global inline conservé.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `907cd7d`.

---

## Fix #29 — /contact + /a-propos + /faq + /aide

- **Problème** : 4 pages publiques standards manquantes, aucun canal de support visible.
- **Fichiers modifiés** :
  - `src/app/aide/page.tsx` (nouveau, redirect)
  - `src/app/contact/page.tsx` (nouveau)
  - `src/app/a-propos/page.tsx` (nouveau)
  - `src/app/faq/page.tsx` (nouveau)
  - `src/middleware.ts` (PUBLIC_ROUTES étendu)
  - `src/app/sitemap.ts` (staticPages étendu)
  - `src/components/layout/Footer.tsx` (nouvelle colonne "Tloush")
- **Correction** :
  - **`/aide`** : simple `redirect('/help')`. `/help` est auth-gated → middleware renvoie vers login si nécessaire.
  - **`/contact`** : page server component avec 2 canaux explicites (`contact@` / `privacy@`) + section "Avant de nous contacter" avec liens vers FAQ, Pricing, CGV, Privacy.
  - **`/a-propos`** : mission Tloush en 2 paragraphes (contenu neutre, sans inventer d'infos sur l'équipe) + valeurs (Simplicité, Confiance) + encart "Un outil, pas un avocat" avec lien vers `/experts`.
  - **`/faq`** : 4 sections (Facturation, Plans, Analyses, RGPD) avec 14 questions au total, rendues via `<details>/<summary>` natif. Reprend les 4 FAQ existantes de `/pricing` + 10 nouvelles basées sur CGV et Privacy.
  - `middleware.ts` PUBLIC_ROUTES : + `/contact` + `/a-propos` + `/faq` + `/aide`.
  - `sitemap.ts` staticPages : + `/contact` + `/a-propos` + `/faq` (pas `/aide` = redirect).
  - `Footer.tsx` : grid passe de 3 à 4 colonnes. Nouvelle colonne "Tloush" (a-propos / faq / contact). Colonne "Application" enrichie (+ calculateurs + modeles).
- **Risque** : faible. `/a-propos` utilise des formulations neutres sans inventer l'équipe. `/faq` reprend uniquement des infos déjà publiées dans CGV/Privacy/Pricing.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `253234e`.
- **À compléter plus tard** : `/blog` (contenu à produire), `/parrainage` (route publique pour la feature `/referral` auth-gated si souhaitée).

---

# Résumé Lot 4

## Fixes faits (8/8 items Q3)

| # | Fix | Commit |
|---|---|---|
| #18 | Calculateurs sources + date | `0fdd9cd` |
| #19 | Maternite BL seuils (3 niveaux) | `c9dc130` |
| #20 | Indemnites article 14 + démission 6 cas | `8d6b598` |
| #23 | Droits-olim sources + 6 ressources | `43cea9a` |
| #24 | Experts noindex + 7 catégories | `d6dd303` |
| #22 | Droits 3 nouveaux guides + sources | `09f51c4` |
| #21 | Modeles 3 nouveaux templates + date | `907cd7d` |
| #29 | Pages manquantes /contact /a-propos /faq /aide | `253234e` |

**8 commits sur branche `claude/lot4-q3-fixes` (basée sur `claude/lot3-q2-fixes`).**

## Tests passés
- `npx tsc --noEmit` : **0 erreur** sur chaque commit (8 passes).

## Blocages restants

- Aucun blocage interne dans le Lot 4.
- ⛔ **#6 + #7** (Lot 2) toujours bloqués sur infos légales externes.
- ⚠️ Prérequis opérationnels identiques aux Lots précédents.

## À valider manuellement

1. **Review juridique** des 3 nouveaux guides `/droits/*` (comprendre-sa-fiche, pitzuim-licenciement, bituah-leumi-cotisations). Contenu rédigé sans validation avocat, disclaimer explicite.
2. **Review juridique** des 3 nouveaux templates `/modeles/*` (resiliation-bail, resiliation-assurance, contestation-pv). Références aux lois citées à vérifier.
3. **Calculateur maternité** : tester les 3 niveaux d'éligibilité avec différentes valeurs de `contributedMonths` pour vérifier que le UI bascule bien entre `full / partial / none`.
4. **Calculateur indemnités** : vérifier que changer le motif met bien à jour le hint en temps réel.
5. **Droits-olim ressources** : cliquer les 6 liens externes et vérifier qu'ils pointent vers les bonnes pages officielles.
6. **Experts noindex** : vérifier en DevTools que `/experts` a bien la balise `<meta name="robots" content="noindex,follow">`.
7. **Pages nouvelles** : charger `/contact`, `/a-propos`, `/faq`, `/aide` en navigateur et vérifier le rendu + les liens internes.
8. **Footer** : vérifier que la grid à 4 colonnes s'affiche correctement en desktop ET mobile (wrap OK).

## État global du projet

**État main** (sha `6f39f75`) : 16 fixes P0/P1/P2.

**Branches en attente (à merger en cascade)** :
- `claude/lot1-q0-fixes` (3 commits) — Q0 quick wins
- `claude/lot2-q1-fixes` (5 commits) — Q1 légal/sécurité (4/6 faits)
- `claude/lot3-q2-fixes` (8 commits) — Q2 UX/SEO/conversion (8/8)
- `claude/lot4-q3-fixes` (9 commits) — **Q3 contenu produit (8/8)**

**Total Lot 1+2+3+4 : 28 items adressés** sur 30 du technical-mapping. Reste :
- 2 bloqués (#6, #7) sur infos légales externes.
- 0 item non-traité.

**Le périmètre complet du technical-mapping est couvert** à l'exception des 2 findings bloqués par les infos légales de l'entité Tloush.

---

## Lot 3 — Phase Q2 (UX / SEO / conversion)

**Contenu prévu** : 8 items de la Phase Q2 du mapping, non bloqués.
**Branche** : `claude/lot3-q2-fixes` (basée sur `claude/lot2-q1-fixes`).

---

## Fix #17 — /calculator → redirect /calculateurs/brut-net + nav publique

- **Problème** : doublon de routes (`/calculator` auth-gated et `/calculateurs/brut-net` public) produisant le même outil. Nav publique Header ne listait pas `/calculateurs`.
- **Fichiers modifiés** :
  - `src/app/(app)/calculator/page.tsx` (rewrite → redirect, -8 lignes)
  - `src/middleware.ts` (retrait de `/calculator` de `PROTECTED_ROUTES`)
  - `src/components/app/AppNav.tsx` (2 occurrences `/calculator` → `/calculateurs/brut-net`)
  - `src/app/(app)/dashboard/DashboardClient.tsx` (shortcut ligne 173)
  - `src/components/layout/Header.tsx` (ajout lien desktop + mobile)
- **Correction** : `/calculator` devient `redirect('/calculateurs/brut-net')`, retiré du middleware protégé → les users non connectés sont redirigés vers la page publique. Nav publique gagne une entrée "Calculateurs" (icon Calculator de lucide).
- **Risque** : faible. Si `/calculator` avait des features exclusives (sauvegarde utilisateur, history), elles sont perdues. À confirmer. `CalculatorClient.tsx` reste dans le repo, non utilisé, à nettoyer plus tard.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `ea912c4`.
- **À vérifier** : qu'aucune page n'attend spécifiquement `CalculatorClient` (sauvegarde, comparaison) — si oui, la feature doit être ré-intégrée dans `/calculateurs/brut-net`.

---

## Fix #14 — Fiches prestataires : normalisation des noms + accents meta

- **Problème** : `src/app/annuaire/[categorie]/[slug]/page.tsx:31` hardcodait `"a ${city}"` sans accent et `provider.last_name.charAt(0)` sans `toUpperCase()`. Pas de source de vérité pour le display.
- **Fichiers modifiés** :
  - `src/lib/providerDisplay.ts` (nouveau, +99)
  - `src/types/directory.ts` (re-export)
  - `src/app/annuaire/[categorie]/[slug]/page.tsx` (usage helper)
  - `src/components/directory/ProviderCard.tsx` (initial helper)
  - `src/components/directory/ProviderSchema.tsx` (JSON-LD SEO)
  - `src/app/annuaire/[categorie]/[slug]/DirectoryProviderClient.tsx` (5 usages + `displayFirstName`)
- **Correction** : nouveau module `providerDisplay.ts` avec `toTitleCase()` (gère particules françaises + tirets), `normalizeFirstName()`, `normalizeLastInitial()`, `getProviderDisplayName()`, `getProviderInitial()`. Tous les rendus publics (fiche, carte, JSON-LD, WhatsApp link, modal gate, CTA, stats contacts) passent maintenant par ce helper. Meta title fix : `a` → `à`, `'Israel'` → `'Israël'` dans le fallback city. Le CTA "Obtenir le numero de X" devient "Obtenir le numero de X (compte gratuit requis)" → annonce la friction auth (fix partiel #15 inclus ici).
- **Risque** : faible — pur fix de display, aucun impact data ou logique métier.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `091fef0`.
- **À vérifier** : les données DB (descriptions avec `electrien`, `Recommande` sans accent) ne sont PAS corrigées par ce fix — elles nécessitent un script SQL de normalisation séparé. Documenté dans le commit comme point ouvert.

---

## Fix #15 — Disclaimer juridique hors contexte + 0 avis state

- **Problème** : le Footer global affichait `"Analyse indicative uniquement. Tloush n'est pas un cabinet juridique ni expert-comptable"` sur toutes les pages, y compris les fiches prestataires (plombier, peintre, etc.) → hors contexte. Les fiches avec 0 avis affichaient un bloc vide.
- **Fichiers modifiés** :
  - `src/components/layout/Footer.tsx` (retrait bloc disclaimer + import AlertCircle)
  - `src/app/annuaire/[categorie]/[slug]/DirectoryProviderClient.tsx` (empty state reviews)
- **Correction** : retrait du bloc disclaimer global du Footer. Les pages qui en ont besoin (homepage, scanner, calculateurs, droits, droits-olim, modeles) rendent déjà leur propre `<DisclaimerBlock />` explicitement. Les fiches prestataires et pages annuaire n'ont plus de disclaimer parasite. Empty state reviews : `reviews.length === 0` → carte dashed "Aucun avis pour le moment. Vous avez fait appel à {displayFirstName} ? Votre avis aide la communauté francophone."
- **Risque** : faible. Vérification faite : toutes les pages "critiques" (analyse indicative) ont leur propre disclaimer inline.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `1dfe9fb`.

---

## Fix #12 + #28 — Sitemap dynamique + noindex catégories vides

- **Problème** :
  - #28 : `sitemap.ts` listait les 6 catégories annuaire en dur, incluant 3 catégories vides (electricien, serrurier, bricoleur) → coquilles SEO.
  - #12 : les pages `/annuaire/[categorie]` vides n'avaient pas de `noindex` → indexées quand même par Google.
- **Fichiers modifiés** :
  - `src/app/sitemap.ts` (rewrite boucle catégories, +26/-16)
  - `src/app/annuaire/[categorie]/page.tsx` (metadata.robots dynamique)
- **Correction** :
  - Sitemap : `ALL_PROVIDER_CATEGORY_SLUGS` filtré via `categoriesWithActiveProviders` (Set construit depuis les providers fetched). `lastMod` des catégories = max des `updated_at` des providers de cette catégorie (plus précis que `new Date()` générique).
  - Page catégorie : `generateMetadata()` fait un `COUNT(*)` des providers actifs. Si `count === 0`, `metadata.robots = { index: false, follow: true }` → noindex Google, liens toujours suivis. Page reste accessible par URL directe.
- **Risque** : faible-moyen. Overhead d'un `COUNT(*)` supplémentaire par metadata, mais `revalidate = 1800` déjà en place donc le count est caché. Si la DB n'est pas dispo au build, le sitemap skip silencieusement les catégories (fallback existant).
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `b6e8229`.
- **Effet attendu** : Google va désindexer les 3 catégories vides au prochain crawl (48h-7j). Au prochain build qui inclut un prestataire dans une nouvelle catégorie, elle redevient automatiquement indexable.

---

## Fix #27 — robots.txt → src/app/robots.ts dynamique

- **Problème** : `public/robots.txt` statique désynchronisé avec le vrai routing. `/inbox` en Disallow (obsolète), ~15 routes `(app)/` crawlables car non listées.
- **Fichiers modifiés** :
  - `public/robots.txt` (supprimé, -11 lignes)
  - `src/app/robots.ts` (nouveau, +67 lignes)
- **Correction** : nouvelle metadata route Next.js 14 qui génère `robots.txt` à la volée. `DISALLOW_ROUTES` aligné manuellement sur `PROTECTED_ROUTES` du middleware + ajoute `/rights-detector` + `/immobilier`. `/inbox` retiré. Sitemap + host explicites.
- **Risque** : faible. Next.js 14 donne priorité aux metadata routes sur les fichiers statiques du dossier public — suppression de `public/robots.txt` évite toute ambiguïté.
- **Limitation** : la liste doit être maintenue en parallèle de `middleware.ts`. Un test d'intégrité qui importe les 2 listes et vérifie leur cohérence est possible mais hors scope minimal.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `c491297`.

---

## Fix #26 — /scanner payslip + pré-warning auth

- **Problème** :
  1. Scanner supportait 5 types (contract, letter, tax, lease, termination) MAIS pas `payslip`. La homepage (Hero H1) promet "Votre fiche de paie en hebreu ?" → feature-product mismatch.
  2. Pas de pré-warning auth → l'utilisateur sélectionnait un type, uploadait, puis recevait 401 → UX cassée.
- **Fichiers modifiés** :
  - `src/types/scanner.ts` (type + interface `PayslipAnalysis` + card)
  - `src/lib/prompts/scan.ts` (system + user prompts pour payslip)
  - `src/app/scanner/page.tsx` (import + switch case + `PayslipResults` + banner warning)
- **Correction** :
  - **Type et interface** : `PayslipAnalysis` avec `period`, `grossSalary`, `netSalary`, `workingDays/Hours`, `deductions` (incomeTax, bituahLeumi, healthInsurance, pension, kerenHishtalmut, other[]), `benefits` (transport, meal, overtime, other[]), `leaveBalance`, `sickBalance`, `seniority`, `cumulativeYear`, `alerts[]`. Union `DocumentAnalysis` étendue. `DOCUMENT_TYPES` carte en tête avec icon 💵.
  - **Prompts Claude** : `SCAN_SYSTEM_PROMPTS.payslip` expert en fiches de paie israéliennes avec constantes clés (salaire min 2026, taux BL, plafond, pension obligatoire, havraa) pour guider vers détection d'anomalies. `SCAN_USER_PROMPTS.payslip` JSON schema complet.
  - **Rendu** : `PayslipResults` (130 lignes) qui affiche header metadata + synthèse Brut/Net en bandeau + retenues détaillées (rouge) + primes (vert) + soldes jours.
  - **Pre-warning auth** : bannière bleue avant les cards type : `"Compte gratuit requis. Après le choix du type, vous serez invité a créer un compte (3 analyses offertes) avant l'upload. Aucune carte bancaire demandée."`
- **Risque** : moyen-élevé. Le prompt payslip n'a jamais été testé en conditions réelles — Claude pourrait retourner un JSON mal structuré. Le rendu `PayslipResults` présuppose que la structure renvoyée correspond au schéma `PayslipAnalysis`. Une erreur de parsing déclenche le try/catch existant et affiche une erreur générique.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `2ebac9e`.
- **À valider manuellement** :
  - Uploader une vraie fiche de paie israélienne, vérifier que Claude retourne un JSON parsable.
  - Vérifier que `PayslipResults` affiche toutes les sections attendues.
  - Ajuster le prompt si Claude hallucine des montants ou omet des champs.

---

## Fix #11 — /immobilier masquage noindex + landing "en construction"

- **Problème** : page vide (0 listings en DB), bug de rendu (fragments Next.js visibles), promue dans la nav Header → SEO cassé + confiance érodée.
- **Fichiers modifiés** :
  - `src/app/immobilier/layout.tsx` (metadata.robots noindex + title updated)
  - `src/app/immobilier/page.tsx` (rewrite complet, server component, -196 lignes → +81 lignes)
  - `src/components/layout/Header.tsx` (retrait desktop + mobile + import Home)
- **Correction** :
  - `layout.tsx` : `robots: { index: false, follow: true }`. Title rebrandé "Immobilier Israel — Bientôt disponible". Commentaire explicatif pour la réactivation.
  - `page.tsx` : remplacement du client component Zustand/Leaflet par un server component statique. Landing propre : H1 "Immobilier Israël", paragraphe explicatif, bloc "Disponible prochainement" avec lien mailto waitlist, bouton retour accueil. Ancien code (useListingsStore, ListingsMap, ListingCard, ListingsFilters, ListingsPagination, API) **conservé dans le repo** pour reprise future — seule la `page.tsx` est réécrite.
  - Header : retrait du lien `/immobilier` desktop + mobile + import `Home` (plus utilisé).
- **Risque** : faible. Le retrait est réversible : un seul commit pour restaurer `page.tsx` + layout + nav.
- **Test** : `npx tsc --noEmit` → 0 erreur.
- **Résultat** : ✅ commit `59634de`.
- **À faire plus tard** : quand la feature est prête (dataset populate + fix rendu Leaflet SSR), il faut :
  1. Restaurer le client component dans `page.tsx`
  2. Retirer `robots: noindex` du layout
  3. Retirer `/immobilier` de `DISALLOW_ROUTES` dans `robots.ts`
  4. Re-ajouter le lien dans Header desktop + mobile
  5. Ajouter `/immobilier` au sitemap

---

# Résumé Lot 3

## Fixes faits (8/8 items Q2)

| # | Fix | Commit |
|---|---|---|
| #17 | /calculator redirect + nav publique | `ea912c4` |
| #14 | Providers display normalization | `091fef0` |
| #15 | Footer disclaimer + 0 avis state | `1dfe9fb` |
| #12 + #28 | Sitemap dynamique + noindex catégories vides | `b6e8229` |
| #27 | robots.ts dynamique | `c491297` |
| #26 | Scanner payslip + pre-warning auth | `2ebac9e` |
| #11 | /immobilier landing + noindex | `59634de` |

**7 commits sur branche `claude/lot3-q2-fixes` (basée sur `claude/lot2-q1-fixes`).**

## Tests passés
- `npx tsc --noEmit` : **0 erreur** sur chaque commit.

## Blocages restants
- Aucun blocage interne dans le Lot 3.
- ⛔ **#6 + #7** (Lot 2) toujours bloqués sur infos légales externes.
- ⚠️ **Prérequis opérationnels** : cf. Lot 1 & 2 (migrations Supabase à appliquer + mailbox privacy@ à créer).

## À valider manuellement
1. **Scanner payslip** : uploader une vraie fiche de paie, vérifier le rendu `PayslipResults` et la qualité du JSON Claude. Ajuster prompt si nécessaire.
2. **Title meta `| Tloush`** : vérifier en navigateur qu'aucune page ne contient `Tloush | Tloush`.
3. **Sitemap dynamique** : GET `/sitemap.xml` en preview → vérifier qu'il ne liste pas les catégories vides.
4. **robots.txt dynamique** : GET `/robots.txt` en preview → vérifier les disallows.
5. **/immobilier** : vérifier que la landing "en construction" s'affiche + noindex en DevTools.
6. **/calculateurs hub** : vérifier le lien depuis la nav publique Header.
7. **Fiches prestataires** : vérifier que les noms sont bien capitalisés (ex. "Benjamin L." au lieu de "Benjamin l.").
8. **Scanner pre-warning** : vérifier que la bannière auth s'affiche bien avant les cards type.

## Prochaines phases
- **Lot 2 à compléter** : #6 + #7 dès réception des infos légales (~3 commits courts).
- **Lot 4 / Phase Q3** : contenu produit (/modeles, /droits, /droits-olim, /experts, calculateurs rigueur légale).

