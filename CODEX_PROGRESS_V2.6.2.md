# V2.6.2 — Bacaan Terkini
Date: 2026-10-04 Asia/Kuala_Lumpur.

## Current status
- V2.6.1 explicitly accepted stable by the user in this task. Protected runtime ff42625de47b6aa07f9b8a7ebde68cebd6479675; documentation closeout/current HEAD and freshly fetched origin/main 6753657175a9405856d6ad921d8e2122fcc9619d.
- Baseline and rollback: 6753657175a9405856d6ad921d8e2122fcc9619d. Do not reset to ff42625 or overwrite newer work.
- Reusing attached clean managed worktree /Users/halimi_hanim/.codex/worktrees/v261-independent-quran/Islamic App. New branch codex/v262-recent-surahs; starting tree clean. Older Google Drive and other checkouts untouched.
- No applicable repository AGENTS.md/package.json; static PWA, npm/build/typecheck inapplicable. Existing invariant and browser validators identified.
- Preserve interrupted changes, never reset/discard or auto-commit incomplete work. Resume by reading this full ledger, checking actual git/files/evidence, and continuing first incomplete milestone.

| Milestone | Status | Evidence |
|---|---|---|
| 0 Baseline and reading-state audit | VERIFIED | Clean hash/remote, V2.6.1 complete ledger/report read; catalogue/reader/storage/page/script/selection/back/cache paths inspected. |
| 1 History + legacy seed | VERIFIED | 23 model cases, seed/backup/failure/recovery. |
| 2 Reading tracking + resume | VERIFIED | Final browser suite, readable List anchors and Page/Classic boundaries. |
| 3 Horizontal row | VERIFIED | 0/1/10, three widths, native touch/keyboard/wheel, inspected screenshots. |
| 4 Validation | VERIFIED | Checklist/invariants/78 exact reader comparisons/PWA/performance/syntax. |
| 5 Quality gate + release | VERIFIED | Implementation806ab62 pushed; GitHub/Vercel success; live assets, three browser widths, PWA and SW update pass. |

First incomplete milestone: none. All milestones VERIFIED. Implementation HEAD/release806ab62618ce93a509f9188a152ba6eaffdcc53a matches remote main; successful Production deployment6837594912. Changed15 implementation files recorded below. Known issues: none confirmed in scope. Production checks complete. Documentation closeout follows the verified implementation; resolve its exact HEAD with git rev-parse HEAD. Historical checkpoints below preserve the audit trail.

## Exact baseline audit
- Reader storage uwa-quran-reader-v1 = {last:{surah,ayah,mode,page},bookmarks:["surah:ayah"],mode,script,uthmaniMode}. Separate uwa-quran-tajweed-v1 is on/off. Original reader saved last fields are only partially validated on load; seed must use strict catalogue ranges and known modes.
- updateLast(ayah) sets state.last to current surah/ayah/mode/page and save(); renderContinue builds one quran-continue button above quran-search. Existing saved record should seed at most ONE recent entry, never fabricated older history.
- Actual entry points: catalogue quran-surah-list (ordinary openSurah(number)), checklist custom event quran-open-checklist (same ordinary open), quran-continue (openSurah(number,true)), switchMode List (openSurah(surah,true,'list')). Selection-mode catalogue click toggles pending only; it never opens/updates state.last.
- List open renders full chapter then updateLast(1) or resumed ayah; resumed anchor quran-ayah-N scrollIntoView in rAF. Existing verse-list click calls updateLast(tapped ayah); bookmarks stored separately in state.bookmarks and must remain unchanged. There is NO baseline scroll-position tracking.
- Page/Classic current page next/prev controls call renderPage/renderClassicPage. Each renderer derives ordered verseKeys/pageSurahs from existing page dataset. Retains current surah if present on page, otherwise picks first in canonical token order, then updateLast(preferred ayah if on page else first ayah of active surah). Simple uses end-marker keys and same retention/first boundary rule. Only active surah is recorded, never every rendered surah.
- verse-pages.json maps surah:ayah to end-marker page; loaded lazily only when switching List→Page/Classic. Catalogue tuples contain count/first/last page and support compact range validation without loading full map on startup.
- Script switching retains visible List anchor and Uthmani mode preference; Simple Classic fallback to Page. Tajweed re-renders current page; Classic font-fit/ResizeObserver do NOT call updateLast. History must ignore background/Tajweed rendering and record actual navigation intent only.
- showArea controls routine/library/reader; readerOrigin/originButton return to library or checklist and focus. App nav view-switch listeners live in index before reader listeners; flush pending scroll in capture phase before leaving Quran.
- Current shell versions v261, cache uwa-bacaan-harian-v261-independent-quran. Catalogue/checklist/reader JS/CSS precached; pages/script chapters/font data lazy. Bump release versions/cache; no full Quran preload.

