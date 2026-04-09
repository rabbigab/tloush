# Tloush Recommande — Product Requirements Document (PRD)

> Version: 1.0
> Date: 2026-04-09
> Statut: En cours de validation
> Parent: Tloush V3 PRD v3.0

---

## 1. Vision produit

### Avant
> "Tloush aide les francophones en Israel a comprendre leurs documents en hebreu."

### Maintenant (avec Recommande)
> "Tloush est le copilote du quotidien des francophones en Israel. Il aide a comprendre ses documents, trouver des prestataires de confiance, et verifier leurs devis."

### Proposition de valeur Recommande
Tloush Recommande est un **annuaire de prestataires francophones references** en Israel avec suivi post-prestation. Il resout un probleme quotidien (trouver un plombier, electricien, peintre qui parle francais) tout en servant de **canal d'acquisition gratuit** pour le SaaS Tloush.

### Killer Promise
> "Trouve un prestataire francophone de confiance en 30 secondes. Gratuit. Avec de vrais avis."

### Positionnement strategique
L'annuaire est un **canal d'acquisition**, pas un produit standalone. Il sert a :
1. Generer du trafic SEO gratuit (ocean bleu : 0 concurrence sur "plombier francophone tel aviv")
2. Convertir les visiteurs en comptes Tloush (gate : inscription pour voir le numero)
3. Creer un pont vers le SaaS ("Analysez le devis que vous avez recu")
4. Renforcer le positionnement "assistant du quotidien"

---

## 2. Utilisateur cible

### Persona client (demandeur de service)
- **Olim francophone** (25-55 ans)
- Cherche un prestataire qui parle francais pour une intervention a domicile
- Reflexe actuel : poster sur Facebook, demander aux amis
- Frustration : pas de tracabilite, recommandations contradictoires, aucune verification
- Besoin : confiance, rapidite, retours verifies

### Persona prestataire (offreur de service)
- **Artisan/professionnel francophone** en Israel
- Parle francais + hebreu
- Independant (osek patur ou murshe)
- Cherche des clients francophones qualifies
- Canal actuel : groupes Facebook, bouche-a-oreille
- Besoin : visibilite, credibilite, clients sans effort de prospection

### Taille du marche
- **~100 000 francophones actifs** en Israel (~33 000 foyers)
- **~165M NIS/an** de depenses en services de maintenance
- **~3 300 nouveaux olim de France/an** (+45% en 2025)
- **0 concurrent direct** avec avis verifies en francais

---

## 3. Architecture fonctionnelle

