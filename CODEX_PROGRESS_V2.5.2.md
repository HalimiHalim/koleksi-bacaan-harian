# V2.5.2 — Classic mobile adaptive font fit

Date: 2026-10-03 Asia/Kuala_Lumpur

## Final current status (supersedes historical checkpoints below)

| Milestone | Status |
|---|---|
| 0 Baseline audit | VERIFIED |
| 1 Width/height root cause | VERIFIED |
| 2 Adaptive largest-safe fitter | VERIFIED |
| 3 Page 7/12 visual targets | VERIFIED |
| 4 Tajweed/order/marker regression | VERIFIED |
| 5 All 604 mobile pages OFF/ON | VERIFIED |
| 6 Font/spare distributions and flagged reviews | VERIFIED |
| 7 Representative visuals | VERIFIED |
| 8 Desktop Classic regression | VERIFIED |
| 9 Modern Page regression | VERIFIED |
| 10 Persistence/navigation/resize/font timing | VERIFIED |
| 11 PWA/cache upgrade/offline | VERIFIED |
| 12 Final local quality gate | VERIFIED |
| 13 Main push/Vercel/production smoke | VERIFIED |

Implementation commit: bf28b0a7173b6b61835e6e975b1b27f70f34234e, pushed to main and deployed. Final documentation closeout records these verified results; resolve its own hash with git HEAD/origin/main. Patch working tree clean after closeout, original user checkouts untouched. Physical iPhone/Safari was not available; phone-width Chrome/DPR3/font-delay/resize validation is documented honestly. Short viewports unable to fit at 11px scroll safely without clipping. No V2.6 or new feature work.

- Baseline HEAD and freshly fetched origin/main: 9c0ae320ee639a778fc4fe80d0233e80c0e72e1b.
- Branch: codex/v252-classic-mobile, reused attached managed worktree /Users/halimi_hanim/.codex/worktrees/v251-desktop-fix/Islamic App.
- Baseline worktree clean; older user checkouts preserved.
- Current fitter: begins at 28px on every invocation; decrements all ordinary QCF lines in 0.5px steps to 11px until every nowrap flex line scrollWidth ≤ clientWidth +1. Heading/basmalah starts min(24,size+2), separately shrinks. No vertical limit, no previous-font reuse. Font fit runs immediately via rAF, fonts.ready, and unguarded root ResizeObserver.
- Current min/max: 11/28px.
- Diagnosed conservative behavior: IN PROGRESS; pages 7/12 baseline measurements running.
- Proposed algorithm: PENDING diagnosis, bounded largest safe fit against actual inner frame width/height, stable font metrics, resize guard.
- Page 7 result: PENDING.
- Page 12 result: PENDING.
- Full 604-page sweep/distributions: PENDING.
- iPhone-width results (320/390): IN PROGRESS baseline.
- Desktop / modern Page regression: PENDING.
- Evidence: /Users/halimi_hanim/Projects/Islamic-App-QA-V2.5.2.
- Supplied physical iPhone screenshot files: absent; textual descriptions only.
- Milestone 0 baseline audit: IN PROGRESS. Milestones 1–13: PENDING.
- Commit/push/deploy: PENDING; no runtime code modified before diagnosis. Do not release incomplete work.

## Root cause — VERIFIED
- Page 7 / 320: 14.5px, 452.453px summed content, 602px inner frame, 24.842% spare. Maximum horizontal-safe size at .25px precision is 14.75px; at 28px widest QCF line 549px versus 288px available.
- Page 7 / 390: 17.5px, 540.344px summed content, 602px inner frame, 10.242% spare. Maximum horizontal-safe 17.75px; at 28px widest line 560px versus 358px.
- Page 12 / 320: 17px, 525.578px content, 602px inner frame, 12.695% spare; exact horizontal maximum 17px.
- Page 12 / 390: 20.5px, 628px content/inner frame, 0% spare. Auto-height frame grows beyond its 602px minimum inner target; no vertical fitting constraint.
- No stale font reuse: every invocation resets 28px and searches downward. Spare height cannot overcome fixed QCF nowrap line widths. Binary search without reflow can improve only .25px on page 7.
- Early font timing and unguarded root observer are secondary robustness concerns, not the proved reason page 7 is smaller.
- Asked user whether mobile Classic word reflow is allowed to meet the significant enlargement target, or whether exact QCF lines should be preserved with limited enlargement. This is a scope clarification due to demonstrated width constraint, not an approval policy. Dependent implementation waits for the answer.
- Baseline 604-page width/height sweep IN PROGRESS while waiting. No runtime changes.