## Schema / migration / tracking decisions
- New key uwa-quran-recent-v1: {schema:1,entries:[{surah,mode,ayah,page?}]}, newest-first, max10 unique canonical integer surahs. List stores ayah anchor; Page/Classic also store page. No Quran text, timestamps, script or Tajweed preferences in entries.
- Validate IDs/counts/pages against existing catalogue; known mode only; omit invalid entries, keep first valid duplicate, cap10. Malformed state never opens invalid content; no repeated seed when history key already exists, including intentionally empty history.
- Missing history seeds one strictly valid original reader last record. Durable uwa-quran-recent-v1-legacy-backup preserves original last before history/legacy writes; originals/checklist/bookmarks untouched. Retry failed initialization from in-memory/original seed; protect legacy saves if backup unavailable. No broad storage clearing.
- List: first visible ayah intersecting reading line at 80px (or first visible below it), using stable data-ayah identity. Only genuine wheel/touch/keyboard scrolling or verse tap engages tracking; programmatic resume/script/layout scroll does not fabricate reading. Throttle trailing scroll position updates to at most once per second; flush latest pending anchor on back/navigation/visibility/pagehide, not unload alone.
- Page/Classic: current navigated page. Retain explicit active surah while it exists on the page; otherwise existing canonical first-verse boundary rule. One entry per genuine navigation; no offscreen phantom surahs. Metadata-only mode changes update same entry without reordering others; no history writes on fitting, catalogue/search/selection/checklist operations or background prefetched data.
- Recent tap alone passes its validated saved position/mode to existing openSurah. Current script/Tajweed remain global; Classic history falls back to Page under Simple. Catalogue/checklist direct opening stays baseline behavior.
- One flex-nowrap horizontal row, compact buttons/ayah-page label, overflow only within row, focus scrolls nearest item, wheel support desktop, touch native. Empty text Belum ada bacaan terkini; hidden in Tambah selection.
- Rollback through a new revert commit/main workflow, never force/reset. New history key ignored by V2.6.1; legacy reader last remains compatible and seed backup retained. Checklist migration/storage untouched.

## Data / integration checkpoint
- Milestone 1 VERIFIED: model suite passes 23 synthetic cases (seed/idempotence/backup, invalid ID/ayah/page/mode, malformed schema, duplicates/cap/newest/reopen, metadata order, reload/no day reset, backup/write/read failures, same-position retry after storage recovers). Single validated JSON key, compact metadata only; backup guards legacy writes.
- Milestones 2/3 IN PROGRESS: intent-gated history around existing reader entry points/page controls and throttled visible List anchor; pending flush on back/capture-phase app nav/hidden/pagehide. Horizontal flex-nowrap row with focus/desktop wheel/native touch behavior implemented; browser checks pending.
- Accepted V2.6.1 checklist browser regression VERIFIED at 320/390/1280, including migration/legacy independence/add/cancel/search/check/reorder/remove/Undo/reload/daily/settings/failure/source assignment. Existing suite unchanged; zero errors.
- Runtime files: index.html, quran/reader.js, quran/reader.css, service-worker.js, new quran/recent.js. Records: new ledger and explicit V2.6.1 acceptance note/report update. New model/browser verifiers. quran/checklist.js unchanged.
- First incomplete milestone: 2. No commit/push/deploy.

