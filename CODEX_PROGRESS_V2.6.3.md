# V2.6.3 — Petikan Kegemaran
Date: 2026-10-04 Asia/Kuala_Lumpur.

## Current status
- User explicitly accepted V2.6.2 stable. Runtime806ab62618ce93a509f9188a152ba6eaffdcc53a; actual clean HEAD and fetched origin/main fb770e74362b0b699bf2d439d22d02b60a1267c2.
- Baseline/rollback fb770e74362b0b699bf2d439d22d02b60a1267c2; branch codex/v263-favourite-excerpts; reused attached worktree /Users/halimi_hanim/.codex/worktrees/v261-independent-quran/Islamic App. Original checkouts untouched.
- No applicable repository AGENTS.md; static PWA, no npm/build/typecheck requirement. Preserve interrupted work; never reset/discard/force-push or commit unverified implementation.

| Milestone | Status | Evidence |
|---|---|---|
|0 Bookmark/data audit|VERIFIED|Baseline/storage/destinations/data/cache/navigation audit.|
|1 Authoritative collection|VERIFIED|19 model cases; persistence/readback/recovery/backup preservation.|
|2 Card|VERIFIED|Exact supported-script content; progressive25, loading/error/offline; screenshots.|
|3 Synchronization/navigation|VERIFIED|Three widths, reader/card/cross-tab sync, exact ayah/Back/history, async guards.|
|4 Validation|VERIFIED|Models/invariants, accepted suites,78 exact reader comparisons, PWA/performance/syntax.|
|5 Release|VERIFIED|Release249bcf8 remote/deployment success; production suites/assets/SW verified.|

First incomplete milestone: none. All milestones0–5 VERIFIED. Implementation/release HEAD249bcf80ed7c0851b095b5dfeaddbbfc721293bd matches remote main; successful Production deployment6838050280. Documentation-only closeout follows; resolve exact final HEAD with git rev-parse HEAD. No confirmed issue in scope or required implementation/production check outstanding. Historical audit checkpoints below preserved. Before resuming read full ledger, inspect actual branch/HEAD/status and evidence, preserve changes, resume first incomplete milestone and repeat only missing/affected checks.

## Audited baseline and decisions
- Milestone0 VERIFIED: actual HEAD/origin/main match fb770e74362b0b699bf2d439d22d02b60a1267c2; clean starting worktree, V2.6.2 records read. No old saved-verse destination exists. List Simpan toggles state.bookmarks then saves uwa-quran-reader-v1; baseline regex-only load, append order, no persistence confirmation. Generic reader save previously rewrote all fields and could drop invalid evidence; Simpan also fell through to updateLast, which must stop for membership-only actions.
- Single authoritative source remains uwa-quran-reader-v1.bookmarks, canonical "surah:ayah" strings in accepted oldest-first append order; display reversed (newest first). Legacy order is reverse stored array; duplicates retain last occurrence, valid leading-zero identities canonicalized. No schema migration or second collection. Valid unique canonical arrays need no cleanup/write.
- Catalogue validation ignores invalid references in display, retains raw evidence untouched on read and ordinary reader saves. First explicit membership mutation that needs cleanup backs up original bookmark field verbatim to uwa-quran-reader-v1-bookmarks-backup-v263, readbacks it, retains backup. Whole malformed root/read refusal blocks writes; valid references alongside invalid preserved. Transaction reads fresh reader object, preserves unrelated/unknown fields, verifies persistence; refused writes retain membership and show retry message, no false Disimpan success. Other reader saves merge latest persisted raw bookmarks.
- No new Tajweed coloring: accepted List is plain text even with global Tajweed on. Excerpts use exact supported-script source verse and same List text classes, full stored verse including first-ayah basmalah, existing Malay meaning only. Page/Classic/Tajweed/fitting bodies untouched.
- Lazy visible card directly below checklist,10 items at a time and Tunjuk lagi without collection cap; group visible requests by surah and reuse small bounded caches. References/open/remove remain when content unavailable; errors retry; request generation/script/visibility guards stale results.
- Open exact ayah through existing openSurah(...,'list',explicit position) and intent-gated history; header-safe anchor and Back returns routine/focus/scroll. Save/remove do not call updateLast. Recent module/checklist/data untouched.
- Milestones1–3 IN PROGRESS, syntax passes; required model/browser/PWA/invariant/regression/performance checks pending. Runtime files index.html, quran/reader.js, quran/reader.css, service-worker.js, new quran/favourites.js. Acceptance records updated. First incomplete milestone1. No commit/push/deploy.

## Collection/UI/navigation verification checkpoint
- Model17 cases PASS: legacy reverse append order/no writes, bounds/invalids/canonical duplicates, backup-before-cleanup/idempotence, reader fields/unknown properties and other storage preserved, latest collection merge, no cap286, read/write/silent/backup refusal and retry, malformed root/field evidence.
- Browser suites PASS 320/390/1280: exact Uthmani/Simple and existing meaning, legacy records/order, save/unsave/remove/re-save, exact ayah255/header-safe List/Back focus-scroll, no history from membership/rendering, refusal/retry, preferences/Tajweed retained, day/reload,25 progressive/grouped cached requests, invalid mixed backup. Slow-load removal/navigation and failure/retry pass. Additional edge cases running.
- Accepted checklist browser and recent-history suites PASS three widths, model checklist19/recent 23 and Quran/script/Tajweed validators pass. Protected renderer/fitter source block/data/fonts/checklist/recent unchanged.
- Pixel regression found an empty new bookmark status paragraph added10px before reader. Removed empty-state spacing so accepted Page/Classic placement remains exact;78 reading comparisons rerunning. Required final screenshot QA/PWA/performance pending before gate.
- PWA V2.6.2→V2.6.3 PASS: all synthetic Quran keys unchanged by upgrade/render, bookmarks/checklist/history/settings/backups intact, both scripts cached offline, exact-ayah open/newoffline tab, uncached keeps reference/remove and failed open produces no history; new cache only. Production remains PENDING.
- Milestones1–3 provisionally validated; full final affected checks after last layout/navigation safeguards required. First incomplete milestone4. No commit/push/deploy.

