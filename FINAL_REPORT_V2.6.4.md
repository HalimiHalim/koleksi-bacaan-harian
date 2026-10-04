# V2.6.4 — Custom Entry Delete Fix

**V2.6.4 ready for user acceptance.** Implementation, local and production verification complete. V2.6.3 has not been assumed accepted stable. Baseline/rollback: `35bbf575f8afc9e453297a3ec8ee277bffa7ab89`.

## Root cause

Baseline Chrome reproduces the exact error with synthetic `u-legacy`, formerly assigned to Quran. In `deleteUserReading`, the global daily-key scan uses `type` inside `parsed.every(type === 'allday' ? ...)` after the destination loop's block binding has ended. Exact extracted production code throws **ReferenceError: type is not defined**, caught as “Data checklist tidak dapat dibaca. Tiada bacaan dipadam.” The reproduced key is `uwa-navigation-renovation-trial-v1-daily-2026-10-04-allday`; any matching daily key, including valid Zikir/Doa state, could trigger the same error. This does not establish corrupt Quran storage.

## Change and preservation

- `source-delete.js` plans cleanup of only the selected custom u-ID in saved custom readings, current and fallback Zikir/Himpunan Doa membership/order and daily completion. Explicit absent keys are skipped; valid present arrays retain unrelated values/types. Malformed active state or inaccessible storage blocks safely with specific module/field errors. No conversion of failed reads into empty arrays.
- `index.html` uses that planner and the existing persistence transaction, clears a matching pending source Undo to prevent resurrection, removes the selected editor draft/DOM/name and reports success only after verified writes. Transaction rollback now also verifies restored bytes; failed recovery reports uncertainty.
- Independent canonical Quran membership/order/daily, recent history, favourites/bookmarks/settings and migration/recovery snapshots remain unchanged. Obsolete allday assignments are excluded before reading. Unrelated source readings/completions and Selawat stanza state remain. No bulk reset or automatic repair was necessary; the reproduced cause is code scope.
- `service-worker.js` caches the new helper and uses `uwa-bacaan-harian-v264-custom-delete-fix`; index/shell assets use `v=264`. Quran modules, data, rendering and fonts are unchanged.
- Three targeted verification scripts and version ledger/validation JSON accompany the fix. No accounts/backend/dependencies or storage schema changes.

## Locks and identities

Original identities 1–21, including Selawat 21, remain locked in UI and edit/submit/delete handlers. Identity, rather than display position, controls the lock. Custom display starts at 22. Repository history at original custom introduction `734f0e2` and Selawat introduction `17aba4f` uses u-prefixed custom UUIDs: no historical numeric identity overlap found; no speculative migration. Unsupported numeric or duplicate persisted custom records are retained and writes blocked. Forced browser collisions prove creation skips both live and tombstoned IDs; custom create/edit/Add to Zikir and Doa/delete remains functional. Quran is absent from Isi assignment destinations. Confirmation continues to name only affected Zikir/Doa modules.

## Validation

- Exact before reproduction and retained custom record; after deletion succeeds and reload shows no resurrection.
- 9 targeted model integrity groups, including all 21 handler locks, missing/malformed/orphan/inaccessible keys, throwing/silent/write-then-throw refusals, partial rollback, absent-key restoration and unverified rollback warning.
- 20 browser scenarios at 320px/390px/1280px: legacy/no assignment/Zikir/Doa/both, unrelated state, full create/edit/Add to/delete, ID collision retries, all built-in UI locks, confirmation/cancel/focus, pending Undo, active failures/retry and ignored obsolete Quran read failures. No console/page errors or horizontal overflow. Screenshot review recorded in ledger.
- Existing checklist 19, recent 23 and favourites 19 model checks; existing UI Polish smoke at all widths exercises checklist/favourites/recent and preserves migration evidence.
- Baseline → V2.6.4 PWA upgrade preserves every seeded storage byte. All 7 cached assets match; offline custom deletion and reload pass with Quran/backups unchanged and cached favourite exact-ayah open retained.
- Inline/changed JavaScript syntax and `git diff --check` pass. Intended diff reviewed, no private browser data/secrets tracked. All tests use isolated synthetic profiles; no real production user entries touched.

## Release and rollback

Runtime commit `6f9408ad4a0d177adb78c99a1bc20630ff6fab8d` independently matches remote main. GitHub Vercel status **success**; Production deployment **6843005572**, matching full runtime SHA, **success** at https://koleksi-bacaan-harian.vercel.app/.

Production: all 20 synthetic custom-delete browser scenarios pass; existing checklist/favourites/recent UI smoke passes at 320/390/1280. Eight live runtime assets byte-match the commit. Explicit service-worker registration update succeeds; only the v264 cache remains, seven cached shell assets match, offline custom deletion/reload and favourite exact-ayah open pass. Quran/backups remain unchanged by deletion. Production screenshots inspected; zero console/page errors. Production testing uses only new isolated synthetic contexts; no real user entries touched. Actual old → new PWA upgrade is separately proven locally, not claimed for an existing production user profile.

Normal existing main/Vercel workflow, no force-push. Rollback with a new revert commit toward `35bbf575f8afc9e453297a3ec8ee277bffa7ab89`, retain recovery snapshots and user storage; old delete bug would return. No data migration to reverse. Branch `codex/v264-custom-delete-fix`, attached worktree preserved; all milestones 0–4 VERIFIED. Verification/QA record closeout follows the runtime commit, without runtime changes; resolve its final hash using `git rev-parse HEAD` and compare `git ls-remote origin refs/heads/main`. Working tree clean at the verified closeout boundary. Ledger retains resumable checkpoints and release evidence.

Evidence: `/Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.4` (before reproduction, model/browser/PWA JSON and screenshots; existing regression evidence under `regression`). Physical iPhone/Safari remains untested. Actual preferred-device check and explicit user acceptance remain after release. No stable declaration or next feature.
