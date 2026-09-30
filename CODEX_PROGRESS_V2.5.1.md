# V2.5.1 — Classic Quran View + Marker Containment

Date: 2026-09-30 (Asia/Kuala_Lumpur).

## Baseline
- Repository: /Users/halimi_hanim/.codex/worktrees/v2-4-tajweed/Islamic App
- Branch: codex/v2-5-1-classic-quran
- Baseline HEAD and freshly fetched origin/main: 2e2730d859bdd7eeee898bf2310d91c1c3b2599b. Initially clean; original older dirty Google Drive checkout preserved untouched.
- Existing Vercel Production reports success/Deployment completed for baseline; URL https://koleksi-bacaan-harian.vercel.app/. HTTP index/SW/reader JS/CSS byte equality independently verified.
- Reader: List with selectedChapter adapter; current Page continuous inline RTL 32px; independent Simple verse-level Page path. Existing state uwa-quran-reader-v1 (mode/script/last/bookmarks), separate Uthmani preference uwa-quran-tajweed-v1. Existing SW cache uwa-bacaan-harian-v25-quran-scripts; reader ?v=25.
- Current marker: inline-grid medallion with inline 2px margins, before ornament inset -2px, paired with preceding token in nowrap quran-verse-end-pair. Text/token wrappers unchanged before diagnosis.

## Historical audit
- V2.4 implementation 900edfd; final pre-V2.4.1 history dfe8256 (parent of 2b24720). Final pre-V2.4.1 hash dfe8256ecb2d09702b176f7508ccdf545b31647f; implementation 900edfd8f50b41337efd723a5ea86dfbb9738a56. V2.4.1 2b24720 removes fitter, 28→32px and nowrap flex-line layout→wrap. V2.4.2 a6b7fae supplies modern continuous flow.
- Historical fitting starts at 28px, reduces all ordinary lines together by .5px to minimum 11px until scrollWidth ≤ clientWidth +1; headings/basmalahs start min(24,size+2), reduce by 1px to historical lower bound. Invoked after render by rAF and fonts.ready; ResizeObserver observes reader root.
- Historical ordinary lines are QCF groups: nowrap RTL flex, space-between, baseline alignment, gap .12em, min-height/line-height 1.95em. Structural lines centered; sparse (<100 words) centered with .28em gap and 1.55 line-height. <=360px gap .07em. Mobile sheet flex column space-between, same historical min-height and 10px/9px padding, horizontal overflow auto (actual overflow to be tested).
- V2.4 and V2.5 verifiedTajweed / appendTajweed helpers are byte-identical. Existing exact [lineIndex,itemIndex] lookup and original page SHA remain valid with historical DOM; no annotation remapping required. Preserve current palette.
- Plan: separate Classic panel/sheet and quran-classic-line DOM; selectively reuse historical renderer/fitter/CSS. Keep modern Page/List untouched. Simple disables Classic; clean existing state remembers last Uthmani mode and automatically falls back to Page on Simple.

## Milestones
| # | Task | Status |
|---|---|---|
| 0 | Baseline audit | VERIFIED |
| 1 | Historical V2.4 audit | VERIFIED |
| 2 | Classic renderer | VERIFIED |
| 3 | Classic historical fitting | VERIFIED |
| 4 | Settings UI | VERIFIED |
| 5 | Script/mode compatibility | VERIFIED |
| 6 | Tajweed compatibility | VERIFIED |
| 7 | Marker diagnosis | VERIFIED |
| 8 | Marker decision | VERIFIED |
| 9 | Current Page full regression | VERIFIED |
| 10 | Classic full validation | VERIFIED |
| 11 | Safari safety | VERIFIED |
| 12 | Persistence | VERIFIED |
| 13 | Quran data regression | VERIFIED |
| 14 | PWA/offline | VERIFIED |
| 15 | Final quality gate | VERIFIED |
| 16 | Git/deployment | IN PROGRESS |

## Work / release status
- Changed: index.html, quran/reader.js, quran/reader.css, service-worker.js, new Classic browser verifier, validation report and this ledger. No Quran data, Tajweed annotations, font or license changes.
- Milestones 0–15 VERIFIED. First incomplete milestone: 16 (Git/deployment). No implementation commit/push/deploy yet.
- Last verified milestone: 15. Marker decision: **Deferred to avoid Page View wrapping regression.**
- On interruption preserve all work; inspect branch/status and read this complete ledger, compare actual state, resume first incomplete milestone only. Never reset/discard/overwrite valid work or commit/push/deploy unverified changes.

