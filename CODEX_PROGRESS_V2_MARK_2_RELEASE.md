# V2 Mark 2 Stable release progress

- V2 Mark 1.1 rollback commit: `2c9a9c2209bd697afd78e440a23a3232a29efb98`
- Current main hash: `2c9a9c2209bd697afd78e440a23a3232a29efb98`
- Trial branch HEAD: `ef76f7eac72d7b9f294876bbb78a1f4dbfd31c3a`
- Release-candidate branch: `release/v2-mark-2` (created from trial HEAD)
- Current milestone and status: 2 — upgrade and rollback regression; VERIFIED
- Last verified checkpoint: `2edf77a3197e4e80e2a0347b9fbfe491bb06348a`
- Tests completed: baseline/trial audit; stable branding and manifest restored; storage namespace unchanged; JavaScript syntax and diff whitespace pass; realistic V2 Mark 1.1 browser-state upgrade preserved all 15 legacy keys byte-for-byte, custom readings/edits, Arabic edit, Selawat stanza, theme and setting; Zikir union/order and 5/8 completion correct; Doa/Quran independent; reorder, removal/Undo, Add to, and reload passed; V2 Mark 1.1 rollback read old routines unchanged; daily rollover, idempotence and deletion regression scripts passed; 375/390/428/tablet/desktop views showed no clipping/overflow; offline reopening and same-scope service-worker upgrade passed after no-store install-cache fix; stable cache active, old cache removed, no app console errors.
- Tests pending: release Preview; production deployment and verification.
- Files changed: progress file, index.html, manifest.webmanifest, service-worker.js.
- Preview deployment status: approved trial Preview ready; release-candidate Preview not yet started.
- Production deployment status: V2 Mark 1.1 remains live; no V2 Mark 2 push.
- Exact next action: commit milestone 2, remove this progress file from the final release-candidate tree, push only release/v2-mark-2, and verify its Vercel Preview.

| Milestone | Status | Checkpoint |
| --- | --- | --- |
| 0 Verify baseline and trial | VERIFIED | `6d2f441` |
| 1 Prepare release candidate | VERIFIED | `2edf77a` |
| 2 Upgrade and rollback regression | VERIFIED | pending commit |
| 3 Release-candidate Preview | NOT_STARTED | pending |
| 4 Production release | NOT_STARTED | pending |
