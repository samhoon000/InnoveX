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

    title: {
      type: String,
      default: '',
    },

    message: {
      type: String,
      required: true,
    },

    reasoning: {
      type: String,
      default: '',
    },

    recommendation: {
      type: String,
      required: true,
    },

    confidenceScore: {
      type: Number,
      default: 0,
    },

    requiresReview: {
      type: Boolean,
      default: true,
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