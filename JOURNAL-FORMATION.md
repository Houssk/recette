# Journal de formation : passage de référence « Recette »

Passage réalisé le 23/11/2026 par Claude (session cloud), en suivant le parcours qu'Inès fera. Pour chaque étape : ce qui a marché, ce qui a coincé (message exact), temps, qui a agi, prompt amélioré.

---

## Étape 0. Lecture du support et de la checklist

- **Marché** : connecteur Moda, lecture des pages 4 à 8 et de la checklist en une minute.
- **Coincé** : rien.
- **Temps** : 1 min (14:36 à 14:37).
- **Qui** : Claude.
- **Constat sur la checklist (page 2)** : le fichier `.claude/settings.json` proposé autorise `mcp__Supabase`, `mcp__Vercel`, `mcp__Resend`. Dans une session cloud, les outils des connecteurs portent des noms du type `mcp__683671c8-…__apply_migration` (identifiant, pas le nom du service). Ces trois règles ne correspondent donc à rien : elles sont inutiles (sans danger). Version corrigée dans SETUP.md.

## Étape 1. Créer le dépôt et le fichier d'autorisations

- **Marché** : _en attente_
- **Coincé** : une session cloud ne peut pas créer de dépôt GitHub ni écrire `.claude/settings.json` : c'est l'humain qui le fait.
- **Temps** : _en attente_
- **Qui** : Houssam (Inès en séance).

## Étape 2. Direction visuelle (sous-agent designer)

_en cours_

## Étape 3. Créer la base Supabase

- **Coincé** : premier appel `create_project` refusé par le garde-fou de Claude Code :
  `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Destructive or Unwanted Actions].`
  Cause : créer un projet peut être facturé ; le garde-fou exige un accord explicite de l'humain dans la conversation.
- **Prompt amélioré** : écrire noir sur blanc l'accord dans le prompt (voir PROMPTS-INES.md, prompt 3).
