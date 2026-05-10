import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Hospital } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospitalId: '',
  })
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    setBusy(true)
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        hospitalId: form.hospitalId.trim().toUpperCase(),
      })
      toast.success('Hospital credential validated. Anonymous alias provisioned.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-ms-mint/80 shadow-inner shadow-white/60">
            <Hospital className="size-8 text-[#2f7d56]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ms-muted">Verified onboarding</p>
            <h2 className="mt-2 text-3xl font-semibold text-ms-ink">Link your hospital credential</h2>
            <p className="mt-2 text-sm text-ms-muted">
              Unique identifiers are provisioned offline by your institution and validated automatically — never exposed in
              community feeds.
            </p>
          </div>
        </div>

        <Card className="border-ms-accent/50 shadow-xl shadow-ms-accent/15">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>

            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hospitalId">Hospital Unique ID (Enter DOC123)</Label>
                <Input
                  id="hospitalId"
                  placeholder="DOC123"
                  autoComplete="off"
                  value={form.hospitalId}
                  onChange={(e) => setForm({ ...form, hospitalId: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto" disabled={busy}>
                  {busy ? 'Provisioning…' : 'Register'}
                </Button>
              </div>
            </form>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
