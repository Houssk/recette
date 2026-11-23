# Recette : règles du projet

Application de formation (onboarding d'Inès) : suivi des anomalies de recette, mobile d'abord. **Rester simple** : ce n'est pas une mise en production.

## Pile
- Next.js App Router, TypeScript, **aucune librairie d'interface**, CSS simple dans `app/globals.css` (jetons et composants issus de `design/tokens.css`, voir DESIGN.md).
- Supabase (projet `recette`, eu-west-3, ref `mqqprlnimoymixqfaymg`) : tables `anomalies`, `captures`, `historique`, bucket privé `captures`. RLS activée partout.
- Vercel (compte Hobby) et Resend (alerte e-mail sur anomalie bloquante).

## Règles
- Français partout (interface, messages, commits).
- Aucun secret dans le dépôt ni dans le chat. Seul `.env.example` est versionné. `RESEND_API_KEY` et `ALERTE_EMAIL` vivent dans Vercel, saisies par l'humain.
- Toute modification de base passe par un fichier dans `supabase/migrations/` (horodaté), appliqué ensuite avec le connecteur Supabase, puis advisors sécurité.
- Les changements de statut passent par la fonction SQL `changer_statut` (transitions contrôlées, historique daté).
- La photo est compressée dans le navigateur (`lib/image.ts`) et déposée directement dans Storage : ne jamais la faire transiter par une route Vercel (limite de 4,5 Mo).
- L'e-mail part uniquement côté serveur (`lib/alerte.ts`). Si l'envoi échoue, l'anomalie reste enregistrée.
- Accessibilité : libellés visibles, cibles ≥ 48 px, contraste AA, gravité et statut jamais par la seule couleur.
- Avant chaque push : `npm run build` doit passer.

## Connecteurs
- Vercel : création de projet impossible par le connecteur sur ce compte (403 avec ou sans `teamId`) : le projet se crée à la main sur vercel.com/new. Lecture (déploiements, journaux) : sans `teamId`. « repo_not_found » = dépôt non autorisé dans l'app GitHub Vercel.
- Réseau de la session cloud : l'hôte `mqqprlnimoymixqfaymg.supabase.co` doit être autorisé dans l'environnement pour lancer les tests ; Node passe par le proxy avec `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.
- Supabase : la Site URL de l'authentification se règle à la main dans le tableau de bord.

## Commandes
- `npm run dev`, `npm run build`, `node tests/rls.mjs` (avec les variables de `.env.local`).
