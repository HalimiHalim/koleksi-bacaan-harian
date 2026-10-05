# V3 — Centered Page Text and Separate Favourites Card

Date: 2026-10-05, Asia/Kuala_Lumpur.

## Checkpoint and resume
- Working checkout: `/Users/halimi_hanim/Projects/Islamic-App`.
- Branch: `codex/v3-centered-page-favourites`.
- Initial HEAD and fetched origin/main: `4bb4c88` (V2.6.4 closeout); runtime `6f9408a`.
- Clean checkout fast-forwarded from f178539 after fetch. Original Google Drive checkout (main 5b6ea69, modified index/service worker, untracked fonts) preserved without edits. No applicable AGENTS.md found.
- V2.6.4 ledger/report read completely; user explicitly identifies this as accepted stable. No separate V2.6.4 handover attachment supplied beyond task and repository records.
- Created before implementation. Never discard interrupted work or commit/push/deploy partial implementation. Resume by inspecting branch/HEAD/status, reading this file fully, comparing evidence/files, and continuing first incomplete milestone.
- Evidence directory outside Git: `/Users/halimi_hanim/Projects/Islamic-App-QA-V3` (isolated synthetic browser profiles only).

| Milestone | Status | Evidence |
|---|---|---|
| 0 Baseline audit | VERIFIED | Baseline screenshots/DOM/line geometry: baseline-evidence, all 27 Page cases + List/Classic and cards at 3 widths. |
| 1 Implementation | VERIFIED | 27 Page cases, unchanged List/Classic pixels, sibling card geometry/themes, existing favourite and UI Polish interactions pass. |
| 2 Validation | VERIFIED | Required matrix + existing favourites/UI Polish/checklist adapter, model/syntax/diff checks pass. |
| 3 Release | VERIFIED | V2.6.4 upgrade/offline, runtime push/hash/Production deployment, 8 live assets, production 27-case matrix and interaction/offline smoke pass. |

First incomplete milestone: none.
Changed files: index.html, quran/reader.css, service-worker.js, this ledger. Runtime commit/push/deployment: VERIFIED (3a80299). Final records closeout follows; inspect Git HEAD for its exact hash. Known issues: none proven in V3; physical iPhone/Safari unavailable.

## Audit
- `.quran-page-flow` reader.css is modern Page continuous RTL body, currently right aligned; heading/basmalah use centered `.quran-page-line`. Classic and List have separate selectors/renderers.
- `#quran-routine` contains checklist/add/remove feedback and favourites. `showArea` owns its visibility; favouritesActive and Back restore depend on this wrapper and existing IDs. Retain wrapper/state ownership and create sibling checklist/favourites cards within it.
- Existing outer `#allday-view.routine-panel` is a visual shell for all three areas. In routine context only, remove its visual shell and give inner checklist/favourites matching existing routine-panel style. Library/reader retain shell.
- Existing tools use Playwright and system Chrome, no package.json/build/lint/typecheck. Use bundled runtime packages, no added dependencies.

## Completed and remaining checks
Completed: git baseline/remote/worktree audit, source visibility and return navigation inspection.
Remaining: no implementation/release checks; final records commit/push/hash/deployment readback. Physical iPhone/Safari and user acceptance remain.

Baseline capture fixture corrected to seed authoritative recent history: legacy last position does not replace an already initialized empty recent collection. No app change was needed. Baseline Page/List/Classic and empty/populated screenshots captured before edits (immutable Git archive served independently). Existing model checks pass: checklist 19, favourites 19, recent 23, custom deletion 9 groups.

