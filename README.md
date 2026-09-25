# Code Courtroom

Code Courtroom is an interactive prototype for examining code through a courtroom-style review: submit a snippet, read the arguments, inspect findings, and consider a ruling.

## Run locally

The active application is in `frontend/`.

```powershell
cd frontend
npm install
npm run dev
```

Run the frontend checks from the same directory:

```powershell
npm run build
npm run lint
```

## Current scope

The current experience is a local, rule-based demo for a curated cart-checkout example. It does not connect to an AI model or backend service and should not be used as a production code-security review. Unsupported snippets receive an unscored “Limited demo” result rather than an approval.

The Express package under `backend/` is a scaffold and is not currently wired to the frontend.

## Project structure

- `frontend/src/pages/Courtroom.jsx` coordinates the sample review flow and page state.
- `frontend/src/components/` contains the courtroom interface components.
- `frontend/src/services/api.js` holds the local demo analysis contract.
- `frontend/src/data/sampleCode.js` contains the curated buggy and clean examples.
- `backend/server.js` is currently an empty backend entry point.
