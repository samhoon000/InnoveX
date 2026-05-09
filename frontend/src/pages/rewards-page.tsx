import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Download } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrustMeter } from '@/components/trust-meter'

type RewardsPayload = {
  trustScore: number
  tier: string
  badges: { label: string; range: string; unlocked: boolean }[]
  certificates: { title: string; dateIssued: string; pdfUrl: string }[]
  anonymousAlias: string
}

export function RewardsPage() {
  const [data, setData] = useState<RewardsPayload | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<RewardsPayload>('/api/doctor/rewards')
        setData(res)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load rewards')
      }
    })()
  }, [])

  async function downloadCertificate(index: number) {
    try {
      const res = await apiFetch<{ body: string; filename: string }>(
        `/api/doctor/certificates/${index}/download`
      )
      const blob = new Blob([res.body], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Certificate file downloaded.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Certificate unavailable')
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-ms-muted">Recognition studio</p>
        <h2 className="text-3xl font-semibold text-ms-ink">Rewards & certificates</h2>
        <p className="text-sm text-ms-muted">
          Gamified yet HIPAA-conscious accolades mapped to your anonymized alias{' '}
          <span className="font-semibold text-ms-ink">{data?.anonymousAlias ?? '…'}</span>
        </p>
      </div>

      <Card className="border-ms-accent/35 bg-white/85">
        <CardHeader>
          <CardTitle>Patient Safety Trust Score</CardTitle>
          <CardDescription>Animated progress toward institutional excellence tiers.</CardDescription>
        </CardHeader>
        <CardContent>
          {data ? (
            <TrustMeter score={data.trustScore} tier={data.tier} />
          ) : (
            <Skeleton className="h-44 w-full" />
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-ms-ink">Earned badges</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(data?.badges ?? Array.from({ length: 4 })).map((badge, idx) => (
            <motion.div key={'label' in badge ? badge.label : idx} whileHover={{ y: -4 }} className="rounded-2xl border border-ms-accent/35 bg-white/80 p-4 shadow-md shadow-ms-accent/10">
              {'label' in badge ? (
                <>
                  <div className="flex items-center gap-2">
                    <Award className={`size-5 ${badge.unlocked ? 'text-[#2f7d56]' : 'text-ms-muted'}`} />
                    <p className="font-semibold text-ms-ink">{badge.label}</p>
                  </div>
                  <p className="mt-2 text-xs text-ms-muted">{badge.range}</p>
                  <Badge className="mt-3" variant={badge.unlocked ? 'default' : 'outline'}>
                    {badge.unlocked ? 'Unlocked' : 'Locked'}
                  </Badge>
                </>
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-ms-ink">Certificates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(data?.certificates ?? []).map((cert, index) => (
            <Card key={cert.title + cert.dateIssued} className="border-ms-accent/40 bg-gradient-to-br from-white to-ms-panel/70">
              <CardHeader>
                <CardTitle className="text-lg">{cert.title}</CardTitle>
                <CardDescription>Issued {new Date(cert.dateIssued).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => void downloadCertificate(index)}>
                  <Download className="size-4" />
                  Download PDF
                </Button>
                {cert.pdfUrl ? (
                  <Button type="button" variant="ghost" onClick={() => window.open(cert.pdfUrl, '_blank')}>
                    Preview hosted PDF
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {data && data.certificates.length === 0 && <p className="text-sm text-ms-muted">Submit reconciliations to unlock certificates.</p>}
        </div>
      </section>
    </div>
  )
}
