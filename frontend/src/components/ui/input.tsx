import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-ms-accent/35 bg-white/80 px-3 py-2 text-sm text-ms-ink shadow-inner shadow-white/40 placeholder:text-ms-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ms-accent/70 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'
