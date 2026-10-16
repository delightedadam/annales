# Audit des sources — 16 octobre 2026

## Vecteur Bac

- [Accueil](https://www.vecteurbac.fr/) : WordPress, navigation par niveau, thème et centre/année. Le menu couvre aussi d’autres cursus, à exclure.
- [Menu thématique de spécialité](https://www.vecteurbac.fr/terminale-specialite-physique-chimie-menu-thematique/) : liens vers chapitres, fiches d’exercices et liens vers sujets complets.
- [Menu géographique](https://www.vecteurbac.fr/terminale-specialite-physique-chimie-menu-geographique/) : tableaux année/centre/session/exercices.
- Chaque fiche individuelle expose titre, numéro d’exercice, référence de sujet, épreuve parente, notions et liens PDF. Les PDF proviennent de `/wp-content/uploads/`.
- `robots.txt`, consulté directement : `User-agent: *`, `Disallow:` vide.
- [Plan de site](https://www.vecteurbac.fr/wp-sitemap.xml) accessible : index XML renvoyant vers plusieurs `page-sitemap*.xml`. Les pages contiennent des liens WordPress REST/oEmbed ; aucune API ni aucun flux n’est utilisé pour la V1.
- [Règlement](https://www.vecteurbac.fr/reglement-dinscription-et-dutilisation-du-site-vecteur-bac/) : consultation gratuite des sujets/corrigés ; ne fournit pas d’autorisation explicite de republication ou d’intégration publique des PDF. Les pages premium et comptes sont hors périmètre.

## Labolycée

- [Accueil](https://www.labolycee.org/) : navigation par chapitre, cursus, centres, années, exercices et épreuves complètes.
- `/exercices/<slug>` : structure HTML de fiche, cursus explicite, centre/année/jour/numéro, badges de notions, notes pédagogiques, épreuve parente et documents séparés.
- `/sujets` : catalogue d’épreuves complètes ; la V1 exploite les sujets complets de Vecteur Bac et les relations parentes Labolycée.
- PDF sous `/fichiers/`. Le lecteur du site utilise `/static/pdfjs/`, interdit à la collecte : aucune requête de notre collecteur vers ce chemin.
- [robots.txt](https://www.labolycee.org/robots.txt), consulté directement : agents de recherche/consultation admis ; plusieurs agents d’entraînement et aspirateurs interdits. Règle générale : interdiction `/admin`, `/compte`, `/api/`, `/recherche`, `/generateur/pdf`, `/static/pdfjs/`. Notre collecteur de métadonnées respecte cette règle sous son propre nom `RepereAnnales`, sans imiter un agent autorisé.
- [Sitemap XML](https://www.labolycee.org/sitemap.xml) accessible et déclaré dans robots.txt. Aucun flux public confirmé. API non utilisée et expressément hors périmètre.
- [Mentions légales](https://www.labolycee.org/mentions-legales) : corrigés et notes sous CC BY-NC-ND ; sujets d’examens explicitement distincts de cette licence. Pas d’autorisation explicite établie pour intégrer les sujets. Aucun PDF copié, ni corrigé, ni texte d’énoncé republié.

## Décisions

Une première collecte de 14 fiches a servi à valider le moteur. Elle a ensuite été remplacée, à la demande de l’utilisateur, par la collecte de toutes les fiches des catalogues publics repérés : 1 079 références retenues, 11 fiches hors cursus exclues, zéro erreur restante. Robots.txt n’est pas une licence de réutilisation. La collecte périodique et l’intégration des PDF restent verrouillées séparément, en attente de preuve documentée. Aucun contournement de restriction, aucune extraction de PDF, aucun accès connecté.

Les titres et catégories sont relevés directement. Les notes Labolycée ne servent qu’à repérer une expression scientifique présente dans un dictionnaire contrôlé ; on ne publie pas ces notes complètes. Les notions de fiches voisines, recommandations ou navigation générale sont exclues par les sélecteurs des connecteurs.

Cas contrôlés manuellement dans la fixture initiale de 14 références (les nombres de résultats peuvent augmenter dans le catalogue élargi) :

| Recherche | Preuve source | Attendu |
|---|---|---|
| Effet Doppler | [Radar pédagogique](https://www.vecteurbac.fr/radar-pedagogique-equipe-dun-panneau-solaire/) : catégorie Doppler | Retrouvé, synonyme contrôlé |
| Titrage pH-métrique ET acide-base | [Lessive de cendre](https://www.labolycee.org/exercices/la-lessive-de-cendre) : deux badges et notes | Retrouvé une fois, deux sources conservées |
| Condensateur RC | [Lave-linge](https://www.vecteurbac.fr/etude-dun-lave-linge/) : Circuits RC | Retrouvé par synonyme |
| RC ET équations différentielles | Aucun exercice de la sélection ne documente les deux notions | Aucun résultat, sans prétendre à une absence générale |
| Deuxième loi de Newton ET champ de pesanteur | [Sécurité incendie](https://www.labolycee.org/exercices/securite-incendie) : note « 2e loi de Newton » et badge pesanteur | Retrouvé |

Une variation de l’URL de l’épreuve parente en septembre a été observée et prise en charge. Les changements non reconnus font échouer le parseur.

## Extension aux catalogues complets

- Labolycée : les 19 pages du filtre `cursus=Tale Spécialité Physique Chimie` contiennent exactement les 449 entrées annoncées. La découverte ajoute les sujets complets par année (2021 à 2026), et les épreuves parentes des exercices. 592 pages candidates ont été examinées, 581 retenues ; les 11 exclusions concernent des fiches ou épreuves d’un autre cursus. Le filtre source contient quelques erreurs de classement : le cursus de chaque fiche a donc été contrôlé.
- Vecteur Bac : parcours du menu géographique, du menu thématique et de ses 30 chapitres. 498 pages candidates distinctes, toutes traitées. Les annales anciennes classées dans ces menus de spécialité sont conservées avec leur année réelle lorsqu’elle est indiquée.
- Les sujets complets Labolycée sont désormais parsés séparément. Les sujets sans exercice associé sont également découverts par les listes annuelles.
- Les liens de catégorie vides rencontrés sur quelques fiches Vecteur Bac sont ignorés, sans inventer de notion.
- Les fiches sans PDF ne sont pas supprimées : une action « Consulter la fiche » les distingue des sujets accessibles directement.
- Les listes de découverte et le rapport de couverture sont conservés dans `data/discovered-*.json` et `data/coverage.json`. Le cache HTML local n’est pas publié. Aucune limite arbitraire au nombre de résultats ou de pages collectées n’est appliquée.
