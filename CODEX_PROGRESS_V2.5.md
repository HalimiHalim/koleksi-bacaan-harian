# V2.5 — Quran Script Options progress

Date: 2026-09-30 (Asia/Kuala_Lumpur).

## Repository and baseline
- Repository: /Users/halimi_hanim/.codex/worktrees/v2-4-tajweed/Islamic App
- Branch: codex/v2-5-quran-scripts
- Baseline/current precommit HEAD and fetched origin/main: c3daddc788c3ee4f054885ed5eeb40eaacf115fc.
- Protected V2.4.2 implementation: a6b7faedba9d66ee9852879dac14a533705b36e6.
- Original Google Drive checkout at 5b6ea69 has index/SW modifications and untracked fonts, preserved untouched. V2.4.2 worktree was clean before the initial two audit documents.
- Existing production: https://koleksi-bacaan-harian.vercel.app/. Baseline HTTP index/SW/reader JS/CSS byte equality was verified; GitHub Vercel status for baseline independently reports success/Deployment has completed.

## Resume and product decision
- Initial session completed milestone 0; stopped during milestone 1 before vendoring due unresolved IndoPak data/font redistribution rights.
- On resume branch/status/HEAD and both complete ledgers were read; only the two audit documents existed. Valid prior work preserved. Work resumed at milestone 1 without repeating VERIFIED baseline audit.
- User explicitly selected Uthmani + Simple fallback. IndoPak deferred due to unresolved dataset-specific redistribution licensing. No IndoPak assets, implementation code, runtime requests or UI are included. Future V2.5.1 only on a separate request.

## Sources, Unicode, fonts and architecture
- Uthmani: protected Tanzil Uthmani v1.1, QCF-derived 604-page source and CPF annotation layer unchanged; exact Page renderer body retained apart from one script route. Baseline wrapping/palette untouched.
- Simple: Tanzil Simple Imla’ei v1.1 with diacritics; publisher download on 2026-09-30 with pause marks, sajdah and tatweel enabled, rub signs disabled. Raw snapshot SHA-256 c8c2ea9e004cf3f4b7afc5ba00de859556f4ed09bd9cf5d1bc79e877406ef678. CC BY 3.0 + publisher verbatim/attribution/link/full-notice terms. Complete copyright notice in raw and every derived surah file; full verse text unchanged.
- Actual 112 separate intro basmalahs; Al-Fatihah 1:1 numbered, surah 9 absent; source initial shadda in 95/97 preserved. Baseline verifier's “111” printed count is a typo, while its asserted set and assets contain 112. Protected verifier untouched. All 15 sajdah signs and source pause marks retained, no embedded ayah-end digits/symbols.
- Font: existing 307,592-byte Noto Naskh Arabic variable TTF, SIL OFL 1.1. Font cmap covers all 55 Simple corpus code points. Added font bytes zero; unrelated typography unchanged.
- List: selectedChapter adapter supplies actual script text with original identity/translation; switching updates text in place and restores scroll anchor without full app reload.
- Page: Simple whole verses follow existing verse-pages/end-marker assignment, structural headings/basmalahs and themed ayah markers; continuous RTL right-aligned 32px flow. No QCF word segmentation/quarter-marker projection onto Simple.
- Persistence: validated script field on existing uwa-quran-reader-v1; default uthmani. Separate existing uwa-quran-tajweed-v1 preference preserved; Simple disables control and renders plain; Uthmani ON returns.
- Offline: cache uwa-bacaan-harian-v25-quran-scripts; shell reader URLs ?v=25, lazy per-surah script chunks cached as visited, maximum eight Simple chapters in JS memory. Baseline PWA architecture otherwise retained.

