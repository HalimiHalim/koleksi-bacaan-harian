# V2.5.1 desktop Classic Tajweed + spacing fix

Date: 2026-10-03 (Asia/Kuala_Lumpur).

| Requested result | Outcome |
|---|---|
| Baseline HEAD | `cab64c5063f96ded8559dc563bc61e9218670d57` |
| Affected renderer/mode | Classic full-width QCF flex lines reproduce the described 534/535 spacing contrast. Page uses continuous inline RTL. Original screenshots were not attached, so exact screenshot attribution cannot be independently confirmed. |
| Desktop Tajweed root cause | Reproduced with forced-colours active: correct spans exist, but browser colour adjustment replaces all seven author colours with black. Normal live HTTPS already rendered correct colours before patch. User's exact PC environment remains unconfirmed. |
| Tajweed fix | Above 620px and only when forced-colours active, preserve author colour adjustment on existing Tajweed spans. Applies to Uthmani Page/Classic. OFF removes spans; Simple remains plain. No annotation or palette changes. |
| Spacing root cause | Ordinary Classic lines use full-width flex `space-between`. Page 534 has fewer than 100 words and already uses compact centered lines; page 535 misses that exception. Remaining width becomes excessive gaps. |
| Spacing fix | Above 620px, center existing Classic children with the existing compact `.28em` gap. Lines remain one nowrap QCF unit. No DOM, font size, fitter, page width or data changes. |
| Page 534 | Existing desktop Classic line geometry retained. ON/OFF and markers pass. |
| Page 535 before/after | Before: 29.72–61.08px gaps at 1024, 36.06–71.95px at 1280/1440. After: 7.82–9.84px, mean 8.75px; variation includes marker margins. Screenshots show natural centered composition. |
| 1024px | All 604 Classic pages OFF/ON pass; 28px desktop font retained; no overflow/errors. Representative Page/Classic visual suite passes. |
| 1280px | Same Classic results; all 604 Page renders with Uthmani OFF/ON and Simple also pass. |
| 1440px | All 604 Classic pages OFF/ON and representative Page/Classic visual suite pass. |
| 320px regression | All 604 Classic OFF/ON and Page Uthmani OFF/ON/Simple pass. Representative baseline/after DOM geometry and reading pixels match. Existing fitting, 32px Page flow and forced-colour behavior retained. |
| 390px regression | Same results as 320px. |
| Quran verifier | PASS: 114 surahs, 6,236 ayat, 604 pages, 15 sajdah. Existing console's 111 separate basmalahs is unchanged; script verifier confirms 112 introductory basmalahs. |
| Tajweed verifier | PASS: 59,253 exact mapped annotations, 804 skipped ranges, 273 conflicting graphemes, all unchanged. |
| Script verifier | PASS: both scripts 114/6236, 604 mappings, 112 intro basmalahs, exact immutable Simple source. |
| PWA/offline | Local V2.5.1 upgrade PASS: old cache removed, single `uwa-bacaan-harian-v251-desktop-fix` cache. Offline List/Page/Classic OFF/ON/cached Simple, bookmarks, persistence and new-tab Classic pass. Production offline also VERIFIED with identical cached modes, settings/bookmarks and new-tab reopening. |
| Files changed | `quran/reader.css`, `index.html`, `service-worker.js`, existing Classic browser verifier, new desktop browser verifier, validation JSON, progress ledger, this report. Runtime JS and all Quran/script/Tajweed data unchanged. |
| Implementation commit | `b0cbee2bf263f06deec2396a560487a83814fd05` |
| origin/main | Implementation hash above confirmed after push. Final documentation commit records this verified closeout; resolve its exact hash with HEAD/origin/main. |
| Vercel status | VERIFIED: commit status success / Deployment has completed; Production deployment 6827423393 success. Production smoke 18 cases passed. |
| Production URL | https://koleksi-bacaan-harian.vercel.app/ |
| Working tree | Implementation tree clean; verified documentation closeout committed separately. Older Google Drive dirty checkout and older Projects checkout preserved. |
| Progress-ledger status | Milestones 0–10 VERIFIED for reproduced conditions; final closeout below. |
| Known limitations | No physical PC/Windows, iPhone/Safari or original screenshot files supplied. Windows forced colours emulated in Chrome; user's exact missing-colour condition not confirmed. Non-localhost plain HTTP lacks Web Crypto, so original safe annotation-unavailable behavior remains; no unverified hash fallback added. |

Evidence: `/Users/halimi_hanim/Projects/Islamic-App-QA-V2.5.1-Desktop`.

Local browser evidence: 6,040 Classic renders, 5,436 Page renders, 80 representative before/after/forced-colour cases, settings/navigation/persistence and upgrade/offline checks. No text mismatches, clipping observed, horizontal overflow or console/page errors. Exact ayah/waqf/headings/basmalah/QCF order and existing rule palette verified. A few rounded-frame corner pixels vary between independent Chrome screenshots; the verifier allows at most 32 frame-only pixels and requires identical reading pixels and geometry.

No new feature/version work started.

Production smoke VERIFIED: pages 534/535 × Page/Classic × 320/390/1280, ON/OFF, desktop forced-colour palette, no console/page errors. Mobile and modern Page geometry/reading pixels match baseline. Production HTML/SW/JS/CSS and representative Quran/Simple/Tajweed data match local bytes. Fresh production PWA/offline tests passed with the single new cache. No remaining implementation or production quality gate for the tested conditions.
