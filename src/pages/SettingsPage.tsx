import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Sun, Moon, Monitor, User, Lock, HardDrive } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../services'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { formatBytes } from '../utils'

const THEMES = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const

function Section({ icon: Icon, title, children }: any) {
  return (
    <section className="cv-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-ink-3" />
        <h2 className="font-semibold text-sm text-ink-1">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const [name, setName] = useState(user?.name ?? '')
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const saveName = useMutation({
    mutationFn: () => authService.updateProfile(name),
    onSuccess: () => { updateUser({ name: name.trim() }); toast.success('Profile updated') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  })
  const savePw = useMutation({
    mutationFn: () => authService.changePassword(cur, next),
    onSuccess: () => { setCur(''); setNext(''); setConfirm(''); toast.success('Password changed') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  })

  const pct = user ? Math.min((user.storageUsed / user.storageQuota) * 100, 100) : 0
  const pwOk = cur && next.length >= 8 && next === confirm

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-ink-1">Settings</h1>

      <Section icon={User} title="Profile">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-ink-3">Name</label>
            <input className="cv-input mt-1" value={name} onChange={e => setName(e.target.value)} maxLength={60} />
          </div>
          <div>
            <label className="text-xs text-ink-3">Email</label>
            <input className="cv-input mt-1 opacity-70" value={user?.email ?? ''} disabled />
          </div>
          <button className="btn-primary text-sm" disabled={saveName.isPending || name.trim().length < 2 || name.trim() === user?.name}
            onClick={() => saveName.mutate()}>Save changes</button>
        </div>
      </Section>

      <Section icon={Sun} title="Appearance">
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ value, icon: Icon, label }) => (
            <button key={value} onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm transition-colors ${theme === value ? 'border-[var(--accent)] text-accent' : 'border-cv text-ink-2 hover:bg-sidebar'}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={HardDrive} title="Storage">
        <div className="storage-bar"><div className="storage-fill" style={{ width: `${pct}%` }} /></div>
        <p className="text-xs text-ink-3">{formatBytes(user?.storageUsed ?? 0)} of {formatBytes(user?.storageQuota ?? 0)} used ({Math.round(pct)}%)</p>
      </Section>

      <Section icon={Lock} title="Change password">
        <div className="space-y-3">
          <input type="password" className="cv-input" placeholder="Current password" value={cur} onChange={e => setCur(e.target.value)} autoComplete="current-password" />
          <input type="password" className="cv-input" placeholder="New password (min 8 characters)" value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" />
          <input type="password" className="cv-input" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
          {confirm && next !== confirm && <p className="text-xs" style={{ color: 'var(--danger)' }}>Passwords do not match</p>}
          <button className="btn-primary text-sm" disabled={!pwOk || savePw.isPending} onClick={() => savePw.mutate()}>Update password</button>
        </div>
      </Section>
    </div>
  )
}
