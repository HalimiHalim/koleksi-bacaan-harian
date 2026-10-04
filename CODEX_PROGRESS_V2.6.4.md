# V2.6.4 — Custom Entry Delete Fix

Date: 2026-10-04, Asia/Kuala_Lumpur.

## Current checkpoint

- Branch: `codex/v264-custom-delete-fix`.
- Reused attached worktree: `/Users/halimi_hanim/.codex/worktrees/v261-independent-quran/Islamic App`.
- Starting clean HEAD, fetched origin/main, baseline and rollback: `35bbf575f8afc9e453297a3ec8ee277bffa7ab89` (V2.6.3 UI Polish documentation closeout; runtime `19e3f14c5cbe5a22b6a2270665c1f620dee80da6`). V2.6.3 is not assumed accepted stable.
- Full V2.6.3 report and ledger read. No applicable AGENTS.md. Static PWA: npm/build/typecheck inapplicable. Original Google Drive checkout and other user work preserved.
- This ledger was created before implementation. Preserve interrupted work; never reset/discard/force-push or commit unverified changes. On resume inspect actual branch/HEAD/status, read this ledger fully, compare files and evidence, resume the first incomplete milestone; repeat only missing or affected checks.

| Milestone | Status | Evidence |
|---|---|---|
| 0 Reproduce/audit | VERIFIED | Baseline Chrome failure and exact extracted production scan throw ReferenceError; source/legacy/ID/Undo audit. |
| 1 Safe targeted deletion | VERIFIED | Source-only planner, validation, persistence/rollback readback and selected pending Undo cleanup; model/browser/PWA tests. |
| 2 Built-in locks/custom creation | VERIFIED | Identity/history audit; all 1–21 UI and handler guards; live/deleted ID collision retries; create/edit/Add to/delete. |
| 3 Focused validation | VERIFIED | Model 9 groups, browser 20 scenarios, existing regression, syntax/diff and baseline-to-current PWA upgrade/offline pass; screenshots inspected. |
| 4 Release | IN PROGRESS | All local gates pass; intended diff/secrets review and rollback recorded. Commit/push/deployment and production verification next. |

First incomplete milestone: **4**, commit/push/deployment and production verification. Working tree has the intended implementation/tests/records only. Release status: PENDING.

## Proven root cause and identity audit

- Baseline synthetic `u-legacy`, formerly assigned to Quran, reproduces exact error: “Data checklist tidak dapat dibaca. Tiada bacaan dipadam.” Custom record remains.
- Exact baseline `deleteUserReading` global daily-key scan, after the destination loop: `parsed.every(type === 'allday' ? quranChecklist.validId : validTrialId)`. The loop's block-scoped `type` is out of scope here: `ReferenceError: type is not defined`. Failing synthetic key: `uwa-navigation-renovation-trial-v1-daily-2026-10-04-allday`. Any matched daily key, including valid Zikir/Doa state, can trigger it. This is a code bug, not proof of corrupt Quran data.
- Active source membership/order/daily keys use trial and fallback prefixes ending morning/evening. Independent Quran keys and obsolete allday assignments are separate. Historical migration/recovery snapshots must stay raw and unchanged.
- Another live reference is `lastRemoval`, the pending checklist Undo. It could reinsert a deleted custom ID. Clear only a matching source morning/evening Undo after verified deletion; unrelated Undo is retained.
- Verified original card identities 1–21, including Selawat 21. `isBuiltIn` checks identity, and original UI omits Edit. Edit/submit/delete handlers reject those identities. Custom display begins 22.
- Original custom-introduction commit `734f0e2` and Selawat-introduction `17aba4f` both use u-prefixed random custom IDs. A historical custom display position 21 is not identity 21. No historical numeric custom overlap was found; no guessed migration. Unsupported numeric/duplicate custom records remain preserved and writes blocked. Existing creation rejects collisions with both saved and deleted IDs; browser forces both retries.

## Implementation and data compatibility

