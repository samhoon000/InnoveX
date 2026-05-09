import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const user = await login(identifier.trim(), password)
      toast.success('Authenticated securely.')
      navigate(user.role === 'authority' ? '/authority' : '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-ms-mint/80 shadow-inner shadow-white/60">
            <Shield className="size-8 text-[#2f7d56]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ms-muted">MediShield AI · SafeDx</p>
            <h2 className="mt-2 text-3xl font-semibold text-ms-ink">Hospital-grade confidential workspace</h2>
          </div>
        </div>

        <Card className="border-ms-accent/50 shadow-xl shadow-ms-accent/20">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Hospital ID</Label>
                <Input
                  id="identifier"
                  autoComplete="username"
                  placeholder="you@hospital.org or DOC1023"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Authenticating…' : 'Login'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-ms-muted">
              Don't have an account?{' '}
              <Link className="font-semibold text-[#2f7d56] underline-offset-4 hover:underline" to="/signup">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
