# V2.6.1 — Independent Quran Amalan Saya

Date: 2026-10-04 Asia/Kuala_Lumpur.

## Repository and recovery
- Worktree: /Users/halimi_hanim/.codex/worktrees/v261-independent-quran/Islamic App.
- Branch: codex/v261-independent-quran.
- Starting HEAD, freshly fetched origin/main, approved V2.5.2 baseline and rollback: 1552582d00ddea19ba9f1fbec917b2985876c2fa.
- Starting working tree clean. Google Drive original has modified index.html/service-worker.js and untracked fonts; left untouched. Earlier V2.5.2 worktree clean and preserved.
- No applicable AGENTS.md found in repository or inspected ancestor paths. Static PWA: no package.json/build/typecheck. Existing Python invariant validators and Playwright browser validators used.
- Never reset/discard interrupted work or commit/push/deploy unverified implementation. Resume by inspecting git, reading this complete ledger and comparing evidence; resume first incomplete milestone.

## Milestones
| Milestone | Status | Evidence |
|---|---|---|
| 0 Baseline audit | VERIFIED | Exact clean baseline and remote hash; V2.5.2 ledger/report read; storage/catalogue/reader/cache paths inspected. |
| 1 Independent data + migration | IN PROGRESS | Audited decisions below; implementation pending. |
| 2 Tambah selection | PENDING | |
| 3 Checklist + reader integration | PENDING | |
| 4 Validation | PENDING | |
| 5 Quality gate/release | PENDING | |

First incomplete milestone: 1.
Files changed: this ledger only.
Known issues: none confirmed in baseline. Physical iPhone testing unavailable.
Validation completed: baseline audit only. Remaining: migration, interactions, representative reader regression, screenshots 320/390/desktop, offline upgrade and production.
Commit/push/deployment: PENDING; no implementation committed.

## Exact legacy findings and migration decisions
- Current keys: uwa-navigation-renovation-trial-v1-members-allday, -order-allday, -daily-YYYY-MM-DD-allday; initialized marker uwa-navigation-renovation-trial-v1-initialized.
- Pre-trial keys: uwa-routine-members-allday-v1, uwa-routine-order-allday-v1, uwa-daily-YYYY-MM-DD-allday. Custom source: uwa-custom-readings-v1; source stays intact.
- initializeTrialState establishes Quran IDs ['4','15','17'] plus custom entries classified by title/reference. Runtime routineFor/readMembers/readOrder/getDone feed checklist, home progress, sort/remove/Undo and source-card completion. Isi destinations currently morning/evening/allday. Deletion currently loops all collections; must stop touching Quran canonical IDs.
- Exact built-in 4 is Tiga Qul, containing complete 112/113/114 (audited Arabic/verse counts). Expand this known group in that order. Built-in 15 (Doa Nabi Yunus, excerpt 21:87) and 17 (Hasbiyallahu, excerpt 9:129) are NOT whole surahs; no conversion. Other/custom IDs have no authoritative whole-surah identifiers; no fuzzy mapping.
- Fresh default canonical selection: 112/113/114, preserving only established whole-surah content. Existing intentionally empty stays empty. Quran baseline repetition badge is always ×1; no user target storage exists. Keep ×1 for independent surahs (source zikir card 3× is not Quran checklist target).
- New membership/order/daily keys use a separate uwa-quran-checklist-v1 namespace and canonical catalogue number strings 1–114. Completion uses local calendar date. Source reading IDs never enter runtime checklist after migration.
- Durable backup precedes new writes; includes original relevant raw arrays/daily keys/custom source/marker. Originals never removed or rewritten. Migration marker last after validation/readback; interrupted migration retries from saved backup, not partially written outputs. Storage errors block writes with concise status.
- Duplicates: first ordered occurrence determines position; a canonical surah is completed only if every contributing mapped legacy occurrence is completed today. Ambiguous repeated same-ID legacy rows (daily set cannot distinguish occurrences) conservatively incomplete. Unmapped IDs recorded and notice shown; source/backup retained through release.
- Catalogue quran/chapters.json has 114 tuples [number, Latin name, Arabic name, verse count, first page, ...]. reader.js loadChapters/renderChapters/openSurah supply existing catalogue/search/full-reader route; showArea controls routine/library/reader. Settings persisted independently in uwa-quran-reader-v1 and uwa-quran-tajweed-v1.
- SW network-first HTML, cache-first same-origin assets; versioned JS/CSS app shell, catalogue precached, reader data/fonts lazy cached. New checklist module must be shell cached; increment cache/asset versions only. No renderer/source changes planned.
- Rollback: revert release application changes via a new reviewed commit on main using existing workflow (no reset/force push). Old legacy data preserved for rollback; additions/completion made after V2.6.1 remain in new keys but old app cannot display them. Keep backup/new keys for forward recovery.

