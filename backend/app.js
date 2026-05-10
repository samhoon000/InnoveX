'use strict';

const express = require('express');
const cors = require('cors');

const { connectToDatabase } = require('./lib/db');
const { makeCorsOptions } = require('./lib/cors-config');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const doctorReportRoutes = require('./routes/doctor-reports');

const app = express();

/* ---------------- Middleware ---------------- */

const corsOptions = makeCorsOptions();
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: '2mb' }));

/* ---------------- Health check ---------------- */

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

/* -------- Ensure DB on every request -------- */

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error(
      'MongoDB connection error:',
      err?.message || err
    );
    res.status(503).json({
      error: 'Database unavailable. Please try again shortly.',
    });
  }
});

/* ---------------- Routes ---------------- */

app.use('/api/auth', authRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/alerts', alertRoutes);

app.use('/api/reports', reportRoutes);

app.use('/api/doctor/reports', doctorReportRoutes);

/* ---------------- Root ---------------- */

app.get(['/', '/api'], (req, res) => {
  res.json({
    message: 'MediShield AI Backend Running',
  });
});

/* ---------------- 404 + error handler ---------------- */

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res
      .status(404)
      .json({ error: 'Not found' });
  }
  next();
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: err?.message || 'Internal server error',
  });
});

module.exports = app;