## Reading/UI validation checkpoint
- Invariant validators VERIFIED: Quran 114/6236/604/source marks, both scripts and 112 intros, exact Tajweed mapping/palette datasets unchanged. Protected Page/Simple/Classic/Tajweed/render/fit function block byte-identical; checklist module/data/fonts unchanged.
- PWA V2.6.1→V2.6.2 upgrade/offline VERIFIED in isolated Chrome context: independent checklist membership/order/today completion/migration backup exact, bookmarks/script/Tajweed retained, one legacy seed with recovery backup, List ayah20 resume, cached Uthmani/Simple List/Page/Classic, new offline tab. Uncached surah fails gracefully and does NOT enter history. New cache only; no all-Quran preload.
- Phone-width history suites passed before desktop: 320/390 single row, zero/one/ten, native CDP touch swipe, keyboard/focus/wheel, first/reopen/dedup/11th eviction, pending Back/hidden/pagehide flush, selection/check/reorder isolation, checklist reader feeding history, reload/day persistence and zero errors. Complete final suite still IN PROGRESS.
- Confirmed desktop bug: after a genuine scroll had persisted, sticky engagement allowed later programmatic auto-scroll to Back button to overwrite ayah20 with1. Fixed by clearing gesture engagement after flush and retaining the pending stable ayah identity; verse taps cancel old scroll timer. Affected full interaction suite rerunning. No renderer/fitting change.
- Harness corrections: phone reader hides main app nav by accepted design, so phone pending-exit test uses actual Back; desktop capture-phase nav tested at current viewport. Regression seed must remove only its own synthetic recent key before reload, because an existing empty schema intentionally never reseeds.
- First incomplete milestone 2: final desktop List and Page/Classic history checks; then 3 final screenshots, 4 full quality evidence, 5 release. No commit/push/deploy.

## Reading and horizontal-row checks — VERIFIED
- Milestones 2/3 VERIFIED: complete final Chrome suite passes 320/390/1280. Saved List anchor/resume, pending Back/app-nav/visibility/pagehide flush, recency/dedup/11th eviction, reload/day persistence, catalogue/checklist entry points, selection/check/reorder isolation, same-surah mode/script compatibility, settings/bookmarks and write refusal all pass, zero page/console errors.
- List write measurement: one update after wheel gesture; 100 scroll events plus immediate leave cause at most one update. Settled gestures end tracking, so programmatic resume/focus/font/layout scrolling cannot continue an old reading gesture. Pending saved identity retained for flush. Actual desktop regression now passes.
- Page/Classic history VERIFIED on pages603/604: explicit113 retained on shared604; backward603 chooses canonical first109; forward604 chooses112. Result [112,109,113], no phantom110/111/114. Recent113 resumes604 and back focuses its refreshed item. Tajweed toggles/resize/font fitting generate zero history writes.
- Simple current preference + Classic history falls back to Page, preserves Tajweed on/bookmarks, restores Uthmani Classic as existing compatibility requires, and keeps one distinct entry. Verse Simpan still persists its bookmark independently.
- Zero/one/ten row screenshots at all widths captured and inspected. Flex-nowrap verified equal top positions, internal overflow only, 320/390 native Chrome CDP touch swipe, wheel scrolling and Tab to offscreen last item all pass. Names truncated visually with full accessible name. Empty state compact. No whole-document overflow.
- 78 representative accepted V2.6.1/candidate reading comparisons VERIFIED: exact text/token geometry/font/reading pixels for List 1/2/114, Page/Classic1/7/12/604 at320/390/1280 with both scripts/Tajweed combinations. Page/render/fitting blocks remain byte-identical; no full604 sweep needed.
- Model23 + accepted checklist migration19, syntax all inline/module/reader/SW and git diff --check pass. Earlier complete checklist browser suite remains valid; checklist module unchanged. First incomplete milestone:4 final PWA-after-fix/performance/report/gate. No commit/push/deploy.

