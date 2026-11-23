# 2. Spécification

> Écrite par Claude à partir de 1-INTENTION.md (prompt 2). Aucun code tant qu'elle n'est pas validée.

## Écrans

**Signaler** (`/signaler`) : un formulaire d'une colonne pour décrire l'anomalie et prendre une photo avec l'appareil du téléphone. Après l'envoi, on arrive sur la liste avec un message de confirmation, qui dit aussi si l'équipe a été prévenue par e-mail.

**Suivre** (`/suivre`) : la liste des anomalies, de la plus récente à la plus ancienne, avec un numéro lisible (A-001), le titre, la gravité, le statut, l'auteur et la date. Filtres par statut (un à la fois) et par gravité (plusieurs possibles). L'onglet « À vérifier » ouvre la liste filtrée sur « Corrigée », avec un compteur.

**Détail** (`/anomalies/<id>`) : tout le contenu de l'anomalie, la capture (toucher pour l'agrandir), l'historique daté, et l'action possible selon le statut : « Passer en cours », « Marquer corrigée », puis le bloc **Vérifier** (« Vérifiée » ou « Rouvrir ») quand l'anomalie est corrigée, et « Rouvrir » quand elle est vérifiée.

## Champs
| Écran | Champ | Type | Obligatoire | Règle |
|---|---|---|---|---|
| Signaler | Votre nom | texte | oui | 1 à 100 caractères ; mémorisé sur le téléphone pour la fois suivante |
| Signaler | Titre | texte | oui | 3 à 200 caractères |
| Signaler | Gravité | choix | oui | Bloquante, Majeure ou Mineure |
| Signaler | Étapes pour reproduire | texte long | oui | 5 000 caractères max ; une étape par ligne |
| Signaler | Résultat attendu | texte long | oui | 2 000 caractères max |
| Signaler | Résultat obtenu | texte long | oui | 2 000 caractères max |
| Signaler | Capture | photo | non | image seulement ; réduite à 1 600 px et compressée dans le téléphone ; refusée si elle dépasse encore 4 Mo |
| Détail | Votre nom | texte | oui | pour signer le changement de statut |
| Détail | Commentaire | texte long | selon le cas | obligatoire pour « Vérifiée » et « Rouvrir » ; 2 000 caractères max |

## Règles métier
- **Statuts** : Nouvelle → En cours → Corrigée → Vérifiée. « Rouvrir » (depuis Corrigée ou Vérifiée) ramène à En cours. Toute autre transition est refusée par la base.
- **Historique** : la création et chaque changement de statut ajoutent une ligne datée : ancien statut, nouveau statut, commentaire, qui.
- **Droits (version 1)** : toute personne qui a l'adresse peut signaler, lire et changer un statut. Personne ne peut modifier le contenu d'une anomalie ni la supprimer depuis l'app.
- **E-mail** : à chaque anomalie **bloquante**, un e-mail part vers `ALERTE_EMAIL` via Resend, depuis le serveur uniquement. Si l'envoi échoue ou si la clé manque, l'anomalie est quand même enregistrée et l'erreur est notée dans les journaux Vercel.
- **Photo** : déposée directement dans Supabase Storage depuis le téléphone (jamais via le serveur Vercel, limité à 4,5 Mo).

## Données (Supabase)
- `anomalies` : id, numero (A-001…), titre, gravite, etapes, attendu, obtenu, statut, auteur, cree_le, maj_le.
- `captures` : id, anomalie_id, chemin du fichier, cree_le.
- `historique` : id, anomalie_id, ancien, nouveau, commentaire, auteur, cree_le.
- Bucket privé `captures` : 5 Mo max, images JPEG, PNG ou WebP. Affichage par lien signé valable 1 heure.
- RLS activée sur les trois tables ; changement de statut par la fonction `changer_statut`.

## Critères d'acceptation
1. Étant donné le formulaire Signaler vide, quand j'appuie sur « Envoyer », alors un résumé liste les champs à corriger, chaque champ en erreur a son message, et rien n'est enregistré.
2. Étant donné un formulaire complet avec une photo, quand j'envoie, alors j'arrive sur la liste avec « Anomalie A-xxx envoyée », l'anomalie est en tête avec le statut Nouvelle, et sa photo s'affiche dans le détail.
3. Étant donné une photo de plus de 4 Mo, quand je la choisis, alors elle est réduite et compressée avant l'envoi (taille affichée) ; si c'est impossible, un message clair la refuse.
4. Étant donné une anomalie bloquante, quand je l'envoie, alors l'adresse `ALERTE_EMAIL` reçoit un e-mail en moins d'une minute, avec le titre et un lien vers l'anomalie.
5. Étant donné que la clé Resend est absente ou invalide, quand j'envoie une anomalie bloquante, alors elle est enregistrée quand même et le message le précise.
6. Étant donné une anomalie Corrigée, quand j'appuie sur « Rouvrir » sans commentaire, alors un message demande un commentaire et le statut ne change pas.
7. Étant donné une anomalie Corrigée, quand je la passe en « Vérifiée » avec un commentaire, alors le statut devient Vérifiée et l'historique montre la ligne datée avec mon nom et mon commentaire.
8. Étant donné une anomalie Nouvelle, quand on essaie de la passer directement en Vérifiée (par l'app ou l'API), alors c'est refusé.
9. Étant donné la liste, quand je filtre « Vérifiée » + « Bloquante », alors seules ces anomalies apparaissent et le résumé l'indique.
10. Étant donné un visiteur avec la clé publique, quand il tente de modifier un titre, de supprimer une anomalie ou une capture, ou d'ouvrir une capture par une adresse publique, alors c'est refusé.
11. Étant donné un téléphone de 390 px, sur chaque écran, alors tout est lisible, sans défilement horizontal, et chaque bouton ou lien fait au moins 48 px de haut.

## Questions ouvertes
- Supposé : une seule adresse d'alerte (`ALERTE_EMAIL`, plusieurs adresses possibles séparées par des virgules). Sans domaine vérifié chez Resend, seule l'adresse du compte Resend reçoit les e-mails.
- Supposé : n'importe qui peut changer un statut en version 1 (pas de rôle « développeur » avant la connexion).
- Supposé : une seule photo par anomalie depuis le formulaire (la base en accepte jusqu'à 3).

## Validée par Inès le : [DATE]
