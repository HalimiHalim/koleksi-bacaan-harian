# V2.4 Tajweed Colour Layer progress

## Repository state

- Working repository: `/Users/halimi_hanim/.codex/worktrees/v2-4-tajweed/Islamic App` (isolated managed worktree).
- Branch: `codex/v2-4-tajweed`.
- V2.3 protected baseline: `f178539e51dc2d869f33ce4ffcc1ca0e3658032c`. The local remote-tracking ref initially showed `1e69741`; a fresh `git ls-remote` and fetch found three newer V20 commits, and this isolated branch was fast-forwarded before implementation.
- Implementation HEAD at production verification: `900edfd8f50b41337efd723a5ea86dfbb9738a56`. `origin/main` and `git ls-remote` matched this hash. This ledger is being updated in a follow-up record-only commit; inspect `git log -1` for the final record HEAD.
- This worktree was clean before this ledger. Original user checkout at `.../My Drive/AI Workspace/Islamic App` is on `main` at `5b6ea69`, 19 commits behind `origin/main`, with pre-existing edits to `index.html`, `service-worker.js`, and untracked `fonts/`. Preserve it.
- Production URL: `https://koleksi-bacaan-harian.vercel.app/`. V2.4 deployment for `900edfd` is Production `success`/Ready (`https://vercel.com/halimi-dashboard/koleksi-bacaan-harian/CTZfEiuz2FwpwR2R4WAphdcLCKDb`). The live V24 index, service worker, reader CSS/JS, Quran pages 001/535 and Tajweed pages 001/535/604 matched local files byte-for-byte. Live browser smoke passed.
- Files changed in this worktree: `CODEX_PROGRESS_V2.4.md`, `index.html`, `quran/SOURCES.md`, `quran/reader.css`, `quran/reader.js`, `service-worker.js`, `quran/tajweed/` (generated page annotations, report, documentation), `tools/build_tajweed_annotations.py`, and `tools/tajweed-source/` (pinned upstream snapshots). No existing Quran text, page JSON, surah JSON, navigation or unrelated module file has been edited.
- Commit: `900edfd8f50b41337efd723a5ea86dfbb9738a56` (implementation). Push to existing `origin/main`: VERIFIED. Vercel Production deployment: success. Production smoke test: VERIFIED. A ledger-only closeout commit will follow; it changes no application asset.

## Baseline architecture and checks

- Static HTML PWA. Quran assets: `quran/chapters.json`, `quran/surah/*.json`, `quran/pages/*.json`, `quran/verse-pages.json`.
- List View Arabic is Tanzil Uthmani v1.1. Page View uses QCF4-derived word and line layout; these are distinct Unicode representations. Both are authoritative and must remain unchanged.
- Page rendering and Quran state: `quran/reader.js`. Page styles: `quran/reader.css`. Reader state uses `localStorage` key `uwa-quran-reader-v1` for last position and bookmarks. Page lines are rendered as word spans plus separate end, sajdah, quarter, heading and basmalah elements.
- Service worker: `service-worker.js`, cache `uwa-bacaan-harian-v20-v2-mark-3-madd`, network-first navigation and cache-first assets. Existing source/data checks: `tools/verify_quran_data.py`.
- V20 maps the complete authoritative Tanzil Uthmani v1.1 text onto QCF page positions; intro basmalahs are separate. `python3 tools/verify_quran_data.py` passes 114 surahs, 6,236 verses, 111 separate basmalahs, all source madd marks, 604 pages and 15 sajdah signs.
- Current milestone: **13 — git and deployment VERIFIED**. First incomplete milestone: none.

## Milestones