### 3.1 Pilier 1 — Annuaire public (SEO)
- Pages publiques indexees par Google (sans login)
- Listing par categorie (plombier, electricien, peintre, etc.)
- Filtrage par ville, note, categorie
- Cards prestataires : prenom, photo, note, nb avis, zone, specialites
- **Numero de telephone masque** (gate d'inscription)

### 3.2 Pilier 2 — Gate d'inscription
- Clic "Obtenir le contact" → modale contextuelle in-page
- Inscription : Google OAuth OU email + telephone + mot de passe
- Opt-in WhatsApp suivi (case separee, non pre-cochee)
- Numero revele immediatement apres inscription
- Boutons "Appeler" + "WhatsApp" avec message pre-rempli

### 3.3 Pilier 3 — Suivi qualite (WhatsApp)
- J+2 apres la demande de contact : message WhatsApp structure
- Note de 1 a 5 via liens pre-remplis
- Formulaire d'avis court (1 ecran, sans login, via token signe)
- Relance unique a J+5 si pas de reponse
- Respect du Shabbat (pas d'envoi vendredi 14h - samedi 21h)

### 3.4 Pilier 4 — Confiance et moderation
- Badge "Reference par Tloush" (pas "verifie" — raison juridique)
- Droit de reponse public pour les prestataires
- Procedure de signalement et delisting
- Score composite : note moyenne + respect du prix + recommandation

### 3.5 Pilier 5 — Pont vers le SaaS
- Cross-promotion dans les rapports d'analyse : "Comparez avec nos prestataires"
- Upsell post-contact : "David vous a envoye un devis ? Analysez-le avec Tloush"
- Widget annuaire sur le dashboard des utilisateurs connectes
- Tracking attribution : directory_visitor → signup → paid_subscriber

---

## 4. Categories de prestataires (V1)

### Lancement (5 categories)
| Categorie | Slug | Icone | Terme hebreu |
|-----------|------|-------|-------------|
| Plombier | `plombier` | Wrench | אינסטלטור |
| Electricien | `electricien` | Zap | חשמלאי |
| Peintre | `peintre` | Paintbrush | צבעי |
| Serrurier | `serrurier` | Key | מנעולן |
| Climatisation | `climatisation` | Thermometer | מזגן |

### Phase 2 (ajout progressif)
- Demenagement, Comptable, Avocat, Assurance, Cours d'hebreu
- Renovation, Carreleur, Menuisier, Jardinier, Nettoyage

### Villes prioritaires (V1)
1. **Netanya** (plus forte concentration francophone)
2. **Ashdod**
3. **Jerusalem** (Baka, Rehavia, Ramot)

### Objectif V1 : 3-5 prestataires par categorie par ville = 45-75 prestataires

---

## 5. Monetisation

### Phase 1 — Acquisition pure (Mois 0-6)
| Element | Prix |
|---------|------|
| Annuaire pour les clients | Gratuit |
| Inscription prestataire | Gratuit |
| Suivi WhatsApp | Gratuit |

### Phase 2 — Valeur ajoutee (Mois 6-12)
| Element | Prix |
|---------|------|
| Listing premium (prestataire en tete) | 99-199 NIS/mois |
| Analyse de devis (upsell SaaS) | Inclus dans Solo/Family |
| Stats de visites pour prestataires | Gratuit |

### Projection MRR a 12 mois
| Source | MRR |
|--------|-----|
| Nouveaux abonnes SaaS via annuaire (~70 x 49 NIS) | 3 430 NIS |
| Prestataires featured listing (~25 x 149 NIS) | 3 725 NIS |
| **Total** | **~7 155 NIS** |

### Regle absolue
> L'annuaire reste TOUJOURS gratuit pour les clients. C'est le moteur d'acquisition.

---

## 6. Contraintes juridiques (P0)

### Terminologie obligatoire
- Utiliser **"Reference par Tloush"**, jamais "Verifie par Tloush"
- Raison : Consumer Protection Law 5741-1981 — le mot "verifie" cree une obligation de diligence
- Si le prestataire fait du mauvais travail, Tloush porterait une responsabilite

### Opt-in WhatsApp obligatoire
- Amendement 40 a la Loi sur les Telecommunications
- Consentement prealable, explicite, separe (case non pre-cochee)
- Chaque message inclut "Repondez STOP pour ne plus recevoir"
- Risque : **1 000 NIS d'amende par message** envoye sans opt-in

### Disclaimers obligatoires
- Sur chaque fiche : "Tloush agit comme intermediaire de mise en relation. Toute relation contractuelle est conclue directement entre vous et le prestataire."
- Sur la page d'accueil annuaire : "Les notes refletent l'experience des utilisateurs et n'engagent pas la responsabilite de Tloush."

### Documents a faire rediger par un avocat israelien
- CGU client annuaire
- Contrat d'inscription prestataire (independance, delisting, donnees personnelles)
- Politique de confidentialite mise a jour

---

## 7. KPIs et signaux d'arret

### Objectifs

| Metrique | 3 mois | 6 mois | 12 mois |
|----------|--------|--------|---------|
| Prestataires actifs | 30 | 80 | 200 |
| Visiteurs annuaire/mois | 500 | 2 000 | 8 000 |
| Inscriptions via annuaire/mois | 60 | 300 | 1 400 |
| Taux inscription (visiteur → compte) | 12% | 15% | 18% |
| Taux reponse avis WhatsApp | 40% | 45% | 50% |
| Nouveaux abonnes payants/mois | 2 | 12 | 70 |

### Kill metrics (arreter si a 3 mois)
- < 200 visiteurs/mois sur l'annuaire
- < 5% taux d'inscription
- < 20% taux de reponse WhatsApp
- 0 conversion annuaire → abonne payant

---

## 8. Hors scope V1

- Marketplace transactionnelle (paiement via Tloush)
- Commission sur les prestations
- Systeme de reservation/agenda
- Messagerie integree client-prestataire
- App mobile separee
- Verification physique des chantiers
- Plus de 3 villes et 5 categories
