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

**Total estime : ~70h de developpement**
