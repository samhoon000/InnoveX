const GROQ_URL =
  'https://api.groq.com/openai/v1/chat/completions';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GROQ_KEY_PLACEHOLDERS = new Set([
  'PASTE_NEW_GROQ_KEY_HERE',
  'YOUR_GROQ_KEY_HERE',
  'YOUR_GROQ_API_KEY',
  'CHANGE_ME',
]);

function isUsableGroqKey(key) {
  const v = String(key || '').trim();
  if (!v) return false;
  if (GROQ_KEY_PLACEHOLDERS.has(v)) return false;
  return true;
}

const GROQ_FAILURE_ANALYSIS = {
  severity: 'none',
  title: 'AI Verification Failed',
  alert_message:
    'AI verification temporarily unavailable.',
  reasoning: '',
  recommendation: 'Try again later.',
  confidence_score: 0,
  requires_review: false,
};

const SYSTEM_PROMPT = `You are MediShield AI, a medical safety verification assistant.

You are NOT diagnosing a patient.

Your role is ONLY to verify consistency between:

1. Doctor Diagnosis & Notes
2. Medicine Given
3. Uploaded medical report

You must identify:

- diagnosis mismatch
- prescription inconsistency
- medicine contradiction
- dangerous medicine combinations
- missing warning signs
- report findings not matching diagnosis
- report findings not matching medicine
- patient safety concerns

Rules:

- Never hallucinate.
- Be conservative.
- If uncertain say:
"Needs review".
- Only use provided information.
- Do not invent medical facts.
- Focus on patient safety.

SEVERITY LEVELS:

HIGH:
Potential patient safety risk.

MEDIUM:
Possible inconsistency requiring review.

LOW:
Minor clarification needed.

NONE:
No meaningful issue found.

Return ONLY valid JSON.

JSON FORMAT:

{
  "severity": "high | medium | low | none",
  "title": "",
  "alert_message": "",
  "reasoning": "",
  "recommendation": "",
  "confidence_score": 0,
  "requires_review": true
}`;

function buildUserPrompt(
  doctorDiagnosis,
  medicineGiven,
  extractedMedicalText
) {
  return `Doctor Diagnosis & Notes:
${doctorDiagnosis}

Medicine Given:
${medicineGiven}

Extracted Medical Report:
${extractedMedicalText}`;
}

function stripJsonFence(text) {
  if (!text) return text;

  let t = text.trim();

  const fence =
    /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(
      t
    );

  if (fence) {
    return fence[1].trim();
  }

  return t;
}

function normalizeSeverity(s) {
  const v = String(s || '')
    .trim()
    .toLowerCase();

  if (
    ['high', 'medium', 'low', 'none'].includes(
      v
    )
  ) {
    return v;
  }

  return 'none';
}

/**
 * Normalize AI output
 */
function coerceAnalysis(parsed) {
  const p =
    parsed && typeof parsed === 'object'
      ? parsed
      : {};

  const severity = normalizeSeverity(
    p.severity
  );

  return {
    severity,
    title: String(
      p.title ?? ''
    ).trim(),

    alert_message: String(
      p.alert_message ?? ''
    ).trim(),

    reasoning: String(
      p.reasoning ?? ''
    ).trim(),

    recommendation: String(
      p.recommendation ?? ''
    ).trim(),

    confidence_score: Number.isFinite(
      Number(p.confidence_score)
    )
      ? Number(p.confidence_score)
      : 0,

    requires_review: Boolean(
      p.requires_review
    ),
  };
}

/**
 * Run Groq Medical Safety Analysis
 */
async function runGroqMedicalSafetyAnalysis(
  input
) {
  if (!isUsableGroqKey(GROQ_API_KEY)) {
    throw new Error(
      'GROQ_API_KEY missing from .env'
    );
  }

  const groqAuthKey =
    String(GROQ_API_KEY).trim();

  const userContent =
    buildUserPrompt(
      input.doctorDiagnosis,
      input.medicineGiven,
      input.extractedMedicalText
    );

  try {
    const res = await fetch(
      GROQ_URL,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${groqAuthKey}`,
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          model: GROQ_MODEL,

          temperature: 0.1,

          max_tokens: 2048,

          response_format: {
            type: 'json_object',
          },

          messages: [
            {
              role: 'system',
              content:
                SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content:
                userContent,
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errText =
        await res
          .text()
          .catch(() => '');

      console.error(
        'Groq API error',
        res.status,
        errText.slice(0, 200)
      );

      return {
        ...GROQ_FAILURE_ANALYSIS,
      };
    }

    const data =
      await res.json();

    const rawContent =
      data?.choices?.[0]
        ?.message?.content;

    const jsonText =
      stripJsonFence(
        String(rawContent || '')
      );

    let parsed;

    try {
      parsed =
        JSON.parse(jsonText);
    } catch (e) {
      console.error(
        'Invalid JSON response:',
        rawContent
      );

      return {
        ...GROQ_FAILURE_ANALYSIS,
      };
    }

    return coerceAnalysis(
      parsed
    );
  } catch (e) {
    console.error(
      'Groq medical safety analysis failed:',
      e
    );

    return {
      ...GROQ_FAILURE_ANALYSIS,
    };
  }
}

module.exports = {
  runGroqMedicalSafetyAnalysis,
  buildUserPrompt,
  coerceAnalysis,
};