import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Download,
  ShieldCheck,
  Star,
  Trophy,
} from 'lucide-react'

import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Skeleton } from '@/components/ui/skeleton'
import { TrustMeter } from '@/components/trust-meter'

type RewardsPayload = {
  trustScore: number
  tier: string
  badges: {
    label: string
    range: string
    unlocked: boolean
  }[]
  certificates: {
    title: string
    dateIssued: string
    pdfUrl: string
  }[]
  anonymousAlias: string
}

export function RewardsPage() {
  const [data, setData] = useState<RewardsPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<RewardsPayload>(
          '/api/doctor/rewards'
        )

        setData(res)
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : 'Unable to load rewards'
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function downloadCertificate(index: number) {
    try {
      const res = await apiFetch<{
        body: string
        filename: string
      }>(
        `/api/doctor/certificates/${index}/download`
      )

      const blob = new Blob([res.body], {
        type: 'text/plain;charset=utf-8',
      })

      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')

      a.href = url
      a.download = res.filename
      a.click()

      URL.revokeObjectURL(url)

      toast.success('Certificate downloaded.')
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Certificate unavailable'
      )
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-ms-muted">
          Recognition Studio
        </p>

        <h2 className="text-3xl font-semibold text-ms-ink">
          Rewards
        </h2>

        <p className="mt-2 text-sm text-ms-muted">
          Track your medical contribution achievements,
          patient safety trust score, and unlocked rewards.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-ms-accent/35 bg-white/85">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-ms-muted">
                Trust Score
              </p>

              <h3 className="mt-2 text-3xl font-bold text-ms-ink">
                {loading ? '...' : data?.trustScore ?? 0}
              </h3>
            </div>

            <ShieldCheck className="size-10 text-[#2f7d56]" />
          </CardContent>
        </Card>

        <Card className="border-ms-accent/35 bg-white/85">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-ms-muted">
                Current Tier
              </p>

              <h3 className="mt-2 text-3xl font-bold text-ms-ink">
                {loading ? '...' : data?.tier ?? 'N/A'}
              </h3>
            </div>

            <Star className="size-10 text-yellow-500" />
          </CardContent>
        </Card>

        <Card className="border-ms-accent/35 bg-white/85">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-ms-muted">
                Badges Earned
              </p>

              <h3 className="mt-2 text-3xl font-bold text-ms-ink">
                {loading
                  ? '...'
                  : data?.badges?.filter((b) => b.unlocked)
                      .length ?? 0}
              </h3>
            </div>

            <Trophy className="size-10 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Trust Meter */}
      <Card className="border-ms-accent/35 bg-white/85">
        <CardHeader>
          <CardTitle>
            Patient Safety Trust Score
          </CardTitle>

          <CardDescription>
            Your AI-assisted diagnostic reliability
            progress.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <Skeleton className="h-44 w-full" />
          ) : (
            <TrustMeter
              score={data?.trustScore ?? 0}
              tier={data?.tier ?? 'Unknown'}
            />
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-ms-ink">
          Earned Badges
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-32 rounded-2xl"
                />
              ))
            : data?.badges?.map((badge, idx) => (
                <motion.div
                  key={badge.label}
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl border border-ms-accent/35 bg-white/80 p-5 shadow-md shadow-ms-accent/10"
                >
                  <div className="flex items-center gap-2">
                    <Award
                      className={`size-5 ${
                        badge.unlocked
                          ? 'text-[#2f7d56]'
                          : 'text-ms-muted'
                      }`}
                    />

                    <p className="font-semibold text-ms-ink">
                      {badge.label}
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-ms-muted">
                    {badge.range}
                  </p>

                  <Badge
                    className="mt-4"
                    variant={
                      badge.unlocked
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {badge.unlocked
                      ? 'Unlocked'
                      : 'Locked'}
                  </Badge>
                </motion.div>
              ))}
        </div>
      </section>

      {/* Certificates */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-ms-ink">
          Certificates
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-40 rounded-2xl"
              />
            ))
          ) : data?.certificates?.length ? (
            data.certificates.map((cert, index) => (
              <Card
                key={cert.title + cert.dateIssued}
                className="border-ms-accent/40 bg-gradient-to-br from-white to-ms-panel/70"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {cert.title}
                  </CardTitle>

                  <CardDescription>
                    Issued{' '}
                    {new Date(
                      cert.dateIssued
                    ).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void downloadCertificate(index)
                    }
                  >
                    <Download className="size-4" />
                    Download PDF
                  </Button>

                  {cert.pdfUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        window.open(
                          cert.pdfUrl,
                          '_blank'
                        )
                      }
                    >
                      Preview PDF
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-ms-accent/30 bg-white/70">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Award className="mb-3 size-10 text-ms-muted" />

                <p className="font-medium text-ms-ink">
                  No certificates unlocked yet
                </p>

                <p className="mt-1 text-sm text-ms-muted">
                  Submit verified reports and resolve
                  AI alerts to unlock achievements.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}