## Classic implementation checkpoint
- Recovered historical renderer/fitter selectively, renamed to separate Classic panel/sheet/line DOM. Current Page renderer body and both Tajweed helpers remain untouched. CSS selectively restores QCF line layout and fitting only in Classic; current palette inherited unchanged.
- Existing state gains uthmaniMode; mode enum includes Classic; Simple disables it. Classic→Simple preloads source then falls back Page on same page; Uthmani return restores Classic. Invalid persisted Simple+Classic normalized to Page.
- Changed implementation: quran/reader.js, reader.css, index.html, service-worker.js. No data/source/font/license edits. Fitter triggers rAF/fonts.ready/ResizeObserver only while Classic active.
- Milestones 2–6 IN PROGRESS; browser validation pending. Marker baseline diagnosis running, no containment fix made. No commit/push/deploy.

## Marker decision — deferred
- Baseline scan all 604 Uthmani pages at 320/390: no marker/glyph/wrapper/frame crossing in Chrome, zero horizontal overflow. Uses medallion border + computed ::before paint bounds and canvas text ink overhang, not scrollWidth alone. Minimum frame clearance ~1.54px (320) / ~2.43px (390). Pages 420/537 have no escaped marker at either width; closest observed nodes are normal words with ~4px clearance.
- Inspected medallion: 15px ordinary/18px three-digit, 2px inline margins, pseudo ornament inset -2px; nowrap end pair keeps preceding token with marker. Potential WebKit line-edge/ink differences remain unproven; no supplied screenshot was attached to identify exact physical offender. **Root cause not established**, no claim it is an ayah medallion.
- Decision: **Deferred to avoid Page View wrapping regression.** No marker CSS, padding, font, grouping, token order or spacing changed. Before captures and marker-baseline.json in /Users/halimi_hanim/Projects/Islamic-App-QA-V2.5.1. After equality checks pending. Milestones 7/8 VERIFIED as diagnosis + explicitly allowed defer outcome.

## Completed quality gate
- Modern Page: 604 × 3 widths (320/390/1280) × Uthmani OFF/ON + Simple = 5,436 renders. Zero text mismatch, horizontal overflow or browser errors; modern 32px right-aligned continuous flow preserved.
- Classic: 604 × 3 widths × OFF/ON = 3,624 renders. Exact QCF grouped token/heading/basmalah order, all markers, exact annotation span classes and Unicode text; zero overflow/errors. Ordinary fitted ranges: 11.5–22.5px at 320, 14–26px at 390, 28px desktop. No Quran content clipping found.
- Historical comparison against actual 900edfd fixture: all line/child relative rectangles, fonts, gaps, alignment and sheet dimensions exactly equal in 30 cases (10 pages × 3 widths). Representative pages 1,2,303,420,531,534,535,537,597,604 reviewed in screenshots.
- Modern Page before/after: exact relative DOM geometry, text and palette AND pixel-identical sheet screenshots in 20 cases (same 10 pages × 320/390). Marker issue unchanged; baseline all-page marker ink/ornament scan found no crossing.
- Current renderPage/renderSimplePage and verifiedTajweed/appendTajweed bodies byte-identical to V2.5. Classic mapping requires no remapping.
- Settings and interactions passed 320/390/1280: Uthmani List/Page/Classic, disabled Simple Classic, same-position fallback/restoration, selected ayah, List behavior, reload, invalid saved Simple+Classic normalization, clean console. Classic button ≥80.67×42px at 320.
- Fresh PWA and V2.5→V2.5.1 upgrade passed. Single new cache; old cache removed; offline List, Page, Classic OFF/ON, cached Simple Page, preserved bookmarks/settings and new-tab Classic reopen. Initial Chrome offline load-event wait timed out; repeated using DOMContentLoaded confirmed cached document readiness without app changes.
- Syntax: reader, service-worker, Classic verifier and all four inline scripts passed. git diff --check passed.
- Quran verifier passed: 114 surahs / 6,236 verses / 604 pages / 15 sajdah. Its existing console says 111 separate basmalahs; actual authoritative introduction set has 112, independently asserted by script verifier. No verifier/source changes.
- Tajweed verifier passed: 59,253 exact mapped annotations; existing 804 skipped ranges and 273 conflicting graphemes remain plain and unchanged. Script verifier passed both scripts, exact immutable Simple, 112 intro basmalahs and 604 mappings.
- Safari safety: exact historical simple flex/fitter restored only in Classic, modern inline RTL preserved. Physical iPhone/Safari was unavailable; Chrome phone-size validation is not a physical Safari claim.
- Evidence: /Users/halimi_hanim/Projects/Islamic-App-QA-V2.5.1 (JSON reports, before/after and historical/current screenshots). No remaining implementation quality gate.
