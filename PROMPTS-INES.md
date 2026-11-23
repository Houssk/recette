# Prompts à coller, dans l'ordre

Chaque prompt a été validé par le passage de référence. Les actions marquées **[Inès]** se font à la main, hors de Claude.

---

### 0. [Inès] Avant d'ouvrir Claude
Créer le dépôt `recette` (privé, avec README) et le fichier `.claude/settings.json` (voir SETUP.md, étape 2). Ouvrir Claude, onglet Code, environnement Cloud, dépôt `recette`.

### 1. Vérifier l'environnement
```
Vérifie, sans rien créer : (1) que tu peux pousser sur ce dépôt (git push --dry-run),
(2) que les connecteurs Supabase, Vercel et Resend répondent avec un appel en lecture
(Supabase : liste des organisations ; Vercel : get_auth_user ; Resend : liste des domaines),
(3) que npm fonctionne. Rends un tableau OK / KO avec le message d'erreur exact en cas de KO.
```
*Pourquoi cette version :* « répondre » est vague. On demande un appel en lecture précis par connecteur, et le message exact.

### 2. Cadrer avant de coder
```
Je veux un outil de suivi des anomalies de recette, mobile d'abord : Signaler (titre,
gravité bloquante/majeure/mineure, étapes, attendu, obtenu, photo), Suivre (liste filtrable
par statut et gravité, détail avec capture et historique), Vérifier (passer en Vérifiée ou
rouvrir avec commentaire). Statuts : Nouvelle → En cours → Corrigée → Vérifiée, rouvrir =
retour En cours. Version 1 sans connexion. C'est une app de formation : reste simple.
Ne code rien : pose-moi 5 questions maximum, puis résume écrans, données, droits et hors
périmètre en 10 lignes.
```

### 3. Direction visuelle (sous-agent designer)
```
Lance un sous-agent « designer » qui fixe la direction visuelle avant le code : palette,
typographie, composants, trois écrans téléphone 390 px en HTML statique avec un tokens.css
réutilisable, captures PNG avec Playwright (déjà installé, ne lance pas playwright install).
Accessibilité : contraste AA mesuré par script, boutons ≥ 48 px vérifiés par script,
libellés visibles, gravité et statut jamais par la seule couleur. Il écrit DESIGN.md.
Tranche toi-même les choix de goût.
```

### 4. Créer la base
```
J'autorise explicitement la création du projet Supabase « recette » dans mon organisation,
région eu-west-3 (plan gratuit, coût 0 $ attendu ; si un coût non nul s'affiche, arrête-toi).
Puis : tables anomalies (avec un numéro lisible A-001), captures et historique, RLS partout,
bucket privé « captures » (5 Mo, images seulement), une fonction SQL changer_statut qui
contrôle les transitions et écrit l'historique. Un fichier par migration dans
supabase/migrations, appliqué avec le connecteur, puis advisors sécurité.
Enfin écris et lance un test d'isolation RLS avec la clé publishable : si l'hôte Supabase
est bloqué par le réseau de la session, propose de l'autoriser dans l'environnement.
```
*Pourquoi :* sans la phrase « J'autorise explicitement… », le garde-fou de Claude refuse la création (« Destructive or Unwanted Actions »). Sans la consigne réseau, le test échoue sur `Proxy response (403)`.

### 5. Construire, puis pousser
```
Construis la version 1 en Next.js App Router, TypeScript, sans librairie d'interface, en
reprenant les classes de design/tokens.css. La photo est compressée dans le navigateur
(1600 px, JPEG) et déposée directement dans Storage, pas via une route Vercel. La création
passe par une route serveur /api/anomalies. Lance npm run build, corrige jusqu'au vert,
commit et pousse sur main. Donne-moi les deux variables publiques Supabase à saisir dans Vercel.
```

### 6. [Inès] Créer le projet Vercel et ranger les clés
Le connecteur Vercel ne peut pas créer le projet (403). Suivre SETUP.md, étapes 4 et 5 : import du dépôt, 4 variables (dont `RESEND_API_KEY` en Sensitive, créée sur resend.com), Deploy. Copier l'URL.

### 7. Brancher les e-mails
```
L'app est déployée sur <URL>. Les variables RESEND_API_KEY et ALERTE_EMAIL sont dans
Vercel. Vérifie que l'alerte e-mail sur anomalie bloquante part côté serveur uniquement et
que l'anomalie est enregistrée même si l'envoi échoue. Si tout est déjà en place, ne change
rien et dis-le.
```

### 8. Tester avec méthode
```
Voici mon plan de test (page 8 du support). Écris les tests automatisés (Playwright pour les
écrans à 390 px, script Node avec la clé publishable pour les règles RLS), exécute-les contre
<URL>, et rends un tableau réussi / échoué avec la cause de chaque échec. Puis crée une
anomalie bloquante de test et vérifie avec le connecteur Resend que l'e-mail est parti
(statut, destinataire, heure). Note tout dans TEST-RESULTS.md.
```
