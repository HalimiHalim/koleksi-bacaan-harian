# V2.4.1 progress — Quran Settings Consolidation + Tajweed Visual Refinement

## Baseline audit (2026-09-30)

- Branch: `codex/v2-4-1-quran-settings` (created from clean V2.4 final HEAD).
- Baseline local HEAD and `origin/main`: `dfe8256ecb2d09702b176f7508ccdf545b31647f`.
- V2.4 implementation: `900edfd8f50b41337efd723a5ea86dfbb9738a56`.
- Working tree before this ledger: clean. Production V2.4 previously verified Ready at `https://koleksi-bacaan-harian.vercel.app/` (see `CODEX_PROGRESS_V2.4.md`).
- Quran controls: `#quran-list-mode` and `#quran-page-mode` above content; `#quran-tajweed-off` and `#quran-tajweed-on` inside Page View. No Quran gear/settings popup exists. The existing app popup is the hero Theme menu, hidden during phone Quran reading; its surface, border, and shadow are the design reference.
- Persistence: Quran reader `uwa-quran-reader-v1` stores `last` and bookmarks; `last.mode` records the last reading mode. Tajweed uses `uwa-quran-tajweed-v1`. Mode toggle renders immediately; Tajweed toggle rerenders Page View immediately.
- Page CSS: 28px Arabic lines with `flex-wrap:nowrap` and `white-space:nowrap`; JavaScript `fitPageLines()` shrinks dense lines from 28px to as low as 11px, including on resize. Mobile page uses a minimum viewport height and horizontal auto scroll.
- Actual V2.4 light Tajweed palette: Madd `#3A6FA9`, Ghunnah `#347B59`, Ikhfa `#70559C`, Idgham `#A74373`, Iqlab `#98611F`, Qalqalah `#A93F3F`, Silent `#686D75`.
- Actual V2.4 Midnight palette: `#89B8E9`, `#7CC59B`, `#B39AD9`, `#E492B7`, `#E9B473`, `#E78B8B`, `#B5BAC2` in the same order.
- No Quran audio/player bar exists in the reader markup, CSS, or JavaScript.
- Cache: `uwa-bacaan-harian-v24-tajweed`; reader CSS/JS URLs use `?v=24`.

## Milestones

