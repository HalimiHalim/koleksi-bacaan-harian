# V2 Mark 3 basmalah and madd — completed

## Authorization and repository
- Authorized by user: apply, test locally, perform specified visual QA, commit, push and verify production; use only /Users/halimi_hanim/Projects/Islamic-App. Other workspace with uncommitted changes was preserved.
- Origin: https://github.com/HalimiHalim/koleksi-bacaan-harian.git
- Starting clean main / origin/main: 1e697413c96dc1b4d629fe4eefb8796947c737a3.
- Implementation: 29984125e4497b9911057b1bb5fe2292e62feaf9, created on codex/v2-mark-3-basmalah-madd, fast-forwarded to main and pushed normally. git ls-remote confirmed exact SHA. Never reapply or recommit this patch.
- Supplied patch SHA256 verified: 373ba337b30f81d3cc9943cab77d7b766d411fd44d996457e250f760e144753c; git apply --check passed.

## Implementation and validation
- Changed: 604 page JSONs, index.html, Quran reader CSS/JS, SOURCES.md, service worker V20, data build/verifier scripts and this progress record.
- Top page controls removed; bottom next-left / previous-right controls and library back button retained.
- Separate unnumbered intro basmalah for all applicable surahs; Al-Fatihah remains ayah 1; At-Tawbah has no intro. Canonical source and surah Arabic/translation files unchanged.
- Full bundled Tanzil Uthmani text mapped onto existing QCF page word positions, preserving page/line/token counts, verse ornaments, verse IDs and 15 sajdah signs.
- Narrow-phone repairs found by visual QA: compact pages use existing .07em gap at <=360px; font fitting uses 0.5px steps down to 11px only as needed for dense full-mark text. No Arabic text manually edited.
- PASS: python3 tools/verify_quran_data.py, node --check quran/reader.js, node --check service-worker.js, git diff --check.
- Independent source-character comparison PASS: 6,236 verses and 5,376 madd marks; all 604 page/line/token topologies and non-word ornaments preserved.
- Chromium local QA PASS at 320/390/428px: List/Page Views surahs 36, 1, 9, 95, 97, 112; pages 440, 1, 187, 597, 598, 604; navigation 440 -> 441 -> 440, disabled page edges and back to library; fonts loaded and zero JS errors. Screenshots visually inspected, including high-resolution يسٓ and dense page 507. No clipping/overlap observed.
- Complete local sweep PASS: 604 pages at both 320 and 390px (1,208 page renders), zero horizontal line/document overflow.
- Cache migration PASS: V19 -> V20 online then offline; corrected madd, bookmarks, last reading and saved-storage sentinels preserved.
- Physical iPhone Safari has not been tested; visual tests used actual Chromium at iPhone-sized viewports.

## Production and resume
- Production VERIFIED: https://koleksi-bacaan-harian.vercel.app/
- Vercel success for implementation 2998412: https://vercel.com/halimi-dashboard/koleksi-bacaan-harian/5nM2Rum1oXYURrJQiqb7zSUsinHY
- Live index.html, service-worker.js, Quran reader CSS/JS, pages 001/440/597/598/604 matched local bytes over verified HTTPS.
- Live Chromium QA PASS for all 18 requested surah/page combinations at 320/390/428px: loaded fonts, correct basmalah/madd and controls, navigation and back button, zero overflow/errors. Production screenshots inspected.
- On resumption (2026-09-29), read this record first, then inspected git status --short --branch, git log -5 --oneline, git remote -v, git ls-remote origin refs/heads/main. Confirmed implementation already pushed; resumed production verification only.
- QA scripts: /private/tmp/v2m3-madd-visual.cjs, /private/tmp/v2m3-madd-allpages.cjs, /private/tmp/v2m3-madd-cache.cjs. Evidence: /private/tmp/v2m3-madd-qa and /private/tmp/v2m3-madd-production-qa.
- Current phase: COMPLETE — implementation, local/visual/cache validation, production push and verification finished.
- Remaining: none. No blockers. Production verification checkpoint 1544d714f84671a8ba5d19b37d61c28822657631 is pushed, remote-confirmed and Vercel success; this closing record changes no application files.
- Exact resume command: cd /Users/halimi_hanim/Projects/Islamic-App && cat CODEX_PROGRESS_V2_MARK_3_BASMALAH_MADD.md && git status --short --branch && git log -5 --oneline && git remote -v && git ls-remote origin refs/heads/main && gh api "repos/HalimiHalim/koleksi-bacaan-harian/commits/$(git rev-parse HEAD)/status". This release is finished: inspect only; do not duplicate implementation or checkpoint commits.
- Interruption protocol: first read this file, inspect status/log/remote/ls-remote, and resume the latest verified checkpoint. Do not duplicate already pushed commits, reset, clean or force-push.
