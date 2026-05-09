import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [alias, setAlias] = useState('')
  const [pushAlerts, setPushAlerts] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{
          user: {
            name: string
            email: string
            anonymousAlias: string
            notificationSettings?: { pushAlerts?: boolean; emailDigest?: boolean }
          }
        }>('/api/auth/me')
        setName(res.user.name)
        setEmail(res.user.email)
        setAlias(res.user.anonymousAlias)
        setPushAlerts(res.user.notificationSettings?.pushAlerts ?? true)
        setEmailDigest(res.user.notificationSettings?.emailDigest ?? false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load profile')
      }
    })()
  }, [])

  async function saveProfile() {
    try {
      await apiFetch('/api/doctor/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          notificationSettings: { pushAlerts, emailDigest },
        }),
      })
      toast.success('Profile synchronized.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function savePassword() {
    try {
      await apiFetch('/api/doctor/profile/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      toast.success('Credential rotated.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Password update failed')
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Card className="border-ms-accent/35 bg-white/85">
        <CardHeader>
          <CardTitle>Professional identity</CardTitle>
          <CardDescription>
            Personal identifiers remain outside anonymized learning feeds. Alias rotation requires hospital IT — contact command center offline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Anonymized publishing alias</Label>
              <Input value={alias} disabled />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-ms-accent/35 bg-ms-panel/40 px-3 py-2 text-sm">
              <input type="checkbox" checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} />
              Push-equivalent instant alerts
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-ms-accent/35 bg-ms-panel/40 px-3 py-2 text-sm">
              <input type="checkbox" checked={emailDigest} onChange={(e) => setEmailDigest(e.target.checked)} />
              Daily safety digest email
            </label>
          </div>
          <Button type="button" onClick={() => void saveProfile()}>
            Save profile preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="border-ms-accent/35 bg-white/85">
        <CardHeader>
          <CardTitle>Credential rotation</CardTitle>
          <CardDescription>Use strong passphrases aligned with hospital policy.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => void savePassword()}>
              Update password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
