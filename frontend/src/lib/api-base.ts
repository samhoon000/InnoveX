/**
 * Resolves the API origin used by `fetch` calls.
 *
 *  - In production (Vercel) set VITE_API_URL to the deployed Render URL,
 *    e.g. https://medishield-api.onrender.com
 *
 *  - In local dev set VITE_API_URL=http://localhost:5000 in
 *    `frontend/.env.local` so the Vite dev server talks to the
 *    Express backend running on port 5000.
 *
 *  - If unset, falls back to same-origin (empty string).
 */
export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  ''
