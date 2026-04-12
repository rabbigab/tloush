# Tloush V3 — Epics & User Stories

> Version: 3.0
> Date: 2026-04-04

---

## EPIC 1 : Lancement produit
**Objectif :** Rendre le produit vendable et desirable immediatement
**Sprint :** 0
**Priorite :** P0 — Bloquant

### Stories

#### 1.1 — Refaire le hero et messaging de la landing page
**En tant que** visiteur,
**Je veux** comprendre immediatement ce que Tloush fait pour moi,
**Pour** avoir envie de tester le produit.

**Criteres d'acceptation :**
- [ ] Nouveau hero : "Ne subissez plus vos papiers en Israel"
- [ ] Sous-texte axe sur la valeur : comprendre, verifier, agir
- [ ] 3 blocs benefices (pas features) : Comprendre / Verifier / Agir
- [ ] 4 cartes cas d'usage concrets (fiche de paie, contrat, facture, courrier)
- [ ] CTA fort : "Analyser mon premier document"
- [ ] Section "Pourquoi Tloush" avec benefices concrets

**Effort :** 2-3h
**Impact :** Tres eleve (conversion visiteur -> inscription)

---

#### 1.2 — Refaire la page pricing (valeur percue)
**En tant que** utilisateur gratuit,
**Je veux** comprendre ce que je gagne en passant au plan payant,
**Pour** etre motive a upgrader.

**Criteres d'acceptation :**
- [ ] Plans presentes avec benefices, pas quotas techniques
- [ ] Quotas mis a jour : Gratuit 5 docs, Solo 50 docs, Famille 150 docs
- [ ] Messages assistant : "illimite (usage raisonnable)" pour les plans payants
- [ ] Solo : mise en avant suivi depenses, rappels, comparaison, recap hebdo
- [ ] Famille : mise en avant "copilote de toute la famille"
- [ ] Quotas techniques uniquement dans les CGV/tooltip
- [ ] FAQ mise a jour

**Effort :** 2-3h
**Impact :** Tres eleve (conversion gratuit -> payant)

---

#### 1.3 — Ameliorer le template de resultat d'analyse
**En tant que** utilisateur qui vient d'analyser un document,
**Je veux** voir clairement ce qui est important, ce qui est suspect et quoi faire,
**Pour** sentir que Tloush apporte plus qu'un simple ChatGPT.

**Criteres d'acceptation :**
- [ ] Section "Resume" clair en 2-3 phrases
- [ ] Section "Points detectes" avec badges vert/orange/rouge
- [ ] Section "Actions recommandees" avec liste cliquable
- [ ] Section "Echeance" si deadline detectee (date + urgence)
- [ ] Section "Quand consulter un pro" si le sujet le necessite
- [ ] Prompt Claude mis a jour pour structurer la sortie

**Effort :** 3-4h
**Impact :** Eleve (differenciation produit)

---

#### 1.4 — Configuration infrastructure (utilisateur)
**En tant que** proprietaire du produit,
**Je dois** configurer les services externes,
**Pour** que le produit fonctionne en production.

**Actions :**
- [ ] Executer `supabase-schema.sql` dans Supabase
- [ ] Executer `supabase-subscriptions.sql` dans Supabase
- [ ] Executer `supabase-family-members.sql` dans Supabase
- [ ] Configurer Google OAuth dans Supabase (redirect URLs)
- [ ] Creer produits Stripe (Solo + Famille)
- [ ] Configurer webhook Stripe
- [ ] Configurer variables d'environnement Vercel
- [ ] Tester le flow complet E2E

**Effort :** 1-2h
**Impact :** Bloquant

---

#### 1.5 — Activer le digest hebdomadaire (cron)
**En tant que** utilisateur payant,
**Je veux** recevoir un email chaque semaine avec le resume de ma situation,
**Pour** avoir une raison de revenir et ne rien oublier.

**Criteres d'acceptation :**
- [ ] Configurer Vercel Cron pour appeler `/api/digest/send` chaque lundi 9h
- [ ] Verifier que le digest inclut : docs recents, urgences, actions en attente
- [ ] Tester avec un compte reel

**Effort :** 30min (code deja ecrit)
**Impact :** Moyen (retention)

---

## EPIC 2 : Systeme de deadlines et rappels
**Objectif :** Ne jamais laisser passer une echeance
**Sprint :** 1
**Priorite :** P0

### Stories

#### 2.1 — Extraire et stocker les deadlines
**En tant que** utilisateur,
**Je veux** que Tloush detecte automatiquement les echeances dans mes documents,
**Pour** ne jamais oublier une date limite.

