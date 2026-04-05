# Rétrospectives Tloush V3

Document vivant — une rétro par sprint livré.

---

## Sprint 0 — Fondations V3 (landing, pricing, template analyse)

### Livré
- Landing page repositionnée : "Ne subissez plus vos papiers en Israël"
- 3 piliers (Comprendre / Vérifier / Agir) + section "Pourquoi Tloush" (6 bénéfices)
- Pricing revu : plans Gratuit / Solo / Famille avec assistant réservé aux payants
- Template d'analyse enrichi : `attention_points` (ok/info/warning/critical), `recommended_actions` avec priorité, `should_consult_pro`, `recurring_info`
- Nouveaux `document_type` : invoice, receipt, utility_bill, insurance → catégorie `finance`
- Onglet "Factures" dans l'inbox

### Ce qui a bien marché
- Décision rapide d'abandonner les features compliquées (score admin, intégrations bancaires)
- Prompt Claude enrichi qui retourne des données structurées exploitables dans l'UI
- Pricing cohérent avec l'analyse de coûts (90% de marge)

### Ce qui a coincé
- Besoin de clarifier que l'assistant n'est pas dispo en gratuit (correction post-livraison)
- `max_tokens` augmenté à 3000 pour Claude (nécessaire vu le schema JSON élargi)

### Actions pour les sprints suivants
- [x] Toujours valider les specs "inclusion/exclusion par plan" explicitement
- [ ] Documenter les coûts par plan dans COST-ANALYSIS.md après 1 mois de prod

---

## Sprint 1 — Deadlines & rappels automatiques

### Livré
- Colonne `deadline` DATE extraite de l'analyse (parse JJ/MM/AAAA, DD.MM.YYYY, YYYY-MM-DD)
- Table `reminder_log` pour éviter les rappels en double
- Endpoint `/api/reminders/check` (cron quotidien) → envois J-7, J-2, J-0
- Colonne `action_completed_at` + endpoint `/api/documents/[id]/action`
- Sections "Échéances à venir" (14j) + "Actions en attente" sur le dashboard
- Page détail `/documents/[id]` avec display riche (attention points, actions, consult pro)
- Bouton "Voir" dans l'inbox → page détail
- Cron Vercel configuré (daily 8am)

### Ce qui a bien marché
- Le parsing multi-format de date couvre 95% des cas réels
- La table `reminder_log` élimine proprement les doublons
- La page détail donne une vraie valeur perçue (≠ ChatGPT + storage)

### Ce qui a coincé
- Set iteration TypeScript (`downlevelIteration` flag) — fix via `Array.from`
- `docs` possibly null dans digest/send — fix via fallback `(docs \|\| []).length`

### Actions pour les sprints suivants
- [x] Systématiser `Array.from(set)` ou fallbacks `|| []`
- [ ] Tester en prod le cron avec une deadline réelle
- [ ] Monitorer le taux d'extraction de deadline (% docs avec key_info.deadline non null)

---

## Sprint 2 — Dossiers vivants & dépenses récurrentes

### Livré
- Tables SQL : `folders`, `recurring_expenses` + RLS
- Colonne `folder_id` sur documents
- Auto-groupement par émetteur à chaque upload (crée le dossier s'il n'existe pas)
- Détection automatique de récurrence via `recurring_info` dans l'analyse
- Page `/folders` : vue accordéon avec compteurs urgent/à traiter
- Page `/expenses` : budget mensuel, projection annuelle, regroupement par catégorie
- API DELETE pour archiver une dépense

### Ce qui a bien marché
- Le contournement des intégrations bancaires par le scan des factures fonctionne
- L'auto-groupement donne une structure aux documents sans effort utilisateur
- Supabase RLS + JSONB `document_ids` simple et efficace

### Ce qui a coincé
- Besoin de déduplication par `provider_name` (ilike) — cas edge quand l'émetteur varie légèrement
- Migration SQL doit être exécutée manuellement en prod

### Actions pour les sprints suivants
- [x] Ajouter rename/merge manuel des dossiers (fait en Sprint 4)
- [ ] Normaliser les noms de provider avec Claude (ex: "cellcom ltd" vs "Cellcom")
- [ ] Checklist déploiement : toujours inclure les migrations SQL

