'use strict';

/**
 * Resolves the JWT signing secret.
 *
 * In production we require a real secret from the environment so a
 * forgotten env var can never silently fall back to a public value.
 * In development we still allow a default so `npm run dev:backend`
 * works out of the box.
 */
function getJwtSecret() {
  const fromEnv = process.env.JWT_SECRET;

  if (fromEnv && fromEnv.trim()) {
    return fromEnv.trim();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is not set. Configure it in your environment.'
    );
  }

  return 'very_secret_key';
}

module.exports = { getJwtSecret };
