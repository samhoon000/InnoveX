'use strict';

const mongoose = require('mongoose');

/**
 * Serverless-safe MongoDB connector.
 *
 * In Vercel serverless functions every cold start re-evaluates the module,
 * so we cache the connection promise on the global object to reuse the
 * underlying socket across invocations of the same warm container.
 */

const globalCache = global;

if (!globalCache.__mongooseCache) {
  globalCache.__mongooseCache = {
    conn: null,
    promise: null,
  };
}

const cache = globalCache.__mongooseCache;

async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Configure it in your environment.'
    );
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true);

    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m.connection);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}

module.exports = {
  connectToDatabase,
};
