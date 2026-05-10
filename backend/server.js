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

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const doctorReportRoutes = require('./routes/doctor-reports');

const app = express();

/* ---------------- Middleware ---------------- */

app.use(cors());

app.use(express.json());

/* ---------------- MongoDB ---------------- */

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

/* ---------------- Routes ---------------- */

app.use('/api/auth', authRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/alerts', alertRoutes);

app.use('/api/reports', reportRoutes);

app.use(
  '/api/doctor/reports',
  doctorReportRoutes
);

/* ---------------- Root ---------------- */

app.get('/', (req, res) => {
  res.json({
    message: 'MediShield AI Backend Running',
  });
});

/* ---------------- Server ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});