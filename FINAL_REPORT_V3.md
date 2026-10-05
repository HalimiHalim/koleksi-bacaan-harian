# V3 — Centered Page Text and Separate Favourites Card

**V3 ready for user acceptance.** Accepted V2.6.4 remains the stable baseline until user feedback. Production: https://koleksi-bacaan-harian.vercel.app/.

## Changes
- `quran/reader.css`: modern Page continuous RTL body uses `text-align:center` and `text-align-last:center`. Both Uthmani and Simple preserve font size, line height, wrapping, original inline flow and attached ayah markers. Heading/basmalah, List and Classic retain their rendering.
- `index.html`: semantic checklist and Petikan Kegemaran sections are sibling cards inside the existing routine visibility wrapper. Shared routine-panel styles give equal width, 18px padding, 20px corners, theme border/shadow and an 18px gap. Checklist ends after + Tambah Surah and its applicable removal controls/feedback. Existing IDs, event ownership and Back focus/scroll behavior retained; favourites remain outside checklist membership/counts.
- `index.html` and `service-worker.js`: asset queries v300 and cache `uwa-bacaan-harian-v300-centered-page-favourites`, using established PWA conventions.
- Records: CODEX_PROGRESS_V3.md, this report and tools/v3-validation-report.json. No new dependencies, migrations, backend or checked-in redundant tests.

## Validation and evidence
Evidence: `/Users/halimi_hanim/Projects/Islamic-App-QA-V3`, outside Git. All browsers use isolated synthetic contexts.
- Local and production 320/390/1280 matrix: Uthmani Tajweed OFF/ON and Simple at pages 1/446/604; 27 cases and 378 lines per matrix, all centered including short final lines (maximum measured offset 1px). Entire rendered page DOM and relative wrapping/line positions equal V2.6.4. Correct RTL, canonical tokens/marker order/attachment, typography and centered structural lines; no overflow/clipped containers or page/console errors. Screenshots inspected including As-Saffat 390 and Simple 604 at 320.
- Six List/Classic full-page screenshot buffers equal V2.6.4 byte for byte locally and on production.
- Separate cards: matching geometry and theme at all three widths and all five themes; empty/populated, routine-only visibility, unique IDs and raw data preservation on tab/layout operations. Screenshot `themes/emerald-gap-390.png` shows checklist end and gap; `production-evidence/cards-populated-390.png` shows populated favourites.
- Existing favourites browser suite: save/unsave/resave/remove, exact-ayah opening, Back focus/scroll, 25 excerpts/Tunjuk lagi, reload/day persistence, both scripts, storage refusal and async retry. Existing UI Polish suite passes locally and production at all widths: add/select/cancel, sort/remove/Undo, recent resume and feedback timing.
- Existing checklist browser scenarios pass all widths, including completion/reload, daily reset, source assignment isolation, reader settings/modes and refused add writes. External adapter corrects only its obsolete migration notice assertion: V2.6.3 intentionally hides non-actionable notice, independently confirmed on V2.6.4. Original checked-in tests unchanged.
- Existing models: checklist 19, favourites 19, recent 23, custom-delete 9 integrity groups. Inline scripts/JS syntax and git diff --check pass.
- Real local V2.6.4→V3 service-worker upgrade preserves every seeded storage raw byte. Seven cached runtime assets match files, old cache removed; offline centered As-Saffat, separate cards, favourite exact-ayah and custom delete/reload pass. Production fresh-profile update/cache/offline smoke separately passes; not claimed as an existing real-user profile upgrade.

## Preservation and release
Quran datasets/fonts/script mapping/Tajweed and reader/state modules remain byte-identical to V2.6.4. No storage-writing logic or listeners changed. Rendering, tab/layout and upgrade raw-byte checks preserve synthetic user data. Existing source custom creation/edit/Add to/delete and built-in locks retain V2.6.4 behavior, with integrity models and offline deletion verified. Real user profiles were not touched.

Runtime commit: `3a802990b0092ee5f4b597c67ecd81a205575602`, pushed normally to main and independently verified by ls-remote/fetched origin/main. Matching Vercel Production deployment `6852969171` success; eight live runtime assets byte-match commit. Final records commit is this report's Git HEAD, with separate hash/deployment readback in external `closeout.json`; it does not change runtime. Existing GitHub→Vercel project reused.

Working checkout `/Users/halimi_hanim/Projects/Islamic-App`, branch `codex/v3-centered-page-favourites`. Working tree clean after final records closeout; original dirty Google Drive checkout preserved. All ledger milestones VERIFIED; no first incomplete implementation milestone. Normal revert commit can restore baseline `4bb4c88` without user-data conversion; never reset/force-push.

Physical iPhone/Safari is untested; phone widths are Chrome emulation. User acceptance remains pending. No next-version work started.
