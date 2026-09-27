# V2 Mark 3 page text and spacing progress

- Repository: `/Users/halimi_hanim/Projects/Islamic-App`; origin `https://github.com/HalimiHalim/koleksi-bacaan-harian.git`.
- Baseline: clean `main`, HEAD and freshly fetched `origin/main` at `5ab2973016654c89c1a83049f7d58793f9d918d1`.
- Feature branch: `feature/v2-mark-3-page-text-and-spacing`; safely fast-forwarded into `main`.
- Supplied patch SHA-256: `596360696e06ea4bf70a6f49d17529c1a6d04ee1dbf4c032782043bb5a842684`; `git apply --check` passed and applied with `git am` as `ab9a746`.
- Prior progress files read; both earlier releases VERIFIED. Current production release is the page text and spacing fix.
- Current milestone: production integration VERIFIED.
- Files changed: 35 page JSONs, `README.md`, `index.html`, `quran/SOURCES.md`, `quran/reader.css`, `quran/reader.js`, `service-worker.js`, build and verification tools, this progress file. Extra repair: narrower word gap only at widths up to 360px, to remove one 3px overflow on page 303.
- Data tests: exact full baseline comparison across 604 pages found 35 changed tokens only (20 numeric HTML references decoded, 15 `#1969` converted to separate `۩` markers); page/line/token counts, verse keys and all other fields unchanged. All 77,433 page words and 112 bismillah entries audited for raw ASCII/entity placeholders. Verifier passed 114 surahs, 6,236 source-identical Arabic verses and Malay translations, 604 pages, 6,236 unique end markers and 15 sajdah markers. All 6,236 Malay entries matched the QuranEnc SQLite snapshot. The 15 sajdah verse keys independently match the Quranic Arabic Corpus verse-mark documentation. The original QCF4 upstream snapshot is unavailable locally; full comparison used the bundled prepatch baseline.
- Browser tests: real Chromium at 428, 390, 320 and desktop 1280 CSS px. Pages 1, 2, 303, 416, 535, 598, 602 and 604 opened; page 416 and 598 show `۩`, page 535 shows decoded Arabic; short pages are compact, all 3 surahs appear on 604, sampled lines and document have no horizontal overflow after the 320px repair. Emerald and Midnight inspected. RTL page navigation and disabled 1/604 edges, List View, Malay translation toggle, bookmark and resume checked. No app console errors.
- Cache test: same-origin V18 fixture first visited and cached old page 535, then files overlaid with V19. First online reload loaded `reader.css?v=19`, `reader.js?v=19` and corrected `pages/535.json?v=19`; reading position persisted. After stopping the server, offline reload reopened corrected page 535 with no console errors. Legacy checklist trial/delete regressions passed. JavaScript and Python syntax and `git diff --check` passed.
- Production: `main` fast-forwarded from `5ab2973` to `796b4f7` and pushed normally to the verified `HalimiHalim/koleksi-bacaan-harian` origin. `git ls-remote` confirmed the exact remote hash; Vercel Deployments showed Production Ready for `796b4f7`. Live `index.html`, service worker, reader CSS/JS, and pages 416/535/604 matched local bytes. Live Chromium at 428px opened page 535, showed corrected Arabic, no overflow and no console errors.
- Checkpoint commits: `70c48c8` baseline; `ab9a746` supplied patch; `796b4f7` narrow-screen repair and test record. This final release record is a separate documentation-only commit.
- Manual check remaining: physical iPhone Safari on pages 416, 535, 1 and 604 for font shaping and perceived spacing. The original QCF4 upstream snapshot was not available locally; every changed token was compared to the bundled prepatch baseline.
- Exact next action: commit and push this documentation-only release record, verify remote hash and Vercel Ready for that commit, then leave `main` clean.

| Milestone | Status |
| --- | --- |
| Baseline and remote | VERIFIED |
| Patch review and application | VERIFIED |
| Data and visual verification | VERIFIED |
| Cache and regression verification | VERIFIED |
| Production integration | VERIFIED |
