# Deploying MediShield AI

Two services, two providers:

| Service | Provider | Folder | Public URL example |
| ------- | -------- | ------ | ------------------ |
| Vite SPA (frontend) | **Vercel** | `frontend/` | `https://medishield.vercel.app` |
| Express API (backend) | **Render** | `backend/` | `https://medishield-api.onrender.com` |

The SPA calls the API by URL set in `VITE_API_URL`. CORS on the API
is configured to allow your Vercel domain (and any `*.vercel.app`
preview URL by default).

```
+-----------------------+         +---------------------------+
|  Browser → Vercel CDN |  fetch  |  Render Web Service       |
|  (Vite SPA, dist/)    | ──────► |  Express + Mongoose +     |
+-----------------------+         |  pdf-parse + Groq         |
                                  +---------------------------+
                                              │
                                              ▼
                                MongoDB Atlas / Groq API
```

---

## 0. Before you deploy: get your secrets

| Secret | Where to get it |
| ------ | --------------- |
| `MONGO_URI` | MongoDB Atlas → cluster → **Connect** → **Drivers** → copy `mongodb+srv://...` and substitute the password |
| `GROQ_API_KEY` | https://console.groq.com/keys → **Create API Key** |
| `JWT_SECRET` | `openssl rand -hex 64` (any 64+ char random string) |

In **MongoDB Atlas → Network Access** add `0.0.0.0/0` to the IP allow‑list
(simplest) so Render's containers can reach the cluster.

Push your latest code to GitHub:

```bash
git add .
git commit -m "Production-ready: Vercel frontend + Render backend"
git push
```

---

## Part 1 — Deploy the backend to Render

### Option A — One‑click via `render.yaml` (recommended)

1. Go to https://dashboard.render.com/blueprints → **New Blueprint Instance**.
2. Connect your GitHub repo. Render reads `render.yaml` automatically.
3. When prompted, fill in the secret values for:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - `CORS_ORIGINS` — set to your Vercel URL once you have it (e.g. `https://medishield.vercel.app`). You can leave it blank for now and update later; `*.vercel.app` is allowed by default.
   - `FRONTEND_URL` — same value as above, optional.
4. Click **Apply** and wait for the build to finish (~2 min).
5. Copy the live URL Render gives you, e.g. `https://medishield-api.onrender.com`. **You'll need this for Vercel.**

### Option B — Manual setup

1. https://dashboard.render.com → **New → Web Service** → connect the repo.
2. Configure:
   | Field | Value |
   | ----- | ----- |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Health Check Path** | `/healthz` |
3. Add the same env vars listed above (Settings → Environment), plus:
   - `NODE_VERSION` = `22.11.0`
   - `NODE_ENV` = `production`
   - `MEDISHIELD_LLM_PROVIDER` = `groq`
   - `MEDISHIELD_ANALYST_MODEL` = `llama-3.3-70b-versatile`
4. **Create Web Service**. Copy the live URL when it's done.

### Verify

Open `https://<your-api>.onrender.com/healthz` → should return `{"status":"ok"}`.
Open `https://<your-api>.onrender.com/` → should return `{"message":"MediShield AI Backend Running"}`.

In **Logs** you should see `Groq key loaded: true` and `Server running on port 10000` (Render injects its own `PORT`).

---

## Part 2 — Deploy the frontend to Vercel

1. Go to https://vercel.com/new → import the same GitHub repo.
2. **Important configuration:**
   | Field | Value |
   | ----- | ----- |
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Vite |
   | **Build Command** | (auto, from `vercel.json`) `npm run build` |
   | **Output Directory** | (auto) `dist` |
   | **Install Command** | (auto) `npm install` |
   | **Node.js Version** | 22.x (auto-picked from `engines`) |
3. Add **one** environment variable (Production + Preview + Development):
   | Name | Value |
   | ---- | ----- |
   | `VITE_API_URL` | The Render URL from Part 1, e.g. `https://medishield-api.onrender.com` (no trailing slash) |
4. Click **Deploy**. ~1 min later you'll get a URL like `https://medishield.vercel.app`.

### Wire CORS back to Vercel

Now that you have the Vercel URL, go back to Render → your service →
**Environment** and set:

```
CORS_ORIGINS = https://medishield.vercel.app
FRONTEND_URL = https://medishield.vercel.app
```

Save → Render auto-redeploys. (You can skip this — `*.vercel.app` is
already whitelisted by default — but setting it explicitly is safer for
production.)

### Verify the full stack

