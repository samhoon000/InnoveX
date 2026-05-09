import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[120px] w-full rounded-xl border border-ms-accent/35 bg-white/80 px-3 py-2 text-sm text-ms-ink shadow-inner shadow-white/40 placeholder:text-ms-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ms-accent/70 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