| # | Task | Status | Evidence / remaining work |
|---|---|---|---|
| 0 | Baseline audit | VERIFIED | Architecture and baseline recorded above before implementation. |
| 1 | Quran settings structure | VERIFIED | Controls relocated into a new topbar gear popup; no permanent mode or Tajweed row remains. The app's only pre-existing popup was Theme, hidden during phone reading. |
| 2 | Popup UX and live controls | VERIFIED | List/Page changes render immediately using `uwa-quran-reader-v1` (`mode` added to the existing object); Tajweed uses unchanged `uwa-quran-tajweed-v1` and rerenders live. Popup has close, Escape, outside-click, focus return. |
| 3 | Tajweed colour refinement | VERIFIED | Seven groups preserved. New light palette: `#2569AB`, `#257A4D`, `#6846A0`, `#AC386F`, `#A45B12`, `#B3333B`, `#59636C`; Midnight: `#83BEF5`, `#70D2A0`, `#BE9AF0`, `#F28EB9`, `#F0B867`, `#F48389`, `#BCC3CD`. Light colours have at least 5.06:1 contrast on `#fffdf8`. |
| 4 | Arabic Page View size/layout | VERIFIED | Default 28px → 32px (+14.3%). Removed JS auto-shrink/ResizeObserver; wrapped word tokens within QCF line groups, natural vertical growth, no horizontal scroll. Seven representative pages at 320/390/1280 passed overflow and text checks. |
| 5 | 320px and 390px popup UX | VERIFIED | Popup fits both widths; screenshot evidence `/private/tmp/v241-settings-{320,390}.png`; 42px+ segmented controls and 44px close/gear. |
| 6 | Desktop popup UX | VERIFIED | Popup constrained to 330px; screenshot `/private/tmp/v241-settings-1280.png`. |
| 7 | Tajweed/font visual validation | VERIFIED | Pages 1, 2, 303, 416, 535, 597, 604 at 320/390/1280: OFF/ON text, markers, 32px font, no clipping/overflow, zero console errors. Screenshots `/private/tmp/v241-{settings,page-*,midnight-*}.png` inspected. Midnight colours/render verified. Full 604-page ON and OFF sweeps at 320/390 have zero text mismatch or overflow. |
| 8 | Quran and Tajweed invariants | VERIFIED | `tools/verify_quran_data.py`: 114 surahs, 6,236 verses, 604 pages, 111 basmalahs, all madd marks, 15 sajdah. `build_tajweed_annotations.py --verify`: 59,253 mapped, 804 skipped, 273 conflicting plain. All 604 pages at 320 and 390 matched authoritative page word arrays in both OFF and ON modes; all colour spans absent OFF and present ON. Data/annotation/builder files unchanged. Page hash validation logic unchanged. |
| 9 | Persistence | VERIFIED | Browser test: change mode/ON in popup → close → reload → Continue restores Page and ON; state restored at 320, 390, 1280. |
| 10 | PWA/cache and offline | VERIFIED | Cache bumped to `uwa-bacaan-harian-v241-quran-settings`; CSS/JS URLs `?v=241`. Fresh install ON persisted offline. A staged same-origin V2.4→V2.4.1 upgrade removed old cache, loaded new popup/assets, restored Page+ON, and reloaded offline with colours and zero errors. Eight shell assets exist. |
| 11 | Final quality gate | VERIFIED | Reader/SW and all four inline scripts pass `node --check`; Quran and Tajweed verifiers, shell assets, `git diff --check`, responsive browser screenshots, 604-page ON/OFF sweeps, List↔Page and next/prev navigation, fresh offline and upgrade fixture pass. No data/annotation files changed; zero browser console/page errors. |
| 12 | Commit, push, deploy, production smoke | VERIFIED | Implementation commit `2b24720639613991b303f71774ffe5fd257b69dc` fast-forward pushed to existing `origin/main`. Vercel Production deployment `FqsbsQyAwuamdboFiw5G6bVDdbv1` completed successfully. Production URL `https://koleksi-bacaan-harian.vercel.app/`. Live index/SW/CSS/JS/page 001/annotation 001 matched local hashes. Browser smoke at 320/390/1280 verified settings, Page+ON persistence, 32px font, no overflow, next-page navigation, and zero console errors; 390px production offline reload passed. This record-only closeout commit changes no app assets. |

## Decisions and status

- UI: add a Quran-specific gear popup to the Quran topbar because the only existing popup is Theme in the hero, unavailable in phone reading mode. Match the existing popup and control visual language. Keep Theme untouched.
- Optional text size control: omitted because there is no existing Quran size state/control; 32px default meets the requested increase without adding persistence complexity.
- Final palette and font values: recorded in milestones 3 and 4.
- Files changed so far: `index.html`, `quran/reader.css`, `quran/reader.js`, `service-worker.js`, this ledger.
- Responsive findings: popup width is bounded at 330px and fits 320/390/1280. Dense page 303 is about 2596px high at 320 and 2063px at 390; vertical growth is intentional. Page 597 has no overflow at 320. The 44px gear and close controls remain tappable. No Quran audio/player bar exists in this release, so there is no audio overlap to correct.
- Known limitations: physical iPhone Safari was not available for testing; Chromium at 320/390 CSS px and desktop was used. The inherited 804 skipped Tajweed ranges remain plain.
- Commit/push/deploy: V2.4.1 implementation `2b24720639613991b303f71774ffe5fd257b69dc` pushed to `origin/main`; existing Vercel project Production status success. Final record commit is ledger-only; inspect `git log -1` for final HEAD. Application assets at production were verified byte-for-byte and in a live browser.