## Implementation checkpoint
- Milestone 1 VERIFIED: independent numeric-string IDs in new namespace; backup-before-write/marker-last migration. 19 synthetic migration tests pass: standard/reordered/partial/stale/duplicate/custom/fresh/empty/pretrial, repeat runs, all five migration write boundaries, persistent write denial, unavailable reads, malformed input and next-day resume. Original keys unchanged in every applicable test.
- Milestones 2/3 IN PROGRESS: catalogue selection, add/search/pending/cancel/browser-back, reader origin and canonical checklist adapter implemented; browser verification pending.
- Quran completion/repeats remain ×1; no target-setting state existed. Independent keys integrate existing home progress/reorder/remove/Undo. Isi destinations reduced to Zikir/Doa. Old pre-trial Zikir initialization still reads its original union (including pre-trial allday) once to preserve unrelated migration behavior, but never creates or consumes live legacy Quran state.
- Files changed: index.html, quran/reader.js (catalogue/navigation only), service-worker.js; new quran/checklist.js, tools/verify_quran_checklist.cjs, ledger.
- First incomplete milestone: 2. Commit/push/deploy PENDING.

## Interaction checkpoint
- Milestones 2 and 3 VERIFIED by real headless Chrome at 320/390/1280: multi-add sorted numerically, search retains choices, existing members disabled, cancel/Escape/browser Back discard, focus return, name full reader/checkbox isolation, keyboard reorder/remove/Undo, checked Undo, reload persistence, home/card isolation, old state migration and post-migration legacy independence, empty reload, all reader modes/scripts/Tajweed and correct origin navigation.
- Ordinary startup requested only the small catalogue, zero Quran page/surah/script content requests. Zero console/page errors across all widths.
- Data invariants VERIFIED: 114/6236/604, exact Simple source and 112 intros, 59,253 Tajweed mappings/804 known skips/273 plain conflicts unchanged. Syntax inline/reader/module/SW and diff whitespace pass.
- Captures inspected: checklist-320, selection-320, Classic-390, empty desktop. Found minor Tambah + wrapping at 320; targeted nowrap adjustment pending. Other captured layouts show no clipping or document overflow.
- First incomplete milestone: 4. Remaining: final responsive after nowrap, representative renderer comparison, assignment write, PWA upgrade/offline, performance size, final release gates.

## Local validation checkpoint
- 78 representative baseline/candidate comparisons VERIFIED: List (surahs 1/2/114), Page/Classic (pages 1/7/12/604), 320/390/1280, Uthmani OFF/ON and Simple as applicable. Exact text, token geometry, sizes and reading pixels equal V2.5.2. Covers sparse/dense/multi-surah pages. Entire open/render/fit/mode/script function block byte-identical; all source datasets/fonts/reader CSS unchanged. Full 604 sweeps not repeated because no shared renderer code changed.
- PWA upgrade V2.5.2→V2.6.1 VERIFIED: old cache replaced by single uwa-bacaan-harian-v261-independent-quran; original trial completion migrated, bookmarks/Tajweed preference retained. Offline cached catalogue/checklist, both scripts and List/Page/Classic, reload and new offline tab pass. Data snapshots compared within isolated synthetic browser context only; none tracked.
- Two PWA harness timeouts were corrected: the existing Simple DOM class is quran-simple-verse, and switching back from Simple restores prior Uthmani Classic (so Tajweed assertion must allow Classic). No product regressions found. Final full PWA pass follows those corrections.
- Final responsive visuals inspected at 320/390/desktop; Tambah + stays on one line, checkbox label hit region and name buttons are 44px. No document overflow or console errors. Physical iPhone/Safari unavailable; desktop Chrome emulation only.
- Performance: 5 local fresh-context runs each: baseline load median 129.2ms, candidate 132.9ms. Resource decoded startup bytes 368,896→384,292 in this sample (~15.4KB additional excluding HTML); zero full Quran content requests. Only existing small catalogue added eagerly; no 604-page preload, backend, new font or dependency. Small sample, not universal performance guarantee.
- Additional failed-add transaction integration and remaining source-assignment write tests IN PROGRESS; source-assignment writes and single-add already pass in the previous browser run. Repeated browser check justified by error-message integration.
- First incomplete milestone: 4 (final failed-add integration); then 5 release. No commit/push/deploy yet.

## Final local quality gate — VERIFIED
- All milestones 0–4 VERIFIED. Final browser pass includes single-add, source Zikir assignment write and failed-add rollback with complete synthetic storage equality. Final PWA rerun after tap-target/error-status changes passes. No required local checks remain.
- Final intended set: index.html, quran/reader.js, service-worker.js, quran/checklist.js, four checklist verifier scripts, tools/v2.6.1-validation-report.json, this ledger and FINAL_REPORT_V2.6.1.md (11 files).
- Final runtime/test/source diff inspected, git diff --check and final syntax/migration checks pass. No credentials/private storage snapshots/test user data/artifacts/dependencies included; test constants are synthetic fixtures. Generated Python cache removed; screenshots/evidence stay outside repo.
- Fetched origin/main still baseline 1552582d00ddea19ba9f1fbec917b2985876c2fa; no newer remote work. Rollback/data compatibility documented above/report.
- Milestone 5 IN PROGRESS: commit verified implementation, fast-forward push HEAD:main (existing Vercel GitHub workflow), verify hashes/deployment/production. First incomplete milestone: 5. Commit/push/deploy PENDING.
