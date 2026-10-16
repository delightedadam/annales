# Validation

## Initial publication — October 16, 2026

The [initial GitHub workflow](https://github.com/delightedadam/annales/actions/runs/38939062871) passed installation, checks, 39 unit tests, production compilation, six Chromium browser tests and deployment in 1 min 6 s. The public page and catalogue were checked by the workflow and independently opened in Edge. The site displayed 918 results; the French query "Titrage pH-métrique et acide-base" returned 68 results in AND mode.

Local validation included strict TypeScript, Zod catalogue validation, builds at `/` and `/annales/`, desktop/mobile layouts, actionlint 1.7.12 and workflow invariants. All 1,079 retained metadata pages were fetched. Separate HEAD checks covered 14 subject links and 11 solution links from the initial selection; newly collected PDF links were not individually rechecked. The interface distinguishes this status.

## Photo search — October 17, 2026

Local validation passed **43 unit tests and 10 Chromium browser tests**. A generated French exercise image was read by the real local OCR engine on desktop and mobile viewports. The tests checked concept suggestions, similar-result search, editable text, invalid file handling, camera capture configuration, no external analysis requests, and no horizontal overflow. The production build uses `/annales/` and serves OCR assets locally.

The camera attribute is tested, but physical camera capture on an actual phone has not been verified. Browser behaviour varies. OCR recognizes printed text; it does not solve questions or understand diagrams. Concept suggestions are explicitly marked for review. Handwriting and mathematical notation may be misread.

## Limits

No Safari/Firefox or native mobile PDF viewer tests. Keyboard tests cover main paths, not full WCAG certification. Coverage is limited to discovered public catalogues as of the crawl date. Links may change later. Uncertain duplicates remain separate.

The embedded-reader test uses an authorized test fixture and a simulated 403 response; it does not establish permission or compatibility for any real remote PDF. All production entries keep `embed.allowed=false`.

Scheduled collection remains disabled pending documented source permissions. The site requires no local server. GitHub reported action-runtime deprecation warnings during initial publication, without preventing success.
