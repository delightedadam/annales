# Repère — Annales de Terminale

Application React + TypeScript + Vite, entièrement statique. Le moteur MiniSearch utilise un index JSON compilé avant publication. Aucun serveur, compte, clé API ni service payant n’est nécessaire après déploiement.

## Démarrer

Installer Node.js 24 et pnpm 11.25.0, puis ouvrir un terminal dans ce dossier :

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrir l’adresse affichée. Pour une vérification complète :

```sh
pnpm test
pnpm check:workflows
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm build` valide les types, contrôle le catalogue avec Zod, prépare les JSON et compile `dist/`. Il ne contacte aucune source. Les deux JSON générés dans `public/` sont reconstruits depuis `data/catalogue.json`.

## Mettre le site sur GitHub Pages

Un **dépôt** est un dossier de projet sur GitHub. Le projet local est prêt, mais aucun dépôt distant ni site public n’a été créé depuis cette session.

1. Se connecter à [github.com/delightedadam](https://github.com/delightedadam), puis cliquer **+ → New repository**.
2. Nommer le dépôt **annales**, choisir **Public**, ne pas ajouter de README ou de `.gitignore`, puis **Create repository**.
3. Dans le terminal ouvert dans ce dossier :

   ```sh
   git add .
   git commit -m "Create static annales search MVP"
   git remote add origin https://github.com/delightedadam/annales.git
   git push -u origin main
   ```

   GitHub peut demander une connexion. Ne mettre aucun mot de passe ou jeton dans le code.

4. Dans le dépôt GitHub, ouvrir **Settings → Pages → Build and deployment → Source**, puis choisir **GitHub Actions**.
5. Ouvrir **Actions → Test and deploy GitHub Pages**. Si le premier lancement a échoué avant l’activation de Pages, cliquer **Re-run all jobs** ou **Run workflow**.
6. Attendre la réussite des étapes de tests, compilation, publication et contrôle de l’URL. L’adresse prévue est `https://delightedadam.github.io/annales/`. **Cette adresse n’a pas été vérifiée publiquement à ce stade.**
7. Ouvrir le lien fourni par le workflow, rechercher « Doppler », tester un corrigé, puis recharger l’URL d’une recherche partagée.

Chaque push sur `main` relance les tests et publie si tout réussit. Les pull requests sont testées mais ne sont pas déployées. Le workflow vérifie aussi l’URL publique et le chargement de son catalogue après publication.

Le nom du dépôt est lu automatiquement depuis `GITHUB_REPOSITORY` pour le `base` Vite. Les dépôts `*.github.io` utilisent `/`. Pour un domaine personnalisé, définir `PAGES_BASE=/` dans l’environnement du build et ajouter un fichier `public/CNAME`. La navigation utilise les paramètres de l’URL, sans routes nécessitant une réécriture serveur.

Référence : [guide officiel Vite pour GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages).

## Catalogue et recherche

Le catalogue compte **1 079 références réelles, regroupées en 918 résultats** : 691 fiches d’exercices ou recueils et 227 sujets complets. Les 26 pages de catalogues Labolycée et les 32 pages de navigation Vecteur Bac repérées ont été parcourues sans plafond de sélection. Les 449 fiches annoncées dans le filtre Terminale Labolycée ont toutes été examinées, ainsi que les sujets complets associés et ceux publiés séparément. Au total, 11 fiches hors cursus ont été exclues et aucune erreur de collecte ne reste. Les doublons non confirmés restent séparés : ce nombre ne garantit pas 918 énoncés tous distincts. La couverture est décrite dans `data/coverage.json` et affichée dans le site.

Les données comprennent la provenance de chaque notion, les liens sujet/corrigé, la date et le statut de vérification, le contexte d’épreuve, les relations exercice/sujet et la politique de lecteur. Les champs inconnus restent `null`. Les deux titres de source sont conservés même lorsqu’un doublon est regroupé.

Les expressions scientifiques connues sont reconnues en priorité grâce à un dictionnaire explicite. Le mode ET exige toutes les notions et tous les termes restants ; le mode OU en exige au moins un. Les notions sélectionnées sont strictes. Les fautes sont tolérées dans la recherche textuelle et signalées comme correspondances à vérifier. Aucune notion ne provient d’une supposition fondée sur un titre ou d’un modèle d’IA.

Le filtre source limite aussi les preuves utilisées. Par exemple, le titrage pH-métrique de « La lessive de cendre » est attesté par Labolycée ; la fiche Vecteur Bac ne précise que « Titrage ». Le filtre Vecteur Bac seul ne lui attribue donc pas cette sous-notion.

## Actualiser

Lire [l’audit](docs/AUDIT.md) et revoir les règles des sources avant chaque extension. La découverte suit toutes les pages du cursus Labolycée, les sujets complets par année et les menus géographique et thématique Vecteur Bac. Elle reste limitée aux deux sources autorisées.

```sh
pnpm collect:all --audit
# Une seule page de la liste :
pnpm collect --audit --only https://www.labolycee.org/exercices/la-lessive-de-cendre
pnpm test
pnpm build
```

Le collecteur vérifie robots.txt, attend au moins 1,6 seconde entre requêtes, refuse les redirections et hôtes inattendus, ne contacte pas d’API, ne télécharge aucun PDF et vérifie les liens par HEAD. Il utilise les ETag lorsqu’ils existent, conserve les données précédentes en cas d’erreur, marque les pages disparues et écrit atomiquement le catalogue. Une erreur structurelle fait échouer la commande plutôt que d’inventer des données. Le rapport de la dernière collecte est dans `data/collection-report.json` ; le cache local n’est pas publié.

Pour la collecte mensuelle, documenter une autorisation explicite par source dans `data/permissions.json` (`periodic: true`, `evidenceUrl`), puis définir **Settings → Secrets and variables → Actions → Variables → COLLECTION_ENABLED = true**. Les deux verrous sont nécessaires. La configuration livrée désactive cette collecte.

Le workflow séparé relance la découverte complète lorsque les autorisations sont documentées, puis produit un **catalogue-candidate** téléchargeable depuis Actions, à examiner avant de remplacer `data/catalogue.json` et de pousser. Cette étape de revue évite qu’une modification de structure des sources publie automatiquement des notions incorrectes. Les listes découvertes sont enregistrées dans `data/discovered-*.json`. Un cache HTML local de 24 heures permet de reprendre sans redemander les pages déjà lues. `pnpm collect --audit --only URL` reste disponible pour contrôler une fiche de la liste initiale.

## Architecture

- `src/model.ts` : modèle validé et liste d’hôtes HTTPS autorisés.
- `scripts/connectors.ts` : parseurs indépendants Labolycée et Vecteur Bac.
- `scripts/collect.ts` : collecte hors ligne, cache, erreurs et liens.
- `src/notions.ts` : vocabulaire scientifique et synonymes.
- `src/search.ts` : contrat `SearchProvider`, moteur local, filtres, tri, pagination et URL.
- `scripts/build-index.ts` : index MiniSearch précompilé.
- `src/main.tsx` : interface accessible, clair/sombre, provenance et lecteur conditionnel.
- `.github/workflows/` : tests/publication et actualisation séparée.

Pour ajouter un backend, implémenter `SearchProvider.search(Query)` avec un appel HTTP et connecter son résultat à l’interface ; les collecteurs et le modèle restent indépendants. La V1 emploie le chemin synchrone local, avec un dictionnaire précompilé pour conserver des recherches rapides sur le catalogue complet.

## Limites actuelles

- Couverture des catalogues publics repérés à la date de collecte, sans garantie sur des pages orphelines non référencées ou des publications ultérieures. Les compilations anciennes sont conservées lorsqu’elles sont classées par la source dans le cursus actuel ; leur année reste inconnue si la source ne la précise pas.
- Aucun texte intégral de PDF indexé ou republié.
- Aucun sujet n’a d’autorisation d’intégration établie : seuls les liens externes sont proposés. Le lecteur conditionnel est prêt, mais sa compatibilité avec un PDF distant autorisé devra être vérifiée avant activation. Les contrôles de page/zoom reposent sur le lecteur PDF du navigateur ; le lien externe reste disponible.
- Les 1 079 pages de métadonnées ont été consultées. Les 1 023 liens PDF sont repris des sources, sans téléchargement ; seuls les liens de la sélection initiale ont reçu un contrôle HEAD séparé. Le statut non retesté est indiqué. 56 fiches sans PDF direct proposent une action distincte « Consulter la fiche ».
- La déduplication des exercices exige titre, année, centre, session et numéro concordants. Celle des sujets complets exige référence officielle, année, centre et session concordants. Les cas incertains restent séparés.
- La publication réelle dépend de la création du dépôt et de l’activation de Pages. Voir [les validations](docs/VALIDATION.md) pour distinguer tests locaux et exécution GitHub.