**Criteres d'acceptation :**
- [ ] Nouvelle colonne `deadline` (DATE) dans table `documents`
- [ ] Migration SQL pour la nouvelle colonne
- [ ] `/api/documents/upload` extrait et sauvegarde la deadline depuis `key_info.deadline`
- [ ] Parsing des formats de date courants (JJ/MM/AAAA, DD.MM.YYYY, hebreu)
- [ ] Fallback si date non parsable : stocker dans `action_description`

**Effort :** 2h

---

#### 2.2 — Emails de rappel d'echeance
**En tant que** utilisateur avec un document ayant une echeance,
**Je veux** recevoir un rappel par email avant la date limite,
**Pour** ne pas manquer le delai.

**Criteres d'acceptation :**
- [ ] Endpoint `/api/reminders/check` qui trouve les docs avec deadline dans les 7j
- [ ] Email de rappel envoye a J-7, J-2 et J-0
- [ ] Table `reminder_log` pour eviter les doublons
- [ ] Vercel Cron quotidien pour declencher la verification
- [ ] Respecter la preference utilisateur `urgent_alerts_enabled`

**Effort :** 3-4h

---

#### 2.3 — Echeances dans le dashboard
**En tant que** utilisateur,
**Je veux** voir mes echeances a venir sur mon dashboard,
**Pour** avoir une vue d'ensemble de ce qui arrive.

**Criteres d'acceptation :**
- [ ] Section "Echeances cette semaine" dans le dashboard
- [ ] Echeances triees par date
- [ ] Badge rouge si < 3 jours
- [ ] Lien direct vers le document concerne

**Effort :** 2h

---

#### 2.4 — Echeances dans le digest hebdo
**En tant que** utilisateur,
**Je veux** que mon recap hebdomadaire inclue les echeances a venir,
**Pour** tout voir d'un coup.

**Criteres d'acceptation :**
- [ ] Section "Echeances des 7 prochains jours" dans l'email digest
- [ ] Documents concernes avec resume et action requise

**Effort :** 1h

---

## EPIC 3 : Resultat d'analyse enrichi
**Objectif :** Se differencier de "ChatGPT + upload"
**Sprint :** 1
**Priorite :** P0

### Stories

#### 3.1 — Nouveau format de sortie structure
**En tant que** utilisateur,
**Je veux** voir le resultat de mon analyse organise en blocs clairs,
**Pour** savoir immediatement quoi faire.

**Criteres d'acceptation :**
- [ ] Bloc "Resume" — 2-3 phrases claires
- [ ] Bloc "Informations cles" — tableau des donnees extraites
- [ ] Bloc "Points detectes" — badges vert (OK) / orange (a verifier) / rouge (alerte)
- [ ] Bloc "Actions recommandees" — liste numerotee d'actions concretes
- [ ] Bloc "Echeance" — date + countdown si applicable
- [ ] Bloc "Consulter un pro" — visible seulement si pertinent

**Effort :** 4h

---

#### 3.2 — Prompt IA mis a jour
**En tant que** developpeur,
**Je dois** mettre a jour le prompt Claude pour generer la sortie structuree,
**Pour** que chaque analyse contienne les blocs attendus.

**Criteres d'acceptation :**
- [ ] Prompt modifie pour demander une sortie JSON structuree avec tous les blocs
- [ ] Niveaux d'attention : `ok`, `info`, `warning`, `critical`
- [ ] Actions avec priorite : `immediate`, `soon`, `when_possible`
- [ ] Champ `should_consult_pro` avec type de professionnel

**Effort :** 2h

---

#### 3.3 — UI du resultat repensee
**En tant que** utilisateur,
**Je veux** voir les blocs affiches de maniere claire et visuelle,
**Pour** comprendre en un coup d'oeil.

**Criteres d'acceptation :**
- [ ] Composant ResultCard par bloc
- [ ] Couleurs coherentes (vert/orange/rouge)
- [ ] Icones par type de point
- [ ] Actions cochables (marquer comme "fait")
- [ ] Responsive mobile

**Effort :** 3h

---

## EPIC 4 : Dossiers vivants
**Objectif :** Transformer des documents isoles en sujets suivis
**Sprint :** 2
**Priorite :** P1

### Stories

#### 4.1 — Schema dossiers
**En tant que** developpeur,
**Je dois** creer le modele de donnees pour les dossiers,
**Pour** pouvoir grouper les documents par sujet.

