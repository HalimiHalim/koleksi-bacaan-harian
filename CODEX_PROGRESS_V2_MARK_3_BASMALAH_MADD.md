# V2 Mark 3 basmalah and madd progress

- Authorized: apply, local tests, visual QA, commit and production push. Use this checkout only.
- Repository: /Users/halimi_hanim/Projects/Islamic-App
- Origin: https://github.com/HalimiHalim/koleksi-bacaan-harian.git
- Starting SHA: 1e697413c96dc1b4d629fe4eefb8796947c737a3; clean main and fetched origin/main match.
- Phase: remote inspection and patch application VERIFIED; data/syntax validation and visual QA VERIFIED; commit and production push NEXT.
- Branch: codex/v2-mark-3-basmalah-madd.
- Patch expected SHA256: 373ba337b30f81d3cc9943cab77d7b766d411fd44d996457e250f760e144753c.
- Modified files: 604 page JSONs, index.html, Quran reader CSS/JS, SOURCES.md, service worker, build/verifier scripts and this record. Patch checksum and git apply --check passed. Applied commits: none.
- Remaining: apply patch; inspect and validate; iPhone-sized visual checks; commit; normal fast-forward push; production verification.
- Blockers: none.
- Resume: read this record, then git status --short --branch; git log -5 --oneline; git remote -v; git ls-remote origin refs/heads/main. Resume next unfinished phase without reset/clean/force-push.

- Checks: python3 tools/verify_quran_data.py PASS (6,236 verses, 111 basmalas, madd, 604 pages, 15 sajdah); node --check reader.js and service-worker.js PASS; git diff --check PASS. Canonical Arabic source and chapter files unchanged.
- Visual QA: local server http://127.0.0.1:8797; Chromium QA at 320/390/428 CSS px. Script /private/tmp/v2m3-madd-visual.cjs; screenshots /private/tmp/v2m3-madd-qa.

- Independent validation PASS: every source character except layout quarter/sajdah markers matches page words; 5,376 madd marks; 604 page/line/token topologies, verse IDs and ornaments unchanged.
- Visual QA found page 597 had 3 overflowing compact lines at 320px with restored full diacritics. Repair: apply existing <=360px .07em word gap to compact pages too. No Arabic text edits. Repeat QA next.

- Full 604-page sweep: 390px all fit, 320px exposed additional dense-page overflows at existing 13px font floor. Repair: fit in 0.5px steps down to 11px as needed; retain uniform page text sizing, original lines and all Arabic. Full sweep rerun required. Cache test fixture corrected to set bookmark through UI before checking persistence (initial fixture injected storage after state was already loaded).

- Repeated required local QA PASS: 18 surah/page combinations at 320/390/428px; surah 36 separate intro and يسٓ, pages 440/1/604, surahs 9/95/97, correct verse markers, bottom-only RTL navigation, disabled edges, back to library, loaded fonts, no JS errors. Screenshots visually reviewed; madd confirmed at 3x resolution.
- Cache upgrade PASS: V19 -> V20 with restored marks online then offline, saved bookmark/reading position and storage sentinels preserved.
- Final full sweep PASS: all 604 pages at 320 and 390 CSS px (1,208 page renders), zero line/document horizontal overflow. No production push yet.

- Final visual review: List View 36 and separate marked يسٓ, Page View 440, Al-Fatihah page 1, At-Tawbah page 187 without intro, distinct basmalas 95/97 on 597/598, three compact surahs on 604; dense page 507 also inspected at 320px/2x. Font loaded before captures; no clipping or overlaps observed. Physical iPhone Safari not tested.
- Latest git diff --check and JS syntax PASS; only specified checkout changed.
- Exact next command: git add index.html quran/pages quran/reader.css quran/reader.js quran/SOURCES.md service-worker.js tools/build_quran_data.py tools/verify_quran_data.py CODEX_PROGRESS_V2_MARK_3_BASMALAH_MADD.md && git commit -m "Restore Quran basmalah and full Uthmani marks". Then fetch, fast-forward main, normal push, and verify live bytes/deployment.