## Visual refinement checkpoint
- Visual QA tightened explicit recent List resume: after existing renderer/fonts settle, position the saved stable ayah at reading line80px with an instant scroll. Only Bacaan Terkini taps with ayah>1 use this final anchor; direct catalogue/checklist behavior and renderer bodies remain unchanged. Cancels if reader request changes. This avoids capturing a transient intermediate frame of the inherited smooth-scroll animation and leaves the ayah below mobile header.
- Affected List/PWA resume tests tightened to readable anchor70–130px and rerunning. Milestones2/3 otherwise verified, milestone4 final adjustment verification IN PROGRESS. Never release before this check passes.
- Explicit V2.6.1 acceptance reflected in its existing ledger/report/validation metadata (documentation only).

## Final local quality gate — VERIFIED
- Milestones0–4 VERIFIED. Final readable-anchor interaction/PWA suites pass after last runtime adjustment. Final unchanged V2.6.1 checklist browser suite also passes all three widths. No required local implementation check remains.
- Final performance sample: baseline median136.1ms/candidate133.7ms, decoded resource bytes384,296→394,957 (+10,661bytes excluding HTML), zero full Quran startup requests. Empty schema25bytes;10 compact entries under1KB. Model/history and write-frequency results in validation JSON.
- Inspected final List ayah20 screenshot at desktop: readable below80px line; phone header-safe anchor tests pass. Row0/1/10 screenshots and regression evidence inspected. No confirmed remaining issue; physical iPhone/Safari remains untested limitation.
- Protected Quran renderer/fitting block, authoritative datasets/page mapping/fonts and checklist module unchanged. Syntax/diff/invariants/model accepted checklist checks pass. No secrets/private storage snapshots or test user data tracked; only synthetic test fixtures. Evidence outside repository. Generated Python cache removed.
- Intended15 files: five runtime files (including recent module); four new verifiers; V2.6.2 validation JSON/ledger/report; three V2.6.1 acceptance records. Final review pending staged diff check. Freshly fetched origin/main still6753657175a9405856d6ad921d8e2122fcc9619d; no newer remote work.
- Milestone5 IN PROGRESS: commit verified implementation, fast-forward HEAD:main via existing GitHub/Vercel workflow, verify hashes/deploy/production. First incomplete milestone5. Commit/push/deployment PENDING.

## Implementation release checkpoint
- Verified implementation committed as 806ab62618ce93a509f9188a152ba6eaffdcc53a after staged diff check. Normal fast-forward push HEAD:main succeeded; independent ls-remote matches that hash.
- GitHub Vercel status success; Production deployment6837594912 reports success. Production browser/PWA/checklist suites running in isolated synthetic contexts; asset and service-worker checks pending. Milestone5 remains IN PROGRESS until smoke evidence passes.

## Production gate — VERIFIED
- Release806ab62618ce93a509f9188a152ba6eaffdcc53a independently matches origin/main. GitHub Vercel check and Production deployment6837594912 success; https://koleksi-bacaan-harian.vercel.app/.
- Production recent/browser and unchanged checklist suites PASS320/390/1280: ordering/cap/resume/pending flush/shared-page active rule/direct browsing/settings/bookmarks/checklist/daily persistence; zero relevant errors.
- Production PWA PASS: legacy seed/backup, checklist state/settings/bookmarks preserved, cached offline List/Page/Classic with both scripts and new-tab resume; uncached failure does not create history. Actual V2.6.1→V2.6.2 upgrade verified locally using exact release files; production fresh-context current-cache smoke is separately recorded and does not claim an old production browser upgrade.
- Twelve live runtime/data assets byte-identical to local implementation. Explicit production registration.update() succeeds; only v262 cache remains; cached HTML/recent module/reader JS/CSS match local files.
- Production ten-item phone row320/390, readable desktop List ayah20 and offline Classic screenshots inspected. Evidence /Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.2/production.
- No remaining required check or confirmed issue. Physical iPhone/Safari untested; uncached Quran still requires network. V2.6.2 ready for user acceptance. Not user-approved stable; no V2.6.3.
- Documentation-only closeout updates this ledger/report/validation JSON, then normal fast-forward push and independent final hash/deployment check. No runtime changes after verified implementation. Working tree clean after closeout commit; final commit hash resolved from Git.