**Criteres d'acceptation :**
- [ ] Table `folders` : id, user_id, name, category, status, icon, created_at, updated_at
- [ ] Colonne `folder_id` (nullable FK) dans `documents`
- [ ] Statuts : `active`, `resolved`, `attention_required`
- [ ] Categories : `travail`, `logement`, `fiscal`, `sante`, `finance`, `autre`
- [ ] RLS : utilisateur ne voit que ses dossiers

**Effort :** 1h

---

#### 4.2 — Auto-groupement intelligent
**En tant que** utilisateur,
**Je veux** que mes fiches de paie du meme employeur soient automatiquement groupees,
**Pour** ne pas avoir a les organiser manuellement.

**Criteres d'acceptation :**
- [ ] A l'upload, si meme `document_type` + meme emetteur -> proposer le dossier existant
- [ ] Auto-creation dossier si 2+ docs du meme type/emetteur
- [ ] Nom automatique : "[Type] - [Emetteur]" (ex: "Fiches de paie - Acme Ltd")
- [ ] L'utilisateur peut renommer ou reorganiser

**Effort :** 3h

---

#### 4.3 — UI dossiers dans l'inbox
**En tant que** utilisateur,
**Je veux** pouvoir voir mes documents par dossier ou par liste,
**Pour** m'y retrouver facilement.

**Criteres d'acceptation :**
- [ ] Toggle vue : "Par document" / "Par dossier"
- [ ] Vue dossier : cartes avec nom, nombre de docs, statut, dernier doc
- [ ] Clic sur dossier -> liste des docs du dossier
- [ ] Badge de statut par dossier (vert/orange/rouge)

**Effort :** 4h

---

#### 4.4 — Timeline par dossier
**En tant que** utilisateur,
**Je veux** voir l'historique chronologique d'un dossier,
**Pour** suivre l'evolution d'un sujet dans le temps.

**Criteres d'acceptation :**
- [ ] Vue timeline verticale
- [ ] Chaque entree : date, document, resume, points detectes
- [ ] Liens vers le detail de chaque document

**Effort :** 3h

---

## EPIC 5 : Scan factures et suivi depenses
**Objectif :** Creer une habitude de scan + vision budget sans integration bancaire
**Sprint :** 2-3
**Priorite :** P1

### Stories

#### 5.1 — Nouveaux types de documents
**En tant que** utilisateur,
**Je veux** pouvoir scanner mes factures et tickets de caisse,
**Pour** suivre mes depenses.

**Criteres d'acceptation :**
- [ ] Nouveaux types : `invoice`, `receipt`, `utility_bill`, `insurance`, `telecom`
- [ ] Labels et icones dans `docTypes.ts`
- [ ] Categorie `finance` ajoutee au filtre inbox

**Effort :** 1h

---

#### 5.2 — Extraction specialisee factures
**En tant que** utilisateur qui scanne une facture,
**Je veux** que Tloush extraie automatiquement les informations financieres,
**Pour** ne pas avoir a saisir manuellement.

**Criteres d'acceptation :**
- [ ] Extraction : fournisseur, montant TTC, montant HT, TVA, date, numero facture
- [ ] Detection recurrence : mensuel, bimestriel, trimestriel, annuel, ponctuel
- [ ] Categorie automatique : arnona, electricite, eau, internet, telephone, assurance, loyer, transport, autre
- [ ] Prompt IA dedie pour les factures

**Effort :** 3h

---

#### 5.3 — Table depenses recurrentes
**En tant que** developpeur,
**Je dois** stocker et agreger les depenses recurrentes,
**Pour** construire le suivi budgetaire.

**Criteres d'acceptation :**
- [ ] Table `recurring_expenses` : id, user_id, provider_name, category, amount, frequency, currency, last_seen_date, document_ids (JSONB array), status, created_at, updated_at
- [ ] Statuts : `active`, `paused`, `ended`
- [ ] RLS : utilisateur ne voit que ses depenses

**Effort :** 1h

---

#### 5.4 — Detection automatique de recurrence
**En tant que** utilisateur qui scanne regulierement ses factures,
**Je veux** que Tloush detecte automatiquement les depenses recurrentes,
**Pour** ne pas avoir a les categoriser manuellement.

**Criteres d'acceptation :**
- [ ] Si meme fournisseur + meme type revient 2+ fois -> marquer comme recurrent
- [ ] Calculer la moyenne, detecter les variations
- [ ] Associer les document_ids
- [ ] Mettre a jour le montant et la date `last_seen` a chaque nouveau scan

**Effort :** 3h

---

#### 5.5 — Page "Mes depenses"
**En tant que** utilisateur payant,
**Je veux** voir un tableau de mes depenses recurrentes,
**Pour** avoir une vision claire de mon budget fixe.

