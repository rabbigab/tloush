---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['_bmad-output/project-context.md']
workflowType: 'prd'
projectType: 'saas-web-app'
domainComplexity: 'medium'
status: 'complete'
---

# Product Requirements Document — Tloush v3

**Auteur :** Tloush Project
**Date :** 2026-04-02
**Version :** 1.0
**Statut :** Complet

---

## Résumé Exécutif

Tloush v3 est une application web SaaS destinée aux francophones vivant en Israël. Elle transforme les documents administratifs hébraïques — incompréhensibles pour la majorité des olim et expatriés — en explications claires en français, avec des alertes d'urgence, un suivi persistant, et un assistant IA contextuel. L'objectif de la v3 est de passer d'un outil ponctuel (v1 : analyse one-shot sans compte) à un **produit à abonnement formant une habitude**, à travers quatre piliers : **Déchiffrer, Comprendre, Agir, Retenir**.

---

## 1. Contexte et Problème

### 1.1 Le Problème

Les francophones en Israël (olim récents, expatriés, conjoints de ressortissants) reçoivent régulièrement des documents administratifs officiels entièrement en hébreu : fiches de paie (tloush), courriers de Bituah Leumi, avis fiscaux, contrats de travail. Ces documents contiennent des obligations légales, des délais de réponse, des droits à faire valoir — et restent **totalement opaques** pour des non-hébraïsants.

Les alternatives actuelles :
- **Google Translate** : traduction littérale sans explication des implications
- **Comptables/avocats** : coûteux, délais longs, pour des documents simples
- **Communautés Facebook** : conseils non-professionnels, lents, variables
- **Tloush v1** : analyse one-shot sans persistance, sans contexte historique

### 1.2 La Solution Tloush v3

Upload d'un document → analyse IA en français → inbox organisée → assistant contextuel pour poser des questions → rappels et résumés périodiques → le tout pour un abonnement de 20-50₪/mois.

### 1.3 Population Cible

- **Primaire** : Olim (nouveaux immigrants) dans leurs 1-5 premières années en Israël, francophones, peu ou pas de maîtrise de l'hébreu écrit administratif
- **Secondaire** : Expatriés en poste, conjoints de ressortissants, retraités français installés en Israël
- **Taille estimée** : ~50 000 à 100 000 francophones actifs en Israël

---

## 2. Vision Produit

### 2.1 Vision Long Terme

Tloush est **le copilote administratif des francophones en Israël** — l'intermédiaire de confiance entre eux et l'administration hébraïque, disponible 24/7, abordable, et qui apprend leur situation au fil du temps.

### 2.2 Les 4 Piliers

| Pilier | Description | Feature principale |
|--------|-------------|-------------------|
| **Déchiffrer** | Comprendre ce que dit le document | Upload + analyse Claude |
| **Comprendre** | Saisir les implications et obligations | Résumé + alertes urgence |
| **Agir** | Savoir quoi faire et comment | Action requise + assistant |
| **Retenir** | Construire un historique personnel | Inbox + dashboard |

---

## 3. Critères de Succès

### 3.1 Succès Utilisateur

- Un utilisateur qui uploade son premier document comprend sa situation en **moins de 2 minutes**
- 70% des utilisateurs reviennent uploader un second document dans les 30 jours
- L'utilisateur identifie les actions urgentes **sans avoir à relire le document original**
- L'assistant répond à 80% des questions sans nécessiter un professionnel humain

### 3.2 Succès Business

- Conversion Free→Payant : 15% dans les 3 premiers mois post-lancement
- Rétention mensuelle : >75% après 3 mois d'abonnement
- Coût d'acquisition client (CAC) < 3 mois d'abonnement
- MRR de 5 000₪ à 6 mois post-lancement payant

### 3.3 Succès Technique

- Upload + analyse complète : < 30 secondes
- Disponibilité : 99% uptime (hors maintenance planifiée)
- Aucune fuite de données personnelles (conformité RGPD / données israéliennes)
- Mobile-friendly : expérience complète sur smartphone

