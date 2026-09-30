# V2.4.2 progress — Quran Page Flow / Wrapping Refinement

## Baseline audit — 2026-09-30

- Branch: `codex/v2-4-2-quran-flow`, created from clean V2.4.1 final HEAD.
- Baseline HEAD and `origin/main`: `30314c003ec46ad9f0a47e5383c62159ba11a638`.
- Working tree before this ledger: clean. V2.4.1 Production status: Vercel success/Ready at `https://koleksi-bacaan-harian.vercel.app/`.
- Current renderer: `quran/reader.js` creates one `.quran-page-line` `div` per QCF source line, then places individual word, end marker, quarter and sajdah spans inside it. `quran/reader.css` gives each line `display:flex; flex-wrap:wrap; justify-content:flex-start; font-size:32px; line-height:1.85`. Each independent flex container forces a break after its last token, even when the visual row has room for words from the next QCF line. `.is-compact .quran-page-line` changes `justify-content` to `center`, causing mixed alignment. This explains the physical iPhone gaps and centered rows.
- Page data audit across all 604 JSON files: 77,433 word tokens, 6,236 end markers, 199 quarter markers, 15 sajdah markers, 114 surah headers, 112 separate `bismillah` line tokens. Header and basmalah lines each contain one token and are structural boundaries. Quarter, sajdah and end markers occur within ordinary text lines and must stay inline in sequence.
- Tajweed renderer uses stable `[lineIndex,itemIndex]` annotation lookup and exact page text hash. Individual word spans can be retained while replacing only their parent layout. Tajweed data, annotation builder, palette and settings are out of scope.
- V2.4.1 CSS defaults: 32px Page View Arabic, line-height 1.85; mobile mushaf page is a flex column with minimum viewport height. No JS auto-fit.

## Milestones

| # | Task | Status | Evidence / remaining work |
|---|---|---|
| 0 | Baseline audit and diagnosis | VERIFIED | Architecture, all token types, structural boundaries, production state, clean branch recorded above before code edits. |
| 1 | Continuous RTL flow prototype | VERIFIED | Ordinary words from consecutive QCF lines now enter one inline flow block; original token elements and `[lineIndex,itemIndex]` Tajweed lookup remain intact. Representative OFF/ON word arrays match source. |
| 2 | Structural boundaries | VERIFIED | Header and basmalah create separate blocks and restart flow. Quarter, sajdah and end markers stay inline; end markers are paired with the preceding token to avoid orphan medallions. Representative heading/marker counts pass. |
| 3 | Alignment and spacing | VERIFIED | Body flow is `direction:rtl; text-align:right`, 32px, line-height 1.8. Browser inline wrapping replaces nested flex line wrapping. Frame/padding unchanged. Special heading/basmalah blocks remain centered. |
| 4 | Representative iPhone widths | VERIFIED | Pages 1, 2, 303, 531 (Ar-Rahman), 534 (Al-Waqi'ah), 535, 597, 604 at 320/390/1280: exact OFF/ON word arrays, 32px, no overflow or browser errors, screenshots in `/private/tmp/v242-page-*-*.png` inspected. Page 534 at 320px: rows with >40% unused width 6→3; page 535 12→0; page 303 12→1. At 390px: page 534 9→1; page 535 3→0; page 303 5→1. |
| 5 | Full 604-page OFF/ON sweep | VERIFIED | All 604 pages at 320/390 with Tajweed OFF/ON (2,416 renders): exact authoritative word arrays; exact flow, heading, basmalah, end-marker, quarter and sajdah counts; all end markers paired; 32px and right-aligned RTL flow; no horizontal overflow, browser errors or text mismatches. `/private/tmp/v242-allpages.json`. |
| 6 | iPhone-specific CSS safety | VERIFIED | Quran body uses a standard block with inline spans, literal whitespace break opportunities, `direction:rtl` and `text-align:right`; mobile sheet is `display:block`. No RTL flex wrapping, `display:contents`, horizontal auto-scroll or JS fitting. Physical iPhone Safari V2.4.2 remains untested; user can recheck after production. |
| 7 | Fallback decision gate | VERIFIED | Continuous flow is retained. Screenshots show consistent right alignment and materially fewer large gaps, with correct shaping, markers and Tajweed. Full sweep passed; selective V2.4 fallback not required. |
| 8 | Quran and Tajweed regression | VERIFIED | Quran verifier: 114 surahs, 6,236 verses, 604 pages, 111 separate basmalahs, all madd marks, 15 sajdah signs. Tajweed verifier: 59,253 mapped, 804 skipped, 273 conflicts plain. Data, annotations, mapper, palette, font family and settings markup unchanged. List↔Page, page next/prev and reader back/reopen passed. |
| 9 | PWA/offline and upgrade | VERIFIED | Cache `uwa-bacaan-harian-v242-quran-flow`, reader URLs `?v=242`. Eight shell assets exist. Fresh offline ON reload passed. Staged V2.4.1→V2.4.2 upgrade removed old cache, restored Page+ON, loaded flow, then reloaded offline with colours and no errors. |
| 10 | Final quality gate | VERIFIED | Reader/SW and four inline scripts syntax, both verifiers, 2,416-render sweep, responsive screenshots at 320/390/1280, navigation, cache upgrade, fresh offline, shell assets, `git diff --check`, data/annotation diff audit and browser console checks pass. |
| 11 | Commit/deploy/production smoke | VERIFIED | Implementation commit `a6b7faedba9d66ee9852879dac14a533705b36e6` fast-forward pushed to existing `origin/main`. Vercel Production deployment `HZ494uBRAeGe1G47wpykBaj7iAD4` completed successfully at `https://koleksi-bacaan-harian.vercel.app/`. Live index/SW/CSS/JS/page 001/page 534/annotation 001/annotation 534 match local SHA-256 hashes. Production browser at 320/390/1280 verified gear, Page/ON persistence, ON/OFF, 32px RTL right-aligned flow, page 534 text, no overflow or errors, and page navigation. 390px production offline page 534 with Tajweed ON passed. This closeout record changes no app assets. |

## Decisions and status

- Intended prototype: keep word and marker elements and Tajweed segment construction unchanged; join ordinary tokens from successive QCF lines into one block of inline RTL content, separated by normal spaces. Flush that block at surah headings and basmalahs. Use native inline line breaking and right alignment.
- Font: retain 32px. No font-family or palette change.
- Fallback status: **not used**; continuous flow passes visual and invariant gates.
- Files changed so far: `quran/reader.js`, `quran/reader.css`, `index.html`, `service-worker.js`, this ledger. No data/annotation files changed.
- Visual findings: continuous right-aligned wrapping uses page width substantially better; no orphan medallion after pairing. Vertical growth remains acceptable. All 604 pages at both phone widths passed OFF/ON. Page 534 and Ar-Rahman page 531 screenshots inspected; page 597 and 604 retain clear structural boundaries.
- Known limitation: physical iPhone Safari was the source of the report but is not available in this automated run. The new layout deliberately uses standard inline/block RTL behavior to reduce engine-specific risk.
- Commit/push/deploy: V2.4.2 implementation `a6b7faedba9d66ee9852879dac14a533705b36e6` pushed to `origin/main`; existing Vercel project Production status success. Final ledger-only record commit changes no app assets; inspect `git log -1` for the final HEAD. Production screenshot evidence: `/private/tmp/v242-production-page534-{320,390}.png`.
