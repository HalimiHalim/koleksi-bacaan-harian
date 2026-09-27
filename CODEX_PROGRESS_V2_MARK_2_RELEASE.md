# V2 Mark 2 Stable release progress

- V2 Mark 1.1 rollback commit: `2c9a9c2209bd697afd78e440a23a3232a29efb98`
- Current main hash: `2c9a9c2209bd697afd78e440a23a3232a29efb98`
- Trial branch HEAD: `ef76f7eac72d7b9f294876bbb78a1f4dbfd31c3a`
- Release-candidate branch: `release/v2-mark-2` (created from trial HEAD)
- Current milestone and status: 1 — prepare release candidate; VERIFIED
- Last verified checkpoint: `6d2f44164b9f76e824744e2456e741e201f0a017`
- Tests completed: baseline/trial audit; exact release-candidate diff contains only presentation, manifest names, one user-facing error string and cache version; manifest scope/start unchanged; original short name Khazanah restored; storage namespace unchanged; JavaScript syntax and diff whitespace pass.
- Tests pending: realistic upgrade/rollback fixture; responsive/offline checks; release Preview; production deployment and verification.
- Files changed: progress file, index.html, manifest.webmanifest, service-worker.js.
- Preview deployment status: approved trial Preview ready; release-candidate Preview not yet started.
- Production deployment status: V2 Mark 1.1 remains live; no V2 Mark 2 push.
- Exact next action: commit milestone 1, then run realistic upgrade and rollback tests.

| Milestone | Status | Checkpoint |
| --- | --- | --- |
| 0 Verify baseline and trial | VERIFIED | `6d2f441` |
| 1 Prepare release candidate | VERIFIED | pending |
| 2 Upgrade and rollback regression | NOT_STARTED | pending |
| 3 Release-candidate Preview | NOT_STARTED | pending |
| 4 Production release | NOT_STARTED | pending |
