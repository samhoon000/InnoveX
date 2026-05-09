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

  const nextCap =
    nextIdx === -1
      ? milestones[milestones.length - 1].max
      : milestones[nextIdx].max

  const prevCap =
    nextIdx <= 0
      ? 0
      : milestones[nextIdx - 1].max

  const span = Math.max(nextCap - prevCap, 1)

  const pct = Math.min(
    100,
    Math.max(
      0,
      ((score - prevCap) / span) * 100
    )
  )

  const radius = 54
  const circumference = 2 * Math.PI * radius

  const offset =
    circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
      {/* Circle Meter */}
      <div className="relative flex h-[180px] w-[180px] items-center justify-center">
        <svg
          className="-rotate-90"
          width={180}
          height={180}
        >
          {/* Background Circle */}
          <circle
            cx={90}
            cy={90}
            r={radius}
            stroke="#e8f5ee"
            strokeWidth={12}
            fill="none"
          />

          {/* Progress Circle */}
          <motion.circle
            cx={90}
            cy={90}
            r={radius}
            stroke="#6bbd8e"
            strokeWidth={12}
            fill="none"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: circumference,
            }}
            animate={{
              strokeDashoffset: offset,
            }}
            transition={{
              type: 'spring',
              stiffness: 90,
              damping: 15,
            }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.32em] text-ms-muted">
            TRUST SCORE
          </p>

          <p className="leading-none text-5xl font-bold text-ms-ink">
            {score}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#2f7d56]">
            {tier}
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
        {milestones.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-ms-accent/40 bg-white/70 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-wide text-ms-muted">
              {m.label}
            </p>

            <p className="text-lg font-semibold text-ms-ink">
              {m.max}+ pts
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}