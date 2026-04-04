# Tloush V3 — Analyse des couts et viabilite

> Version: 3.0
> Date: 2026-04-04

---

## 1. Couts par composant

### 1.1 Supabase (Database + Storage + Auth)

**Plan Pro : $25/mois**
- Database : 8 GB inclus
- Storage : 100 GB inclus
- Auth : 100,000 MAU inclus
- Bandwidth : 250 GB inclus

**Estimation stockage par utilisateur :**
| Type document | Taille moyenne | Frequence |
|--------------|---------------|-----------|
| PDF (fiche de paie, contrat) | 200-500 KB | 2-5/mois |
| Image (ticket, facture) | 500 KB - 2 MB | 5-15/mois |
| Moyenne ponderee | ~700 KB | ~15/mois (avec factures) |

**Stockage par plan par an :**
| Plan | Docs/mois | Stockage/mois | Stockage/an |
|------|-----------|---------------|-------------|
| Gratuit (5 docs) | 5 | 3.5 MB | 42 MB |
| Solo (50 docs) | 50 | 35 MB | 420 MB |
| Famille (150 docs) | 150 | 105 MB | 1.26 GB |

**Capacite avec 100 GB inclus :**
- ~79 utilisateurs Famille a plein regime pendant 1 an
- ~238 utilisateurs Solo a plein regime pendant 1 an
- ~2,380 utilisateurs Gratuit pendant 1 an

**Quand upgrader :**
- Au-dela de ~200 utilisateurs actifs payants : passer a Supabase Team ($599/mois) ou ajouter du stockage ($0.021/GB)
- Strategie : supprimer les fichiers source apres analyse (garder uniquement les metadonnees + resultats) pour reduire le stockage de 90%

### 1.2 Claude API (Anthropic)

**Tarifs Claude Sonnet 4.5 :**
- Input : $3/million tokens
- Output : $15/million tokens

**Cout par operation :**
| Operation | Tokens input | Tokens output | Cout estime |
|-----------|-------------|---------------|-------------|
| Analyse document simple | ~2,000 | ~1,000 | ~$0.02 |
| Analyse facture (extraction) | ~2,500 | ~800 | ~$0.02 |
| Analyse contrat (detaillee) | ~5,000 | ~2,000 | ~$0.045 |
| Message assistant (court) | ~1,500 | ~500 | ~$0.01 |
| Message assistant (avec contexte doc) | ~3,000 | ~800 | ~$0.02 |

**Cout par plan par mois (usage realiste, pas max) :**
| Plan | Docs analyses | Messages | Cout IA total |
|------|--------------|----------|---------------|
| Gratuit | 3 | 10 | ~$0.16 |
| Solo | 25 (realiste) | 50 | ~$1.00 |
| Famille | 60 (realiste) | 100 | ~$2.20 |

### 1.3 Stripe

- 1.4% + 0.25 EUR par transaction (EU cards)
- 2.9% + 0.25 EUR pour cartes non-EU (peu probable en Israel)
- Pour Israel : ~2.9% + 1.10 ILS

**Commission par plan :**
| Plan | Prix | Commission Stripe | Net |
|------|------|------------------|-----|
| Solo 39 ILS | 39 ILS (~$10.50) | ~2.23 ILS | ~36.77 ILS |
| Famille 89 ILS | 89 ILS (~$24) | ~3.68 ILS | ~85.32 ILS |

### 1.4 Resend (Email)

- Plan gratuit : 100 emails/jour, 3000/mois
- Plan Pro ($20/mois) : 50,000 emails/mois

**Estimation :**
- Digest hebdo : 1 email/utilisateur/semaine = 4/mois
- Rappels : ~2/utilisateur/mois (en moyenne)
- Alertes urgentes : ~1/utilisateur/mois

→ ~7 emails/utilisateur/mois
→ Plan gratuit suffit jusqu'a ~430 utilisateurs actifs
→ Plan Pro necessaire apres

### 1.5 Vercel (Hosting)

- Plan Pro : $20/mois
- Serverless functions incluses (suffisant pour le trafic initial)
- Bandwidth : 1 TB inclus

### 1.6 Autres couts fixes

| Service | Cout/mois | Note |
|---------|-----------|------|
| PostHog (analytics) | $0 | Plan gratuit suffisant |
| Sentry (monitoring) | $0 | Plan gratuit suffisant |
| Upstash Redis (rate limit) | $0 | Plan gratuit suffisant |
| Domaine tloush.com | ~$1/mois | Annuel |

---

## 2. Cout total par utilisateur par mois

### Infrastructure fixe
| Service | Cout/mois |
|---------|-----------|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Resend (gratuit -> $20 a 430+ users) | $0-20 |
| **Total fixe** | **$45-65/mois** |

### Cout variable par utilisateur

| Plan | Cout IA | Cout stockage | Total variable |
|------|---------|---------------|----------------|
| Gratuit | $0.16 | ~$0.00 | ~$0.16/mois |
| Solo | $1.00 | ~$0.01 | ~$1.01/mois |
| Famille | $2.20 | ~$0.02 | ~$2.22/mois |

---

## 3. Analyse de rentabilite

### Par utilisateur payant

