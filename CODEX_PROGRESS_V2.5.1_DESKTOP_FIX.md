# V2.5.1 desktop Classic Tajweed / spacing fix

Date: 2026-10-03 Asia/Kuala_Lumpur

- Branch: codex/v251-desktop-fix
- Baseline HEAD / freshly fetched origin/main: cab64c5063f96ded8559dc563bc61e9218670d57
- Working tree: initially clean managed worktree. Older dirty Google Drive checkout preserved.
- Evidence: /Users/halimi_hanim/Projects/Islamic-App-QA-V2.5.1-Desktop
- Supplied screenshot files: absent; request describes 534 acceptable / 535 excessive.
- Exact affected mode: IN PROGRESS (Classic has full-width space-between QCF lines; Page has continuous inline RTL).
- Desktop Tajweed root cause: IN PROGRESS. Both renderers use existing validated annotations; no reset found in CSS.
- Spacing root cause: IN PROGRESS (full-width Classic flex space-between; compact threshold applies only below 100 words).
- CSS/DOM changes: PENDING.
- Screenshots tested: PENDING.
- Mobile / desktop regression: PENDING.
- Milestone 0 baseline / DOM diagnosis: IN PROGRESS.
- Milestones 1–9 diagnosis, fixes, validation, cache and quality gate: PENDING.
- Milestone 10 commit/push/deploy/production: PENDING. Do not release incomplete work.

## Baseline DOM diagnosis — VERIFIED
- Classic matches the described 534/535 spacing contrast. 534 is compact (centered); 535 is ordinary (full-width space-between). Current Page has no distributing flex lines. No supplied screenshot is available for direct attribution.
- Both modes at 320/390/1024/1280/1440 have exact expected Tajweed spans: 90 on 534 and 142 on 535, all seven existing computed palette colours, no overflow. Native localhost verification succeeds.
- Spacing root cause VERIFIED: Classic full-width flex line distributes all remaining horizontal width equally between words/markers; page-level <100-word compact exception masks it on 534.
- Smallest spacing fix IN PROGRESS: min-width:621px only, center Classic line children with existing .28em compact gap. No DOM, fitter, font size, width, Page or mobile CSS changes.
- Desktop Tajweed diagnosis IN PROGRESS: production, forced-colour and insecure-origin conditions being checked. Asked user for affected URL/mode; no annotation/palette change is justified yet.

## Desktop Tajweed diagnosis and fix
- VERIFIED reproduction: desktop forced-colours active leaves 142 correct spans on page 535 but all seven computed colours become rgb(0,0,0). No mapping failure or application CSS reset. Browser forced-colour adjustment replaces author colours.
- Ordinary localhost and live HTTPS production have all seven correct palette colours. Separate diagnostic non-localhost HTTP has no crypto.subtle and safely shows the existing annotation-unavailable status; this is not established as the user's case and is not changed.
- Exact user's PC condition remains unconfirmed; screenshot files absent and URL/mode clarification pending. Do not claim the reproduced forced-colour case is confirmed on their machine.
- Fix IN PROGRESS: desktop-only forced-colors media query preserves colour adjustment on existing Tajweed spans. Both Uthmani Page/Classic covered; OFF has no spans. No palette, annotations, renderer, settings or mobile mutation.
- Cache IN PROGRESS: reader asset queries 251d1; unique uwa-bacaan-harian-v251-desktop-fix cache. Upgrade/offline pending.

## Validation checkpoint
- Quran verifier VERIFIED: 114 surahs / 6,236 ayat / 604 pages / 15 sajdah. Existing verifier reports 111 separate basmalahs; script verifier confirms 112 introductory basmalahs; neither source changed.
- Tajweed verifier VERIFIED: 59,253 mapped; 804 skipped; 273 conflict graphemes unchanged.
- Script verifier VERIFIED: both scripts 114/6236, 604 mappings, immutable Simple and 112 intros.
- Page browser sweep VERIFIED: 5,436 renders at 320/390/1280, Uthmani OFF/ON and Simple, zero errors/overflow/text mismatch.
- Settings/navigation/persistence VERIFIED at 320/390/1280, Classic/Simple fallback and restoration, invalid saved state.
- Upgrade/offline VERIFIED: V2.5.1 cache removed; single new cache; cached List, Page, Classic OFF/ON, Simple, bookmarks and new-tab Classic reopening. Chrome offline navigation event timed out initially; waitUntil commit followed by actual DOM readiness assertions passed, no application change needed.
- Phone before/after geometry and reading pixels VERIFIED for 7 representative pages × 2 modes × 320/390. One initial comparison had 10 rounded-frame rasterization pixels differing; reading pixels exact. Verifier explicitly allows at most 32 frame-only pixels with exact DOM/style equality.
- Classic all-604 sweep at five widths and remaining desktop representative screenshots IN PROGRESS.
- JS syntax and git diff --check VERIFIED; final recheck pending release.
- Commit/push/deploy PENDING.

## Final local quality gate — VERIFIED
- Classic: 604 pages × five widths (320/390/1024/1280/1440) × OFF/ON = 6,040 renders. Exact Unicode tokens, QCF line order, span classes/text, visible palette, ayah/waqf/headings/basmalah; zero horizontal overflow/browser errors. Desktop fonts remain 28px; no size reduction.
- Representative visual/geometry suite: 80 cases covering Page/Classic, pages 1/2/303/534/535/597/604, five widths, before/after screenshots, ON/OFF and forced-colours. All passed. Page 534 Classic desktop line geometry unchanged; Page 535 centered natural gaps; current Page/mobile geometry and reading pixels unchanged.
- Desktop contact sheet and page 535 normal/forced-colour screenshots visually reviewed. No content clipping seen.
- All data/source/palette/rendering code unchanged, verified diff scopes. No quran/reader.js changes.
- Milestones 0–9 VERIFIED for reproduced conditions. Exact user PC setup is a known unconfirmed limitation; production normal Tajweed already correct before patch. No fabricated claim of a confirmed PC setup.
- Release milestone 10 IN PROGRESS: implementation commit/push next, production deployment/smoke pending.
