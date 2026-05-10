import type { AuthUser } from 'shared/types'

/** Client-only session tokens (no server). */
const SESSION_TOKEN_DOCTOR = 'demo-session:doctor'
const SESSION_TOKEN_AUTHORITY = 'demo-session:authority'

const DEMO_EMAIL = 'demo@medishield.demo'
const AUTHORITY_EMAIL = 'authority@medishield.demo'
const DEMO_PASSWORD = 'DemoDoctor123!'

let profileOverrides: Partial<{
  name: string
  notificationSettings: { pushAlerts: boolean; emailDigest: boolean }
}> = {}

export function resetMockProfileState() {
  profileOverrides = {}
}

function assertDoctor(token: string | null) {
  if (!token) {
    throw new Error('Sign in as a clinician to use this workspace.')
  }
}

function assertAuthority(token: string | null) {
  if (!token) {
    throw new Error('Sign in as a safety reviewer to open this queue.')
  }
}

function doctorProfileBase() {
  return {
    id: 'demo-doctor',
    name: 'Demo Clinician',
    email: DEMO_EMAIL,
    role: 'doctor' as const,
    hospitalId: 'DOC1023',
    trustScore: 120,
    anonymousAlias: 'Anonymous Doctor #A204',
    milestoneIssued: { silver: true, gold: false, platinum: false },
    certificates: [
      {
        title: 'Honest Healthcare Contributor',
        dateIssued: new Date().toISOString(),
        pdfUrl: '',
      },
    ],
    notificationSettings: { pushAlerts: true, emailDigest: false },
  }
}

function doctorProfileForApi() {
  const base = doctorProfileBase()
  return {
    ...base,
    ...profileOverrides,
    notificationSettings: {
      ...base.notificationSettings,
      ...profileOverrides.notificationSettings,
    },
  }
}

function authorityProfileForApi() {
  return {
    id: 'demo-authority',
    name: 'Chief Safety Reviewer',
    email: AUTHORITY_EMAIL,
    role: 'authority' as const,
    hospitalId: 'AUTH001',
    trustScore: 0,
    anonymousAlias: 'Safety Review Console',
    milestoneIssued: { silver: false, gold: false, platinum: false },
    certificates: [] as { title: string; dateIssued: string; pdfUrl: string }[],
    notificationSettings: { pushAlerts: true, emailDigest: false },
  }
}

function toAuthUser(
  p: ReturnType<typeof doctorProfileForApi> | ReturnType<typeof authorityProfileForApi>
): AuthUser {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    trustScore: p.trustScore,
    anonymousAlias: p.anonymousAlias,
    certificates: p.certificates,
    hospitalId: p.hospitalId,
  }
}

const demoFeedItems = [
  {
    _id: 'demo-feed-1',
    anonymousDoctorName: 'Anonymous Doctor #A204',
    symptoms: 'Persistent fever, productive cough, mild hypoxia.',
    medicines: 'Azithromycin, supplemental oxygen, acetaminophen PRN.',
    diagnosis: 'Community-acquired pneumonia, moderate severity.',
    patientCondition: 'monitoring',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aiAnalysis: {
      isCorrect: true,
      confidence: 0.86,
      warning: 'Clinical coherence appears acceptable for the documented narrative.',
      suggestions: ['Continue monitoring inflammatory markers if available.'],
    },
    status: 'validated',
  },
  {
    _id: 'demo-feed-2',
    anonymousDoctorName: 'Anonymous Doctor #B310',
    symptoms: 'Acute chest tightness with diaphoresis, radiation to left arm.',
    medicines: 'Topical antifungal cream, oral cephalexin.',
    diagnosis: 'Likely musculoskeletal strain.',
    patientCondition: 'critical',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    aiAnalysis: {
      isCorrect: false,
      confidence: 0.58,
      warning:
        'High-risk cardiopulmonary narrative warrants careful reconciliation with prescribed agents.',
      suggestions: ['Urgent clinical reassessment recommended if acute coronary syndrome cannot be excluded.'],
    },
    status: 'alert_open',
  },
]

