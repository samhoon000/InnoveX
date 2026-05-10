'use strict';

/**
 * Vercel serverless entry.
 *
 * The whole Express app from `backend/app.js` is exported as a single
 * Vercel Node Function. Every request to `/api/*` is forwarded here by
 * the rewrite in `vercel.json`.
 *
 * Environment variables (MONGO_URI, GROQ_API_KEY, JWT_SECRET, ...) are
 * provided by the Vercel project settings, so we do NOT load `.env` here.
 */

const app = require('../backend/app');

console.log(
  'Groq key loaded:',
  !!process.env.GROQ_API_KEY
);

module.exports = app;