**Criteres d'acceptation :**
- [ ] Liste des depenses recurrentes avec : fournisseur, montant, frequence, categorie
- [ ] Total mensuel estime en haut de page
- [ ] Tri par montant / categorie / fournisseur
- [ ] Icones par categorie (maison, telephone, voiture, etc.)
- [ ] Indicateur de variation : fleche haut/bas si le montant a change
- [ ] Lien vers les documents source

**Effort :** 4h

---

#### 5.6 — Detection anomalies depenses
**En tant que** utilisateur,
**Je veux** etre alerte quand une depense augmente significativement,
**Pour** ne pas payer plus sans le savoir.

**Criteres d'acceptation :**
- [ ] Si montant > +20% vs moyenne -> alerte orange
- [ ] Si montant > +50% vs moyenne -> alerte rouge
- [ ] Notification dans le dashboard
- [ ] Mention dans le digest hebdo

**Effort :** 2h

---

#### 5.7 — Assistant contextuel depenses
**En tant que** utilisateur,
**Je veux** poser des questions a l'assistant sur mes depenses,
**Pour** mieux comprendre mon budget.

**Criteres d'acceptation :**
- [ ] L'assistant a acces aux `recurring_expenses` de l'utilisateur
- [ ] Peut repondre a : "combien je depense par mois ?", "mon arnona a augmente ?"
- [ ] Peut lister les depenses par categorie

**Effort :** 2h

---

#### 5.8 — Depenses dans le digest hebdo
**En tant que** utilisateur payant,
**Je veux** que mon recap hebdomadaire inclue un resume de mes depenses,
**Pour** garder le controle.

**Criteres d'acceptation :**
- [ ] Section "Vos depenses" dans l'email digest
- [ ] Total mensuel estime
- [ ] Anomalies detectees cette semaine

**Effort :** 1h

---

## EPIC 6 : Dashboard ameliore
**Objectif :** Donner une raison de revenir chaque semaine
**Sprint :** 3
**Priorite :** P1

### Stories

#### 6.1 — Section echeances
**En tant que** utilisateur,
**Je veux** voir mes echeances a venir en premier sur le dashboard,
**Pour** ne rien oublier.

**Criteres d'acceptation :**
- [ ] Cartes echeances triees par date
- [ ] Badge rouge si < 3 jours, orange si < 7 jours
- [ ] Lien vers le document

**Effort :** 2h

---

#### 6.2 — Section actions en attente
**En tant que** utilisateur,
**Je veux** voir toutes les actions non traitees,
**Pour** savoir ce qu'il me reste a faire.

**Criteres d'acceptation :**
- [ ] Liste des docs avec `action_required = true` non resolus
- [ ] Checkbox pour marquer comme fait
- [ ] Colonne `action_completed_at` dans `documents`

**Effort :** 2h

---

#### 6.3 — Widget depenses recurrentes
**En tant que** utilisateur payant,
**Je veux** voir un resume de mes charges fixes sur le dashboard,
**Pour** avoir une vue globale.

**Criteres d'acceptation :**
- [ ] Total mensuel estime
- [ ] Top 3 plus grosses depenses
- [ ] Fleche si variation recente
- [ ] Lien vers la page depenses complete

**Effort :** 2h

---

#### 6.4 — Resume mensuel
**En tant que** utilisateur,
**Je veux** voir un resume du mois en cours,
**Pour** mesurer mon utilisation.

**Criteres d'acceptation :**
- [ ] X documents analyses
- [ ] Y alertes detectees
- [ ] Z actions completees
- [ ] Comparaison vs mois precedent

**Effort :** 2h

---

## EPIC 7 : Comparaison de documents
**Objectif :** Montrer l'evolution dans le temps (le "waouh")
**Sprint :** 3
**Priorite :** P2

### Stories

#### 7.1 — Comparaison fiches de paie
**En tant que** utilisateur avec plusieurs fiches de paie,
**Je veux** voir la comparaison entre deux mois cote a cote,
**Pour** detecter les changements.

**Criteres d'acceptation :**
- [ ] Selecteur de 2 documents du meme type
- [ ] Vue cote a cote avec differences surlignees
- [ ] Badges : augmentation (vert), diminution (rouge), nouveau (bleu), disparu (gris)
- [ ] Note : la comparaison basique existe dans `/api/extract`, l'exposer en UI

**Effort :** 4h

---

#### 7.2 — Comparaison factures recurrentes
**En tant que** utilisateur,
**Je veux** comparer mes factures du meme fournisseur,
**Pour** voir si mes depenses augmentent.

**Criteres d'acceptation :**
- [ ] Meme interface que 7.1 mais pour les factures
- [ ] Accent sur le montant et les lignes qui changent

