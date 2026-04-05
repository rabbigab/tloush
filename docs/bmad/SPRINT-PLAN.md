# Tloush V3 — Sprint Plan

> Version: 3.0
> Date: 2026-04-04

---

## Vue d'ensemble

```
Semaine 1        Sprint 0 — LANCEMENT
Semaine 2-3      Sprint 1 — RETENTION
Semaine 4-5      Sprint 2 — PROFONDEUR
Semaine 6-7      Sprint 3 — FREQUENCE & WAOUH
```

---

## Sprint 0 — Lancement (Semaine 1)
**Objectif :** Produit vendable et desirable

### Dev (Claude)
| # | Story | Effort | Dependance |
|---|-------|--------|------------|
| 1 | 1.1 — Refaire landing page (hero, messaging, cas d'usage) | 2-3h | - |
| 2 | 1.2 — Refaire page pricing (valeur percue, quotas MAJ) | 2-3h | - |
| 3 | 1.3 — Ameliorer template resultat d'analyse | 3-4h | - |
| 4 | 1.5 — Configurer Vercel Cron pour digest hebdo | 30min | 1.4 |
| 5 | Test E2E flow complet | 1h | 1.4 |

### Toi (Config)
| # | Tache | Effort |
|---|-------|--------|
| A | Executer les 3 SQL dans Supabase | 15min |
| B | Configurer Google OAuth (redirect URLs) | 10min |
| C | Creer produits Stripe + webhook | 30min |
| D | Variables d'environnement Vercel | 15min |
| E | Video demo (HeyGen/Supademo) | 2-3h |

### Definition of Done Sprint 0
- [ ] Landing page convertit (nouveau messaging)
- [ ] Pricing affiche la valeur, pas les quotas
- [ ] Resultat d'analyse structure (resume + points + actions)
- [ ] Google OAuth fonctionne
- [ ] Stripe fonctionne (inscription payante)
- [ ] Digest hebdo programme
- [ ] Flow complet teste : inscription -> upload -> analyse -> assistant

---

## Sprint 1 — Retention (Semaine 2-3)
**Objectif :** Raison de revenir + differenciation

### Semaine 2
| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 1 | 2.1 — Colonne deadline + extraction auto | 2 | 2h | - |
| 2 | 3.2 — Prompt IA mis a jour (sortie structuree) | 3 | 2h | - |
| 3 | 3.1 — Nouveau format de sortie (blocs) | 3 | 4h | 3.2 |
| 4 | 3.3 — UI resultat repensee | 3 | 3h | 3.1 |

### Semaine 3
| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 5 | 2.2 — Emails de rappel d'echeance | 2 | 3-4h | 2.1 |
| 6 | 2.3 — Echeances dans le dashboard | 2 | 2h | 2.1 |
| 7 | 2.4 — Echeances dans le digest hebdo | 2 | 1h | 2.1 |

### Definition of Done Sprint 1
- [ ] Chaque analyse montre : resume + points detectes + actions + echeance
- [ ] Les deadlines sont extraites et stockees automatiquement
- [ ] Rappels email envoyes avant les echeances (J-7, J-2, J-0)
- [ ] Dashboard affiche les echeances a venir
- [ ] Digest hebdo inclut les echeances

---

## Sprint 2 — Profondeur (Semaine 4-5)
**Objectif :** Dossiers vivants + base scan factures

### Semaine 4
| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 1 | 4.1 — Schema dossiers (SQL) | 4 | 1h | - |
| 2 | 5.1 — Nouveaux types de documents (factures) | 5 | 1h | - |
| 3 | 4.2 — Auto-groupement intelligent | 4 | 3h | 4.1 |
| 4 | 5.2 — Extraction specialisee factures | 5 | 3h | 5.1 |
| 5 | 5.3 — Table depenses recurrentes (SQL) | 5 | 1h | - |

### Semaine 5
| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 6 | 4.3 — UI dossiers dans l'inbox | 4 | 4h | 4.1, 4.2 |
| 7 | 5.4 — Detection auto recurrence | 5 | 3h | 5.3, 5.2 |
| 8 | 5.5 — Page "Mes depenses" | 5 | 4h | 5.3 |
| 9 | 4.4 — Timeline par dossier | 4 | 3h | 4.3 |

### Definition of Done Sprint 2
- [ ] Documents groupes en dossiers automatiquement
- [ ] Vue par dossier dans l'inbox
- [ ] Timeline par dossier
- [ ] Factures/tickets scannables avec extraction montant/fournisseur
- [ ] Depenses recurrentes detectees et listees
- [ ] Page "Mes depenses" avec total mensuel

---

## Sprint 3 — Frequence & Waouh (Semaine 6-7)
**Objectif :** Usage hebdomadaire + comparaison dans le temps

### Semaine 6
| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 1 | 5.6 — Detection anomalies depenses | 5 | 2h | 5.4 |
| 2 | 5.7 — Assistant contextuel depenses | 5 | 2h | 5.3 |
| 3 | 5.8 — Depenses dans digest hebdo | 5 | 1h | 5.3 |
| 4 | 6.1 — Section echeances dashboard | 6 | 2h | 2.1 |
| 5 | 6.2 — Section actions en attente | 6 | 2h | - |

### Semaine 7
| # | Story | Epic | Effort | Dependance |
|---|-------|------|--------|------------|
| 6 | 6.3 — Widget depenses dashboard | 6 | 2h | 5.5 |
| 7 | 6.4 — Resume mensuel | 6 | 2h | - |
| 8 | 7.1 — Comparaison fiches de paie (UI) | 7 | 4h | - |
| 9 | 7.2 — Comparaison factures recurrentes | 7 | 2h | 5.4 |
| 10 | 7.3 — Graphique d'evolution | 7 | 3h | 7.1 ou 5.5 |

### Definition of Done Sprint 3
- [ ] Dashboard complet : echeances + actions + depenses + resume
- [ ] Anomalies de depenses detectees et affichees
- [ ] Assistant repond aux questions sur les depenses
- [ ] Comparaison cote a cote de documents (fiches de paie, factures)
- [ ] Graphique d'evolution dans le temps
- [ ] Digest hebdo complet (docs + echeances + depenses + anomalies)

---

## Jalons cles

| Jalon | Date cible | Critere |
|-------|-----------|---------|
| **MVP Vendable** | Fin semaine 1 | Landing + pricing + analyse amelioree + infra OK |
| **Retention Loop** | Fin semaine 3 | Deadlines + rappels + resultat enrichi |
| **Product-Market Fit** | Fin semaine 5 | Dossiers + scan factures + depenses |
| **V3 Complete** | Fin semaine 7 | Dashboard complet + comparaison + graphiques |

---

## Risques identifies

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Google OAuth non configure | Bloquant | Sprint 0, action utilisateur |
| Stripe non configure | Bloquant | Sprint 0, action utilisateur |
| Parsing de dates hebreu complexe | Moyen | Fallback sur `action_description` texte libre |
| Detection recurrence imparfaite | Faible | L'utilisateur peut corriger manuellement |
| Cout Claude API si usage eleve | Faible | Rate limits + "fair use" deja en place |
| Prompt trop long pour factures complexes | Moyen | Prompt dedie par type de document |

---

## Metriques a suivre par sprint

### Sprint 0
- Taux de clic sur CTA landing
- Taux d'inscription
- Taux d'upload premier document

### Sprint 1
- % d'analyses avec echeances detectees
- Taux d'ouverture emails de rappel
- Temps passe sur le resultat d'analyse

### Sprint 2
- Nombre de documents par utilisateur par mois (objectif : +50%)
- % d'utilisateurs qui scannent des factures
- Nombre de dossiers crees automatiquement

### Sprint 3
- Frequence de visite (objectif : 1x/semaine minimum)
- Taux d'ouverture du digest hebdo
- Utilisation de la comparaison de documents
- Conversion gratuit -> payant
