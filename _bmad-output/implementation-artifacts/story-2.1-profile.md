---
story_id: "2.1"
epic_id: "E2"
title: "Page Profil Utilisateur"
status: in_progress
---

# Story 2.1 — Page Profil Utilisateur

**En tant qu'** utilisateur connecté,
**je veux** accéder à ma page de profil,
**afin de** voir et gérer mes informations et mon compte.

## Critères d'Acceptation

- Étant donné que je suis connecté, quand j'accède à `/profile`, alors je vois mon email et un bouton de déconnexion
- Étant donné que je clique sur "Supprimer mon compte", quand je confirme, alors mon compte et toutes mes données sont supprimés
- Étant donné que le compte est supprimé, alors je suis redirigé vers la page d'accueil

## Tâches Techniques

1. Créer `src/app/profile/page.tsx` (Server Component)
2. Créer `src/app/profile/ProfileClient.tsx` (Client Component)
3. Créer `DELETE /api/account/delete` route
4. Ajouter le lien vers /profile dans l'header de l'inbox
