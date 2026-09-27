# V2 Mark 1.1 — Navigation Renovation Trial V1

- Base commit: `2c9a9c2209bd697afd78e440a23a3232a29efb98`
- Current branch: `codex/navigation-renovation-trial-v1`
- Last verified checkpoint: `acbe83bfba1e4ed089cb9d957dbd49e5af92a265`
- Current milestone: 4 — Responsive, persistence and offline QA
- Milestone status: VERIFIED
- Intended change: mark trial identity, version the scoped service-worker cache, and test reload, rollover, custom content, themes, layouts and offline reopen.
- Files changed: progress file, index.html, manifest.webmanifest, service-worker.js
- Storage keys audited: `uwa-theme`, `uwa-arabic-edits`, `uwa-custom-readings-v1`, `uwa-deleted-reading-ids-v1`, `uwa-selawat-21-stanzas-v1`, `uwa-ios-install-help-dismissed`, `uwa-routine-members-{morning,evening,allday}-v1`, `uwa-routine-order-{morning,evening,allday}-v1`, `uwa-daily-YYYY-MM-DD-{morning,evening,allday}`. No IndexedDB usage.
- Tests completed: baseline and VM fixture checks; syntax/diff checks; browser reorder/remove/Undo; Home immediate progress; Add to unchecked; custom creation and three memberships; VM transactional deletion with injected write failure and rollback; same-day independence and next-day reset; 375/390/428/768/1280px widths without overflow or nav overlap; mobile navigation >=64px and tablet/desktop >=44px; theme reload persistence; fresh offline tab with trial shell and Arabic font; no browser console errors; 21 original cards and need panel byte-for-byte unchanged.
- Tests pending: final diff/clean-tree review, Preview deployment, production URL verification.
- Classification mapping: Doa IDs 1,7,8,9,13,15,16,18,19,20; Quran IDs 4,15,17. Zikir is the legacy ordered union. Custom `u-*` readings are classified from explicit saved fields at first initialization.
- Exact next action: commit milestone 4, then review final diff and prepare Preview branch.
- Anything pushed: no.
- Preview deployment status: not started.

## Milestones

| Milestone | Status | Checkpoint |
| --- | --- | --- |
| 0 Baseline and audit | VERIFIED | `1935bff` |
| 1 Trial state and classification | VERIFIED | `4160af4` |
| 2 Navigation and checklists | VERIFIED | `9d48bf7` |
| 3 Home and Add to | VERIFIED | `acbe83b` |
| 4 QA | VERIFIED | pending |
| 5 Preview preparation | NOT_STARTED | pending |

## Audit detail

- Legacy membership arrays contain reading IDs; missing keys use built-in defaults. Order arrays contain IDs and append members omitted from the saved order. Daily completion is an array of IDs under a local-date key. Custom readings are objects with `id`, `name`, `arabic`, `meaning`, `reference`; custom deletion keeps tombstones.
- Morning built-in order: 4,5,6,7,8,9,10,11,12,17,18,19. Evening: 4,5,6,7,8,9,11,13,14,17,18,19. All-day: 1,2,3,15,16,20.
- Trial fixture plan: untouched legacy keys, duplicate IDs across three source lists, custom ID, unknown ID in trial order, independent completion for one shared ID, simulated date rollover, and storage-write failure rollback.
- Service worker `uwa-bacaan-harian-v14-home-progress` caches root, index, manifest, Noto Naskh font and icons; network-first navigation; cache-first same-origin assets; activation deletes older app-prefixed caches only within its origin. No site-data deletion. Preview origin isolates it from production.

## Classification audit

Doa selected: 1 (explicit forgiveness request), 7 and 13 (explicit refuge requests), 8 (request for help and improved affairs), 9 (forgiveness request), 15 (Doa Nabi Yunus), 16 (request for protection from distress/debt), 18 (request for afiat), 19 (request for health), 20 (request for steadfastness). Quran selected: 4 (three named surahs), 15 (Al-Anbiya 21:87; verified against Quran.com), 17 (At-Tawbah 9:129; verified against Quran.com). Ambiguous/unclassified: 2 and 21 (Selawat, prayer forms but separate Selawat use), 3,5,6,10,11 (dhikr/praise), 12 and 14 (witness statements rather than direct requests). No custom readings are bundled; user-specific saved custom readings require explicit content-level evidence.

Fixture definitions: duplicate ID 4 in morning/evening, shared ID 15 in Zikir/Doa/Quran, custom `u-fixture`, unknown `u-unavailable`, legacy daily completed ID 4, and next local date. These will be injected only into isolated browser test storage, never production.