| # | Milestone | Status | Evidence / next check |
| --- | --- | --- | --- |
| 0 | Baseline audit | VERIFIED | Branch, hashes, clean isolated worktree, pre-existing original edits, data/render/settings/cache architecture inspected. |
| 1 | Tajweed dataset audit | VERIFIED | Selected cpfair under CC BY 4.0, with strict fail-safe alignment. Quran Foundation requires approved API or written content license; Mushaf-Learning has no annotation data. |
| 2 | Text and alignment verifier | VERIFIED | Full 6,236-verse and 604-page deterministic report; 59,253 exact mapped annotations, 804 individually reported omissions, 273 conflicting graphemes plain, zero silent shifts. Word ordinal checks added after the initial report. |
| 3 | Tajweed data model | VERIFIED | Separate 604 page annotation JSONs, 2017 source snapshot and generator, page hash and source provenance; authoritative text hash fixed. |
| 4 | Tajweed renderer | VERIFIED | Exact token reconstruction, 21 representative browser combinations, 1,208 ON page renders and mismatch fallback pass. |
| 5 | Soft Khazanah palette | VERIFIED | Light palette adjusted after screenshot/contrast inspection; all groups ≥4.8:1 against Warm Sepia surface. Midnight page 535 inspected, no clipping/overflow. |
| 6 | Settings and persistence | VERIFIED | Page View OFF/ON, default OFF, `uwa-quran-tajweed-v1` localStorage, live toggle and reload persistence passed local browser test. |
| 7 | Full data validation | VERIFIED | Existing Quran verifier passes; pinned V2.3 text/page bundle SHA-256 assertions, all generated annotations and 48,971 annotated tokens reconstruct exactly. |
| 8 | Visual and responsive validation | VERIFIED | Pages 1, 2, 303, 416, 535, 597, 604 at 320/390/1280px plus pages 27, 177, 254 after stricter alignment; 604 pages at 320 and 390px, 1,208 text/overflow checks. Representative screenshots inspected, including Midnight. Physical Safari remains untested. |
| 9 | Runtime and performance regression | VERIFIED | Page 535 OFF 206 sheet descendants, ON 348 (142 colour spans). Ten local 390px toggle pairs averaged 122 ms OFF and 125 ms ON including browser action/wait overhead; OFF made no annotation requests, ON made 10. Page navigation passed in 1,208-page sweep. |
| 10 | PWA, offline and cache | VERIFIED | V24 service worker caches new shell assets and on-demand annotation pages. Offline ON reload succeeded; V20→V24 upgrade fixture deleted old cache, loaded ON online/offline with no errors. Hash mismatch displays plain original text. |
| 11 | Security, privacy and license | VERIFIED | No keys/secrets found in changed code/data scan; no analytics, accounts or remote runtime API. CC BY 4.0/Tanzil credits in Quran library and repository documentation. Text inserted with `textContent`; colour class comes from a fixed allowlist. |
| 12 | Final quality gate | VERIFIED | `node --check` reader/SW and all four inline scripts; existing Quran verifier; annotation generator `--verify`; 604 generated files and nine SW shell assets present; `git diff --check`; browser, offline, upgrade and responsive checks pass. |
| 13 | Git and deployment | VERIFIED | Implementation `900edfd` committed from clean staged V2.4 diff, pushed by fast-forward to `origin/main`, remote hash confirmed; Vercel Production success and live browser/asset smoke pass. Ledger-only closeout record pending commit/push. |

## Dataset and alignment findings

