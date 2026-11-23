# 1. Intention

> Rempli par Claude à partir de vos mots (prompt 1 de PROMPTS-INES.md). Vous relisez et validez avant de passer à la suite.

## Le problème
Pendant une recette, les anomalies sont notées dans un tableur partagé : captures perdues, doublons, statuts jamais à jour. L'équipe de développement découvre une anomalie bloquante trop tard, parfois le lendemain.

## Pour qui
- Les testeuses et testeurs de la recette, **sur leur téléphone**, souvent debout devant l'écran testé, pour signaler en moins d'une minute avec une photo.
- L'équipe de développement, sur ordinateur ou téléphone, pour suivre et faire avancer les statuts.
- Une dizaine de personnes au plus, sur un même projet. Pas de connexion en version 1 : l'adresse de l'app est partagée en interne.

## À quoi on verra que c'est réussi
1. Une anomalie complète avec photo se signale depuis un téléphone en moins d'une minute.
2. L'équipe reçoit un e-mail moins d'une minute après chaque anomalie **bloquante**.
3. Chaque anomalie a un statut à jour et un historique daté : Nouvelle, En cours, Corrigée, Vérifiée (ou rouverte).

## Hors périmètre (pour cette version)
- Connexion et rôles (version 2 : lien magique).
- Récapitulatif quotidien par e-mail, export CSV (version 2).
- Plusieurs projets, pièces jointes autres que des images, commentaires libres hors changement de statut.

## Validé par Inès le : [DATE]