---

## 4. Parcours Utilisateurs

### 4.1 Parcours Principal — Premier Contact

> *Sophie, 34 ans, installée à Tel Aviv depuis 8 mois, reçoit une enveloppe de Bituah Leumi.*

1. Elle cherche "comprendre courrier bituah leumi français" → tombe sur Tloush
2. Elle crée un compte avec son email
3. Elle uploade une photo du courrier depuis son téléphone
4. En 20 secondes, elle voit : "Courrier de Bituah Leumi — Action requise — Vous devez fournir votre Teudat Zehut avant le 15 mai"
5. Elle clique sur "Demander à l'assistant" → pose "est-ce que c'est grave si je réponds pas ?"
6. L'assistant lui explique les conséquences et la procédure
7. Elle s'abonne parce qu'elle a 3 autres courriers sur son bureau

### 4.2 Parcours Récurrent — Utilisatrice Abonnée

> *Rachel, abonnée depuis 3 mois, reçoit sa fiche de paie mensuelle.*

1. Elle uploade directement depuis l'inbox (habitude installée)
2. Elle reçoit une confirmation : "Fiche de paie Mars 2026 — RAS, aucune anomalie"
3. Elle compare rapidement avec le mois précédent dans son historique
4. Elle pose à l'assistant : "j'ai eu une prime ce mois, les charges sont-elles normales ?"

### 4.3 Parcours Urgence

> *David reçoit une mise en demeure de l'administration fiscale.*

1. Il uploade le document en panique
2. L'inbox s'ouvre avec une bannière rouge : "🔴 Document urgent — Délai de réponse : 15 jours"
3. L'assistant lui explique la procédure et lui recommande un expert-comptable
4. Il comprend qu'il a le temps d'agir — son stress est immédiatement réduit

### 4.4 Parcours Mobile

> *Marc reçoit un SMS avec un lien vers sa fiche de paie en PDF.*

1. Il ouvre Tloush sur son téléphone
2. Il uploade le PDF depuis son téléphone
3. Il lit le résumé en 30 secondes dans les transports
4. Il met une note pour vérifier un point plus tard avec l'assistant

---

## 5. Exigences du Domaine

### 5.1 Documents Supportés

| Type | Exemples | Complexité |
|------|---------|-----------|
| `payslip` | Tloush mensuel | Haute (beaucoup de lignes) |
| `official_letter` | Courriers Bituah Leumi, Misrad Hapnim | Haute (implications légales) |
| `contract` | Contrats de travail, baux | Très haute |
| `tax` | Mas Hachnasa, formulaires fiscaux | Très haute |
| `other` | Tout autre document hébreu | Variable |

### 5.2 Contraintes Spécifiques au Domaine

- L'IA n'est **pas un avocat ni un comptable** — toujours préciser cette limite
- Pour les questions juridiques complexes : recommander un professionnel
- Les montants en shekels (₪) doivent être préservés tels quels
- Les dates hébraïques/israéliennes doivent être converties en format français
- Confidentialité absolue : les documents ne doivent jamais être partagés entre utilisateurs

### 5.3 Qualité de l'Analyse IA

- L'analyse doit détecter les **délais** et les mettre en évidence
- Les **montants anormaux** (primes, retenues inhabituelles) doivent déclencher une note
- Le niveau d'urgence doit être conservateur (mieux vaut sur-alerter que sous-alerter)

---

## 6. Innovation

### 6.1 Différentiation Clé

- **Contextualisation persistante** : l'assistant se souvient de tous les documents uploadés et peut les mettre en relation ("votre fiche de paie de janvier mentionnait déjà...")
- **Adaptation culturelle** : pas de traduction littérale mais une explication adaptée au cadre de référence français (équivalence avec France quand possible)
- **Inbox intelligente** : triage automatique avec alertes proactives, pas juste du stockage passif

---

## 7. Périmètre et Phases

### Phase 1 — MVP (✅ COMPLÉTÉ)

