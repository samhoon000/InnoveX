import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, Filter, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

type DashboardPayload = {
  overview: {
    reportsSubmitted: number
    aiAlertsReceived: number
    patientSafetyTrustScore: number
    certificatesEarned: number
    openAlerts: number
  }
  safetyTrend: { date: string; safe: number; flagged: number }[]
  topInsights: { anonymousDoctorName: string; aiAnalysis?: { warning?: string }; createdAt: string }[]
}

type FeedPayload = {
  items: {
    _id: string
    anonymousDoctorName: string
    symptoms: string
    medicines: string
    diagnosis: string
    patientCondition: string
    createdAt: string
    aiAnalysis?: { isCorrect?: boolean; warning?: string }
  }[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export function DashboardPage() {
  const [dash, setDash] = useState<DashboardPayload | null>(null)
  const [feed, setFeed] = useState<FeedPayload | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadDash()
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadFeed()
    }, 350)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page])

  async function loadDash() {
    try {
      const res = await apiFetch<DashboardPayload>('/api/doctor/dashboard')
      setDash(res)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to load dashboard')
    }
  }

  async function loadFeed() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '6', q: query })
      const res = await apiFetch<FeedPayload>(`/api/doctor/reports?${params.toString()}`)
      setFeed(res)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to load reports')
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo(() => dash?.safetyTrend ?? [], [dash])

  async function exportReports() {
    try {
      const rows = await apiFetch<unknown[]>('/api/doctor/reports/export')
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-reports.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    }
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(dash
          ? [
              { label: 'Reports Submitted', value: dash.overview.reportsSubmitted },
              { label: 'AI Alerts Received', value: dash.overview.aiAlertsReceived },
              { label: 'Patient Safety Trust Score', value: dash.overview.patientSafetyTrustScore },
              { label: 'Certificates Earned', value: dash.overview.certificatesEarned },
            ]
          : Array.from({ length: 4 }).map((_, i) => ({ label: `metric-${i}`, value: null }))
        ).map((card, idx) => (
          <motion.div key={dash ? card.label : `metric-skel-${idx}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="border-ms-accent/35 bg-gradient-to-br from-white/90 to-ms-panel/70">
              <CardHeader className="pb-2">
                <CardDescription>{dash ? card.label : <Skeleton className="h-4 w-32" />}</CardDescription>
                <CardTitle className="text-3xl">
                  {dash ? (
                    card.value
                  ) : (
                    <Skeleton className="mt-2 h-9 w-16" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-ms-muted">
                {dash && idx === 1 && (
                  <Badge variant="outline">{dash.overview.openAlerts} active investigations</Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-ms-accent/35 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Safety signal trend</CardTitle>
              <CardDescription>Aggregated anonymized reconciliation outcomes · trailing 30 days</CardDescription>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={() => void loadDash()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="h-[280px]">
            {dash ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="safe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6bbd8e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6bbd8e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="flagged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 8" stroke="#d9f3e4" />
                  <XAxis dataKey="date" tick={{ fill: '#4a6358', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#4a6358', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#d9f3e4' }} />
                  <Area type="monotone" dataKey="safe" stroke="#2f7d56" fillOpacity={1} fill="url(#safe)" />
                  <Area type="monotone" dataKey="flagged" stroke="#ea580c" fillOpacity={1} fill="url(#flagged)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="border-ms-accent/35">
          <CardHeader>
            <CardTitle>Top learning insights</CardTitle>
            <CardDescription>Latest AI reconciliation narratives without identifiers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(dash?.topInsights ?? []).map((insight) => (
              <div key={insight.createdAt + insight.anonymousDoctorName} className="rounded-xl bg-white/70 p-3 shadow-inner shadow-white/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-ms-muted">{insight.anonymousDoctorName}</p>
                <p className="mt-2 text-sm text-ms-ink">{insight.aiAnalysis?.warning}</p>
              </div>
            ))}
            {!dash && (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-ms-ink">Community anonymized reports</h3>
            <p className="text-sm text-ms-muted">Structured peer learning feed · PHI-safe narratives only.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-ms-muted" />
              <Input className="pl-9 md:w-72" placeholder="Search symptoms, medicines…" value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} />
            </div>
            <Button variant="outline" type="button" onClick={() => void loadFeed()}>
              <Filter className="size-4" />
              Apply filters
            </Button>
            <Button variant="secondary" type="button" onClick={() => void exportReports()}>
              <Download className="size-4" />
              Export my reports
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-52 w-full" />
            ))}

          {!loading &&
            feed?.items.map((item) => (
              <motion.article key={item._id} layout className="rounded-2xl border border-ms-accent/35 bg-white/80 p-5 shadow-lg shadow-ms-accent/10">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#2f7d56]">{item.anonymousDoctorName}</p>
                  <Badge variant={item.aiAnalysis?.isCorrect ? 'default' : 'critical'}>
                    {item.aiAnalysis?.isCorrect ? 'Validated' : 'Review signal'}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-ms-muted">Symptoms · </span>
                    {item.symptoms}
                  </p>
                  <p>
                    <span className="font-semibold text-ms-muted">Medicine prescribed · </span>
                    {item.medicines}
                  </p>
                  <p>
                    <span className="font-semibold text-ms-muted">Outcome / diagnosis notes · </span>
                    {item.diagnosis}
                  </p>
                  <p>
                    <span className="font-semibold text-ms-muted">Learning summary · </span>
                    {item.aiAnalysis?.warning}
                  </p>
                  <p className="text-xs text-ms-muted">
                    <span className="font-semibold">Condition:</span> {item.patientCondition} ·{' '}
                    <span className="font-semibold">Time:</span> {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.article>
            ))}
        </div>

        {feed && feed.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-ms-muted">
              Page {feed.page} of {feed.totalPages} · {feed.total} narratives
            </p>
            <div className="flex gap-2">
              <Button variant="outline" type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <Button variant="outline" type="button" disabled={page >= feed.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
