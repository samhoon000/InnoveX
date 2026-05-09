import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  Gift,
  LayoutDashboard,
  LogOut,
  ShieldPlus,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/submit-report', label: 'Submit Report', icon: FilePlus2 },
  { to: '/ai-alerts', label: 'AI Alerts', icon: Bell },

  // UPDATED HERE
  { to: '/rewards', label: 'Rewards', icon: Gift },

  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function Sidebar({
  collapsed,
  onToggle,
  onLogout,
}: {
  collapsed: boolean
  onToggle: () => void
  onLogout: () => void
}) {
  return (
    <motion.aside
      layout
      className={cn(
        'relative z-20 flex h-full flex-col border-r border-ms-accent/35 bg-white/70 backdrop-blur-xl',
        collapsed ? 'w-[76px]' : 'w-[248px]'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-ms-mint/90 text-ms-ink shadow-inner shadow-white/60">
          <ShieldPlus className="size-6 text-[#2f7d56]" />
        </div>

        {!collapsed && (
          <div className="text-left leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ms-muted">
              SafeDx
            </p>

            <p className="text-base font-semibold text-ms-ink">
              MediShield AI
            </p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 pb-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-ms-mint/80 text-ms-ink shadow-sm shadow-ms-accent/25'
                  : 'text-ms-muted hover:bg-ms-panel/80 hover:text-ms-ink'
              )
            }
          >
            <Icon className="size-[18px] shrink-0" />

            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ms-accent/25 p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          type="button"
          onClick={onLogout}
        >
          <LogOut className="size-4" />

          {!collapsed && 'Logout'}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="absolute -right-3 top-24 hidden rounded-full border border-ms-accent/40 bg-white shadow-md lg:flex"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  )
}