# Checklist de tests E2E — Tloush V3

**Objectif** : valider le flow complet signup → paywall → Stripe checkout → webhook → accès payant → annulation.

**Durée estimée** : ~15-20 minutes.

**Prérequis** :
- Accès Supabase Studio (projet tloush)
- Accès Stripe Dashboard (mode **Test** activé)
- Un navigateur en mode privé / incognito
- Carte de test Stripe : `4242 4242 4242 4242`, date future quelconque, CVC `123`, code postal `12345`

---

## Test 1 — Signup (fix du trigger)

**But** : vérifier que la création de compte ne renvoie plus "Database error saving new user".

1. Ouvre **https://tloush.com** en navigation privée
2. Clique sur **S'inscrire** (ou "Commencer gratuitement")
3. Email : `test+$(date +%s)@tloush.com` (utilise un timestamp pour un email unique)
4. Mot de passe : `TestTloush2026!`
5. Soumets le formulaire

**Vérifications :**
- [ ] Pas d'erreur "Database error saving new user"
- [ ] Redirection vers `/dashboard` (ou écran de confirmation email)
- [ ] Dans **Supabase Studio → Table Editor → `auth.users`** : ligne créée
- [ ] Dans **`public.subscriptions`** : ligne avec `user_id=<nouveau>`, `plan_id='free'`, `status='active'`, `trial_end` ≈ J+60

**Si ça échoue** :
- Va dans **Supabase Studio → SQL Editor**
- Exécute le contenu de `supabase-fix-signup-trigger.sql`
- Retente le signup

---

## Test 2 — Google OAuth

**But** : vérifier que l'auth Google marche aussi.

1. Toujours en navigation privée, clique sur **Se connecter avec Google**
2. Utilise un compte Google de test

**Vérifications :**
- [ ] Redirection vers `/auth/callback` puis `/dashboard`
- [ ] Ligne créée dans `auth.users` avec `provider='google'`
- [ ] Ligne créée dans `subscriptions` avec `plan_id='free'`

---

## Test 3 — Accès plan gratuit (paywall)

**But** : vérifier les limites du plan free.

1. Connecté avec un compte free, va sur `/scanner`
2. Upload un PDF quelconque

**Vérifications :**
- [ ] Upload accepté (5 docs/mois max pour free)
- [ ] Analyse IA fonctionne
- [ ] Dans `documents` : nouvelle ligne avec `user_id` du compte

3. Essaie d'accéder à `/inbox` (assistant IA)

**Vérifications :**
- [ ] Soit paywall affiché "Passez au plan Solo", soit accès limité (0 messages sur free)

---

## Test 4 — Checkout Stripe Solo

**But** : vérifier tout le flow de paiement.

1. Depuis la page `/pricing` (connecté), clique sur **Choisir Solo**
2. Tu arrives sur **checkout.stripe.com**

**Vérifications avant paiement :**
- [ ] Prix affiché : **49 ILS/mois** (ou 49 ₪)
- [ ] Nom du produit : "Solo"

3. Remplis le formulaire :
   - Carte : `4242 4242 4242 4242`
   - Date : `12/34`
   - CVC : `123`
   - Nom : `Test User`
   - Pays : Israël
4. Clique **S'abonner**

**Vérifications après paiement (5-10 secondes) :**
- [ ] Redirection vers `/dashboard` ou page de succès
- [ ] Dans **Stripe Dashboard → Customers** : nouveau client créé
- [ ] Dans **Stripe Dashboard → Subscriptions** : subscription `active`
- [ ] Dans **Stripe Dashboard → Webhooks → [ton endpoint] → Events** :
  - `checkout.session.completed` ✅ 200
  - `invoice.paid` ✅ 200
  - `customer.subscription.created` ou `.updated` ✅ 200
- [ ] Dans **Supabase → `subscriptions`** (pour ce user) :
  - `plan_id = 'solo'`
  - `status = 'active'`
  - `stripe_customer_id` rempli (commence par `cus_`)
  - `stripe_subscription_id` rempli (commence par `sub_`)
  - `current_period_end` ≈ J+30

---

## Test 5 — Accès plan Solo

**But** : vérifier que le plan Solo débloque bien les features.

1. Connecté avec le compte Solo, va sur :
   - `/inbox` → doit marcher (assistant IA)
   - `/expenses` → doit marcher (dépenses récurrentes)
   - `/folders` → doit marcher (dossiers)
   - `/search` → doit marcher

**Vérifications :**
- [ ] Aucun paywall affiché
- [ ] Toutes les pages chargent sans erreur

---

## Test 6 — Portal client (annulation)

**But** : vérifier que l'annulation revient au plan free.

1. Va sur `/profile` (ou équivalent) → **Gérer mon abonnement**
2. Tu arrives sur **billing.stripe.com** (portal)
3. Clique **Annuler l'abonnement**
4. Confirme (cancel at period end OU immediate)

**Vérifications :**
- [ ] Dans **Stripe Webhooks → Events** :
  - `customer.subscription.updated` ✅ 200 (si cancel at period end)
  - OU `customer.subscription.deleted` ✅ 200 (si immediate)
- [ ] Dans **Supabase → `subscriptions`** :
  - Si "at period end" : `cancel_at_period_end = true`, `status` reste `active`
  - Si "immediate" : `plan_id = 'free'`, `status = 'canceled'`, `stripe_subscription_id = null`

---

## Test 7 — Échec de paiement

**But** : vérifier que le statut passe en `past_due`.

1. Crée un nouveau compte de test
2. Va sur `/pricing` → Solo
3. Utilise la carte qui échoue : `4000 0000 0000 0341` (paiement initial OK, renouvellement KO)
4. Complète le checkout (il passe)
5. Dans **Stripe Dashboard → ton client test → Invoices**, clique sur la dernière facture → **Charge → Refund or fail**
   - OU attends le renouvellement
   - OU simule via Stripe CLI : `stripe trigger invoice.payment_failed`

**Vérifications :**
- [ ] Webhook `invoice.payment_failed` reçu ✅ 200
- [ ] `subscriptions.status = 'past_due'`

---

## Test 8 — Checkout plan Famille

Même test que #4 mais avec **Choisir Famille**.

**Vérifications :**
- [ ] Prix : **99 ILS/mois**
- [ ] Après paiement : `plan_id = 'family'` dans Supabase
- [ ] `/profile` permet d'inviter jusqu'à 5 membres

---

## Commandes SQL de diagnostic

Si un webhook échoue, exécute dans **Supabase SQL Editor** :

```sql
-- Voir l'état d'une subscription
SELECT user_id, plan_id, status, stripe_customer_id, stripe_subscription_id,
       current_period_end, cancel_at_period_end, updated_at
FROM subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@tloush.com');

-- Forcer un plan pour debug
UPDATE subscriptions
SET plan_id = 'solo', status = 'active'
WHERE user_id = '<UUID>';

-- Voir les derniers inserts sur auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

---

## Monitoring des webhooks en continu

**Stripe Dashboard → Developers → Webhooks → [endpoint tloush.com/api/stripe/webhook]**
- Onglet **Events** : liste temps réel des events envoyés
- Onglet **Attempts** : si un event échoue, tu vois les retry automatiques
- Active **"Email on failure"** dans les settings du webhook

---

## Critères de succès global

- [ ] Test 1 (signup) passe
- [ ] Test 4 (checkout Solo 49₪) passe
- [ ] Test 6 (annulation) passe

Si ces 3 passent, la prod est validée côté Stripe + Supabase. Les autres tests sont du bonus.
