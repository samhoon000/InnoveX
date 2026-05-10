/**
 * Resolves the API origin used by `fetch` calls.
 *
 *  - In production (Vercel) we call the same origin so we set this to ''.
 *    e.g. fetch('/api/auth/me') → https://<your-app>.vercel.app/api/auth/me
 *
 *  - In local dev set VITE_API_BASE=http://localhost:5000 in
 *    `frontend/.env.local` (or `frontend/.env`) so the Vite dev server
 *    talks to the Express backend running on port 5000.
 */
export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ??
  ''