## Authorized implementation — IN PROGRESS
- User explicitly selected “Allow mobile Classic reflow (Recommended)”. Mobile Classic now allows wrapping within original QCF groups; no text/order/structural node changes.
- Mobile only: actual visible UI chrome measured (header, controls, margins/padding and visible sibling feedback), then frame inner area derived excluding its border/padding. All structural rows and folio included.
- Bounded integer-quarter-pixel binary search 11–28px, 3% inner-height reserve. Structural font independently width-capped at historical 13–24px bounds, then min(cap,body+2).
- Very short viewport fallback expands frame at 11px if even the minimum cannot fit, retaining all content and permitting screen scroll rather than clipping. Portrait full-page fit and short viewport behavior require validation.
- Fits wait for required Arabic font load and document.fonts.ready. RAF coalescing and request/width/height/DPR signature guard avoid redundant observer cycles. Resize and visualViewport resize refit.
- Desktop historical fitter retained unchanged apart from function name; desktop CSS untouched. Modern Page/List/renderers/annotations untouched.
- Page 7/12 after measurements and full sweep PENDING. No commit/push/deploy.

## Section-flow prototype — IN PROGRESS validation
- Wrapping within each separate QCF group remained conservative (page 7: 15.75/18px at 320/390). User-authorized section-level reflow now lets adjacent original reading groups share visual rows. Surah headings/basmalah remain separate, original QCF line elements/tokens/annotation identities remain unchanged beneath section containers.
- Section containers are display:contents on desktop, leaving historical QCF lines/fitter/geometry intact. On mobile they are wrapping flex flows; QCF line wrappers become display:contents. DOM token order and Arabic text are unchanged.
- Initial section results at 844px viewport: page 7 17.75/20px at 320/390, 3.918%/3.766% unused inner height; page 12 19/21.5px, 6.162%/3.054% unused. Measured chrome 144px, frame 700px, inner 678px. Full sweep pending.
- Asset/cache v252 / uwa-bacaan-harian-v252-classic-mobile. Upgrade/offline pending.

## Quality checkpoint
- First mobile full sweep VERIFIED: 2,416 renders, zero text/marker mismatch, frame glyph/marker escapes, horizontal/vertical overflow or browser errors; representative exhaustive largest-font checks passed.
- Additional exhaustive checks on every >8%-spare case passed. Sparse pages 1/2 reach historical 28px cap; other flagged pages encounter a new wrapped row at the next quarter-pixel. Largest safe size validated independently.
- Visual review found a standalone end marker on page 12. Added inline-flex mobile pairs of preceding word + optional sajdah sign + end marker. Wrappers are display:contents on desktop with original child flex properties retained. Original QCF identities, Unicode tokens and markers remain exact.
- Final paired-renderer 604-page mobile sweep, desktop sweep and geometry/pixel comparisons IN PROGRESS; reruns justified by marker wrapping change.
- Data verifiers VERIFIED: Quran 114/6236/604, Tajweed 59,253/804/273 unchanged, both scripts/112 introductory basmalahs/exact Simple.
- Modern Page full sweep VERIFIED: 5,436 renders across 320/390/1280 Uthmani OFF/ON and Simple; no errors/text mismatch/overflow.
- Prior desktop full sweep and 60 geometry/visual cases VERIFIED; final pair-wrapper regression IN PROGRESS.
- Font-delay/DPR3, resize, navigation/reload/reopen, idle guard and upgrade/offline had passed before marker pairing; final checks pending. Short 390×320 viewport safely expanded frame at 11px, requiring screen scroll but no frame clipping.
- Commit/push/deploy PENDING.