## Milestones
| # | Task | Status | Evidence |
|---|---|---|---|
| 0 | Baseline audit | VERIFIED | Previously verified; resume inspected branch/status/ledger/audit; fetched remote unchanged. |
| 1 | Script dataset audit | VERIFIED | Tanzil Simple v1.1 publisher snapshot/license; IndoPak excluded by user decision. |
| 2 | Verse identity alignment | VERIFIED | Both scripts 114/6236; exact identities/order, zero missing/duplicates/extra. |
| 3 | Basmalah / special text | VERIFIED | 112 actual intro basmalahs, 95/97 shadda retained, 15 sajdahs, waqf/Unicode/end-symbol audit. |
| 4 | Font audit | VERIFIED | All 55 Simple code points covered by existing Noto Naskh SIL OFL; zero new fonts. |
| 5 | Script data model | VERIFIED | Existing reader state.script defaults Uthmani; central lazy adapter; eight chapter memory cache. |
| 6 | List support | VERIFIED | Full 114-surah List sweep both scripts; translations, numbering/bookmarks unchanged; mobile switching passes. |
| 7 | Page support | VERIFIED | All 604 end-marker mappings; separate whole-verse Simple flow. Uthmani body unchanged except routing. |
| 8 | Settings UI | VERIFIED | Only Uthmani / Simple Arabic; pressed states, disabled Tajweed note, 320px settings inspected. |
| 9 | Live switching | VERIFIED | Both modes and three widths, immediate switch, position/context/bookmarks/translations preserved; rapid cancellation passes. |
| 10 | Tajweed interaction | VERIFIED | Uthmani OFF/ON; Simple has zero coloured spans; saved Uthmani ON restored. |
| 11 | Persistence | VERIFIED | Settings close, navigation, mode switch, reload and new-tab offline reopen preserve Simple; fresh default Uthmani. |
| 12 | Full Quran validation | VERIFIED | Both full corpora pass; exact immutable raw/derived bytes, complete notices, zero unexpected Unicode. |
| 13 | Full page validation | VERIFIED | 5436 renders: 604 × 3 widths × (Uthmani OFF/ON + Simple); no overflow/clipping/error/text mismatch. |
| 14 | Visual checks | VERIFIED | 48 representative captures + 6 settings; 24 same-driver Uthmani screenshot pairs pixel-identical to V2.4.2. |
| 15 | Performance | VERIFIED | Five-run local baseline/V2.5 sample; default zero Simple requests; 5.8ms cold/15.6ms warm medians; report saved. |
| 16 | PWA/offline | VERIFIED | Fresh install and V2.4.2 upgrade; single v25 cache, Simple/Uthmani offline Page/List and new-tab reopen pass. |
| 17 | Security/license | VERIFIED | No new APIs/keys/tracking/scans/fonts; CC BY 3.0 publisher terms, source notice in raw and every chunk. |
| 18 | Final quality gate | VERIFIED | Syntax (reader/SW/browser tool/four inline scripts), all verifiers, responsive/interaction/offline/console/diff/source review pass. |
| 19 | Fallback decision | VERIFIED | User-approved Uthmani + Simple; IndoPak deferred due unresolved dataset redistribution licensing. |
| 20 | Git/deployment | IN PROGRESS | Local quality gate complete; Implementation commit 63ffe4e885eb5de8bf1240d79fcfe73c8573552a exists locally; push/deployment/smoke pending. |

## Validations and artifacts
- Machine report: tools/v2.5-validation-report.json. Immutable data/alignment report: quran/scripts/script-alignment-report.json.
- Sources/licenses and exact packaging: quran/SOURCES.md and V2.5_SCRIPT_DATA_AUDIT.md.
- Screenshots and raw browser results preserved at /Users/halimi_hanim/Projects/Islamic-App-QA-V2.5 (source capture directory /private/tmp/v25-qa).
- Added Simple bytes: raw 1,353,105 + derived chunks 1,508,826 + alignment report 67,743 = 2,929,674 bytes in repository; runtime chapter maximum 107,302 bytes, chapter 1 1,836 bytes. No source/report full-Quran startup download. Reader JS +8,499 uncompressed bytes.
- Local five-run median navigation: 125ms baseline / 136ms V2.5; default Page 1 DOM 54 nodes both; heap ~3,958,586 / 3,979,652 bytes (small local sample, not universal performance guarantee). Simple Page 1 DOM 32; all-page maximum DOM 166 versus Uthmani 253 OFF/378 ON.

## Files, limitations and release state
- Modified: index.html, service-worker.js, quran/reader.js, quran/reader.css, quran/SOURCES.md.
- New: this ledger, V2.5_SCRIPT_DATA_AUDIT.md, FINAL_REPORT_V2.5.md, raw Simple, 114 Simple chapter JSON, alignment report, tools/build_quran_scripts.py, tools/verify_quran_scripts_browser.cjs, tools/v2.5-validation-report.json.
- No authoritative Uthmani assets, fonts, QCF data, translations, Tajweed annotations/mapper/palette, unrelated Home/Zikir/Doa/Selawat or existing verifiers changed.
- Limitations: offline requires visiting applicable Quran assets online first; Simple page layout is whole-verse flow on existing page identities, not printed-word pagination; no Simple Tajweed; no IndoPak; physical iPhone Safari unavailable, browser tests used desktop Chrome at 320/390/1280. Optional previews omitted to keep compact settings.
- Last VERIFIED milestone: 19 (all 0–19 VERIFIED). First incomplete milestone: 20.
- Implementation commit: 63ffe4e885eb5de8bf1240d79fcfe73c8573552a (local only). Push: pending. Deployment: existing V2.4.2. Scoped source whitespace policy/release record correction pending commit.
- Resume: inspect branch/status, read this whole ledger, compare actual files/evidence; preserve valid work, resume first incomplete milestone; rerun only evidence that cannot be proven. Never reset/discard or commit/push/deploy unverified work.

## Resume during release gate
- User continuation: inspected branch/status, full ledger and actual log. Implementation commit 63ffe4e exists and worktree initially clean; ledger's precommit wording was stale. All browser/data artifacts remain present and app assets unchanged since verified tests. Resume milestone 20 only.
- Staged diff --check flagged seven trailing spaces in the publisher's original copyright notice; the shell command continued to the local commit. No push occurred. Preserve immutable source bytes and scope `.gitattributes` blank-at-EOL exemption only to that pinned raw snapshot; retain whitespace checks for every implementation/generated file. This corrects the release gate without changing Quran/source notice.
