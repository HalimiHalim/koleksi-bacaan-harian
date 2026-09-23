# Himpunan Amalan Khazanah

Himpunan Bacaan dan Panduan Islam — a lightweight offline-installable PWA.

## Structure

```text
index.html
manifest.webmanifest
service-worker.js
icons/
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