## Final local quality gate — VERIFIED
- Final mobile paired renderer: all 604 pages × 320/390 × OFF/ON = 2,416 renders. Exact QCF Unicode/annotations/markers/waqf/structural order, zero frame horizontal/vertical overflow, glyph/marker escapes, document overflow or console errors at 844px portrait height. Every end marker remains with its preceding word; 15 sajdah signs included in pairs.
- Independent exhaustive larger-candidate trials passed on nine representative pages and every >8%-spare case. 204 unique width/page flagged compositions reviewed across nine contact sheets; no clipping/cramped layout found. Most flagged content leaves 8–9.5% because the next .25px adds a wrapped row. Only one uncapped page per width exceeds 10%: 134 at 320 (10.70%), 564 at 390 (14.13%), both limited by structural/whole-word/pair row transitions. Pages 1/2 reach the historical 28px ceiling; larger spare areas intentionally remain.
- Final page 7: 14.5→17.75px at 320, 17.5→19.75px at 390; spare 24.842→3.918%, 10.242→4.946%.
- Final page 12: 17→18.75px at 320, 20.5→21.25px at 390; spare 12.695→4.125%, 0→4.125%. Old 390 frame auto-expanded; new measured 700px frame / 678px inner fits actual visible UI.
- Font distributions (both states): 320 min16.25/p10 17.25/median18.25/p90 19.25/max28; 390 min17.75/p10 18.75/median20/p90 21.5/max28. Two pages at max per run, zero ≤12px. All 604 per-page records saved in evidence mobile-{width}-{state}.json.
- Desktop final sweep VERIFIED: 3,624 renders at 1024/1280/1440 × OFF/ON, 28px retained, exact text/spans/markers, zero errors/overflow. Desktop historical fitter body byte-identical after function rename.
- Final geometry/pixel regression VERIFIED: 60 cases, nine representatives, desktop Classic 1024/1280/1440 and Page 320/390/1280, ON/OFF and desktop forced colours. Original token nodes/styles/rectangles and reading pixels match baseline; only new contents wrappers added. Modern Page, Simple and Tajweed helper bodies unchanged.
- Modern Page full 5,436-render suite and all Quran/Tajweed/script verifiers VERIFIED.
- Final resize/fonts/navigation VERIFIED: multiple widths/heights, mobile↔desktop and short landscape, next/previous/jump/reload/new-tab reopen, delayed Arabic font load and DPR3. No stale font; zero style writes while idle or reader hidden.
- Final upgrade/offline VERIFIED against latest assets: V2.5.1→v252, old cache removed, exact cached JS/CSS, offline fit sizes match online ON/OFF, cached List/Page/Classic/Simple, settings/bookmarks and new-tab Classic.
- JS syntax/inline syntax and git diff --check VERIFIED. No data/font/source/script/palette mutations.
- Milestones 0–12 VERIFIED. Milestone 13 PENDING: inspect final diff, commit/push/deploy/production smoke. No implementation gate remains.

## Production closeout — VERIFIED
- Implementation bf28b0a7173b6b61835e6e975b1b27f70f34234e pushed through existing main workflow; HEAD/origin/main equal before documentation closeout.
- GitHub Vercel commit status success / Deployment has completed; Production deployment 6828857337 status success. URL https://koleksi-bacaan-harian.vercel.app/.
- Classic pages 7/12 × 320/390 × OFF/ON: eight exact-local font/frame/content/spare matches, no overflow, paired markers and correct palette. Desktop Classic 1024/1280/1440 and modern Page 320/390/1280 retain baseline geometry/reading pixels; 18 regression/forced-colour comparisons passed.
- Production settings/scripts/persistence passed at 320/390/1280; Classic↔Simple fallback/restoration, List, disabled Simple Classic and invalid-state normalization preserved; zero console/page errors.
- Production offline passed with fitted fonts matching online ON/OFF and exact cached JS/CSS; cached List/Page/Classic/Simple, bookmarks/settings and offline new-tab Classic reopening. Only cache uwa-bacaan-harian-v252-classic-mobile.
- Nine production assets/datasets byte-equal to local. All implementation/production quality gates complete; final report and JSON include full metrics and limits. Documentation-only closeout next; runtime unchanged since production verification.
