import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export function AppShell() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ms_sidebar_collapsed') === '1')

  useRealtime(Boolean(user), user?.role ?? null)

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem('ms_sidebar_collapsed', next ? '1' : '0')
      return next
    })
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="flex min-h-screen bg-transparent text-ms-ink">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        onLogout={() => {
          logout()
          navigate('/login', { replace: true })
        }}
      />
      <motion.main layout className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-ms-accent/25 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-10">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ms-muted">Clinical intelligence workspace</p>
              <h1 className="text-2xl font-semibold text-ms-ink">
                {greeting},{' '}
                <span className="text-[#2f7d56]">{user?.anonymousAlias?.replace('Anonymous Doctor ', '') ?? 'Doctor'}</span>
              </h1>
              <p className="text-sm text-ms-muted">
                Patient Safety Trust Score ·{' '}
                <span className="font-semibold text-ms-ink">{user?.trustScore ?? 0}</span>
              </p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-3 text-xs text-ms-muted">
              All published reports mask identity as randomized aliases. Never share identifiers inside narratives.
            </div>
          </div>
        </header>
        <div className="flex-1 px-4 py-8 md:px-10">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}
