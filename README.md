# Repère — Terminale past-paper search

[Open the website](https://delightedadam.github.io/annales/)

A static React, TypeScript and Vite app for French Terminale physics and chemistry. MiniSearch runs entirely in the browser against a prebuilt JSON index. No backend, account or API key is required. The website stays in French.

## Run locally

Use Node.js 24 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Checks and production build:

```sh
pnpm test
pnpm check:workflows
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The build validates types and catalogue data, prepares local OCR assets, generates the search index and builds `dist/`. It does not crawl the sources.

## Photo search

Import an image or choose **Prendre une photo** on a phone. Supported mobile browsers offer the rear camera; others may show a file picker. French OCR runs locally using Tesseract.js. The worker, WebAssembly engine and language model are hosted with the site and downloaded when needed. Images and recognized text are not uploaded to an analysis service.

Review the editable text and proposed concepts, then search for similar papers. Suggestions use explicit phrases and scientific clues; results are ranked by shared catalogue concepts in OR mode. Switch to AND to require every concept. This is not mathematical reasoning or visual diagram interpretation. Handwriting, formulas, blurred images and rotated pages may be misread. Paste text as a fallback. JPG, PNG, WebP and BMP are accepted, up to 20 MB; export HEIC as JPG first. Photo text is not put into shared URLs.

## GitHub Pages

The repository is [delightedadam/annales](https://github.com/delightedadam/annales). In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. Push changes to `main`; the deployment workflow runs checks, tests, the production build and browser tests before publishing. It then checks the public page and catalogue. Pull requests only run checks.

The Vite base path is derived from `GITHUB_REPOSITORY`; this project uses `/annales/`. User sites named `*.github.io` use `/`. For a custom domain, set `PAGES_BASE=/` during the build and add `public/CNAME`. Navigation uses query parameters, so no server rewrites are needed. Keep credentials out of the repository and public files.

## Catalogue and search

The October 16, 2026 crawl retained **1,079 references**, grouped into **918 results**: 691 exercise or collection entries and 227 complete papers. It examined 26 Labolycée listing pages and 32 Vecteur Bac navigation pages, including all 449 entries announced by the Labolycée curriculum filter. Eleven out-of-scope entries were excluded, with no remaining collection errors. Uncertain duplicates remain separate; 918 does not mean 918 proven distinct papers.

Search uses titles, source-provided concepts and a curated synonym dictionary. AND requires every concept and remaining word; OR requires at least one. Source filters also restrict the evidence used. Unknown metadata stays `null`. Concept provenance and verification status are available in each result.

No source PDFs or full PDF text are hosted or indexed. The 1,023 PDF links come from source pages; only the initial selection received separate HEAD checks. Another 56 entries link to their source page instead. No production PDF has embedding permission enabled. Coverage includes discovered public catalogues, not guaranteed orphan pages or future additions.

## Update the catalogue

Review [source access notes](docs/AUDIT.md) before collecting:

```sh
pnpm collect:all --audit
pnpm collect --audit --only https://www.labolycee.org/exercices/la-lessive-de-cendre
pnpm test
pnpm build
```

Full discovery follows the two sources only, respects robots.txt, spaces requests by at least 1.6 seconds per origin and uses a 24-hour local HTML cache. It does not download PDFs. Discovery lists and coverage are saved in `data/discovered-*.json` and `data/coverage.json`. The single-page collector additionally checks document links; its report is `data/collection-report.json`. Local caches are not published.

Monthly collection is disabled. To enable it, record permission for each source in `data/permissions.json` (`periodic: true` and `evidenceUrl`) and set the repository Actions variable `COLLECTION_ENABLED=true`. Both gates are required. The separate workflow produces a candidate catalogue for review, without automatically changing the live catalogue.

## Main files

- `src/search.ts`: local search, filters, ranking, pagination and the `SearchProvider` interface for a future backend.
- `src/notions.ts`: scientific vocabulary and synonyms.
- `src/PhotoSearch.tsx`, `src/photo-notions.ts`: local OCR and reviewable concept suggestions.
- `scripts/connectors.ts`, `scripts/discover.ts`, `scripts/collect-all.ts`: source parsing and collection.
- `scripts/build-index.ts`, `scripts/prepare-ocr.ts`: static build assets.
- `.github/workflows/`: deployment and separately gated collection.

See [validation notes](docs/VALIDATION.md) for checks and limitations.