| Feature | Statut |
|---------|--------|
| Authentification (email + mot de passe) | ✅ |
| Inbox avec upload de document (PDF, image) | ✅ |
| Analyse IA par Claude (type, résumé, urgence, action) | ✅ |
| Stockage persistant Supabase | ✅ |
| Assistant contextuel (chat avec historique) | ✅ |
| Sidebar documents dans l'assistant | ✅ |
| Protection des routes (middleware) | ✅ |

### Phase 2 — Engagement (🔲 À CONSTRUIRE)

| Feature | Priorité | Description |
|---------|----------|-------------|
| Page profil utilisateur | Haute | Gérer son compte, préférences |
| Résumé hebdomadaire par email | Haute | Digest des documents de la semaine |
| Dashboard personnel | Haute | Vue d'ensemble : documents récents, stats, alertes |
| Suppression de documents | Haute | RGPD / contrôle utilisateur |
| Système d'abonnement (Stripe ou local) | Haute | Paywall avec freemium |
| Notifications push (web) | Moyenne | Alertes pour documents urgents |
| Recherche dans les documents | Moyenne | Retrouver un document par mot-clé |
| Export PDF du résumé | Faible | Pour les utilisateurs qui veulent archiver |

### Phase 3 — Rétention & Expansion (🔲 Vision)

| Feature | Description |
|---------|-------------|
| Intégration WhatsApp | Upload via WhatsApp, résumé par message |
| Comparaison entre fiches de paie | Détection automatique d'anomalies mois-sur-mois |
| Annuaire d'experts | Comptables/avocats francophones recommandés |
| Mode famille | Gérer les documents de plusieurs membres |
| API publique | Intégration avec d'autres outils de la communauté |

---

## 8. Exigences Fonctionnelles

### FR-AUTH : Authentification

- **FR-AUTH-01** : L'utilisateur peut créer un compte avec email + mot de passe
- **FR-AUTH-02** : L'utilisateur reçoit un email de confirmation à l'inscription
- **FR-AUTH-03** : L'utilisateur peut se connecter et déconnecter
- **FR-AUTH-04** : Les routes `/inbox` et `/assistant` redirigent vers `/auth/login` si non authentifié
- **FR-AUTH-05** : Après login, l'utilisateur est redirigé vers sa destination initiale

### FR-UPLOAD : Upload et Analyse

- **FR-UPLOAD-01** : L'utilisateur peut uploader un fichier PDF, JPG, JPEG, ou PNG (max 10 Mo)
- **FR-UPLOAD-02** : L'analyse Claude retourne : type, résumé FR, is_urgent, action_required, action_description, période
- **FR-UPLOAD-03** : Le document est stocké dans Supabase Storage dans le dossier privé de l'utilisateur
- **FR-UPLOAD-04** : Le résultat d'analyse est sauvegardé en base et affiché immédiatement dans l'inbox
- **FR-UPLOAD-05** : Si l'analyse échoue, un message d'erreur explicite est affiché ; le fichier est conservé

### FR-INBOX : Inbox Documentaire

- **FR-INBOX-01** : L'inbox affiche tous les documents de l'utilisateur, ordonnés par date décroissante
- **FR-INBOX-02** : Les documents urgents (`is_urgent: true`) sont mis en avant dans une section rouge
- **FR-INBOX-03** : Les documents nécessitant une action (`action_required: true`) sont dans une section ambre
- **FR-INBOX-04** : Chaque document affiche : nom du fichier, type, période, résumé, statut, date
- **FR-INBOX-05** : Un bouton "Demander" redirige vers l'assistant avec ce document chargé

### FR-ASSISTANT : Assistant Contextuel

- **FR-ASSISTANT-01** : L'assistant peut répondre à des questions générales sur l'administration israélienne
- **FR-ASSISTANT-02** : Quand un document est sélectionné, l'assistant a accès à son analyse complète
- **FR-ASSISTANT-03** : L'historique de conversation est persistant (table `messages`)
- **FR-ASSISTANT-04** : L'utilisateur peut changer de document actif depuis la sidebar
- **FR-ASSISTANT-05** : Des questions suggérées sont proposées au démarrage d'une conversation
- **FR-ASSISTANT-06** : L'assistant répond toujours en français et indique ses limites (non avocat)

