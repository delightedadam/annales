# Validation — 16 octobre 2026

## Exécuté et réussi localement

- Validation TypeScript stricte.
- Validation du catalogue avec Zod et reconstruction des deux JSON statiques.
- **39 tests unitaires** : 26 scénarios de recherche sur une fixture réelle stable, 5 tests de formats effectivement rencontrés, 8 tests du catalogue complet. Ces derniers vérifient notamment l’absence de plafond de sélection, les 449 exercices annoncés dans le catalogue Labolycée, la justification de chaque exclusion, les deux sources, les années, les sujets sans PDF et la déduplication des sujets complets.
- **6 tests navigateur Chromium** : trois scénarios chacun en 1280 × 900 et 390 × 844. Recherche, tags, OU, filtres, pagination, rechargement d’URL, liens externes, mode sombre, navigation clavier, absence de débordement horizontal et erreurs JavaScript.
- Build de production Vite réussi à la racine, puis sous **`/annales/`**. Les tests navigateur ont été exécutés sur le second build ; les JSON et les fichiers JS/CSS sont bien chargés depuis ce sous-chemin.
- Contrôle visuel des captures desktop et mobile : titres et actions lisibles, pas de chevauchement ni de débordement constaté.
- **actionlint 1.7.12** : aucun diagnostic pour `deploy.yml` et `refresh.yml`.
- Contrôle complémentaire YAML/invariants : permissions Pages, dépendance au build, restriction à main, commandes de tests/build et verrou de collecte.
- La collecte étendue a consulté **1 079 fiches retenues** : 581 Labolycée et 498 Vecteur Bac. Les catalogues repérés représentent 26 pages Labolycée et 32 pages Vecteur Bac. Les 11 exclusions hors cursus sont documentées ; aucune erreur de collecte restante. Après regroupement des doublons confirmés, le moteur affiche **918 résultats** : 691 fiches d’exercices ou recueils et 227 sujets complets. Les doublons incertains restent séparés.
- Les **14 liens de sujets** et **11 liens de corrigés** de la sélection initiale ont reçu un contrôle HEAD séparé réussi. Les liens ajoutés par la collecte complète ont été relevés sur les pages sources, sans vérification HTTP individuelle des PDF ; l’interface distingue ce statut. 56 fiches sans PDF direct renvoient explicitement vers leur page source.
- Mesures locales sur le catalogue élargi : environ 4–12 ms par recherche après précompilation du dictionnaire de synonymes. Ce sont des mesures de développement, pas une garantie sur tous les appareils.

Le test du lecteur utilise uniquement une fixture navigateur explicitement autorisée pour le test, avec réponse simulée 403 afin de vérifier le repli externe. Cela ne constitue pas une preuve d’autorisation ou de compatibilité d’un document distant réel. Le catalogue de production garde `embed.allowed=false` pour toutes les références.

## Exécuté sur GitHub et vérifié publiquement

- Dépôt public créé : https://github.com/delightedadam/annales ; push sur main et source Pages réglée sur GitHub Actions.
- [Workflow initial réussi](https://github.com/delightedadam/annales/actions/runs/38939062871) pour le commit a30a9e8 : installation verrouillée, contrôles, tests unitaires, compilation de production, tests Chromium et publication. Durée totale : 1 min 6 s.
- Le workflow a vérifié l’URL publique et son catalogue JSON. Une ouverture indépendante dans Edge de https://delightedadam.github.io/annales/ a confirmé le chargement de 918 résultats. La recherche « Titrage pH-métrique et acide-base » en mode ET renvoie 68 résultats.

Le site est publié et ne dépend pas du serveur local. GitHub signale des avertissements de dépréciation des runtimes Node 20 des actions, exécutées automatiquement avec Node 24 ; ils n’ont pas empêché la réussite. La collecte périodique demeure verrouillée en attente d’autorisations documentées des sources.

## Limites de couverture des tests

Pas de test Safari/Firefox ni lecteur PDF mobile natif. La couverture clavier vérifie les parcours principaux, sans prétendre à une certification WCAG complète. Toutes les fiches des catalogues publics repérés ont été traitées ; cela ne garantit pas la découverte de pages orphelines ou de publications futures. Une source peut modifier ses liens après la date de contrôle. Le verrou de collecte périodique a été testé : sans autorisation documentée, aucune requête n’est effectuée et le catalogue est conservé. Les workflows périodiques restent désactivés.