const demoAlerts = [
  {
    _id: 'demo-alert-1',
    patientCaseId: 'CASE-DEMO-7K2M',
    severity: 'high',
    message:
      'Potential diagnostic mismatch detected. Symptoms may not align with prescribed medicine. Suggested review recommended.',
    summary:
      'High-risk cardiopulmonary narrative warrants careful reconciliation with prescribed agents.',
    deadline: new Date(Date.now() + 20 * 3600000).toISOString(),
    status: 'open',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    reportId: {
      symptoms: 'Acute chest tightness with diaphoresis, radiation to left arm.',
      medicines: 'Topical antifungal cream, oral cephalexin.',
      diagnosis: 'Likely musculoskeletal strain.',
      uploads: [{ originalName: 'demo-ecg-placeholder.pdf' }],
      aiAnalysis: {
        warning:
          'High-risk cardiopulmonary narrative warrants careful reconciliation with prescribed agents.',
        suggestions: [
          'Urgent clinical reassessment recommended if acute coronary syndrome cannot be excluded.',
        ],
      },
    },
  },
  {
    _id: 'demo-alert-2',
    patientCaseId: 'CASE-DEMO-9PQR',
    severity: 'medium',
    message:
      'Potential diagnostic mismatch detected. Symptoms may not align with prescribed medicine. Suggested review recommended.',
    summary: 'Documented allergy penumbra may conflict with prescribed beta-lactam therapy.',
    deadline: new Date(Date.now() + 3 * 3600000).toISOString(),
    status: 'open',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    reportId: {
      symptoms: 'Penicillin allergy documented. Fever with strep throat symptoms.',
      medicines: 'Amoxicillin high dose.',
      diagnosis: 'Acute bacterial pharyngitis.',
      uploads: [],
      aiAnalysis: {
        warning: 'Documented allergy penumbra may conflict with prescribed beta-lactam therapy.',
        suggestions: ['Verify allergy history and consider alternative antimicrobial classes.'],
      },
    },
  },
]

const demoEscalatedCases = [
  {
    _id: 'demo-esc-1',
    patientCaseId: 'CASE-ESC-551',
    severity: 'high',
    message: 'Automatic escalation — clinician correction window elapsed.',
    summary: 'Persistent discordance between ischemic narrative and antimicrobial-centric prescribing.',
    anonymousDoctorLabel: 'Anonymous Doctor #B310',
    report: {
      symptoms: 'Acute chest tightness with diaphoresis, radiation to left arm.',
      medicines: 'Topical antifungal cream, oral cephalexin.',
      diagnosis: 'Likely musculoskeletal strain.',
    },
  },
]

