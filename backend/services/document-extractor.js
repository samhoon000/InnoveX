const pdfParse = require('pdf-parse');

const PDF_MIME = 'application/pdf';
const TXT_MIME = 'text/plain';

const EXTRACTION_FAILED =
  'Medical document could not be analyzed.';

/**
 * Collapse repeated whitespace while keeping paragraph breaks.
 * @param {string} raw
 * @returns {string}
 */
function cleanExtractedText(raw) {
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  let t = raw.replace(/\r\n/g, '\n');

  t = t.replace(/[ \t]+/g, ' ');
  t = t.replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

/**
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<{ extractedMedicalText: string }>}
 */
async function extractMedicalDocument(
  buffer,
  mimeType
) {
  const normalizedMime = (
    mimeType || ''
  ).toLowerCase();

  try {
    if (normalizedMime === PDF_MIME) {
      const data = await pdfParse(buffer);
      const text = cleanExtractedText(
        data?.text || ''
      );
      return {
        extractedMedicalText:
          text ||
          EXTRACTION_FAILED,
      };
    }

    if (normalizedMime === TXT_MIME) {
      const text = cleanExtractedText(
        buffer.toString('utf8')
      );
      return {
        extractedMedicalText:
          text ||
          EXTRACTION_FAILED,
      };
    }

    return {
      extractedMedicalText:
        EXTRACTION_FAILED,
    };
  } catch (err) {
    console.error(
      'document-extractor:',
      err?.message || err
    );
    return {
      extractedMedicalText:
        EXTRACTION_FAILED,
    };
  }
}

module.exports = {
  extractMedicalDocument,
  cleanExtractedText,
  EXTRACTION_FAILED,
  PDF_MIME,
  TXT_MIME,
};