**Effort :** 2h

---

#### 7.3 — Graphique d'evolution
**En tant que** utilisateur avec un historique,
**Je veux** voir un graphique de l'evolution de mon salaire ou d'une depense,
**Pour** visualiser la tendance.

**Criteres d'acceptation :**
- [ ] Graphique ligne simple (recharts ou chart.js)
- [ ] Axe X : mois, Axe Y : montant
- [ ] Disponible par dossier ou par depense recurrente

**Effort :** 3h

---

## Resume des Epics

| Epic | Sprint | Effort total | Priorite |
|------|--------|-------------|----------|
| 1. Lancement produit | 0 | ~8h + config | P0 |
| 2. Deadlines et rappels | 1 | ~8h | P0 |
| 3. Resultat analyse enrichi | 1 | ~9h | P0 |
| 4. Dossiers vivants | 2 | ~11h | P1 |
| 5. Scan factures et depenses | 2-3 | ~17h | P1 |
| 6. Dashboard ameliore | 3 | ~8h | P1 |
| 7. Comparaison documents | 3 | ~9h | P2 |

**Total estime V3 : ~70h de developpement**

---

# Tloush V4 — Epics & User Stories

> Version: 4.0
> Date: 2026-04-12
> Voir aussi: `v4-FEASIBILITY.md`, `v4-ARCHITECTURE.md`, `v4-SPRINT-PLAN.md`

---

## EPIC 9 : Profil utilisateur enrichi (PREREQUIS)
**Objectif :** Collecter les donnees necessaires pour personnaliser les calculs fiscaux, droits et miluim
**Sprint :** 0 (V4)
**Priorite :** P0 — Bloquant pour EPIC 11, 12, 14

### Stories

#### 9.1 — Migration profil + champs enrichis
**En tant que** developpeur,
**Je dois** enrichir la table profiles avec les champs necessaires,
**Pour** debloquer les features fiscales et droits.

**Criteres d'acceptation :**
- [ ] Migration SQL : `marital_status`, `aliyah_year`, `children_count`, `children_birth_dates[]`, `disability_level`, `employment_status`, `spouse_profile_id`
- [ ] Validation Zod cote API (enums stricts)
- [ ] RLS: chaque user ne peut lire/modifier que son propre profil
- [ ] Seed optionnel pour tests

**Effort :** 1h
**Impact :** Bloquant

#### 9.2 — Page profil edition
**En tant que** utilisateur,
**Je veux** completer mon profil avec mes informations personnelles,
**Pour** que Tloush personnalise son analyse pour moi.

**Criteres d'acceptation :**
- [ ] Page `/profile/edit` avec sections : situation familiale, alyah, enfants, sante, emploi
- [ ] Formulaire reactif avec validation en temps reel
- [ ] Progress bar "Profil rempli a X%"
- [ ] Auto-save apres chaque modification
- [ ] Toast de confirmation
- [ ] Onboarding post-inscription qui pousse a remplir

**Effort :** 2h
**Impact :** Tres eleve (conversion + qualite des analyses)

---

## EPIC 10 : Monitoring administrateur
**Objectif :** Suivre la sante technique et financiere de Tloush en temps reel
**Sprint :** 1 (V4)
**Priorite :** P1

### Stories

#### 10.1 — Dashboard metriques de performance
**En tant que** administrateur Tloush,
**Je veux** voir les metriques de performance d'analyse en temps reel,
**Pour** detecter rapidement les degradations de service.

**Criteres d'acceptation :**
- [ ] Page admin `/admin/metrics` accessible aux roles `admin` uniquement (RLS)
- [ ] Affichage du temps moyen d'analyse par type de document (24h, 7j, 30j)
- [ ] Taux d'erreur global et par endpoint (`/api/extract`, `/api/upload`)
- [ ] Nombre de documents analyses par heure (graphique ligne)
- [ ] Temps de reponse P50 / P95 / P99 pour chaque appel Claude
- [ ] Filtres : periode, type de document, plan utilisateur
- [ ] Auto-refresh toutes les 60 secondes

**Effort :** 5h
**Impact :** Eleve (qualite de service)

#### 10.2 — Suivi des couts Claude API
**En tant que** administrateur,
**Je veux** voir les couts Claude par utilisateur et par jour,
**Pour** identifier les abus et controler la marge.

**Criteres d'acceptation :**
- [ ] Migration : `documents` + `tokens_in, tokens_out, duration_ms, error_code, model`
- [ ] Wrapper centralise autour de `anthropic.messages.create` qui logge tout
- [ ] Vue admin : cout total quotidien / hebdo / mensuel
- [ ] Top 10 utilisateurs les plus couteux
- [ ] Cout moyen par document analyse (par type)
- [ ] Alerte email si cout journalier > seuil configurable

