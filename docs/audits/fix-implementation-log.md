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
