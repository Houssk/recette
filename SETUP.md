# Mise en place de « Recette »

Guide pas à pas, validé par le passage de référence du 23/11/2026. Compter environ 45 minutes en séance.

## 1. Avant la séance (à faire par Inès, une seule fois)

Voir la checklist de préparation, plus les compléments de JOURNAL-FORMATION.md (fin du document).

## 2. Le dépôt GitHub (à la main, 2 min)

1. github.com/new : nom `recette`, **Private**, cocher « Add a README file », Create.
2. Add file, Create new file, nom `.claude/settings.json`, contenu :

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)", "Bash(npx *)", "Bash(node *)", "Bash(git *)",
      "Bash(curl *)", "Bash(ls *)", "Bash(cat *)", "Bash(mkdir *)",
      "Bash(cp *)", "Bash(tar *)", "Bash(date *)",
      "mcp__Supabase", "mcp__Vercel", "mcp__Resend"
    ]
  }
}
```

3. Commit changes. Claude n'a pas le droit d'écrire ce fichier lui-même (refus « Undermining Oversight ») ni de créer le dépôt depuis une session cloud.

## 3. La base Supabase (Claude, 5 min)

Claude crée le projet `recette` (eu-west-3), applique les deux migrations de `supabase/migrations/`, lance les advisors sécurité et le test `tests/rls.mjs`.

- **Réseau** : la session cloud doit pouvoir joindre `<ref>.supabase.co`. Sinon : `Proxy response (403) !== 200 when HTTP Tunneling`. Claude propose d'ajouter l'hôte à l'environnement : accepter la carte.
- Pour lancer les tests depuis la session : `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node tests/rls.mjs` (avec les variables de `.env.local`).

## 4. Le projet Vercel (à la main, 3 min)

Le connecteur Vercel a refusé la création du projet (403, avec et sans `teamId`). Donc, à la main :

1. vercel.com/new, « Import » sur `recette`. Si le dépôt n'apparaît pas : « Adjust GitHub App Permissions », ajouter le dépôt.
2. Environment Variables, avant « Deploy » :

| Variable | Valeur | Type |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (Claude la donne) | Plain |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clé `sb_publishable_…` (Claude la donne, elle est publique) | Plain |
| `ALERTE_EMAIL` | adresse du compte Resend | Plain |
| `RESEND_API_KEY` | clé Resend « Sending access » | **Sensitive** |

3. Deploy. Chaque push sur `main` redéploie ensuite tout seul.

## 5. Resend (à la main, 2 min)

resend.com, API Keys, Create API Key, droit « Sending access ». Copier la clé **directement dans Vercel** (étape 4), jamais dans le chat. Sans domaine vérifié, les e-mails partent de `onboarding@resend.dev` et n'arrivent qu'à l'adresse du compte Resend.

Si la clé est ajoutée après le premier déploiement : Vercel, Deployments, « Redeploy », sinon la variable n'est pas prise en compte.

## 6. Tester

- `node tests/rls.mjs` : 16 contrôles sur les droits (clé publique).
- `BASE_URL=<url> node tests/e2e.mjs` : plan de test de la page 8 (Playwright, 390 px). En local : `npm run build && npx next start -p 3100`.
- Sur téléphone : signaler une anomalie bloquante avec une photo, vérifier la boîte de réception.

## Variables

Voir `.env.example`. Le fichier `.env.local` (jamais versionné) sert aux tests en local.
