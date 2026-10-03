# V2.5.2 — Classic mobile adaptive font fit

Date: 2026-10-03 (Asia/Kuala_Lumpur).

| Requested item | Result |
|---|---|
| 1. Baseline HEAD | `9c0ae320ee639a778fc4fe80d0233e80c0e72e1b`, clean managed tree; origin/main matched before work. Branch `codex/v252-classic-mobile`. |
| 2. Root cause | Longest fixed, nowrap QCF line capped every ordinary line's font, regardless of spare height. No stale font reuse. Height was never tested, and auto-height could grow the frame. |
| 3. Old algorithm | Reset to 28px each call; decrease by .5px until each QCF line's scrollWidth ≤ clientWidth +1, down to 11px. Headings/basmalah fitted separately. rAF/font-ready/root observer could repeat fits before/after font load. |
| 4. New algorithm | User authorized section-level mobile reflow. Adjacent QCF groups share wrapped rows within Quran sections; headings/basmalah remain separate. Quarter-pixel binary search measures width and total rendered height including structural rows and folio. End markers remain with preceding words, including intervening sajdah signs. Font load precedes fitting; RAF/signature guard handles resize and avoids repeated/hidden-reader fitting. Desktop keeps original fitter and QCF lines. |
| 5. Font min/max | Historical ordinary-text range retained: 11–28px. Structural fonts width-capped within 13–24px, then limited to body size +2px. .25px precision. |
| 6. Safety margin | 3% of actual inner frame height, excluding frame padding/border. Available outer frame height measures visible header, controls, UI margins/padding and feedback siblings against visual viewport. At 844px portrait height, chrome 144px, frame 700px, inner 678px. |
| 7. Page 7 font before/after | 320px: **14.5→17.75px** (+22.4%). 390px: **17.5→19.75px** (+12.9%). |
| 8. Page 7 spare height | 320px: **24.84→3.92%**. 390px: **10.24→4.95%**. Content height 452.45→651.44px / 540.34→644.47px. |
| 9. Page 12 before/after | 320px: **17→18.75px**, spare **12.69→4.13%**, content 525.58→650.03px. 390px: **20.5→21.25px**, spare **0→4.13%**, content 628→650.03px. Old 390 frame auto-expanded; new frame includes safety reserve. |
| 10. 604-page font distribution | Both Tajweed states: 320 min16.25 / p10 17.25 / median18.25 / p90 19.25 / max28px; 390 min17.75 / p10 18.75 / median20 / p90 21.5 / max28px. Two pages at maximum per run; zero near minimum (≤12px). |
| 11. Spare-space distribution | 320 median4.13%, p90 8.37%, max37.79%; 390 median4.95%, p90 8.81%, max44.19%. Pages 1/2 hit 28px cap, so sparse space remains intentionally. >8% flags: 78/80 pages at 320 OFF/ON; 124/122 at 390. All flagged cases exhaustively tested: no larger quarter-pixel candidate fits. 204 unique width/page compositions visually reviewed. Most uncapped flags are 8–9.5%; only page 134 at 320 (10.70%) and page 564 at 390 (14.13%) exceed 10%, because the next size creates additional whole-word/pair rows around structural content. |
| 12. 320px | All 604 pages OFF/ON: no text/marker mismatch, horizontal/vertical frame overflow, ink/marker escape, document overflow or browser errors at 844px height. Every page includes font/frame/content/spare/overflow records. |
| 13. 390px | Same full 604-page results. Delayed font loading and DPR3 representative test passed. Additional 375×667, 320×568, 390×700, 430×932, 620×800 and short viewport checks passed within stated limits. |
| 14. Tajweed regression | Exact annotation classes/text and all existing computed palette colours preserved; OFF has no spans. QCF identities, token order, markers and 15 sajdah signs unchanged. |
| 15. Desktop Classic | 604 × three widths (1024/1280/1440) × OFF/ON = 3,624 renders passed. Original fitter body byte-identical after function rename; stable centered spacing, token/marker styles/geometry and reading pixels match baseline on representatives. New wrappers are display:contents at desktop. |
| 16. Modern Page | 5,436 renders at 320/390/1280 with Uthmani OFF/ON and Simple passed. Representative geometry and reading pixels match baseline. Page/Simple/Tajweed helper bodies unchanged; continuous Page font remains 32px. |
| 17. Quran verifier | PASS: 114 surahs / 6,236 ayat / 604 pages / 15 sajdah. Original verifier's existing 111 separate-basmalah console label retained; script verifier confirms 112 intros. |
| 18. Tajweed verifier | PASS: 59,253 mapped annotations, 804 skipped ranges, 273 conflicting graphemes, unchanged. |
| 19. Script verifier | PASS: both scripts 114/6236, 604 mappings, 112 intro basmalahs and exact immutable Simple source. |
| 20. PWA/offline | Local V2.5.1→V2.5.2 upgrade passed; old cache removed, single `uwa-bacaan-harian-v252-classic-mobile`; exact cached JS/CSS. Offline fitted sizes match online ON/OFF, cached List/Page/Classic/Simple, settings/bookmarks and new-tab Classic reopening pass. Production also VERIFIED, with exact cached assets and fitted sizes matching online. |
| 21. Files changed | `quran/reader.js`, `quran/reader.css`, `index.html`, `service-worker.js`; Classic desktop/desktop-Page regression verifiers, new mobile verifier; validation JSON, progress ledger and this report. No Quran/Tajweed/script data, palette, font, manifest, settings or navigation UI edits. |
| 22. Implementation commit | `bf28b0a7173b6b61835e6e975b1b27f70f34234e` |
| 23. origin/main | Implementation hash confirmed after push. Final documentation commit records the verified closeout; resolve its own hash with HEAD/origin/main. |
| 24. Vercel | Implementation commit status success / Deployment has completed. Production deployment 6828857337 success. Production smoke VERIFIED: 8 Classic fits and 18 desktop/Page/forced-colour comparisons, settings/scripts and offline; no console errors. URL https://koleksi-bacaan-harian.vercel.app/. |
| 25. Working tree | Implementation tree clean; final verified report/ledger/JSON documentation closeout committed separately. Older user checkouts remain untouched. |
| 26. Progress ledger | `CODEX_PROGRESS_V2.5.2.md`; milestones 0–13 VERIFIED. |
| 27. Known limitations | No physical iPhone/Safari or original screenshot files were available. Browser tests use Chrome at phone widths, including delayed-font and DPR3 checks; this is not a claim of physical iPhone validation. Very short viewports unable to hold a complete page at the retained 11px minimum require screen scroll; frame expands safely with 3% reserve, without clipping. Tested 390×320 yields an 11px, 251px frame and 75px screen scroll. |

Phone reference metrics above use **844px viewport height**. Every page's font, frame height, rendered content height, spare percentage and overflow result are recorded in `mobile-320-off.json`, `mobile-320-on.json`, `mobile-390-off.json`, `mobile-390-on.json` under `/Users/halimi_hanim/Projects/Islamic-App-QA-V2.5.2`. All 604 records are reproducible with the checked-in mobile verifier. Screenshots, nine representative pages at both widths, baseline captures, flagged contact sheets, resize tests and upgrade evidence are in that directory.

No V2.6 or other feature work started.

Production closeout VERIFIED: page 7/12 Classic at 320/390 × OFF/ON matches every local font/frame/content/spare metric exactly. Desktop Classic at 1024/1280/1440 and modern Page at 320/390/1280 retain baseline geometry and reading pixels. Forced-colour desktop palette, settings/script fallback/restoration, persistence and offline tests passed. Nine live assets/datasets (HTML/SW/JS/CSS, 7/12 pages/annotations and Simple 002) match local bytes. No mixed renderer assets or remaining implementation quality gates. Physical iPhone/Safari validation remains the explicitly stated hardware limitation.