- Selected source: **cpfair/quran-tajweed**, commit `496f71c`, annotation data CC BY 4.0; older Tanzil source text is for mapping only. Authoritative V20 text and page data stay unchanged. The annotation model has half-open Unicode code-point offsets into 2017 verse strings. No runtime API is required.
- Candidate: `cpfair/quran-tajweed`, CC BY 4.0 annotation JSON (5,578,730 bytes, 60,057 annotations across 6,236 verses), Unicode code point ranges against a circa-2017 Tanzil text (1,376,504 downloaded bytes); project notes that current Tanzil encoding differs and it is no longer maintained. Source revision `496f71cd191da00fa2a37ded79dbbddb033bb0ad`; source SHA-256 JSON `151d616ad37a4cc21a80f20d5e1104c5b408375107ddd4d71247dea4c05ebf67`, downloaded CRLF text `abe6447a5d29bb126383ba9120628060cf96dc9ef5b402a506fc251f6ed0b9a2`, vendored LF/trimmed-text hash `c2bfd907f3d353fc9fb27063da5ed471c65717c91b830843880d83eae971c65f`. Quran code points and copyright notice words are unchanged by line-ending/space cleanup. Full compatibility audit is complete; omissions are documented.
- Candidate: Quran Foundation `text_uthmani_tajweed`, embedded markup; API documentation exists, but connected-app policy requires approved endpoints or written license for hosted copies, so offline redistribution is unresolved.
- Candidate: `Mushaf-Learning/quran-tajweed`, repo states MIT but says primary annotations derive from CC BY 4.0 `cpfair`; its `annotations/` directory contains only `.gitkeep`, so there is no dataset to vendor.
- The V20 page words are source-aligned but split across page positions and omit the intro basmalah from verse words. Against cpfair's 2017 text, only 1,890 of 6,236 current source verses are byte/codepoint exact. NFC does not increase this count. Strict Unicode equal-block **and word-ordinal** alignment maps 59,253 of 60,057 annotations; 773 touch changed text or inserted pause signs and 31 lie in three verses with changed word boundaries. No annotation will be rendered on guessed offsets.
- The report finds 4,346 changed source verses and 678 verses with omitted annotations; 2017 text has 2 pause signs and 495 tatweel characters versus V2.3's 4,366 and 6,848. Every omitted range is enumerated by verse, rule and code-point offsets. The page renderer validates a SHA-256 of the live page token text before colouring, and falls back to plain text on any mismatch.
- The first local browser pass checked 21 width/page combinations (320, 390, 1280px × 7 pages), exact OFF/ON text, no overflow or page errors, and persistence after reload. At 390px page 535, OFF has 206 DOM descendants within the sheet and ON 348; toggle to colour completed in 159 ms including a 50 ms test wait. Other tested pages ranged 32–142 coloured spans.
- Full ON-mode page sweep: all 604 pages at 320px and 390px (1,208 renders), every page word compared exactly with V2.3 JSON, zero overflow and zero page errors. Pages 27, 177 and 254 (the three changed-word-boundary verses) also passed targeted OFF/ON tests at 320, 390 and 1280px. A mismatched annotation file was deliberately supplied on page 2; the reader showed exact plain page text with an availability message.
- Local PWA test: one-page ON assets cached and reopened offline with preference retained. Separate V20 fixture upgraded to V24; V20 cache removed, V24 loaded and worked online then offline, no page errors. Ten local page-535 toggle pairs at 390px averaged 122 ms OFF and 125 ms ON; these are headless Chromium timings including browser-action overhead.
- Light colours were darkened after inspecting pages 1, 535 and 597 and calculating contrast against the existing page surfaces: Madd `#4F86C6 → #3A6FA9`, Ghunnah `#4E9F78 → #347B59`, Ikhfa `#8B72B8 → #70559C`, Idgham `#C85C8E → #A74373`, Iqlab `#D99545 → #98611F`, Qalqalah `#C95B5B → #A93F3F`, Silent `#92969D → #686D75`. All are at least 4.8:1 against Warm Sepia. Midnight has a separate lighter mapping.
- Production smoke: actual HTTPS site at 320, 390 and 1280 CSS px loaded Page View with default OFF; ON coloured source-identical Arabic, persisted through reload, and page 1→2 navigation worked. Font loaded, no overflow or browser console/page errors. The 390px page 2 screenshot was visually inspected. Live file hashes matched local for nine representative application/data files. Production service worker cached page 1 and its Tajweed asset; a forced offline reload kept ON and showed colours with no console errors. The V20→V24 upgrade was tested in a local same-origin fixture.

## Known issues

- The original checkout is older and dirty; all work must remain in this worktree.
- 804 source annotations cannot be safely transferred because their code-point ranges touch changed text/inserted pause signs or changed word boundaries. They remain plain; this is documented, not silently shifted. The upstream source is not actively maintained.
- Physical iPhone Safari has not been tested. Chrome/Chromium at matching CSS widths, including all pages at 320 and 390px, is the available visual evidence.

## Candidate audit summary

| Candidate | Rights and shape | Size / offline fit | Text compatibility and maintenance |
| --- | --- | --- | --- |
| [cpfair/quran-tajweed](https://github.com/cpfair/quran-tajweed) | CC BY 4.0 JSON, 18 rule categories, half-open Unicode code-point ranges against circa-2017 Tanzil Hafs text | 5.58 MB annotations + 1.38 MB source text; local derivative page files total ~1.75 MB and are fetched on demand | 1,890/6,236 verses exact to V2.3; strict alignment maps 59,253/60,057 ranges. Not actively maintained. **Selected with omissions and verifier.** |
| [Quran Foundation text_uthmani_tajweed](https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/quran-verses-uthmani-tajweed/) | Embedded Tajweed tags in API verse strings; connected-app policy requires approved endpoints or written license for hosted copies | Paginated network API, no cleared local redistribution; runtime dependence conflicts with offline-first PWA | Exact V2.3 alignment not established, and content/API terms block vendoring without license. |
| [Mushaf-Learning/quran-tajweed](https://github.com/Mushaf-Learning/quran-tajweed) | Repo says MIT but cites cpfair CC BY 4.0 as annotation source; intended per-surah character ranges | `annotations/` contains only `.gitkeep` (zero data bytes) | No actual annotation data to verify or vendor; inherited attribution would still apply. |