---

## Sprint 3 — Intelligence & dashboard enrichi

### Livré
- Widget "Budget mensuel" sur dashboard : top 5 fournisseurs avec barres proportionnelles
- Détection d'anomalies : variation ≥20% → attention_point warning/critical auto-injecté
- Assistant étendu : détection mots-clés (combien, budget, arnona...) → injection contexte dépenses
- Quick wins : export CSV, édition inline dépense, filtre par dossier dans inbox

### Ce qui a bien marché
- La détection d'anomalies est simple (comparaison montant N vs N-1) mais très parlante
- L'assistant devient capable de répondre factuellement sur les dépenses
- Quick wins livrés en même temps améliorent drastiquement l'UX

### Ce qui a coincé
- Choix du seuil d'anomalie (20%) arbitraire — à calibrer avec de la vraie donnée
- Mots-clés de détection assistant risquent de louper certaines questions formulées différemment

### Actions pour les sprints suivants
- [ ] A/B tester seuil anomalie 15% vs 20% vs 25%
- [ ] Passer à une détection d'intention LLM si keywords trop limitants
- [ ] Logger les questions "expenses" sans match pour améliorer les keywords

---

## Sprint 4 — Évolution & qualité

### Livré
- Graphique d'évolution des dépenses sur 12 mois (bars SVG sur /expenses)
- Graphique d'évolution des fiches de paie sur dashboard (delta vs précédent)
- Recherche globale `/search` (debounced 300ms, highlight matches)
- Rename / Delete / Merge manuel des dossiers
- Email d'alerte anomalie (seuil ≥30%)
- Plan de tests et premiers tests unitaires

### Ce qui a bien marché
- Les graphiques SVG maison évitent une dépendance lourde (recharts/chart.js)
- La recherche debounced est très réactive côté UX
- Le merge de dossiers est un vrai filet de sécurité pour l'auto-groupement imparfait

### Ce qui a coincé
- Extraction de montant depuis `key_info.amount` nécessite un parsing regex (formats variés)
- Les dossiers auto-générés peuvent être bruyants — il faut pouvoir les nettoyer facilement

### Actions pour les sprints suivants
- [ ] Stocker `amount` en numérique dès l'analyse Claude (plutôt que de le re-parser après)
- [ ] Ajouter un bouton "Supprimer les dossiers à 1 document" sur /folders
- [ ] Écrire les tests E2E Playwright pour les parcours critiques

---

## Plan de tests

### Tests unitaires (à ajouter progressivement)
- `lib/deadlineParser.ts` — tous les formats de date
- `lib/amountParser.ts` — parsing de montants avec devise/séparateur variables
- `lib/expenseFrequency.ts` — calcul multiplier mensuel par fréquence
- `lib/stripe.ts PLANS` — constantes de plan conformes à l'UI

### Tests d'intégration API (à prioriser)
- `POST /api/documents/upload` — flow complet upload → analysis → folder auto → recurring detection
- `POST /api/assistant/chat` — context expenses injecté quand keywords match
- `POST /api/reminders/check` — sélection docs dans les fenêtres J-7/J-2/J-0 sans doublon
- `POST /api/folders/merge` — move docs + delete source folders

### Tests E2E (Playwright, à construire)
1. **Onboarding** : signup → upload 1er doc → voir l'analyse
2. **Deadline flow** : upload doc avec deadline → visible sur dashboard → mark action done
3. **Facture récurrente** : upload 2 factures même fournisseur → apparition /expenses + dossier auto
4. **Anomalie** : upload facture avec amount ≠ 30% → attention_point critical
5. **Stripe upgrade** : free quota atteint → modal upgrade → checkout → webhook → solo actif
6. **Famille** : owner invite membre → membre join → limite partagée

### Tests manuels (check-list avant chaque déploiement)
- [ ] Login/logout fonctionne sur staging
- [ ] Upload PDF + image OK
- [ ] Toutes les pages nav (Inbox, Dashboard, Dossiers, Dépenses, Assistant, Search) chargent sans 500
- [ ] Dark mode OK sur toutes les nouvelles pages
- [ ] Mobile responsive (viewport 375px) sur toutes les pages
- [ ] Cron Vercel affiche les bons logs
