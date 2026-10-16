# Source audit — October 16, 2026

## Vecteur Bac

- [Homepage](https://www.vecteurbac.fr/): WordPress navigation by curriculum, topic, examination centre and year. Other curricula are excluded.
- [Topic menu](https://www.vecteurbac.fr/terminale-specialite-physique-chimie-menu-thematique/) and [geographic menu](https://www.vecteurbac.fr/terminale-specialite-physique-chimie-menu-geographique/): exercise and complete-paper links, chapter labels and examination context.
- Individual pages expose titles, exercise numbers, parent papers, concepts and PDF links under `/wp-content/uploads/`.
- The inspected robots.txt has an empty `Disallow` for `User-agent: *`. The [XML sitemap](https://www.vecteurbac.fr/wp-sitemap.xml) is accessible. No REST or oEmbed API is used.
- [Terms](https://www.vecteurbac.fr/reglement-dinscription-et-dutilisation-du-site-vecteur-bac/) permit free consultation but do not establish explicit permission to republish or publicly embed PDFs. Premium pages and signed-in access are out of scope.

## Labolycée

- [Homepage](https://www.labolycee.org/): chapter, curriculum, centre, year, exercise and complete-paper navigation.
- Exercise pages expose curriculum, examination context, concept badges, teaching notes, parent papers and document links. `/sujets` provides annual complete-paper lists.
- PDFs are under `/fichiers/`. The source PDF viewer uses `/static/pdfjs/`, which the collector does not request.
- [robots.txt](https://www.labolycee.org/robots.txt) allows search/consultation agents and blocks several training agents and crawlers. General exclusions include `/admin`, `/compte`, `/api/`, `/recherche`, `/generateur/pdf` and `/static/pdfjs/`. The metadata collector uses its own truthful `RepereAnnales` identity.
- The [XML sitemap](https://www.labolycee.org/sitemap.xml) is accessible. APIs are not used.
- [Legal notice](https://www.labolycee.org/mentions-legales): solutions and teaching notes use CC BY-NC-ND; exam questions are explicitly separate. Permission to embed exam papers has not been established. No PDF, solution text or full question text is republished.

## Scope and decisions

The initial 14-entry fixture validated the search engine. Full discovery subsequently retained 1,079 references, excluded 11 out-of-scope entries and finished without remaining errors. Robots.txt is not a reuse licence. Scheduled collection and PDF embedding remain separately gated pending documented permission. No restrictions are bypassed and no signed-in source access is used.

Titles and concept labels are collected directly. Teaching notes are used only to identify controlled scientific phrases; their full text is not republished. Related cards and general navigation are excluded from concept extraction.

Labolycée discovery covered the 19 curriculum-filter pages and their 449 announced entries, annual complete-paper lists for 2021–2026 and parent papers: 592 candidates examined, 581 retained. Each page's curriculum is checked because the source filter includes some misclassified entries. Vecteur Bac discovery covered its geographic menu, topic menu and 30 chapters: all 498 candidates were processed. Older resources remain when the source classifies them in this curriculum, with the year left unknown when not supplied.

Complete papers are parsed separately, including those without linked exercises. Empty category links are ignored. Entries without direct PDFs remain available through source-page links. Unconfirmed duplicates remain separate. Discovery and coverage reports are stored in `data/`; local HTML caches are excluded from publication. No arbitrary page or result cap is used.

## Search examples checked in the original fixture

| French query | Source evidence | Expected behaviour |
|---|---|---|
| Effet Doppler | [Teaching radar](https://www.vecteurbac.fr/radar-pedagogique-equipe-dun-panneau-solaire/), Doppler category | Controlled synonym match |
| Titrage pH-métrique ET acide-base | [Wood-ash detergent](https://www.labolycee.org/exercices/la-lessive-de-cendre), both labels and notes | One grouped result retaining both sources |
| Condensateur RC | [Washing machine](https://www.vecteurbac.fr/etude-dun-lave-linge/), Circuits RC | Synonym match |
| RC ET équations différentielles | No fixture entry documents both | No fixture result; no claim about the full catalogue |
| Deuxième loi de Newton ET champ de pesanteur | [Fire safety](https://www.labolycee.org/exercices/securite-incendie), Newton note and gravity badge | Match |

A September parent-paper URL variation is handled explicitly. Unrecognized structural changes fail parsing instead of inventing metadata.
