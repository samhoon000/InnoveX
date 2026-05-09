import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { AlertTriangle, ClipboardList } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'
import { CountdownBadge } from '@/components/countdown-badge'

type AlertRecord = {
  _id: string
  patientCaseId: string
  severity: string
  message: string
  summary: string
  deadline: string
  status: string
  createdAt: string
  reportId?: {
    symptoms?: string
    medicines?: string
    diagnosis?: string
    uploads?: { originalName?: string }[]
    aiAnalysis?: { warning?: string; suggestions?: string[] }
  }
}

export function AiAlertsPage() {
  const [severity, setSeverity] = useState<string>('all')
  const [alerts, setAlerts] = useState<AlertRecord[]>([])
  const [active, setActive] = useState<AlertRecord | null>(null)
  const [tab, setTab] = useState<'review' | 'error' | 'safety'>('review')
  const [errorForm, setErrorForm] = useState({ mistake: '', reason: '', learning: '' })
  const [safetyForm, setSafetyForm] = useState({
    updatedDiagnosis: '',
    updatedMedicine: '',
    patientStatus: '',
    safetyConfirmation: '',
  })

  const severityFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'All severities' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
    []
  )

  async function load() {
    try {
      const params = severity === 'all' ? '' : `?severity=${severity}`
      const res = await apiFetch<{ alerts: AlertRecord[] }>(`/api/doctor/alerts${params}`)
      setAlerts(res.alerts)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to load alerts')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severity])

  async function submitError() {
    if (!active) return
    try {
      await apiFetch(`/api/doctor/alerts/${active._id}/error-report`, {
        method: 'POST',
        body: JSON.stringify(errorForm),
      })
      toast.success('Confidential error disclosure captured (+ trust rewards pending).')
      setActive(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  async function submitSafety() {
    if (!active) return
    try {
      await apiFetch(`/api/doctor/alerts/${active._id}/safety-confirmation`, {
        method: 'POST',
        body: JSON.stringify(safetyForm),
      })
      toast.success('Patient safety confirmation filed.')
      setActive(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  async function reviewAck() {
    if (!active) return
    try {
      await apiFetch(`/api/doctor/alerts/${active._id}/review`, { method: 'POST' })
      toast.message('Review acknowledgement logged.')
    } catch {
      /* optional */
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-ms-muted">AI safety desk</p>
          <h2 className="text-3xl font-semibold text-ms-ink">Confidential reconciliation alerts</h2>
          <p className="text-sm text-ms-muted">24-hour clinician-only correction runway before automated escalation.</p>
        </div>
        <div className="md:w-64">
          <SelectField value={severity} onChange={setSeverity} options={severityFilterOptions} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => (
          <motion.div key={alert._id} layout className="rounded-2xl border border-ms-accent/35 bg-white/85 p-5 shadow-lg shadow-ms-accent/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-ms-muted">Patient case id</p>
                <p className="font-mono text-lg font-semibold text-ms-ink">{alert.patientCaseId}</p>
              </div>
              <Badge variant="critical">{alert.severity}</Badge>
            </div>
            <p className="mt-4 text-sm text-ms-ink">{alert.message}</p>
            <p className="mt-2 text-xs text-ms-muted">{alert.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CountdownBadge deadline={alert.deadline} />
              <p className="text-xs text-ms-muted">{new Date(alert.createdAt).toLocaleString()}</p>
            </div>
            <Button className="mt-4 w-full md:w-auto" type="button" onClick={() => { setActive(alert); setTab('review'); }}>
              Open confidential workflow
            </Button>
          </motion.div>
        ))}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.patientCaseId}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={tab === 'review' ? 'default' : 'outline'} type="button" onClick={() => setTab('review')}>
                  Review case
                </Button>
                <Button size="sm" variant={tab === 'error' ? 'default' : 'outline'} type="button" onClick={() => setTab('error')}>
                  Submit error report
                </Button>
                <Button size="sm" variant={tab === 'safety' ? 'default' : 'outline'} type="button" onClick={() => setTab('safety')}>
                  Safety confirmation
                </Button>
              </div>

              {tab === 'review' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ClipboardList className="size-4" />
                        Structured intake
                      </CardTitle>
                      <CardDescription>AI explanation mirrors automated reasoning — not legal adjudication.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p>
                        <span className="font-semibold text-ms-muted">Symptoms · </span>
                        {active.reportId?.symptoms}
                      </p>
                      <p>
                        <span className="font-semibold text-ms-muted">Medicines · </span>
                        {active.reportId?.medicines}
                      </p>
                      <p>
                        <span className="font-semibold text-ms-muted">Diagnosis narrative · </span>
                        {active.reportId?.diagnosis}
                      </p>
                      <div className="rounded-xl bg-ms-panel/60 p-3">
                        <div className="flex items-center gap-2 text-[#b45309]">
                          <AlertTriangle className="size-4" />
                          <span className="text-sm font-semibold">AI concern</span>
                        </div>
                        <p className="mt-2 text-sm">{active.reportId?.aiAnalysis?.warning}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-ms-muted">
                          {(active.reportId?.aiAnalysis?.suggestions ?? []).map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ms-muted">Attachments</p>
                        <ul className="text-xs text-ms-ink">
                          {(active.reportId?.uploads ?? []).map((u) => (
                            <li key={u.originalName}>{u.originalName}</li>
                          ))}
                          {(active.reportId?.uploads?.length ?? 0) === 0 && <li>No uploads referenced.</li>}
                        </ul>
                      </div>
                      <Button type="button" variant="secondary" onClick={() => void reviewAck()}>
                        Acknowledge review
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {tab === 'error' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>What mistake happened?</Label>
                    <Textarea value={errorForm.mistake} onChange={(e) => setErrorForm({ ...errorForm, mistake: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Why it happened?</Label>
                    <Textarea value={errorForm.reason} onChange={(e) => setErrorForm({ ...errorForm, reason: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>What did you learn?</Label>
                    <Textarea value={errorForm.learning} onChange={(e) => setErrorForm({ ...errorForm, learning: e.target.value })} />
                  </div>
                  <Button type="button" onClick={() => void submitError()} disabled={!errorForm.mistake || !errorForm.reason || !errorForm.learning}>
                    Encrypt & transmit disclosure
                  </Button>
                </div>
              )}

              {tab === 'safety' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Updated diagnosis</Label>
                    <Textarea value={safetyForm.updatedDiagnosis} onChange={(e) => setSafetyForm({ ...safetyForm, updatedDiagnosis: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Updated medicine</Label>
                    <Textarea value={safetyForm.updatedMedicine} onChange={(e) => setSafetyForm({ ...safetyForm, updatedMedicine: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Patient status</Label>
                    <Textarea value={safetyForm.patientStatus} onChange={(e) => setSafetyForm({ ...safetyForm, patientStatus: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Safety confirmation narrative</Label>
                    <Textarea
                      value={safetyForm.safetyConfirmation}
                      onChange={(e) => setSafetyForm({ ...safetyForm, safetyConfirmation: e.target.value })}
                    />
                  </div>
                  <Button type="button" onClick={() => void submitSafety()}>
                    Submit patient safety confirmation
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