## Local evidence
- candidate-evidence/summary.json: all 27 combinations (320/390/1280, Uthmani OFF/ON, Simple, pages 1/446/604); 378 lines, max center offset 1px. Complete page DOM byte-identical to baseline; relative line positions/text and flow widths equal. RTL, 32px, 57.6px line height, markers/pairs/headings, overflow and clipping checks pass. Resize leaves every storage raw byte unchanged.
- Six full-page List/Classic screenshot buffers equal baseline byte for byte.
- Cards at all widths: semantic sibling sections, 18px gap, equal width/background/border/radius/padding/shadow, unique IDs; same wrapper visibility on routine/library/source views, storage unchanged by tab/layout operations. Inspected before/after As-Saffat 390, populated cards 390, Simple 604 at 320: no clipped marks; centered final lines evident.
- Existing favourites browser suite passes 3 widths + async error/retry; save/unsave/remove, exact-ayah, Back focus/scroll, Tunjuk lagi 25 excerpts, reload/day persistence, authoritative storage and recovery refusal covered. Existing UI Polish suite passes 3 widths, add/sort/remove/Undo/timers/error notices/recent resume.
- Original older checklist browser suite reaches obsolete /petikan/ expectation and fails: accepted V2.6.3 intentionally sets notice empty when ready (index.html). External adapter changes only this expectation; no application or checked-in test changes.
- Inline scripts, reader.js and service-worker.js syntax pass; git diff --check passes.

Checklist external adapter passes all widths plus legacy/empty/refused-write checks. Independent baseline confirms ready migration notice is empty; accepted runtime unchanged. Version bumped to asset v300 and cache uwa-bacaan-harian-v300-centered-page-favourites after milestone 2 passes.

## Release gate
- V2.6.4 → V3 real service-worker upgrade passes: all seeded localStorage raw bytes unchanged on upgrade/reload; old cache removed, only v300 cache remains; 7 cached runtime assets byte-match final files. Offline custom deletion/reload preserves Quran/recovery state; cached favourite exact-ayah opens; cached As-Saffat page 446 is centered and sibling cards remain separate offline. Evidence pwa/custom-delete-pwa.json and offline screenshots, no page errors.
- Final intended diff reviewed: only HTML card structure/labels, scoped CSS, conventional asset/cache version changes. reader.js, all storage modules, datasets, mappings, Tajweed, fonts and source-delete.js bytes unchanged. No migrations, dependencies/backend, secrets/private browser state or QA screenshots tracked.
- Fetched origin/main still baseline 4bb4c88 before release; normal commit and push authorized by task, pending. Rollback through ordinary revert commit/main/Vercel workflow to V2.6.4 runtime; no reset/force-push or user data conversion.

## Production checkpoint
- Runtime commit/pushed remote-main: `3a802990b0092ee5f4b597c67ecd81a205575602`; fetched origin/main and independent ls-remote match. GitHub Vercel status success; matching Production deployment `6852969171` success. No duplicate deployment project created.
- Production 8 live runtime assets byte-match commit; production PWA explicit update/cache/offline scenario passes (production-pwa/custom-delete-pwa.json). Local baseline upgrade is separate from production fresh-profile reload; no claim of testing existing user profiles.
- Production UI Polish interaction smoke passes all widths; production rendering matrix 320/390 verified, desktop also verified; complete 27-case matrix passes.
- All 15 card theme/width comparisons pass; inspected empty-card 390 screenshot clearly shows checklist ending after + Tambah Surah and 18px gap. No runtime changes since passing local validation other than tested version strings.

## Final closeout
- All milestones 0–3 VERIFIED; no first incomplete milestone. V3 ready for user acceptance; accepted V2.6.4 remains the stable baseline until user feedback. No next version work begun.
- Production matrix complete: 27 Page cases/378 lines; unchanged DOM/wrapping and 1px maximum center offset; six List/Classic screenshot buffers match baseline. Unique IDs, routine-only sibling cards and raw data preservation pass. Production interaction and offline smoke zero page/console errors.
- Final records commit contains only this ledger, FINAL_REPORT_V3.md and tools/v3-validation-report.json. Runtime remains 3a80299; final local HEAD/origin/main/hash/deployment readback saved outside Git as closeout.json. Clean working tree expected after normal records closeout; verify explicitly.
- Limitations: phone widths are Chrome emulation; physical iPhone/Safari not available. Actual stored user profiles were not accessed; preservation proven with isolated synthetic profiles, unchanged storage code/datasets, raw-byte layout/upgrade comparisons and existing integrity suites. No unresolved implementation issue.