- Runtime: `index.html`, `source-delete.js`, `service-worker.js`.
- Planner validates explicit source members/order and all source daily completion arrays before any mutation. Missing keys mean absent references, without manufacturing empty collections. Malformed active state and storage access/enumeration failures give precise module/field errors and preserve raw data. Order membership is checked when an explicit membership exists. Daily duplicate values retain existing schema semantics; unrelated values and numeric types are preserved.
- Removes only the selected u-ID from custom records, current/legacy Zikir/Doa membership/order/completion, and matching pending source Undo. Appends a tombstone, removes its editor draft/name/card and refreshes UI after persistence succeeds.
- Never reads unrelated Quran/allday/backup data for deletion cleanup. Canonical Quran members/order/daily, bookmarks/favourites, recent history, settings, all migration/recovery evidence, unrelated custom/source/completion and Selawat stanza state are unchanged.
- Existing transaction snapshots all keys before writes, verifies each write, reverses partial writes on failure; added rollback readback catches silently refused recovery and reports uncertainty instead of claiming original data is safe. No automatic reset or repair: reproduced cause is code scope, not provably damaged active data.
- No storage schema change or new identity allocation. Rollback via new revert commit using normal main/Vercel workflow, baseline above, never reset or force-push; retain all recovery state. Original data remains compatible; baseline code would reintroduce its delete bug.
- Cache version `uwa-bacaan-harian-v264-custom-delete-fix`; asset queries `v=264`, new helper included in shell. Quran modules/data/fonts/icons/manifest contents unchanged.
- Tests: `tools/verify_custom_delete.cjs`, `tools/verify_custom_delete_browser.cjs`, `tools/verify_custom_delete_pwa.cjs`. Records: this ledger, `FINAL_REPORT_V2.6.4.md`, `tools/v2.6.4-validation-report.json`.

## Completed validation / evidence

Evidence outside Git: `/Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.4`. Only isolated synthetic profiles used; no real entries touched.

- `before.json`, `before-error.png`, external `reproduce.cjs`: exact baseline failure proven.
- `verify_custom_delete.cjs`: 9 integrity groups pass, using actual production planner, transaction and edit/delete guard functions. All 21 original IDs (number/string) reject even forged custom lookup before reads. Missing/malformed/duplicate/orphan/inaccessible storage distinguished. Selected-only cleanup preserves every unrelated raw key and retained value type. Throwing, silent and write-then-throw failures roll back partial writes; absent tombstone removed again; snapshot failures write nothing; silent rollback refusal reports uncertainty.
- `verify_custom_delete_browser.cjs`: 20 scenarios pass at 320/390/1280, synthetic legacy Quran custom delete, no assignment/Zikir/Doa/both, unrelated completions, reload/no resurrection, confirmation/cancel/focus, all built-in UI locks, no horizontal overflow, pending Undo invalidation, forced live/deleted ID collisions and new create/edit/Add to both/delete. Missing collections remain missing. Active malformed members/order/daily/custom/tombstones and storage reads block without raw changes; partial throwing/silent writes roll back, recover and retry. Obsolete Quran access refusal does not block delete. Absent trial initialization marker plus malformed obsolete Quran also passes. No console/page errors.
- Existing checklist model 19, recent model 23, favourites model 19 pass. Existing `verify_quran_ui_polish.cjs` passes all 3 widths, covering checklist add/select/cancel/sort/remove/Undo, favourites exact-ayah open/save/remove and recent resume, preserved migration state and UI Polish timer behavior. No Quran rendering sweep required: no shared rendering changes.
- PWA `35bbf57` → current upgrade passes. All seeded storage raw bytes unchanged on upgrade; one new cache; 7 cached shell assets byte-match current files. Offline custom delete/reload passes while Quran and backups remain unchanged; cached favourite opens exact ayah offline. `custom-delete-pwa.json` and offline screenshot.
- Inline scripts and all changed JS/CJS pass `node --check`; `git diff --check` passes. Intended diff inspected; no private browser state/secrets/artifacts tracked. Remote main rechecked still baseline before release.
- Remaining device review: physical iPhone/Safari is untested; Chrome phone widths are emulation. Explicit user acceptance remains required after successful release. Do not declare stable or begin another feature.

## Historical checkpoints

1. Ledger created before implementation; milestone 0 initially IN PROGRESS, 1–4 PENDING; suspected undeclared type required proof.
2. Baseline reproduced, exact ReferenceError proven, milestone 0 verified; safe cleanup implementation and locks/custom identity audit begun.
3. Implementation, 9 model groups, 19 browser scenarios, existing regression and local upgrade/offline tests pass. Two test-fixture assertions corrected: custom title itself contains “Quran”, so affected-module assertion scopes the confirmation suffix; initial theme explicitly seeded for exact PWA whole-storage snapshot. Neither correction changed runtime behavior.

4. Milestones 0–3 VERIFIED: final 20-scenario browser suite passes; confirmation controls visible at 320/390/desktop, remaining custom entry/actions and Zikir completion screenshots inspected. First incomplete 4. All local gates pass; release authorized by task, PENDING.