| Plan | Revenu net (apres Stripe) | Cout variable | Marge brute | % marge |
|------|--------------------------|---------------|-------------|---------|
| Solo | ~$9.90 | ~$1.01 | **$8.89** | **90%** |
| Famille | ~$23.00 | ~$2.22 | **$20.78** | **90%** |

### Point d'equilibre (couts fixes couverts)

Avec $45/mois de couts fixes :
- **5 abonnes Solo** = $44.45 de marge → quasi equilibre
- **3 abonnes Solo + 1 Famille** = $47.45 → equilibre
- **2 abonnes Famille** = $41.56 → quasi equilibre

**→ Des 5 abonnes payants, Tloush est rentable.**

### Scenarios de croissance

| Mois | Gratuits | Solo | Famille | Revenu/mois | Couts/mois | Profit |
|------|----------|------|---------|-------------|------------|--------|
| M1 | 50 | 5 | 1 | 284 ILS | ~$65 | +$12 |
| M3 | 200 | 20 | 5 | 1,225 ILS | ~$95 | +$236 |
| M6 | 500 | 50 | 15 | 3,285 ILS | ~$175 | +$712 |
| M12 | 1,000 | 100 | 40 | 7,460 ILS | ~$350 | +$1,660 |

---

## 4. Strategie d'optimisation des couts

### Court terme
1. **Supprimer les fichiers source apres analyse** : garder uniquement les metadonnees et resultats dans la DB, supprimer le PDF/image du storage apres 30 jours → reduit stockage de 90%
2. **Cache des prompts systeme** : utiliser le prompt caching Claude pour reduire les couts input de 50-90%
3. **Limiter la taille des messages assistant** : max_tokens plus bas pour les reponses courtes

### Moyen terme
4. **Modele hybride** : utiliser Haiku pour les analyses simples (tickets de caisse), Sonnet pour les complexes (contrats)
5. **Batch processing** : agreger les digests en un seul appel API au lieu d'un par utilisateur
6. **CDN pour les exports** : cacher les exports PDF generes

### Long terme
7. **Negocier les tarifs API** au-dela de 1000 utilisateurs
8. **Partenariats** (telecom, assurances) → revenus additionnels sans cout IA
9. **Plan annuel** avec reduction → tresorerie amelioree

---

## 5. Quotas revises — justification

### Pourquoi augmenter les quotas

Avec l'ajout du scan de factures/tickets de caisse :
- Un utilisateur type va scanner ~10-15 factures/tickets PAR MOIS en plus de ses 2-3 documents administratifs
- Le plan Solo a 30 docs/mois serait trop juste
- Le plan Famille a 100 docs/mois (5 personnes) serait insuffisant

### Nouveaux quotas

| Plan | Avant | Apres | Justification |
|------|-------|-------|---------------|
| Gratuit | 3 docs | 5 docs | Permet de tester 2-3 factures + 1-2 docs admin |
| Solo | 30 docs | 50 docs | ~3 docs admin + ~12 factures + marge |
| Famille | 100 docs | 150 docs | 5 personnes x ~30 docs |
| Messages gratuit | 0 | 15 | Permet de decouvrir l'assistant |
| Messages Solo | 200 | illimite (fair use) | Ne pas compter les messages |
| Messages Famille | 500 | illimite (fair use) | Ne pas compter les messages |

### Impact financier de l'augmentation

Le cout marginal par document est de ~$0.02.
- Solo : 20 docs supplementaires = +$0.40/mois → marge reste a 86%
- Famille : 50 docs supplementaires = +$1.00/mois → marge reste a 86%

**→ L'augmentation des quotas n'impacte pas significativement la rentabilite.**

### "Fair use" pour les messages

Au lieu de compter les messages, definir un fair use :
- Soft limit a 500 messages/mois (Solo) et 1000 messages/mois (Famille)
- Pas affiche a l'utilisateur
- Si depasse : ralentir les reponses, pas bloquer
- En realite, un utilisateur moyen envoie ~30-50 messages/mois

---

## 6. Risques financiers

| Risque | Probabilite | Impact | Mitigation |
|--------|------------|--------|------------|
| Utilisateur abuse (upload massif) | Faible | Moyen | Rate limits + quotas durs en backend |
| Claude API augmente les prix | Faible | Eleve | Modele hybride Haiku/Sonnet |
| Trop d'utilisateurs gratuits, peu de payants | Moyen | Eleve | Ameliorer la conversion + limiter le gratuit |
| Stockage explose | Moyen | Moyen | Politique de retention + suppression fichiers source |
| Stripe augmente les frais | Faible | Faible | Marges suffisantes |

---

## 7. Conclusion

**Le modele economique est sain :**
- Marges de ~90% par utilisateur payant
- Couts fixes faibles (~$45-65/mois)
- Point d'equilibre a seulement 5 abonnes
- Les augmentations de quotas pour les factures ne changent pas la donne
- Le passage a "messages illimites (fair use)" est viable car l'usage reel est bien en dessous des limites

**Recommandation :** Lancer avec les quotas revises et la presentation "valeur percue". Monitorer le ratio gratuit/payant et ajuster si necessaire apres M3.
