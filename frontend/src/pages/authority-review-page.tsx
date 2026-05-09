import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

type EscalatedCase = {
  _id: string
  patientCaseId: string
  severity: string
  message: string
  summary: string
  anonymousDoctorLabel?: string
  report?: {
    symptoms?: string
    medicines?: string
    diagnosis?: string
  }
}

export function AuthorityReviewPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [cases, setCases] = useState<EscalatedCase[]>([])

  useRealtime(Boolean(user), user?.role ?? null)

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ cases: EscalatedCase[] }>('/api/authority/cases')
        setCases(res.cases)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load escalations')
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-[#f7fffb] px-4 py-10 md:px-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-ms-muted">Safety command</p>
          <h1 className="text-3xl font-semibold text-ms-ink">Escalated AI reconciliation queue</h1>
          <p className="text-sm text-ms-muted">Cases surface after the confidential 24-hour physician window lapses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => void navigate('/login')}>
            Switch credential
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {cases.map((item) => (
          <Card key={item._id} className="border-red-100 bg-white/90 shadow-lg shadow-red-100/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldAlert className="size-6 text-red-500" />
                <div>
                  <CardTitle>{item.patientCaseId}</CardTitle>
                  <CardDescription>Anonymous contributor · {item.anonymousDoctorLabel}</CardDescription>
                </div>
              </div>
              <Badge variant="critical">{item.severity}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-semibold text-ms-ink">{item.message}</p>
              <p className="text-ms-muted">{item.summary}</p>
              <div className="rounded-xl bg-ms-panel/70 p-3">
                <p>
                  <span className="font-semibold text-ms-muted">Symptoms · </span>
                  {item.report?.symptoms}
                </p>
                <p>
                  <span className="font-semibold text-ms-muted">Medicines · </span>
                  {item.report?.medicines}
                </p>
                <p>
                  <span className="font-semibold text-ms-muted">Diagnosis · </span>
                  {item.report?.diagnosis}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {cases.length === 0 && (
          <Card className="border-ms-accent/35 md:col-span-2">
            <CardHeader>
              <CardTitle>Queue clear</CardTitle>
              <CardDescription>No escalations pending — integrity signals stable.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
