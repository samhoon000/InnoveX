import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Filter, Search } from 'lucide-react'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

type DashboardPayload = {
  overview: {
    reportsSubmitted: number
    alertsReceived: number
    trustScore: number
    certificatesEarned: number
  }
}

type FeedPayload = {
  items: {
    _id: string
    anonymousDoctorName?: string
    symptoms?: string
    medicinePrescribed?: string
    diagnosisSummary?: string
    learningSummary?: string
    patientCondition?: string
    createdAt?: string
  }[]

  page: number
  limit: number
  total: number
  totalPages: number
}

export function DashboardPage() {
  const [dash, setDash] =
    useState<DashboardPayload | null>(null)

  const [feed, setFeed] =
    useState<FeedPayload | null>(null)

  const [query, setQuery] = useState('')

  const [page, setPage] = useState(1)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    void loadDash()
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadFeed()
    }, 350)

    return () =>
      window.clearTimeout(handle)
  }, [query, page])

  async function loadDash() {
    try {
      const res =
        await apiFetch<DashboardPayload>(
          '/api/dashboard/69ffb887c87e294658348fee'
        )

      setDash(res)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard'
      )
    }
  }

  async function loadFeed() {
    setLoading(true)

    try {
      const params =
        new URLSearchParams({
          page: String(page),
          limit: '6',
          q: query,
        })

      const res =
        await apiFetch<FeedPayload>(
          `/api/reports?${params.toString()}`
        )

      setFeed(res)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Unable to load reports'
      )
    } finally {
      setLoading(false)
    }
  }

  async function exportReports() {
    try {
      toast.success(
        'Export downloaded.'
      )
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Unable to export reports'
      )
    }
  }

  const statCards = [
    {
      label: 'Reports Submitted',
      value:
        dash?.overview
          ?.reportsSubmitted ?? '--',
    },

    {
      label: 'AI Alerts Received',
      value:
        dash?.overview
          ?.alertsReceived ?? '--',
    },

    {
      label: 'Trust Score',
      value:
        dash?.overview?.trustScore ??
        '--',
    },

    {
      label: 'Certificates Earned',
      value:
        dash?.overview
          ?.certificatesEarned ?? '--',
    },
  ]

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            layout
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <Card className="border border-ms-accent/35 bg-white/80">
              <CardContent className="p-5">
                <p className="text-sm text-ms-muted">
                  {card.label}
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <h3 className="text-3xl font-semibold text-ms-ink">
                    {card.value}
                  </h3>

                  <div className="rounded-xl bg-ms-mint/60 px-3 py-1 text-xs font-medium text-[#2f7d56]">
                    Active
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-ms-ink">
              Community anonymized reports
            </h3>

            <p className="mt-1 text-sm text-ms-muted">
              Structured peer-learning
              feed with identity-safe
              clinical narratives.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-ms-muted" />

              <Input
                className="pl-9 md:w-72"
                placeholder="Search symptoms, medicines..."
                value={query}
                onChange={(e) => {
                  setPage(1)
                  setQuery(e.target.value)
                }}
              />
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={() =>
                void loadFeed()
              }
            >
              <Filter className="size-4" />
              Apply filters
            </Button>

            <Button
              variant="secondary"
              type="button"
              onClick={() =>
                void exportReports()
              }
            >
              <Download className="size-4" />
              Export reports
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {loading &&
            Array.from({
              length: 4,
            }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-56 w-full rounded-2xl"
              />
            ))}

          {!loading &&
            feed?.items?.map((item) => (
              <motion.article
                key={item._id}
                layout
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="rounded-3xl border border-ms-accent/30 bg-white/85 p-6 shadow-lg shadow-ms-accent/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-[#2f7d56]">
                      {item.anonymousDoctorName ||
                        'Anonymous Doctor'}
                    </p>

                    <p className="mt-1 text-xs text-ms-muted">
                      {item.createdAt &&
                      !isNaN(
                        new Date(
                          item.createdAt
                        ).getTime()
                      )
                        ? new Date(
                            item.createdAt
                          ).toLocaleString()
                        : 'Recently submitted'}
                    </p>
                  </div>

                  <Badge variant="destructive">
                    AI Review Signal
                  </Badge>
                </div>

                <div className="mt-5 space-y-3 text-sm leading-relaxed">
                  <p>
                    <span className="font-semibold text-ms-muted">
                      Symptoms ·{' '}
                    </span>

                    {item.symptoms || 'N/A'}
                  </p>

                  <p>
                    <span className="font-semibold text-ms-muted">
                      Medicine prescribed ·{' '}
                    </span>

                    {item.medicinePrescribed ||
                      'N/A'}
                  </p>

                  <p>
                    <span className="font-semibold text-ms-muted">
                      Diagnosis summary ·{' '}
                    </span>

                    {item.diagnosisSummary ||
                      'N/A'}
                  </p>

                  <p>
                    <span className="font-semibold text-ms-muted">
                      Learning summary ·{' '}
                    </span>

                    {item.learningSummary ||
                      'No AI summary available'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-ms-accent/20 pt-4">
                  <div className="text-xs text-ms-muted">
                    Patient condition:

                    <span className="ml-1 font-semibold capitalize text-ms-ink">
                      {item.patientCondition ||
                        'Unknown'}
                    </span>
                  </div>

                  <div className="rounded-full bg-ms-panel px-3 py-1 text-xs font-medium text-[#2f7d56]">
                    Confidential Learning
                    Feed
                  </div>
                </div>
              </motion.article>
            ))}
        </div>

        {feed && feed.totalPages > 1 && (
          <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-ms-muted">
              Page {feed.page} of{' '}
              {feed.totalPages} ·{' '}
              {feed.total} reports
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
              >
                Previous
              </Button>

              <Button
                variant="outline"
                type="button"
                disabled={
                  page >= feed.totalPages
                }
                onClick={() =>
                  setPage((p) => p + 1)
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}