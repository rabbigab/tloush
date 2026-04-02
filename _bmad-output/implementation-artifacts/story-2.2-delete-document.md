---
story_id: "2.2"
epic_id: "E2"
title: "Suppression de Document"
status: in_progress
---

# Story 2.2 — Suppression de Document

**En tant qu'** utilisateur connecté,
**je veux** supprimer un document de mon inbox,
**afin de** garder mon espace organisé et de supprimer des données sensibles.

## Critères d'Acceptation

- Étant donné que je suis dans l'inbox, quand je clique sur l'icône de suppression d'un document et confirme, alors le document est supprimé de la DB et du Storage Supabase
- Étant donné que la suppression réussit, alors le document disparaît immédiatement de l'inbox sans rechargement
- Étant donné que la suppression échoue, alors un message d'erreur s'affiche et le document reste visible
- Étant donné que je ne confirme pas la suppression, alors rien ne se passe

## Tâches Techniques

1. Créer `DELETE /api/documents/[id]` route
   - Vérifier auth (user_id)
   - Récupérer le file_path du document
   - Supprimer du Storage Supabase
   - Supprimer de la table documents (cascade sur conversations + messages)
2. Ajouter bouton de suppression dans InboxClient.tsx
   - Icône Trash2 de lucide-react
   - Confirmation inline (pas de modal, pour rester simple)
   - Appel API + mise à jour du state local
