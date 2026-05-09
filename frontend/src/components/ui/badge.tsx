import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' | 'critical' }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-ms-mint/90 text-ms-ink border border-ms-accent/40',
        variant === 'outline' && 'border border-ms-accent/50 text-ms-muted bg-white/60',
        variant === 'critical' && 'bg-red-50 text-red-700 border border-red-100',
        className
      )}
      {...props}
    />
  )
}