## Final local validation and quality gate
- Milestones0–4 VERIFIED.19 model cases include rollback after readback refusal and explicit recovery-uncertainty notice if restoration cannot be verified. Latest affected storage-refusal/edge checks pass; fallback save retains even null malformed evidence.
- Three-width favourites suite and edge cases PASS: Uthmani/Simple exact source plus meaning;19 model cases; keyboard Enter/Tab/remove/focus, missing meaning omitted, first/last1:1/114:6/2:286 header-safe at320/390/1280, cross-tab freshness, rapid script change while28 still loading, remove refusal/retry, no async stale content. All relevant page/console errors zero (expected synthetic503/offline network failures excluded).
- Accepted checklist browser/recent browser three widths PASS, model checklist19/recent 23, Quran/script/Tajweed invariants PASS.78 exact baseline/candidate text/geometry/font/reading pixels PASS after removing empty status spacing. Source block/renderers/fitting, authoritative data/mapping/fonts and checklist/recent modules byte-identical.
- PWA old→new/cache/offline PASS; evidence outside repo in /Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.3. Empty/populated320/390/desktop, one390, loading/error390, representative reading and offline screenshots inspected. Desktop Chrome/phone viewport emulation; no physical iPhone/Safari claim.
- Five-run local sample baseline median 151.7ms/candidate 145.5ms; decoded startup resource bytes 394957→409941 (+14984 excluding HTML), zero full Quran startup requests.25 same-surah progressive items use one content request; rendering writes0, save/unsave1 each, membership history writes0. Small sample, not universal performance promise.
- All inline/module/reader/SW/verifier syntax and git diff --check pass. Static PWA: npm/build/typecheck inapplicable. Task-generated Python cache removed. No private browser state/screenshots/secrets tracked; fixtures synthetic. Final intended diff review and staged check next. Fresh origin/main remainsfb770e74362b0b699bf2d439d22d02b60a1267c2; no newer remote work.
- Runtime5 files (index.html, reader.js/CSS, service-worker.js, new favourites.js); five new verifiers; V2.6.3 ledger/report/JSON; three V2.6.2 acceptance records. Rollback via new revert commit/main workflow, never reset/force-push; bookmarks schema still compatible oldest-first references, backup retained. Commit/push/production PENDING; milestone5 IN PROGRESS.

## Final PWA rerun checkpoint
- Earlier complete upgrade/offline pass recorded. Final console-instrumented rerun timed out on an offline reload waiting for load. No release yet; investigating/repeating isolated PWA check. First incomplete milestone4 for this final affected check, then5 release. Latest performance updated to151.7/145.5ms,14984byte increase.

## Final gate — VERIFIED
- Isolated final PWA rerun PASS with relevant console monitoring: complete old→new/preserved keys/offline/exact-ayah/uncached cases. Prior load timeout did not reproduce.19 model cases, favourites/edges/accepted suites,78 reader comparisons/invariants/performance/syntax all required local checks pass.
-16 intended files reviewed; secrets patterns/private-browser artifact audit and staged diff check PASS. No incomplete implementation. First incomplete milestone5: commit/push/deploy/production. Working tree intentionally staged; commit/push PENDING.

## Implementation release checkpoint
- Verified implementation249bcf80ed7c0851b095b5dfeaddbbfc721293bd committed and fast-forward HEAD:main pushed. Independent ls-remote matches implementation hash; original checkouts untouched. Vercel deployment pending when first checked. Milestone5 IN PROGRESS, production tests next.

## Production release gate — VERIFIED
- Release249bcf80ed7c0851b095b5dfeaddbbfc721293bd independently matches remote main. GitHub Vercel success; Production deployment6838050280 success at https://koleksi-bacaan-harian.vercel.app/.
- Production favourites/browser and edge suites PASS:320/390/1280, exact supported content/meaning, existing refs/newest save/remove/re-save, header-safe exact full List, Back focus/scroll, keyboard/pressed state, storage refusal, async/script/removal guards, cross-tab freshness, first/last ayahs, missing translation omission, no fabricated history. Relevant errors0.
- Production unchanged checklist/recent suites PASS three widths: browsing/settings/bookmarks, checklist migration/manage/daily and accepted history ordering/cap/tracking/resume/shared-page rule.
- Production current-cache PWA PASS: bookmarks/checklist/history/settings/backups preserved in isolated synthetic profile, offline both-script content/exact-ayah opening/newtab and graceful uncached reference/remove/failed-open-no-history. Actual V2.6.2→V2.6.3 upgrade tested separately locally from exact baseline; no claim of physical-device/old-production-profile upgrade.
-14 live runtime/data/font assets byte-identical to local release. Explicit registration.update() passes; only v263 cache remains; five cached shell assets match local. Production Simple/populated/one/empty/error and offline screenshots inspected. Evidence /Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.3/production.
- All milestones VERIFIED; first incomplete none. V2.6.3 ready for user acceptance. No confirmed remaining issue; physical iPhone/Safari untested and uncached data needs network. Not user-approved stable/series-complete; no automatic next version.
- Documentation-only closeout ledger/report/validation JSON next, normal fast-forward push, independent final local/remote hash/deployment and runtime-byte confirmation. No runtime changes after verified implementation; clean worktree after closeout. Original checkouts preserved.
