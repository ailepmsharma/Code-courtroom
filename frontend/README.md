# Code Courtroom Frontend

This is the active React 19 + Vite frontend for Code Courtroom.

## Run locally

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

The current analyzer in `src/services/api.js` is a local rule-based simulation for the cart-checkout examples. No AI model or backend is connected. The UI labels unsupported code as “Limited demo” rather than presenting it as safe.
