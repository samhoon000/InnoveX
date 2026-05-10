'use strict';

const fs = require('fs');

/**
 * Loads KEY=value lines from a .env file into process.env.
 * Runs before dotenv so local plain-text .env is honored even when
 * a global dotenvx hook only injects a subset of variables.
 *
 * @param {string} absPath absolute path to .env
 */
function loadEnvFromFile(absPath) {
  if (!absPath || !fs.existsSync(absPath)) {
    return;
  }

  const text = fs.readFileSync(
    absPath,
    'utf8'
  );

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eq = line.indexOf('=');
    if (eq <= 0) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    if (
      val.length >= 2 &&
      ((val[0] === '"' &&
        val[val.length - 1] === '"') ||
        (val[0] === "'" &&
          val[val.length - 1] === "'"))
    ) {
      val = val.slice(1, -1);
    }

    process.env[key] = val;
  }
}

module.exports = loadEnvFromFile;
