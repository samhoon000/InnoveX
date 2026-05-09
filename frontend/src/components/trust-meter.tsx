import { motion } from 'framer-motion'

export function TrustMeter({
  score,
  tier,
}: {
  score: number
  tier: string
}) {
  const milestones = [
    { label: 'Bronze', max: 100 },
    { label: 'Silver', max: 250 },
    { label: 'Gold', max: 500 },
    { label: 'Platinum', max: 650 },
  ]

  const nextIdx = milestones.findIndex((m) => score < m.max)
  const nextCap = nextIdx === -1 ? milestones[milestones.length - 1].max : milestones[nextIdx].max
  const prevCap = nextIdx <= 0 ? 0 : milestones[nextIdx - 1].max

  const span = Math.max(nextCap - prevCap, 1)
  const pct = Math.min(100, Math.max(0, ((score - prevCap) / span) * 100))
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
      <div className="relative flex size-44 items-center justify-center">
        <svg className="-rotate-90" width={160} height={160}>
          <circle cx={80} cy={80} r={radius} stroke="#e8f5ee" strokeWidth={12} fill="none" />
          <motion.circle
            cx={80}
            cy={80}
            r={radius}
            stroke="#6bbd8e"
            strokeWidth={12}
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 90, damping: 15 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-ms-muted">Trust score</p>
          <p className="text-4xl font-semibold text-ms-ink">{score}</p>
          <p className="text-sm font-medium text-[#2f7d56]">{tier}</p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
        {milestones.map((m) => (
          <div key={m.label} className="rounded-xl border border-ms-accent/40 bg-white/70 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-ms-muted">{m.label}</p>
            <p className="text-lg font-semibold text-ms-ink">{m.max}+ pts</p>
          </div>
        ))}
      </div>
    </div>
  )
}
