'use strict';

/**
 * Build the CORS options for the API.
 *
 * Allowed origins (in addition to the always-allowed local dev hosts):
 *   - everything in process.env.CORS_ORIGINS (comma-separated)
 *   - process.env.FRONTEND_URL (single value, convenience)
 *   - any *.vercel.app subdomain (so preview deployments work)
 *
 * If CORS_ORIGINS = "*" the API allows all origins (use only for demos).
 */

const ALWAYS_ALLOWED = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
];

function parseList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildAllowedOrigins() {
  const fromEnv = parseList(process.env.CORS_ORIGINS);
  const single = (process.env.FRONTEND_URL || '').trim();

  const list = new Set(ALWAYS_ALLOWED);

  for (const o of fromEnv) {
    list.add(o.replace(/\/$/, ''));
  }
  if (single) {
    list.add(single.replace(/\/$/, ''));
  }

  return list;
}

function makeCorsOptions() {
  const allowAll =
    parseList(process.env.CORS_ORIGINS).includes('*');
  const allowed = buildAllowedOrigins();

  return {
    origin(origin, cb) {
      // Same-origin / curl / server-to-server requests have no Origin.
      if (!origin) return cb(null, true);

      if (allowAll) return cb(null, true);

      const normalized = origin.replace(/\/$/, '');

      if (allowed.has(normalized)) {
        return cb(null, true);
      }

      // Allow any *.vercel.app preview/production URL by default.
      try {
        const host = new URL(normalized).hostname;
        if (host.endsWith('.vercel.app')) {
          return cb(null, true);
        }
      } catch {
        // ignore malformed
      }

      return cb(
        new Error(`CORS: origin ${origin} is not allowed`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

module.exports = { makeCorsOptions };