**Effort :** 4h
**Impact :** Tres eleve (rentabilite)

#### 10.3 — Journal d'erreurs centralise
**En tant que** administrateur,
**Je veux** consulter les erreurs survenues sur le produit,
**Pour** corriger les bugs avant qu'ils n'impactent trop d'utilisateurs.

**Criteres d'acceptation :**
- [ ] Table `error_log` : id, user_id, endpoint, error_message, stack_trace, severity, resolved, created_at
- [ ] Capture automatique des erreurs serveur 5xx
- [ ] Vue admin avec filtres severite (info / warning / error / critical)
- [ ] Bouton "marquer comme resolu" avec note
- [ ] Compteur d'occurrences pour erreurs identiques
- [ ] Export CSV des erreurs sur une periode

**Effort :** 3h
**Impact :** Moyen

---

## EPIC 11 : Module famille UI
**Objectif :** Permettre la gestion partagee des documents au sein du foyer
**Sprint :** 2 (V4)
**Priorite :** P1 — Debloque EPIC 12 et 14

### Stories

#### 11.1 — Gestion des membres de la famille
**En tant que** parent abonne au plan Famille,
**Je veux** ajouter et gerer les membres de mon foyer,
**Pour** centraliser les documents de toute la famille.

**Criteres d'acceptation :**
- [ ] Page `/family` accessible aux abonnes Famille uniquement (gate via subscription.ts)
- [ ] Formulaire d'ajout : prenom, lien (conjoint, enfant, parent), date de naissance
- [ ] Limite de 6 membres par foyer
- [ ] Edition et suppression avec confirmation
- [ ] Avatar genere automatiquement (initiales + couleur)
- [ ] RLS: seul le proprietaire peut modifier

**Effort :** 3h
**Impact :** Eleve

#### 11.2 — Partage selectif de documents
**En tant que** utilisateur,
**Je veux** choisir quels documents partager avec ma famille,
**Pour** garder mes papiers prives prives.

**Criteres d'acceptation :**
- [ ] Table `family_shared_documents` avec RLS bidirectionnelle
- [ ] Toggle "Partager avec la famille" sur la page detail document
- [ ] Tests pgTAP RLS obligatoires avant deploiement
- [ ] Revocation immediate si un membre est retire du foyer
- [ ] Indicateur visuel (badge) sur les docs partages dans l'inbox

**Effort :** 4h
**Impact :** Tres eleve (differenciateur plan Famille)

#### 11.3 — Vue foyer consolidee
**En tant que** parent,
**Je veux** une vue d'ensemble des documents et echeances de toute la famille,
**Pour** ne rien manquer pour personne.

**Criteres d'acceptation :**
- [ ] Page `/family/dashboard` avec une colonne par membre
- [ ] Pour chaque membre : nombre de docs, prochaine echeance, derniere alerte
- [ ] Section "Echeances de la semaine du foyer"
- [ ] Section "Documents partages du foyer"
- [ ] Notifications regroupees par membre dans le digest hebdo

**Effort :** 3h
**Impact :** Tres eleve

---

## EPIC 12 : Suivi miluim
**Objectif :** Simplifier la gestion administrative des periodes de reserve
**Sprint :** 3 (V4)
**Priorite :** P1

### Stories

#### 12.1 — Saisie des periodes de miluim
**En tant que** olim reserviste,
**Je veux** enregistrer mes periodes de miluim,
**Pour** suivre mon historique et mes droits.

**Criteres d'acceptation :**
- [ ] Table `miluim_periods` : id, user_id, start_date, end_date, days_count, unit, type, document_ids
- [ ] Formulaire de saisie avec validation des dates
- [ ] Upload du tzav 8 (PDF) avec extraction auto des dates
- [ ] Calcul automatique du nombre de jours
- [ ] Liste chronologique (annee en cours et anterieures)
- [ ] Total cumule sur 12 mois et 3 ans
- [ ] Plafond legal : max 270 jours/3 ans

**Effort :** 4h
**Impact :** Eleve

#### 12.2 — Calcul de l'indemnisation
**En tant que** reserviste salarie,
**Je veux** estimer mon indemnisation Bituah Leumi,
**Pour** verifier que mon employeur me verse le bon montant.

