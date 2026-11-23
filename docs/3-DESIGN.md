# 3. Design

> Écrit par le sous-agent designer à partir de 2-SPEC.md (prompt 3). Claude le respecte pour chaque écran.

## Intention visuelle
Sobre et net, dans l'esprit des consoles Vercel et Supabase : fond quasi noir, peu d'éléments, une seule couleur d'accent. Lisible debout, au téléphone, pendant une recette.

## Couleurs
| Rôle | Couleur | Usage |
|---|---|---|
| Principale | `#ededed` (texte `#0a0a0a`) | bouton principal, filtre actif, onglet actif |
| Fond | `#0a0a0a`, surfaces `#111111` | page, champs, cartes |
| Bordures | `#262626`, champs `#333333` | séparations, contours |
| Texte | `#ededed` (16,9:1), secondaire `#a1a1a1` (7,7:1), discret `#8f8f8f` (6,1:1) | contenu, aides, dates |
| Succès | `#3ecf8e` (9,9:1) | seul accent : « Corrigée », « Vérifiée », compteur À vérifier |
| Alerte | `#f5a524` (9,7:1) | gravité Majeure, statut En cours |
| Erreur | `#ff6369` (6,8:1) | gravité Bloquante, messages d'erreur |

## Typographie
- Geist (paquet `geist`, auto-hébergé), Geist Mono pour les numéros A-001 et les heures.
- Titre d'écran 28 px, graisse 600, interlettrage -0,03 em ; titre de section 20 px ; texte 17 px ; aides et badges 13 à 15 px ; interlignage 1,5.

## Espacements et formes
- Marges latérales 16 à 20 px, pas de 4 px (4, 8, 12, 16, 24, 32).
- Arrondis : badges 6 px, champs et boutons 10 px, cartes 12 px, filtres en pilule.
- Pas d'ombre : la profondeur vient des bordures fines.

## Composants
- **Bouton principal** : fond `#ededed`, texte noir, 48 à 56 px de haut. **Secondaire / Rouvrir** : transparent, bordure `#333333`. **Vérifiée** : fond vert, texte noir.
- **Champ** : libellé au-dessus, aide en gris, fond `#111111`, bordure `#333333`, message d'erreur rouge relié au champ.
- **Gravité** : trois boutons côte à côte, forme + mot (▲ Bloquante, ◆ Majeure, ▼ Mineure) ; le choisi est clair sur fond noir.
- **Carte d'anomalie** : numéro en mono, titre, deux badges, auteur et date.
- **Badges** : gravité = forme + mot sur fond teinté ; statut = pastille (anneau, demi-disque, disque, ✓) + mot. Jamais la couleur seule.
- **Messages** : succès sur fond vert teinté, erreur sur fond rouge teinté, icône ronde, titre en gras.
- **Barre basse** : Signaler, Suivre, À vérifier (avec compteur vert).

## États à prévoir
- **Signaler** : erreur (résumé en haut + messages par champ), photo en préparation, envoi en cours (bouton désactivé), succès (message sur la liste).
- **Suivre** : vide (« Aucune anomalie » + bouton Signaler), filtres sans résultat, erreur (« Liste indisponible »).
- **Détail** : introuvable (page dédiée), capture indisponible, erreur de transition, succès du changement de statut.

## Règles mobile et accessibilité
- Écran de référence : 390 px de large.
- Boutons d'au moins 48 px de haut, libellés visibles au-dessus des champs.
- Contraste du texte : niveau AA minimum.

## Maquettes validées
- Claude Design : https://claude.ai/artifact/GXcxCSDVsrBZVnNxfMMLTQ (Signaler, Suivre, Détail et vérification). Validées par Houssam le 23/11/2026 ; à valider par Inès le : [DATE]
