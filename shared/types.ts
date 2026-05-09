export type UserRole = 'doctor' | 'authority'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  trustScore: number
  anonymousAlias: string
  certificates?: { title: string; dateIssued: string; pdfUrl: string }[]
  hospitalId?: string
}

export type AnalyzeDiagnosisResult = {
  isCorrect: boolean
  confidence: number
  warning: string
  suggestions: string[]
}