export async function resolveMockApi<T>(path: string, init: RequestInit, token: string | null): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const [pathname, queryString = ''] = path.split('?')
  const params = new URLSearchParams(queryString)

  if (pathname === '/api/auth/register' && method === 'POST') {
    throw new Error(
      'Self-registration is disabled in this static demo. Sign in with demo@medishield.demo / DemoDoctor123!'
    )
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = JSON.parse(init.body as string) as { identifier: string; password: string }
    const idRaw = body.identifier.trim()
    const id = idRaw.toLowerCase()
    const idUpper = idRaw.toUpperCase()

    if (body.password !== DEMO_PASSWORD) {
      throw new Error('Invalid credentials for static demo.')
    }

    if (id === DEMO_EMAIL) {
      return {
        token: SESSION_TOKEN_DOCTOR,
        user: toAuthUser(doctorProfileForApi()),
      } as T
    }
    if (id === AUTHORITY_EMAIL) {
      return {
        token: SESSION_TOKEN_AUTHORITY,
        user: toAuthUser(authorityProfileForApi()),
      } as T
    }
    if (idUpper === 'DOC1023') {
      return {
        token: SESSION_TOKEN_DOCTOR,
        user: toAuthUser(doctorProfileForApi()),
      } as T
    }

    throw new Error(
      `Unknown account. Static demo accepts:\n• ${DEMO_EMAIL} (clinician)\n• ${AUTHORITY_EMAIL} (reviewer)\n• Hospital ID DOC1023 (clinician)\nPassword: ${DEMO_PASSWORD}`
    )
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    if (!token) throw new Error('Not authenticated')
    if (token === SESSION_TOKEN_AUTHORITY) return { user: authorityProfileForApi() } as T
    if (token === SESSION_TOKEN_DOCTOR) return { user: doctorProfileForApi() } as T
    throw new Error('Session expired. Please sign in again.')
  }

  if (pathname === '/api/authority/cases' && method === 'GET') {
    assertAuthority(token)
    return { cases: demoEscalatedCases } as T
  }

  if (pathname === '/api/doctor/dashboard' && method === 'GET') {
    assertDoctor(token)
    const p = doctorProfileForApi()
    return {
      overview: {
        reportsSubmitted: 12,
        aiAlertsReceived: 4,
        patientSafetyTrustScore: p.trustScore,
        certificatesEarned: p.certificates.length,
        openAlerts: demoAlerts.filter((a) => a.status === 'open').length,
      },
      safetyTrend: [
        { date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10), safe: 4, flagged: 1 },
        { date: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10), safe: 5, flagged: 0 },
        { date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), safe: 3, flagged: 2 },
        { date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), safe: 6, flagged: 1 },
        { date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), safe: 7, flagged: 1 },
      ],
      topInsights: demoFeedItems
        .filter((r) => !r.aiAnalysis?.isCorrect)
        .slice(0, 5)
        .map((r) => ({
          anonymousDoctorName: r.anonymousDoctorName,
          aiAnalysis: { warning: r.aiAnalysis?.warning },
          createdAt: r.createdAt,
        })),
    } as T
  }

  if (pathname === '/api/doctor/reports/export' && method === 'GET') {
    assertDoctor(token)
    return demoFeedItems.map((r) => ({
      anonymousDoctorName: r.anonymousDoctorName,
      symptoms: r.symptoms,
      medicines: r.medicines,
      diagnosis: r.diagnosis,
      patientCondition: r.patientCondition,
      status: r.status,
      aiAnalysis: r.aiAnalysis,
      createdAt: r.createdAt,
    })) as T
  }

  const certDl = pathname.match(/^\/api\/doctor\/certificates\/(\d+)\/download$/)
  if (certDl && method === 'GET') {
    assertDoctor(token)
    const p = doctorProfileForApi()
    const idx = Number(certDl[1])
    const cert = p.certificates[idx]
    if (!cert) throw new Error('Certificate not found')
    const body = `MediShield AI — ${cert.title}\nIssued: ${cert.dateIssued}\n\nStatic demo certificate (browser-only build).\n`
    return {
      body,
      filename: `${cert.title.replace(/\s+/g, '-')}-demo.txt`,
    } as T
  }

  if (pathname === '/api/doctor/reports' && method === 'GET') {
    assertDoctor(token)
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const limit = Math.min(50, Math.max(1, Number(params.get('limit') ?? 10)))
    const q = (params.get('q') ?? '').trim().toLowerCase()
    let items = [...demoFeedItems]
    if (q) {
      items = items.filter(
        (r) =>
          r.symptoms.toLowerCase().includes(q) ||
          r.medicines.toLowerCase().includes(q) ||
          r.diagnosis.toLowerCase().includes(q)
      )
    }
    const total = items.length
    const slice = items.slice((page - 1) * limit, page * limit)
    return {
      items: slice,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    } as T
  }

  if (pathname === '/api/doctor/reports' && method === 'POST') {
    assertDoctor(token)

    let diagnosis = ''
    let medicines = ''
    let uploadCount = 0
    const uploadNames: string[] = []
    const rawBody = init.body
    if (typeof FormData !== 'undefined' && rawBody instanceof FormData) {
      diagnosis = String(rawBody.get('diagnosis') ?? '').trim()
      medicines = String(rawBody.get('medicines') ?? '').trim()
      const fileEntries = rawBody.getAll('files')
      for (const entry of fileEntries) {
        if (entry && typeof entry === 'object' && 'name' in entry && typeof (entry as File).name === 'string') {
          uploadCount += 1
          uploadNames.push((entry as File).name)
        }
      }
    }

    const uploadSummary =
      uploadCount > 0
        ? ` ${uploadCount} uploaded document(s) (${uploadNames.slice(0, 4).join(', ')}${uploadNames.length > 4 ? '…' : ''}) were included for cross-check.`
        : ' No attachments were supplied — screening relied on doctor notes and prescribed medicines only.'

    const doc = diagnosis.toLowerCase()
    const med = medicines.toLowerCase()

    const betaLactamAllergyConflict =
      (/penicillin allergy|pcn allergy|allergy to penicillin|beta[\s-]?lactam allergy/i.test(doc) ||
        /documented allergy.*penicillin/i.test(doc)) &&
      /\b(amoxicillin|ampicillin|penicillin|benzylpenicillin|cephalexin|cefalexin|ceftriaxone|cefuroxime|piperacillin|ticarcillin)\b/i.test(
        med
      )

    const cardiacHighRiskLanguage =
      /chest tightness|chest pain|substernal|acs\b|acute coronary|stemi|nstemi|troponin|radiat.*(to )?(the )?left arm|diaphoresis.*chest/i.test(
        doc
      )
    const mskBrushOff = /musculoskeletal|msk|strain|costochondr|likely musculoskeletal/i.test(doc)
    const peripheralPrescribing =
      /topical antifungal|clotrimazole cream|terbinafine cream|miconazole/i.test(med) ||
      (/cephalexin\b/i.test(med) &&
        !/aspirin|nitroglycerin|nitrate|heparin|enoxaparin|ticagrelor|clopidogrel|prasugrel|metoprolol|oxygen|morphine/i.test(
          med
        ))

    let status: 'validated' | 'alert_open' = 'validated'
    let notification: { type: 'success' | 'warning'; message: string }
    let alert: (typeof demoAlerts)[0] | null = null

    if (!diagnosis || !medicines) {
      throw new Error('Doctor diagnosis & notes and medicines given are required for AI reconciliation.')
    }

    if (betaLactamAllergyConflict) {
      status = 'alert_open'
      notification = {
        type: 'warning',
        message:
          'AI reconciliation flagged a possible allergy conflict between doctor notes and prescribed medicines. A safety alert has been queued for review.',
      }
      alert = {
        _id: `demo-alert-new-${Date.now()}`,
        patientCaseId: 'CASE-AUTO-GEN',
        severity: 'high',
        message:
          'Potential prescribing conflict: beta-lactam therapy may not align with documented allergy language in doctor notes.',
        summary: 'Verify allergy history and prescribed antimicrobial class.',
        deadline: new Date(Date.now() + 12 * 3600000).toISOString(),
        status: 'open',
        createdAt: new Date().toISOString(),
        reportId: {
          medicines,
          diagnosis,
          uploads: uploadNames.map((originalName) => ({ originalName })),
          aiAnalysis: {
            warning:
              'Documented penicillin / beta-lactam allergy language appears inconsistent with prescribed beta-lactam therapy.',
            suggestions: ['Verify allergy history and consider alternative antimicrobial classes.'],
          },
        },
      }
    } else if (cardiacHighRiskLanguage && mskBrushOff && peripheralPrescribing) {
      status = 'alert_open'
      notification = {
        type: 'warning',
        message:
          'AI reconciliation detected a high-risk pattern: ischemic-type narrative paired with a non-acute diagnosis and peripheral prescriptions. A safety alert has been queued.',
      }
      alert = {
        _id: `demo-alert-new-${Date.now()}`,
        patientCaseId: 'CASE-AUTO-GEN',
        severity: 'high',
        message:
          'Possible diagnostic mismatch: cardiopulmonary-risk language in notes may not align with diagnosis and prescribed medicines.',
        summary: 'Urgent clinical reassessment recommended if acute coronary syndrome cannot be excluded.',
        deadline: new Date(Date.now() + 8 * 3600000).toISOString(),
        status: 'open',
        createdAt: new Date().toISOString(),
        reportId: {
          medicines,
          diagnosis,
          uploads: uploadNames.map((originalName) => ({ originalName })),
          aiAnalysis: {
            warning:
              'High-risk cardiopulmonary language in doctor notes warrants careful reconciliation with diagnosis, medicines, and uploaded reports.',
            suggestions: [
              'Reconcile ECG, troponins, and imaging if available.',
              'Escalate care pathways if ACS cannot be confidently excluded.',
            ],
          },
        },
      }
    } else {
      notification = {
        type: 'success',
        message: `Doctor notes, prescribed medicines, and attachments screened in this pass.${uploadSummary} No automated discrepancies were detected.`,
      }
    }

    return {
      report: {
        _id: 'demo-new-report',
        anonymousDoctorName: doctorProfileForApi().anonymousAlias,
        status,
      },
      notification,
      alert,
    } as T
  }

  if (pathname === '/api/doctor/alerts' && method === 'GET') {
    assertDoctor(token)
    const sev = params.get('severity')
    let alerts = [...demoAlerts]
    if (sev && sev !== 'all') alerts = alerts.filter((a) => a.severity === sev)
    return { alerts } as T
  }

  const reviewMatch = pathname.match(/^\/api\/doctor\/alerts\/([^/]+)\/review$/)
  if (reviewMatch && method === 'POST') {
    assertDoctor(token)
    return { ok: true } as T
  }

  const errorMatch = pathname.match(/^\/api\/doctor\/alerts\/([^/]+)\/error-report$/)
  if (errorMatch && method === 'POST') {
    assertDoctor(token)
    return { errorReport: { _id: 'demo-error-report' } } as T
  }

  const safetyMatch = pathname.match(/^\/api\/doctor\/alerts\/([^/]+)\/safety-confirmation$/)
  if (safetyMatch && method === 'POST') {
    assertDoctor(token)
    return { confirmation: { _id: 'demo-safety' } } as T
  }

  if (pathname === '/api/doctor/rewards' && method === 'GET') {
    assertDoctor(token)
    const p = doctorProfileForApi()
    return {
      trustScore: p.trustScore,
      tier: 'Silver',
      badges: [
        { label: 'Bronze Contributor', range: '0 – 100', unlocked: true },
        { label: 'Silver Sentinel', range: '100 – 250', unlocked: true },
        { label: 'Gold Guardian', range: '250 – 500', unlocked: false },
        { label: 'Platinum Shield', range: '500+', unlocked: false },
      ],
      certificates: p.certificates,
      anonymousAlias: p.anonymousAlias,
    } as T
  }

  if (pathname === '/api/doctor/profile' && method === 'PATCH') {
    assertDoctor(token)
    const body = JSON.parse((init.body as string) ?? '{}') as {
      name?: string
      notificationSettings?: { pushAlerts?: boolean; emailDigest?: boolean }
    }
    if (body.name != null) profileOverrides.name = body.name
    if (body.notificationSettings != null) {
      profileOverrides.notificationSettings = {
        ...doctorProfileBase().notificationSettings,
        ...profileOverrides.notificationSettings,
        ...body.notificationSettings,
      }
    }
    const user = doctorProfileForApi()
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        notificationSettings: user.notificationSettings,
      },
    } as T
  }

  if (pathname === '/api/doctor/profile/password' && method === 'POST') {
    assertDoctor(token)
    return { ok: true } as T
  }

  throw new Error(`Unimplemented demo route: ${method} ${path}`)
}
