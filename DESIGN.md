# Recette — direction visuelle

Référence : maquettes `design/signaler.html`, `design/suivre.html`, `design/detail.html`, feuille partagée `design/tokens.css` (à copier telle quelle dans `app/globals.css`), captures 390 px dans `design/captures/`.

## Principes
1. Lisible debout, en plein soleil : corps 17 px, contrastes ≥ 7:1 sur le texte courant, bords de champ marqués (2 px).
2. Un pouce suffit : toute cible ≥ 48 px, action principale en bas de l'écran, pleine largeur, 56 px.
3. Jamais la couleur seule : gravité = texte + forme (▲ ◆ ▼) + angle vif ; statut = texte + pastille (anneau, demi, plein, ✓) + pilule.
4. Une action principale par écran, en bleu Doxeva ; le vert est réservé à « Vérifiée ».
5. Zéro dépendance : police système, icônes SVG inline ou caractères, CSS simple à variables.

## Police
**Pile système** (`system-ui, -apple-system, "Segoe UI", Roboto…`), aucune police Google. Raisons : rendu immédiat même en 4G faible sur un site de recette, pas de saut de mise en page, chiffres et accents optimisés par l'OS, une requête externe en moins (et une dépendance en moins pour Next.js). Monospace système pour les identifiants (`A-021`).

| Jeton | Taille | Usage |
|---|---|---|
| `--fs-xs` | 14 px | méta, horodatage, onglets, badge gravité (MAJUSCULES gras) |
| `--fs-sm` | 15 px | aides, badges, chips, erreurs |
| `--fs-base` | 17 px | corps, champs, titres de carte (600) |
| `--fs-lg` | 20 px | titres de section, bouton principal |
| `--fs-xl` | 24 px | titre d'écran |
| `--fs-2xl` | 28 px | titre du détail |

Interlignage 1,5 (texte) / 1,25 (titres). Graisses 400, 600, 700.

## Palette et contrastes (mesurés)
Calculés avec `node design/scripts/contrast.js` (formule WCAG 2.x). Le vert Doxeva `#29a57b` ne passe pas en texte (3,11:1) : il est assombri en `#1d7a5a`.

| Jeton | Couleur | Fond | Ratio | Seuil | Résultat |
|---|---|---|---|---|---|
| `--ink` | #0b0b0c | surface #ffffff | 19.67:1 | 4.5:1 | OK |
| `--ink` | #0b0b0c | bg #f5f6fd | 18.25:1 | 4.5:1 | OK |
| `--ink-2 (texte secondaire)` | #4a5072 | surface #ffffff | 7.83:1 | 4.5:1 | OK |
| `--ink-2 (texte secondaire)` | #4a5072 | bg #f5f6fd | 7.27:1 | 4.5:1 | OK |
| `--navy (titres)` | #1a1f4a | bg #f5f6fd | 14.55:1 | 4.5:1 | OK |
| `--primary (lien/texte)` | #4353df | surface #ffffff | 5.93:1 | 4.5:1 | OK |
| `--primary (lien/texte)` | #4353df | bg #f5f6fd | 5.50:1 | 4.5:1 | OK |
| `--on-primary` | #ffffff | primary #4353df | 5.93:1 | 4.5:1 | OK |
| `--on-primary (survol)` | #ffffff | primary-strong #3341c4 | 7.80:1 | 4.5:1 | OK |
| `--primary-ink (texte sur tint)` | #2d3aa8 | primary-tint #eef0fd | 8.11:1 | 4.5:1 | OK |
| `--border-strong (bord champ)` | #767c9e | surface #ffffff | 4.08:1 | 3:1 | OK |
| `--focus (anneau)` | #4353df | surface #ffffff | 5.93:1 | 3:1 | OK |
| `--success (texte)` | #1d7a5a | surface #ffffff | 5.27:1 | 4.5:1 | OK |
| `--success-ink` | #145c43 | success-bg #e3f5ee | 7.03:1 | 4.5:1 | OK |
| `--danger (texte erreur)` | #b42318 | surface #ffffff | 6.57:1 | 4.5:1 | OK |
| `--danger-ink` | #8f1c13 | danger-bg #fdecea | 7.84:1 | 4.5:1 | OK |
| `--on-danger` | #ffffff | danger #b42318 | 6.57:1 | 4.5:1 | OK |
| `--grave-bloquante` | #ffffff | bloquante (plein) #b42318 | 6.57:1 | 4.5:1 | OK |
| `--grave-majeure-ink` | #7a3d00 | majeure-bg #fdebd3 | 7.21:1 | 4.5:1 | OK |
| `--grave-majeure-border` | #b35a00 | surface #ffffff | 4.80:1 | 3:1 | OK |
| `--grave-mineure-ink` | #3d4466 | mineure-bg #eceef5 | 8.17:1 | 4.5:1 | OK |
| `--statut-nouvelle-ink` | #2d3aa8 | nouvelle-bg #eef0fd | 8.11:1 | 4.5:1 | OK |
| `--statut-encours-ink` | #7a3d00 | encours-bg #fdebd3 | 7.21:1 | 4.5:1 | OK |
| `--statut-corrigee-ink` | #145c43 | corrigee-bg #e3f5ee | 7.03:1 | 4.5:1 | OK |
| `--statut-verifiee (plein)` | #ffffff | success #1d7a5a | 5.27:1 | 4.5:1 | OK |
| `--nav actif` | #4353df | surface #ffffff | 5.93:1 | 4.5:1 | OK |
| `--nav inactif` | #4a5072 | surface #ffffff | 7.83:1 | 4.5:1 | OK |
| `Doxeva vert #29a57b (référence, non retenu en texte)` | #29a57b | surface #ffffff | 3.11:1 | 4.5:1 | ÉCHEC |

