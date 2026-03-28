# Tloush 🧾
### Analysez votre fiche de paie israélienne en français

> **Tloush** (תלוש) — le mot hébreu pour "fiche de paie".
> Un outil d'aide à la compréhension des bulletins de salaire israéliens, destiné aux francophones vivant en Israël.

---

## 🚀 Démarrage rapide

### Prérequis
- **Node.js** v18 ou supérieur
- **npm** v9 ou supérieur (inclus avec Node.js)

### Installation

```bash
npm install
npm run dev
```

Ouvrir dans le navigateur : **http://localhost:3000**

---

## 🗺️ Parcours utilisateur

```
/ (Landing page)
  └─► /analyze?demo=true  ← Mode démo (aucun fichier requis)
  └─► /analyze            ← Upload de votre vraie fiche
        ├─► Étape 1 : Upload (PDF / JPG / PNG)
        ├─► Étape 2 : Extraction + Vérification manuelle
        ├─► Étape 3 : Questionnaire contextuel
        └─► /results ← Rapport complet
  └─► /privacy            ← Politique de confidentialité
```

---

*Construit avec Next.js 14, TypeScript, Tailwind CSS, Zustand*

⚠️ **Disclaimer** : Tloush est un outil d'aide à la compréhension, pas un cabinet juridique. L'analyse produite est indicative et pédagogique.
