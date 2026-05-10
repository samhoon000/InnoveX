const express = require('express');
const multer = require('multer');
const crypto = require('crypto');

const protect = require('../middleware/protect');
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const User = require('../models/User');
const {
  extractMedicalDocument,
} = require('../services/document-extractor');
const {
  runGroqMedicalSafetyAnalysis,
} = require('../services/groq-medical-safety');

const router = express.Router();

const MAX_FILE_BYTES =
  15 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    const mime = (
      file.mimetype || ''
    ).toLowerCase();
    if (
      mime === 'application/pdf' ||
      mime === 'text/plain'
    ) {
      return cb(null, true);
    }
    cb(
      new Error(
        'Only PDF and plain text (.txt) uploads are supported.'
      )
    );
  },
});

function multerMiddleware(req, res, next) {
  const mw = upload.array(
    'files',
    12
  );
  mw(req, res, (err) => {
    if (err) {
      const msg =
        err instanceof multer.MulterError
          ? err.code === 'LIMIT_FILE_SIZE'
            ? 'Each file must be 15MB or smaller.'
            : err.message
          : err.message ||
            'Upload failed';
      return res.status(400).json({
        error: msg,
      });
    }
    next();
  });
}

function buildCombinedExtracted(
  files
) {
  if (!files?.length) {
    return '(No uploaded medical report document.)';
  }

  return files
    .map((f, i) => {
      const header = `--- File ${i + 1}: ${f.originalname} ---`;
      return `${header}\n${f._extractedText || ''}`;
    })
    .join('\n\n');
}

/**
 * POST /api/doctor/reports
 * multipart: diagnosis, medicines, files[]
 */
router.post(
  '/',
  protect,
  multerMiddleware,
  async (req, res) => {
    try {
      const diagnosis = String(
        req.body.diagnosis || ''
      ).trim();
      const medicines = String(
        req.body.medicines || ''
      ).trim();

      if (!diagnosis || !medicines) {
        return res.status(400).json({
          error:
            'Doctor diagnosis & notes and medicines given are required.',
        });
      }

      const files = req.files || [];

      for (const f of files) {
        const { extractedMedicalText } =
          await extractMedicalDocument(
            f.buffer,
            f.mimetype
          );
        f._extractedText =
          extractedMedicalText;
      }

      const combinedExtracted =
        buildCombinedExtracted(files);

      const actor = await User.findById(
        req.user.id
      ).select(
        'anonymousAlias reportsSubmitted alertsReceived'
      );

      let analysis;
      try {
        analysis =
          await runGroqMedicalSafetyAnalysis(
            {
              doctorDiagnosis: diagnosis,
              medicineGiven: medicines,
              extractedMedicalText:
                combinedExtracted,
            }
          );
      } catch (groqErr) {
        console.error(
          'Groq medical safety:',
          groqErr?.message || groqErr
        );

        const report =
          await Report.create({
            doctorAlias:
              actor?.anonymousAlias ||
              'Anonymous Doctor',
            symptoms: '',
            medicinePrescribed: medicines,
            diagnosisSummary: diagnosis,
            learningSummary: '',
            patientCondition: '',
            status: 'verification_unavailable',
            confidentialityTag:
              'standard',
            uploads: files.map(
              (file) => ({
                originalName:
                  file.originalname,
                mimeType: file.mimetype,
              })
            ),
            extractedMedicalText:
              combinedExtracted.slice(
                0,
                500000
              ),
          });

        await User.findByIdAndUpdate(
          req.user.id,
          {
            $inc: {
              reportsSubmitted: 1,
            },
          }
        );

        return res.json({
          report: {
            _id: report._id,
            status: report.status,
          },
          notification: {
            type: 'warning',
            message:
              'AI verification temporarily unavailable.',
          },
        });
      }

      const report =
        await Report.create({
          doctorAlias:
            actor?.anonymousAlias ||
            'Anonymous Doctor',
          symptoms: '',
          medicinePrescribed: medicines,
          diagnosisSummary: diagnosis,
          learningSummary:
            analysis.reasoning ||
            analysis.alert_message ||
            '',
          patientCondition: '',
          status:
            analysis.severity === 'none'
              ? 'validated'
              : 'alert_open',
          confidentialityTag: 'standard',
          uploads: files.map((file) => ({
            originalName: file.originalname,
            mimeType: file.mimetype,
          })),
          extractedMedicalText:
            combinedExtracted.slice(
              0,
              500000
            ),
        });

      await User.findByIdAndUpdate(
        req.user.id,
        {
          $inc: { reportsSubmitted: 1 },
        }
      );

      if (analysis.severity === 'none') {
        return res.json({
          report: {
            _id: report._id,
            status: report.status,
          },
          notification: {
            type: 'success',
            message:
              'AI safety verification completed. No meaningful issue was flagged for this submission.',
          },
        });
      }

      const caseId = `CASE-${crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase()}`;

      const deadline = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      const countdown = `24-hour correction timer · ends ${deadline.toISOString()}`;

      const alert = await Alert.create({
        caseId,
        severity: analysis.severity,
        title:
          analysis.title ||
          'Safety verification',
        message:
          analysis.alert_message ||
          analysis.title ||
          'Safety review suggested.',
        reasoning: analysis.reasoning,
        recommendation:
          analysis.recommendation ||
          'Clinical review recommended.',
        confidenceScore:
          analysis.confidence_score,
        requiresReview:
          analysis.requires_review,
        countdown,
        reportId: report._id,
      });

      await User.findByIdAndUpdate(
        req.user.id,
        {
          $inc: { alertsReceived: 1 },
        }
      );

      return res.json({
        report: {
          _id: report._id,
          status: report.status,
        },
        notification: {
          type: 'warning',
          message:
            'AI safety verification flagged an item for confidential reconciliation review.',
        },
        alert,
      });
    } catch (err) {
      console.error(
        'doctor-reports:',
        err
      );
      res.status(500).json({
        error:
          err.message ||
          'Failed to process report',
      });
    }
  }
);

module.exports = router;
