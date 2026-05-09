import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export function CountdownBadge({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const ms = new Date(deadline).getTime() - now
  if (ms <= 0) {
    return <Badge variant="critical">Correction window closed · routed per escalation rules</Badge>
  }

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <Badge variant="outline" className="font-mono text-[11px]">
      {hours}h {minutes.toString().padStart(2, '0')}m {seconds.toString().padStart(2, '0')}s remaining
    </Badge>
  )
}