**Criteres d'acceptation :**
- [ ] Calcul base sur le salaire moyen des 3 derniers mois (extraits des fiches de paie)
- [ ] Application du plafond et plancher Bituah Leumi en vigueur (versionnes)
- [ ] Affichage : montant brut estime, jours indemnises, taux journalier
- [ ] Comparaison avec ce que l'employeur a verse
- [ ] Alerte si difference > 5%
- [ ] Lien vers le formulaire de reclamation Bituah Leumi

**Effort :** 4h
**Impact :** Tres eleve

#### 12.3 — Generation lettre employeur
**En tant que** reserviste,
**Je veux** generer automatiquement une lettre pour mon employeur,
**Pour** l'informer de mes obligations sans avoir a la rediger.

**Criteres d'acceptation :**
- [ ] Template bilingue francais / hebreu dans letterTemplates.ts
- [ ] Pre-rempli : nom, dates, unite, references (article 41 loi Hok Hayalim)
- [ ] Telechargement en PDF via pdfGenerator.ts
- [ ] Historique des lettres generees
- [ ] Variante "lettre de reclamation" si l'employeur refuse

**Effort :** 3h
**Impact :** Eleve

---

## EPIC 13 : Estimateur de remboursement d'impots
**Objectif :** Aider l'olim francophone a recuperer ses החזר מס sans comptable
**Sprint :** 4 (V4)
**Priorite :** P0

### Stories

#### 13.1 — Analyse formulaire 106
**En tant que** olim qui recoit son tofes 106,
**Je veux** que Tloush extraie automatiquement les donnees fiscales,
**Pour** comprendre ma situation sans lire l'hebreu.

**Criteres d'acceptation :**
- [ ] Nouveau type de document `tax_form_106`
- [ ] Prompt Claude dedie qui extrait : salaire brut annuel, impot preleve, bituah leumi, mas briout, points de credit utilises
- [ ] Traduction automatique des champs cles en francais
- [ ] Stockage structure
- [ ] Gestion des cas multi-employeurs
- [ ] Validation parser sur au moins 5 vrais Tofes 106

**Effort :** 4h
**Impact :** Tres eleve

#### 13.2 — Detection des points de credit
**En tant que** olim,
**Je veux** que Tloush detecte les points de credit auxquels j'ai droit,
**Pour** ne pas en oublier dans ma declaration.

**Criteres d'acceptation :**
- [ ] Utilise le profil enrichi (EPIC 9)
- [ ] Calcul automatique : olim hadash (3 ans), parent isole, enfants < 5 ans
- [ ] Comparaison entre points utilises (extraits du 106) et points dus
- [ ] Affichage des points manquants avec equivalent en shekels
- [ ] Lien vers la documentation officielle Rashut HaMisim
- [ ] Avertissement "consultez un comptable" si situation complexe

**Effort :** 5h
**Impact :** Tres eleve

#### 13.3 — Estimation du remboursement
**En tant que** olim,
**Je veux** voir une estimation chiffree de mon remboursement potentiel,
**Pour** decider si je lance une demande החזר מס.

**Criteres d'acceptation :**
- [ ] Calcul base sur les brackets 2025 de israeliPayroll.ts
- [ ] Affichage du montant estime en NIS et EUR
- [ ] Detail du calcul etape par etape
- [ ] Disclaimer juridique "estimation indicative, pas un avis fiscal"
- [ ] Export PDF "Brouillon Tofes 135"
- [ ] Historique des estimations par annee fiscale
- [ ] Lien vers expertMatcher.ts pour yoetz mas francophone

**Effort :** 4h
**Impact :** Tres eleve (conversion premium)

---

## EPIC 14 : Comparateur annuel de fiches de paie
**Objectif :** Donner une vision longitudinale de l'evolution salariale
**Sprint :** 5 (V4)
**Priorite :** P1

### Stories

#### 14.1 — Vue 12 mois consolidee
**En tant que** salarie utilisant Tloush,
**Je veux** voir mes 12 dernieres fiches de paie sur un seul ecran,
**Pour** comprendre l'evolution de ma remuneration.

**Criteres d'acceptation :**
- [ ] Page `/payslips/annual` accessible depuis le dossier "Fiches de paie"
- [ ] Tableau : 1 ligne par mois, colonnes brut/net/impot/BL/primes
- [ ] Detection automatique des mois manquants
- [ ] Total annuel cumule en pied de tableau
- [ ] Export CSV / PDF pour comptable
- [ ] Empty state si < 3 fiches

**Effort :** 4h
**Impact :** Eleve

#### 14.2 — Detection des augmentations et variations
**En tant que** salarie,
**Je veux** etre alerte des variations de mon salaire,
**Pour** poser les bonnes questions a mon employeur.

