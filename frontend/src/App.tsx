import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { AiAlertsPage } from '@/pages/ai-alerts-page'
import { AuthorityReviewPage } from '@/pages/authority-review-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/pages/login-page'
import { ProfilePage } from '@/pages/profile-page'
import { RewardsPage } from '@/pages/rewards-page'
import { SignupPage } from '@/pages/signup-page'
import { SubmitReportPage } from '@/pages/submit-report-page'

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center text-sm text-ms-muted">
      Initializing MediShield AI workspace…
    </div>
  )
}

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} replace />
}

function RequireGuest() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} replace />
  return <Outlet />
}

function RequireDoctor() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'authority') return <Navigate to="/authority" replace />
  return <Outlet />
}

function RequireAuthority() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'authority') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<RequireDoctor />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/submit-report" element={<SubmitReportPage />} />
          <Route path="/ai-alerts" element={<AiAlertsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<RequireAuthority />}>
        <Route path="/authority" element={<AuthorityReviewPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
