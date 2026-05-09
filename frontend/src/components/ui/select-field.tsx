import * as Select from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-ms-accent/35 bg-white/80 px-3 text-sm text-ms-ink shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-ms-accent/70'
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="size-4 text-ms-muted" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-50 overflow-hidden rounded-xl border border-ms-accent/40 bg-white shadow-xl">
          <Select.Viewport className="p-1">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-ms-ink outline-none data-[highlighted]:bg-ms-mint/70"
              >
                <Select.ItemText>{o.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
