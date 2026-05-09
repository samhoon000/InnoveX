import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-ms-panel/80 border border-ms-accent/20', className)} {...props} />
  )
}