1. Open the Vercel URL.
2. Sign up / log in.
3. Submit a doctor report.
4. Confirm the AI Safety Desk alert appears.
5. Watch Render's **Logs** tab — you should see the request, the Mongo
   query, and the Groq call.

---

## Part 3 — Local development

Two terminals, no change from before:

```bash
# Terminal 1 — Express on http://localhost:5000
npm run dev:backend

# Terminal 2 — Vite on http://localhost:5173
npm run dev
```

Local config:

- `backend/.env` provides `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`.
- `frontend/.env.local` already contains `VITE_API_URL=http://localhost:5000`.

Both files are gitignored.

---

## Part 4 — Continuous deployment

After the first deploy, both providers redeploy on every push to `main`:

```bash
git add .
git commit -m "your change"
git push
```

- Vercel rebuilds the SPA in ~1 min.
- Render rebuilds the API in ~2 min (free tier sleeps after inactivity;
  first request after wake-up can take 30–60 s).

---

## Part 5 — Why this setup avoids the previous build errors

| Symptom you hit | Root cause | Fix in this repo |
| --------------- | ---------- | ---------------- |
| Vercel build failed with rolldown / native binding error | npm bug [#4828](https://github.com/npm/cli/issues/4828) — Windows-built `package-lock.json` doesn't list Linux platform binaries (`@rolldown/binding-linux-x64-gnu`, `@rollup/rollup-linux-x64-gnu`) | Lockfiles deleted from the repo so Vercel/Render generate fresh, Linux-correct ones; `optional=true` in `.npmrc` forces optional native binaries to install |
| Node.js version mismatch | Vercel was defaulting to Node 24 (which ships unstable Vite/Rolldown bindings) | `engines.node = "22.x"` pinned in root, frontend, and backend `package.json` + `NODE_VERSION = 22.11.0` in `render.yaml` |
| Workspace path confusion on Vercel | The previous combined-deploy `vercel.json` tried to build the workspace from the repo root | Removed root `vercel.json`. Vercel **Root Directory = `frontend`** plus `frontend/vercel.json` makes Vercel treat the SPA as an isolated Vite project |
| Frontend calling `localhost:5000` in production | Hardcoded URL | All API calls go through `frontend/src/lib/api-base.ts` which reads `VITE_API_URL` |
| API calls blocked by CORS in production | `cors()` was wide open in dev but unsafe in prod | `backend/lib/cors-config.js` — env-driven whitelist + automatic `*.vercel.app` allowance |

---

## Part 6 — Troubleshooting

| Symptom | Cause / Fix |
| ------- | ----------- |
| `npm error code EBADENGINE` on Vercel | A dependency or repo lists an unsupported Node version. Confirm Vercel project Settings → General → **Node.js Version = 22.x** (it should auto-pick from `engines`) |
| `Cannot find module @rolldown/binding-linux-x64-gnu` | Stale lockfile cached in Vercel. Settings → General → **Clear Build Cache** → Redeploy |
| Render build fails: `MONGO_URI is not set` (only on first request) | Add `MONGO_URI` in Render → Environment → Save (Render auto-redeploys) |
| Render build succeeds but `/healthz` returns 503 | Atlas IP allow-list missing `0.0.0.0/0`, or `MONGO_URI` password contains unescaped `@`/`/` (URL-encode them) |
| Browser shows `CORS: origin … is not allowed` | Set `CORS_ORIGINS=https://your-frontend.vercel.app` on Render and redeploy |
| First request after idle is slow | Render free tier sleeps. Either upgrade to a paid plan or accept ~30 s cold starts |
| `Groq key loaded: false` in Render logs | Add `GROQ_API_KEY` in Render → Environment, redeploy |
| `JWT_SECRET is not set` | Same — set it in Render env. Backend refuses to start in prod without it |

---

## Part 7 — Quick reference

| Goal | Action |
| ---- | ------ |
| Run locally | Terminal 1: `npm run dev:backend` &nbsp; Terminal 2: `npm run dev` |
| Deploy frontend | `git push` (Vercel auto-builds) |
| Deploy backend | `git push` (Render auto-builds) |
| Change frontend env | Vercel → Settings → Environment Variables → Redeploy |
| Change backend env | Render → service → Environment → Save (auto-redeploys) |
| Watch backend logs | Render → service → **Logs** |
| Watch frontend build | Vercel → **Deployments** |

If anything breaks, check Section 6 first — every failure mode I've seen
during this migration is listed there.
