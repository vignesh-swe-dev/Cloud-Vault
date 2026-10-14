import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Trash2, ArrowLeft, ShieldCheck, Users, Files, HardDrive, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../services'
import { useAuthStore } from '../store/authStore'
import { formatBytes, formatDate, downloadBlob } from '../utils'
import FileIcon from '../components/files/FileIcon'

export default function AdminPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any | null>(null)

  const statsQ = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminService.stats, enabled: !!user?.isAdmin })
  const stats = statsQ.data?.data?.data

  const usersQ = useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.users, enabled: !!user?.isAdmin })
  const filesQ = useQuery({
    queryKey: ['admin', 'files', selected?.id],
    queryFn: () => adminService.userFiles(selected.id),
    enabled: !!selected,
  })

  const delUser = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); setSelected(null); toast.success('User deleted') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  })
  const delFile = useMutation({
    mutationFn: (id: string) => adminService.deleteFile(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); toast.success('File deleted') },
  })

  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />

  const users = usersQ.data?.data?.data?.users ?? []
  const files = filesQ.data?.data?.data?.files ?? []

  const download = async (f: any) => {
    try { const { data } = await adminService.downloadFile(f._id); downloadBlob(data, f.name) }
    catch { toast.error('Download failed') }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        <h1 className="text-xl font-bold text-ink-1">{selected ? selected.name : 'Admin'}</h1>
        {selected && (
          <button className="btn-ghost text-sm ml-2" onClick={() => setSelected(null)}>
            <ArrowLeft className="w-4 h-4" /> All users
          </button>
        )}
      </div>

      {!selected && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total users', value: stats.users, icon: Users, color: '#007AFF' },
              { label: 'Total files', value: stats.files, icon: Files, color: '#5856D6' },
              { label: 'Storage used', value: formatBytes(stats.storageUsed), icon: HardDrive, color: '#34C759' },
              { label: 'Unverified', value: stats.unverified, icon: ShieldAlert, color: '#FF9F0A' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="cv-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-ink-3">{label}</span>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-2xl font-bold text-ink-1 tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="cv-card p-4">
              <h3 className="text-sm font-semibold text-ink-1 mb-3">Files by type</h3>
              {stats.byCategory.length === 0 && <p className="text-xs text-ink-3">No files yet.</p>}
              {stats.byCategory.map((c: any) => (
                <div key={c.category} className="flex items-center gap-3 text-xs mb-2">
                  <span className="w-20 capitalize text-ink-2">{c.category}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(c.size / Math.max(1, stats.byCategory[0].size)) * 100}%`, background: 'var(--accent)' }} />
                  </div>
                  <span className="w-14 text-right text-ink-3">{c.count} · {formatBytes(c.size)}</span>
                </div>
              ))}
            </div>
            <div className="cv-card p-4">
              <h3 className="text-sm font-semibold text-ink-1 mb-3">Latest signups</h3>
              {stats.latest.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between text-xs py-1.5">
                  <span className="truncate text-ink-1">{u.name} <span className="text-ink-3">· {u.email}</span></span>
                  <span className="text-ink-3 shrink-0 ml-2">{formatDate(u.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selected ? (
        <div className="cv-card overflow-hidden">
          {users.length === 0 && <p className="p-6 text-sm text-ink-3">No users.</p>}
          {users.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-cv last:border-0">
              <button className="flex-1 min-w-0 text-left" onClick={() => setSelected(u)}>
                <p className="text-sm font-medium text-ink-1 truncate">
                  {u.name} {u.isAdmin && <span className="badge ml-1">admin</span>}
                  {!u.emailVerified && <span className="badge ml-1">unverified</span>}
                </p>
                <p className="text-xs text-ink-3 truncate">{u.email}</p>
              </button>
              <span className="hidden sm:block text-xs text-ink-3 w-16 text-right">{u.fileCount} files</span>
              <span className="hidden sm:block text-xs text-ink-3 w-20 text-right">{formatBytes(u.storageUsed)}</span>
              <span className="hidden md:block text-xs text-ink-3 w-28 text-right">{formatDate(u.createdAt)}</span>
              {!u.isAdmin && (
                <button className="btn-icon hover:text-danger" title="Delete user"
                  onClick={() => { if (window.confirm(`Delete ${u.email} and ALL their files?`)) delUser.mutate(u.id) }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="cv-card overflow-hidden">
          <div className="px-4 py-3 border-b border-cv text-xs text-ink-3">{selected.email}</div>
          {files.length === 0 && <p className="p-6 text-sm text-ink-3">This user has no files.</p>}
          {files.map((f: any) => (
            <div key={f._id} className="flex items-center gap-3 px-4 py-2.5 border-b border-cv last:border-0">
              <FileIcon mimeType={f.mimeType} category={f.category} className="w-8 h-8 shrink-0" />
              <span className="flex-1 min-w-0 text-sm text-ink-1 truncate">{f.name}</span>
              <span className="hidden sm:block text-xs text-ink-3 w-20 text-right">{formatBytes(f.size)}</span>
              <button className="btn-icon" title="Download" onClick={() => download(f)}><Download className="w-4 h-4" /></button>
              <button className="btn-icon hover:text-danger" title="Delete"
                onClick={() => { if (window.confirm('Delete this file?')) delFile.mutate(f._id) }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