TOUS LES JETONS RETENUS CONFORMES : true

## Espacements, rayons, dimensions
- Échelle base 4 : `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 24 · `--sp-6` 32 · `--sp-7` 48. Gouttière latérale 16 px, 24 px entre champs, 32 px entre sections.
- Rayons : `--r-sm` 4 (badge gravité, vignettes), `--r-md` 10 (boutons, champs, alertes), `--r-lg` 14 (cartes), `--r-pill` (statut, filtres).
- `--tap` 48 px (minimum partout), `--tap-lg` 56 px (bouton principal), `--nav-h` 64 px, `--maxw` 560 px.
- Focus : `outline: 3px solid --focus; outline-offset: 2px` sur tout `:focus-visible` (blanc dans la barre de titre).

## Composants (classes réutilisables telles quelles)
- **Boutons** `.btn` + `.btn-primary` (bleu plein) · `.btn-secondary` (contour bleu 2 px) · `.btn-success` (vert plein, « Vérifiée ») · `.btn-danger` (contour rouge, « Rouvrir », « Retirer ») · `.btn-block` · `.btn-lg` (56 px) · `.btn-row` (2 colonnes). Désactivé = `aria-disabled="true"`, fond gris, jamais d'opacité.
- **Champ** `.field` > `.field-label` (au-dessus, toujours visible, `*` rouge + phrase d'aide en tête de formulaire) > `.field-hint` > `.input` / `.textarea` / `.select` > `.field-error`. En erreur : `aria-invalid="true"` + `aria-describedby="<id-aide> <id-erreur>"`, bord rouge, message avec pastille « ! ».
- **Gravité (saisie)** `fieldset.segmented` + `legend` ; 3 `.segmented-option.is-bloquante|is-majeure|is-mineure` = radio natif invisible + `label` de 64 px (forme + texte). Choisi : bord 3 px navy, fond teinté, mention « ✓ choisi ».
- **Photo** `.photo-input` : `input type=file accept="image/*" capture="environment"` masqué, `label.photo-drop` pointillé 96 px « Prendre une photo » ; après choix `.photo-preview` (vignette, nom, poids, bouton Retirer).
- **Badges** `.badge.badge-grave.badge-grave-bloquante|majeure|mineure` (angle 4 px, MAJUSCULES ; bloquante = rouge plein, majeure = orange clair bord orange, mineure = gris) avec `.shape` ▲ ◆ ▼. `.badge.badge-statut.badge-statut-nouvelle|en-cours|corrigee|verifiee` (pilule) avec `.shape.s-nouvelle` (anneau), `.s-encours` (demi-disque), `.s-corrigee` (disque), ✓ pour Vérifiée. Formes dessinées en CSS : indépendantes de la police. Les formes sont `aria-hidden`, le texte porte le sens.
- **Carte** `ul.card-list > li > a.card` (+ `.is-bloquante` = liseré gauche rouge 6 px) : `.card-id` (mono), `.card-title` (2 lignes max), `.badges`, `.meta` (auteur · date), chevron ›. Toute la carte est le lien.
- **Filtres** `.filters > fieldset.filter-group > legend + .chips > button.chip[aria-pressed]` ; actif = navy plein + ✓. Rangée défilable horizontalement, compteur `.count`. Sous les filtres, `.result-count` en `role="status"`.
- **Barre basse** `nav.tabbar[aria-label] > a.tab` ×3 : **Signaler** · **Suivre** · **À vérifier** (liste filtrée sur Corrigée, compteur rouge `.tab-count` avec texte masqué « en attente »). Onglet courant `aria-current="page"` : bleu, gras, réglette 4 px en haut. Le détail est une sous-page : barre de titre avec `.topbar-back` « ‹ Liste » et l'identifiant.
- **Messages** `.alert.alert-success` (`role="status"`) / `.alert.alert-error` (`role="alert"`, `tabindex="-1"`, reçoit le focus, liens `.alert-link` 48 px vers chaque champ fautif).
- **État vide** `.empty` (pictogramme, titre, phrase, bouton secondaire de sortie).
- **Chargement** liste : `.skeleton-card` ×2-3 dans un conteneur `aria-busy="true"` + texte masqué « Chargement… » ; action : bouton `aria-disabled` + `.spinner` + « Envoi en cours… ». Animations coupées sous `prefers-reduced-motion`.
- **Détail** `.detail-head`, `.capture` (figure cliquable → plein écran), `.dl.panel` (étapes en `ol.steps`), `ol.timeline` (pastille colorée + `<time datetime>` + forme de statut en texte + `.comment`), `.verify` (bloc encadré bleu).

## Règles par écran
**Signaler** — Ordre : titre, gravité, étapes, attendu, obtenu, photo, Envoyer. Pas de gravité présélectionnée en vrai (la maquette montre l'état « choisi »). Validation à l'envoi seulement : résumé d'erreurs en tête qui prend le focus + message sous chaque champ ; saisie conservée. Envoi : bouton en état chargement, puis redirection vers Suivre avec l'alerte succès « Anomalie A-0xx envoyée ».

**Suivre** — Tri : plus récentes d'abord. Filtres Statut (Tous par défaut) et Gravité (multi-sélection, « Toutes » remet à zéro), reflétés dans l'URL (`?statut=…&gravite=…`). Compteur de résultats annoncé. Aucun résultat → `.empty` avec « Réinitialiser les filtres ». Bloquantes repérables par liseré + badge plein.

**Détail / Vérifier** — En-tête : titre, badges, auteur et date. Le bloc **Vérifier** vient juste sous l'en-tête et n'apparaît que si statut = Corrigée : commentaire (facultatif pour Vérifiée, obligatoire pour Rouvrir → erreur liée au champ), boutons « ↺ Rouvrir » (gauche, contour rouge) et « ✓ Vérifiée » (droite, vert plein). Rouvrir ramène à **En cours** ; chaque transition ajoute une entrée datée à l'historique (date longue + heure, auteur, commentaire). Puis capture, description, historique (plus récent en haut).

## Contrôles effectués
- Contraste : 27 paires mesurées, toutes conformes (tableau ci-dessus).
- Cibles tactiles : `node design/scripts/capture.js` mesure tous les éléments cliquables des 3 maquettes à 390 px (libellé pour les radios/fichier masqués) : 42 éléments, 0 sous 48 px (min 48 px), aucun débordement horizontal.

## Jetons CSS (à coller dans `globals.css`)
Les composants complets sont dans `design/tokens.css`.

```css
:root {
  /* Couleurs de base (ratios mesurés : voir DESIGN.md) */
  --bg: #f5f6fd;              /* fond d'application */
  --surface: #ffffff;         /* cartes, champs, barre basse */
  --ink: #0b0b0c;             /* texte principal 19.7:1 sur surface */
  --ink-2: #4a5072;           /* texte secondaire 7.8:1 sur surface */
  --navy: #1a1f4a;            /* titres, en-tête */
  --border: #d5d8ea;          /* séparateurs décoratifs uniquement */
  --border-strong: #767c9e;   /* bord des champs et contrôles 4.1:1 */

  --primary: #4353df;         /* action principale, liens, focus 5.9:1 */
  --primary-strong: #3341c4;  /* survol / appui */
  --primary-tint: #eef0fd;    /* fond sélection */
  --primary-ink: #2d3aa8;     /* texte sur primary-tint 8.1:1 */
  --on-primary: #ffffff;

  --success: #1d7a5a;         /* vert Doxeva assombri (le #29a57b fait 3.1:1) */
  --success-bg: #e3f5ee;
  --success-ink: #145c43;
  --danger: #b42318;
  --danger-bg: #fdecea;
  --danger-ink: #8f1c13;
  --warning: #b35a00;
  --warning-bg: #fdebd3;
  --warning-ink: #7a3d00;
  --neutral-bg: #eceef5;
  --neutral-ink: #3d4466;

  --focus: #4353df;

  /* Gravité */
  --grave-bloquante-bg: var(--danger);
  --grave-bloquante-ink: #ffffff;
  --grave-majeure-bg: var(--warning-bg);
  --grave-majeure-ink: var(--warning-ink);
  --grave-majeure-border: var(--warning);
  --grave-mineure-bg: var(--neutral-bg);
  --grave-mineure-ink: var(--neutral-ink);

  /* Statut */
  --statut-nouvelle-bg: var(--primary-tint);
  --statut-nouvelle-ink: var(--primary-ink);
  --statut-encours-bg: var(--warning-bg);
  --statut-encours-ink: var(--warning-ink);
  --statut-corrigee-bg: var(--success-bg);
  --statut-corrigee-ink: var(--success-ink);
  --statut-verifiee-bg: var(--success);
  --statut-verifiee-ink: #ffffff;

  /* Typographie : pile système, aucune police téléchargée */
  --font: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --fs-xs: 0.875rem;   /* 14 px — méta, horodatage */
  --fs-sm: 0.9375rem;  /* 15 px — aide, badges */
  --fs-base: 1.0625rem;/* 17 px — corps, champs */
  --fs-lg: 1.25rem;    /* 20 px — titres de section */
  --fs-xl: 1.5rem;     /* 24 px — titre d'écran */
  --fs-2xl: 1.75rem;   /* 28 px — titre du détail */
  --lh: 1.5;
  --lh-tight: 1.25;
  --fw-regular: 400;
  --fw-semibold: 600;
  --fw-bold: 700;

  /* Espacements (base 4) */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --sp-7: 48px;
  --gutter: 16px;

  /* Rayons */
  --r-sm: 4px;    /* badge gravité (angle vif = gravité) */
  --r-md: 10px;   /* boutons, champs */
  --r-lg: 14px;   /* cartes */
  --r-pill: 999px;/* badge statut, filtres */

  /* Dimensions */
  --tap: 48px;        /* hauteur minimale de toute cible */
  --tap-lg: 56px;     /* bouton principal */
  --nav-h: 64px;
  --maxw: 560px;

  --shadow-1: 0 1px 2px rgba(26, 31, 74, 0.08), 0 1px 1px rgba(26, 31, 74, 0.04);
  --shadow-nav: 0 -1px 0 var(--border), 0 -4px 16px rgba(26, 31, 74, 0.06);
}
```
