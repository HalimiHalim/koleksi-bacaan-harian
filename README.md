# Himpunan Amalan Khazanah

Himpunan Bacaan dan Panduan Islam — a lightweight offline-installable PWA.

## V2 Mark 3 · Quran reader

The existing Quran navigation opens **Amalan Saya** (the existing daily checklist) and **114 Surah**. Select a surah for Arabic text and Malay translation in List View. Page View follows the 604 Madinah page boundaries and line groups, displaying Arabic only, with small verse numbers inside independently themed circular markers. Search, bookmarks, and the last reading place are saved locally under `uwa-quran-reader-v1`, separate from the existing checklist data.

The app shell and surah index are cached on installation; individual surahs and pages are cached as they are opened, so previously visited readings work offline. Open a new surah or page online at least once before relying on it offline. The page layout uses the bundled Noto Naskh Arabic font; line boundaries match the Madinah metadata, while printed glyph widths may differ. See [Quran sources and rights](quran/SOURCES.md) and the reproducible [data build script](tools/build_quran_data.py).

On phones, opening a surah enters a focused full-width reading screen with a back button to the surah list. Page View advances right-to-left: the next page control is on the left and the previous page control is on the right. The reader leaves the existing Quran hub and daily checklist layout unchanged.

Run `python3 tools/verify_quran_data.py` to check chapter, ayah, page and marker integrity against the bundled Tanzil source. Pass the official QuranEnc `malay_basumayyah.sqlite` file as an optional argument to verify every Malay translation byte for byte.

## Structure

```text
index.html
manifest.webmanifest
service-worker.js
icons/
quran/
tools/
source/
```

## Local Testing

Service workers do not operate when `index.html` is opened directly with `file://`.
You can open `index.html` directly for a quick visual check, but PWA caching must be tested through `localhost`:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## iPhone / iPad Installation

Open the deployed HTTPS URL in Safari, then:

```text
Share -> Add to Home Screen -> Add
```

## Android Installation

Open the deployed HTTPS URL in Chrome. When prompted, choose Install. If no prompt appears, use the browser menu and choose Add to Home screen or Install app.

## Offline Behaviour

After the first complete load over `https://` or `localhost`, the service worker caches the app shell. The app can then open and run offline using the cached files.

To test offline mode, load the app once through `localhost`, wait for the service worker to register, then reload with the network disabled.

## Refreshing Old Caches

If an installed app still shows an older build, open it while online, allow the update to download, then reload or close and reopen it. The service worker replaces older app caches automatically. Do not clear site data or localStorage to update the app: these hold saved checklists, ordering, custom readings, edits and preferences. Cache Storage updates leave these saved values intact.

## Vercel Toolbar

The repository does not include a Vercel Toolbar script or package. If the toolbar appears in a Vercel session, manage it through the project's Settings → General → Vercel Toolbar → Production → Off, or use Disable for Session in the toolbar menu. See [Vercel's toolbar visibility guide](https://vercel.com/docs/vercel-toolbar/managing-toolbar). No CSS or DOM workaround is applied to the app.

## Deployment

The app is static and uses only relative paths, so it can be hosted on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any simple static host.
