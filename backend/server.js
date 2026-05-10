'use strict';

/**
 * Local development entry point.
 *
 * In production (Vercel) the request handler is `api/index.js`,
 * which imports the same Express app. This file is only used for
 * `npm run dev:backend` so we can keep the same dotenv loading
 * and the familiar `app.listen` flow on a developer machine.
 */

const path = require('path');
const loadEnvFromFile = require('./lib/load-env-from-file');

const envPath = path.join(__dirname, '.env');
loadEnvFromFile(envPath);

require('dotenv').config({
  path: envPath,
  override: false,
});

console.log(
  'Groq key loaded:',
  !!process.env.GROQ_API_KEY
);

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
