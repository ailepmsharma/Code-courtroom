# Code Courtroom Frontend

This is the active React 19 + Vite frontend for Code Courtroom.

## Run locally

Start the backend from `../backend` in another terminal with `npm start` before submitting trials. The Vite dev server proxies `/api` to `http://127.0.0.1:3001`.

```powershell
npm install
npm run dev
```

## Checks

```powershell
npm run build
npm run lint
```

## Demo behavior

The Express backend runs a local rule-based analysis for curated cart-checkout examples. No AI model or external provider is connected. The UI labels unsupported code as “Limited demo” rather than presenting it as safe.
