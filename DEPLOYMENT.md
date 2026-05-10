# Deploying MediShield AI to Vercel

This repo deploys as a **single Vercel project**:

- The Vite SPA (`frontend/`) is built to static assets and served from the CDN.
- The Express backend (`backend/`) runs as one Vercel Node Function exposed at `/api/*` via `api/index.js`.

The frontend therefore calls the API on the **same origin** in production — no CORS headaches and no separate deploy.

```
+-------------------+         +-------------------------------+
|   Browser (SPA)   |  fetch  |  /api/*  →  api/index.js      |
|  Vite static CDN  | ──────► |  (Express app from backend/)  |
+-------------------+         +-------------------------------+
                                          │
                                          ▼
                                 MongoDB Atlas / Groq API
```

---

## 1. One-time setup

### Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**
(scope: Production + Preview + Development):

| Variable                    | Required | Notes                                                       |
| --------------------------- | -------- | ----------------------------------------------------------- |
| `MONGO_URI`                 | yes      | MongoDB Atlas connection string                             |
| `JWT_SECRET`                | yes      | Long random string. Generate: `openssl rand -hex 64`        |
| `GROQ_API_KEY`              | yes      | `gsk_...` from https://console.groq.com/keys                |
| `MEDISHIELD_LLM_PROVIDER`   | optional | Defaults are fine (`groq`)                                  |
| `MEDISHIELD_ANALYST_MODEL`  | optional | Defaults to `llama-3.3-70b-versatile`                       |

> **Do NOT** set `VITE_API_BASE` in Vercel. Leaving it unset makes the
> SPA call the same origin (`/api/...`), which is what you want.

### MongoDB Atlas network access

Atlas blocks unknown IPs by default. Either:

1. Add `0.0.0.0/0` to the cluster's IP allow-list (simplest), **or**
2. Use Atlas + Vercel's [private networking peering](https://www.mongodb.com/docs/atlas/security-vpc-peering/).

---

## 2. Deploy

### Via the Vercel dashboard

1. **Import the GitHub repo** at https://vercel.com/new.
2. Vercel reads `vercel.json` automatically — keep all framework / build / output fields **unchanged**.
3. Add the environment variables above.
4. **Deploy**.

### Via the Vercel CLI

```bash
npm i -g vercel
vercel link            # link to a Vercel project
vercel env pull        # optional: pull env vars locally
vercel --prod          # deploy to production
```

---

## 3. Local development

Two terminals, same as before:

```bash
# terminal 1 — Express API on http://localhost:5000
npm run dev:backend

# terminal 2 — Vite dev server on http://localhost:5173
npm run dev
```

`frontend/.env.local` already contains `VITE_API_BASE=http://localhost:5000`,
so the local SPA talks to the local Express server. In production this file
is absent and `VITE_API_BASE` is empty, so the built SPA calls the same Vercel origin.

`backend/.env` provides MongoDB, JWT, and Groq credentials locally. **Do not commit it.**

---

## 4. Vercel limits to be aware of

| Tier   | Function timeout | Request body | Notes                                               |
| ------ | ---------------- | ------------ | --------------------------------------------------- |
| Hobby  | 10 s             | 4.5 MB       | Big PDFs (≥4.5 MB) and slow Groq calls may fail     |
| Pro    | 60 s (configured)| 4.5 MB       | `vercel.json` already requests `maxDuration: 60`    |

This app uses `multer.memoryStorage()` (no disk writes — required by serverless),
caches the Mongo connection across warm invocations, and uses
`pdf-parse/lib/pdf-parse.js` directly to avoid a known bundler issue.

---

## 5. Troubleshooting

| Symptom                                              | Cause / Fix                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `503 Database unavailable`                           | `MONGO_URI` missing or Atlas IP allow-list rejects Vercel's egress IP        |
| `JWT_SECRET is not set`                              | Set `JWT_SECRET` in Vercel env (or set `NODE_ENV != production`)             |
| Logs show `Groq key loaded: false`                   | Add `GROQ_API_KEY` to Vercel env and redeploy                                |
| `GROQ_API_KEY missing from .env`                     | Same — env var not present in this Vercel environment                        |
| `Function execution timed out` on report submit      | Pro tier needed (60 s) for large prompts, or shrink the uploaded PDFs        |
| 404 on every `/api/*`                                | `vercel.json` rewrite missing — re-deploy with this file at the repo root    |
| Browser still calling `localhost:5000` in production | `VITE_API_BASE` was set in Vercel env. Remove it and redeploy.               |

---

## 6. What was changed for Vercel

- `backend/app.js` — Express app extracted from `server.js`, no `.listen()`.
- `backend/server.js` — local-dev entry only; loads `.env` and calls `.listen()`.
- `backend/lib/db.js` — cached `mongoose.connect()` for serverless cold starts.
- `backend/lib/jwt-secret.js` — refuses to start in production without `JWT_SECRET`.
- `backend/services/document-extractor.js` — safer `pdf-parse` import path.
- `api/index.js` — Vercel Node Function wrapping the Express app.
- `vercel.json` — builds the SPA, routes `/api/*` to the function, rewrites SPA paths.
- `frontend/src/lib/api-base.ts` + edits to `api.ts` and `submit-report-page.tsx` — URL is env-driven.
- Root `package.json` — `vercel-build` script + `engines.node` + serverless deps.
- `.vercelignore`, `.gitignore` — keep secrets and dev artifacts out of deploys.
