const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    doctorAlias: String,

    symptoms: String,

    medicinePrescribed: String,

    diagnosisSummary: String,

    learningSummary: String,

    patientCondition: String,

    status: String,

    confidentialityTag: String,

    uploads: [
      {
        originalName: String,
        mimeType: String,
      },
    ],

    extractedMedicalText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', ReportSchema);