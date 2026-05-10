const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    recommendation: {
      type: String,
      required: true,
    },

    countdown: {
      type: String,
      required: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'alerts',
  }
);

const Alert = mongoose.model(
  'Alert',
  AlertSchema
);

module.exports = Alert;