### FR-PROFILE (Phase 2) : Profil Utilisateur

- **FR-PROFILE-01** : L'utilisateur peut modifier son nom d'affichage
- **FR-PROFILE-02** : L'utilisateur peut supprimer son compte et toutes ses données (RGPD)
- **FR-PROFILE-03** : L'utilisateur peut supprimer des documents individuels
- **FR-PROFILE-04** : L'utilisateur peut voir son historique d'abonnement

### FR-DIGEST (Phase 2) : Résumé Hebdomadaire

- **FR-DIGEST-01** : Un email est envoyé chaque lundi avec les documents de la semaine
- **FR-DIGEST-02** : Le digest met en avant les documents urgents et actions en attente
- **FR-DIGEST-03** : L'utilisateur peut se désabonner du digest depuis ses préférences

---

## 9. Exigences Non-Fonctionnelles

### NFR-PERF : Performance

- **NFR-PERF-01** : Upload + analyse complète en < 30 secondes (P90)
- **NFR-PERF-02** : Chargement de l'inbox en < 2 secondes
- **NFR-PERF-03** : Réponse de l'assistant en < 5 secondes

### NFR-SEC : Sécurité

- **NFR-SEC-01** : Row Level Security (RLS) activé sur toutes les tables — un utilisateur ne peut jamais accéder aux données d'un autre
- **NFR-SEC-02** : Le bucket Storage est privé — aucun accès public aux fichiers
- **NFR-SEC-03** : La `SUPABASE_SERVICE_ROLE_KEY` n'est jamais exposée côté client
- **NFR-SEC-04** : Les clés API (Anthropic, Supabase) ne sont jamais dans le code source versionné

### NFR-PRIV : Confidentialité

- **NFR-PRIV-01** : Les documents uploadés ne sont jamais partagés entre utilisateurs
- **NFR-PRIV-02** : L'utilisateur peut exporter ou supprimer toutes ses données sur demande
- **NFR-PRIV-03** : Une politique de confidentialité claire est accessible depuis l'app

### NFR-ACCESS : Accessibilité Mobile

- **NFR-ACCESS-01** : L'interface est entièrement utilisable sur mobile (iOS Safari, Android Chrome)
- **NFR-ACCESS-02** : L'upload fonctionne depuis la caméra du téléphone
- **NFR-ACCESS-03** : Le texte est lisible sans zoom sur un écran de 375px de large

### NFR-AVAIL : Disponibilité

- **NFR-AVAIL-01** : Disponibilité cible : 99% (hors maintenance Supabase/Vercel)
- **NFR-AVAIL-02** : Les erreurs d'analyse IA ne font pas crasher l'app — fallback gracieux

---

## 10. Hors Périmètre (Explicitement)

Les éléments suivants ne font **pas** partie du périmètre v3 :

- Traduction complète des documents (objectif : explication, pas traduction)
- Analyse de documents en langues autres que l'hébreu (anglais, arabe, etc.) — sauf si demandé
- Consultation juridique en temps réel avec un professionnel humain
- Application mobile native (iOS/Android) — web responsive uniquement
- Gestion multi-compte / multi-utilisateur sur un même abonnement
- Intégration directe avec des services gouvernementaux israéliens (APIs Misrad)

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| Tloush | En hébreu : fiche de paie (תלוש) ; aussi le nom du produit |
| Olim | Immigrants en Israël bénéficiant du statut d'alyah |
| Bituah Leumi | Sécurité sociale israélienne (ביטוח לאומי) |
| Misrad Hapnim | Ministère de l'Intérieur israélien |
| Mas Hachnasa | Impôt sur le revenu israélien |
| RLS | Row Level Security — sécurité au niveau ligne dans PostgreSQL/Supabase |