**Criteres d'acceptation :**
- [ ] Detection automatique des hausses / baisses > 3% mois sur mois
- [ ] Detection des nouvelles lignes (prime, indemnite) jamais vues avant
- [ ] Detection des lignes disparues
- [ ] Badge sur le mois concerne avec resume du changement
- [ ] Explication claire en francais
- [ ] Alerte rouge si retenue suspecte

**Effort :** 4h
**Impact :** Tres eleve

#### 14.3 — Graphiques d'evolution
**En tant que** utilisateur visuel,
**Je veux** voir des graphiques clairs de mes revenus dans le temps,
**Pour** suivre ma trajectoire financiere.

**Criteres d'acceptation :**
- [ ] Graphique en barres empilees : brut / net / impot par mois (Recharts)
- [ ] Graphique ligne : net cumule sur 12 mois
- [ ] Graphique camembert : repartition moyenne
- [ ] Toggle annee N vs annee N-1 si dispo
- [ ] Responsive mobile

**Effort :** 3h
**Impact :** Moyen

---

## EPIC 15 : Detecteur automatique de droits (MVP)
**Objectif :** Reveler a l'utilisateur les aides non reclamees — MVP avec 10 regles a forte confiance
**Sprint :** 6 (V4)
**Priorite :** P0

### Stories

#### 15.1 — Base de connaissance des 10 droits MVP
**En tant que** developpeur,
**Je dois** modeliser un catalogue de 10 droits a forte confiance,
**Pour** eviter les faux positifs catastrophiques.

**Criteres d'acceptation :**
- [ ] Table `rights_catalog` : id, slug, title_fr, description_fr, conditions (JSONB), authority, average_amount, application_url, confidence_level
- [ ] 10 droits MVP documentes et valides :
  1. Points de credit oleh (3 ans)
  2. Points de credit parent isole
  3. Points de credit enfants < 5 ans
  4. Allocation enfants (kitsbat yeladim)
  5. Exemption BL freelance debut activite
  6. Remboursement miluim non reclame (lien EPIC 12)
  7. Remboursement mas hachnasa (lien EPIC 13)
  8. Droits licenciement non verses
  9. Conges non pris au-dela du plafond legal
  10. Convalescence (havraa) non versee
- [ ] Validation legale par professionnel avant mise en prod
- [ ] Chaque regle a une `confidence_level` (high/medium/low) et un disclaimer

**Effort :** 5h
**Impact :** Tres eleve (fondation feature)

#### 15.2 — Moteur de matching profil / droits
**En tant que** olim,
**Je veux** que Tloush analyse mon profil et mes documents pour detecter les droits,
**Pour** ne rien laisser sur la table.

**Criteres d'acceptation :**
- [ ] `src/lib/rightsDetector.ts` avec fonction `detectRights(profile, documents)`
- [ ] Regles exprimees en JSON, pas en hardcode
- [ ] Score de confiance par droit (0-100%)
- [ ] Table `detected_rights` avec status (suggested/claimed/dismissed)
- [ ] Re-scan automatique apres chaque nouveau document
- [ ] Consent RGPD explicite pour l'utilisation des donnees sensibles

**Effort :** 5h
**Impact :** Tres eleve

#### 15.3 — Page "Mes droits detectes"
**En tant que** utilisateur,
**Je veux** voir la liste des droits auxquels j'ai potentiellement droit,
**Pour** decider lesquels reclamer.

**Criteres d'acceptation :**
- [ ] Onglet "Detectes pour vous" dans `/rights-check`
- [ ] Cartes par droit : titre, description, montant moyen, confiance
- [ ] Filtres : autorite, montant, confiance
- [ ] Bouton "voir comment reclamer" avec guide pas a pas
- [ ] Boutons "deja reclame" / "pas concerne"
- [ ] Notification dashboard si nouveaux droits detectes
- [ ] UI claire distinguant "probable" vs "a verifier"

**Effort :** 4h
**Impact :** Tres eleve

---

## Resume des Epics V4

| Epic | Sprint V4 | Effort | Priorite |
|------|-----------|--------|----------|
| 9. Profil enrichi (prerequis) | 0 | 3h | P0 |
| 10. Monitoring administrateur | 1 | ~12h | P1 |
| 11. Module famille UI | 2 | ~10h | P1 |
| 12. Suivi miluim | 3 | ~11h | P1 |
| 13. Estimateur remboursement impots | 4 | ~13h | P0 |
| 14. Comparateur annuel fiches paie | 5 | ~11h | P1 |
| 15. Detecteur droits MVP | 6 | ~14h | P0 |

**Total estime V4 : ~74h de developpement**
