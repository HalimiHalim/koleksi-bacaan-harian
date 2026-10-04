# V2.6.1 — Independent Quran Amalan Saya

Date: 2026-10-04 Asia/Kuala_Lumpur.

Release status: local quality gate passed; commit/push/deployment/production pending. This is not user-approved stable.

## Files and architecture
- Runtime: index.html, quran/reader.js, service-worker.js; new quran/checklist.js.
- Verification: tools/verify_quran_checklist.cjs, tools/verify_quran_checklist_browser.cjs, tools/verify_quran_checklist_pwa.cjs, tools/verify_quran_checklist_reader_regression.cjs, tools/v2.6.1-validation-report.json.
- Records: CODEX_PROGRESS_V2.6.1.md and this report.
- Canonical identity: existing chapters.json surah numbers 1–114, stored as validated decimal strings. Membership/order independent of dated completion. Existing home progress, keyboard/pointer sorting/removal and Undo infrastructure retained. Quran names come from the same 114-surah catalogue as ordinary browsing.
- New keys: uwa-quran-checklist-v1-members, -order, -daily-YYYY-MM-DD, -migration-backup, -migrated. No runtime dependence on Isi reading IDs after migration. Calendar day uses device local date. ×1 retained; no Quran user repetition-target settings existed in V2.5.2.

## Exact legacy findings and migration
- Current source: uwa-navigation-renovation-trial-v1-members-allday, -order-allday, -daily-YYYY-MM-DD-allday; initialized marker uwa-navigation-renovation-trial-v1-initialized.
- Pre-trial source: uwa-routine-members-allday-v1, uwa-routine-order-allday-v1, uwa-daily-YYYY-MM-DD-allday. Custom source: uwa-custom-readings-v1.
- Default current IDs were 4 (Tiga Qul), 15 (Doa Nabi Yunus, excerpt 21:87), 17 (Hasbiyallahu, excerpt 9:129), plus text-classified custom entries.
- Audited built-in 4 contains complete surahs 112/113/114 and expands in that order. IDs 15/17 and all unsupported/custom records are not inferred to be whole surahs. They remain in original storage/Isi and backup; concise notice explains omitted conversion.
- First ordered occurrence supplies position. Duplicate canonical membership is prevented. Completion requires all mapped contributors complete today; indistinguishable duplicate legacy occurrences conservatively remain incomplete. Stale daily data never becomes today's completion.
- Backup of relevant original raw storage is durable before new writes. Original keys never overwritten or removed. New arrays validated/read back; migration marker last. An interrupted migration retries from backup, including next-day reset. Unavailable storage blocks unsafe writes with a visible message. Backup retained through this release.
- Fresh defaults 112/113/114 preserve established whole-surah selection. Explicit empty arrays remain empty across reload. No broad storage clearing in application; isolated browser tests clear their own synthetic context only.

## UI and navigation
- Tambah + beside Susun opens explicit selection mode using existing catalogue/name-number search. Current members show Sudah ditambah; multi-selection survives filtering. Selesai appends additions in canonical numeric order; Batal/Escape/tab-back/browser Back discard pending choices. Selection does not open a reader or modify last-read state.
- Name opens existing full-surah reader with saved mode/script/Tajweed compatibility and returns to Amalan Saya; checkbox affects daily completion only. Buttons/labels avoid nested interaction, expose accessible state and 44px checklist targets. Empty checklist explains Tambah +.
- Quran removed from Isi Add to destinations. Zikir/Himpunan Doa writes remain functional. Source cards cannot complete canonical Quran entries, and removal affects only checklist state.

## Validation and evidence
- 19 synthetic migration tests: standard/ordered/partially completed/stale/duplicates/unmapped/custom/fresh/empty/pretrial, idempotence, every migration write boundary, persistent refusal, unavailable reads, malformed state, next-day interrupted resume. Original state retained.
- Headless desktop Chrome at 320/390/1280: single/multi-add, search/pending/current-member state, cancel/Escape/browser Back, full-reader/checkbox separation, keyboard reorder/removal/checked Undo, reload/progress/day rollover, reader origin focus, ordinary browsing, Isi assignment writes, legacy independence, empty state and failed-add rollback. Zero console/page errors.
- 78 V2.5.2-versus-V2.6.1 reader comparisons: sparse/dense/multi-surah pages 1/7/12/604, List surahs 1/2/114, Uthmani OFF/ON and Simple, applicable List/Page/Classic, 320/390/1280. Exact reading text/token geometry/font sizes/pixels. Entire protected open/render/fit/mode/script block byte-identical. Full 604 sweeps not repeated because renderers were untouched.
- Existing Python verifiers pass: 114 surahs/6,236 ayat/604 pages; both scripts/exact immutable Simple/112 intro basmalahs; 59,253 exact Tajweed mappings/804 pre-existing skips/273 conflicts left plain. Original data verifier still prints its known 111-basmalah label; actual script verifier proves 112 intros. All source datasets/fonts/reader CSS unchanged.
- Node syntax (module/reader/SW/all inline scripts) and git diff --check pass. Static PWA: npm/build/typecheck inapplicable, no package.json. No new dependencies, backend, account system, font or deployment project.
- Screenshot/browser evidence: /Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.1. Inspected checklist/selection 320/390/desktop, empty desktop, Classic/offline 390 and representative regression captures. Phone-width emulation only; no physical iPhone/Safari claim.

## Performance, PWA and limits
- Existing network-first HTML/cache-first asset convention retained, versions v261/cache uwa-bacaan-harian-v261-independent-quran. New module and small catalogue shell-cached; reader assets/data remain lazy.
- V2.5.2→V2.6.1 upgrade passed, single new cache, original trial completion/bookmarks/Tajweed preferences preserved. Offline cached catalogue/checklist, Uthmani/Simple List/Page/Classic and new-tab reopen pass. Offline Quran content still requires visiting applicable assets online first, as before.
- Five-run local fresh-context navigation median 129.2ms baseline / 132.9ms candidate; resource decoded startup bytes 368,896→384,292 (~15.4KB added excluding HTML). Zero full Quran content requests on startup or selection. Small local sample, not a universal performance guarantee.
- No history/favourites or Sambung bacaan/verse Simpan behavior changes. No V2.6.2/V2.6.3 work.

## Rollback and release
- Approved baseline/rollback: 1552582d00ddea19ba9f1fbec917b2985876c2fa.
- Rollback via a new revert commit through existing main workflow, never reset/force-push. Original legacy keys retained; old version cannot show new post-migration additions/completion. Preserve new namespace/backup for forward recovery.
- Implementation/release hash, remote/deployment/production: pending release gate. Latest ledger is authoritative; historical checkpoints are retained for interruption recovery.
- User review: inspect deployed independent checklist and review behavior on actual preferred devices. Deployment does not constitute stable acceptance; wait for explicit acceptance before further feature work.
