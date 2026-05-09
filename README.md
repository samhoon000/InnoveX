# MediShield AI (SafeDx) — frontend-only demo

Single-page **React + Vite** app. All `/api/*` calls are handled in the browser by a **mock layer** (`frontend/src/lib/mock-api.ts`). There is **no Node backend** and **no database**.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

Output: `frontend/dist/`.

## Demo sign-in (static)

| Role | Identifier | Password |
|------|------------|----------|
| Clinician | `demo@medishield.demo` or hospital ID `DOC1023` | `DemoDoctor123!` |
| Safety reviewer | `authority@medishield.demo` | `DemoDoctor123!` |

**Signup** is disabled in this build (the mock API returns a clear error).

## Layout

- `frontend/` — Vite app (Tailwind v4, shadcn-style primitives, Framer Motion, Recharts)
- `shared/` — shared TypeScript types for the SPA (`shared/types`)

## Notes

Certificate downloads are emitted as **`.txt` placeholders** (no PDF binary in the static demo). Export uses JSON from the mock API.
