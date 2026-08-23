# Koleksi Bacaan Harian PWA

This is a lightweight offline-installable PWA for UWA Mark 7.

## Local Testing

Service workers do not operate when `index.html` is opened directly with `file://`.
Serve the folder over `localhost` instead:

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

## Deployment

The app is static and uses only relative paths, so it can be hosted on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any simple static host.
