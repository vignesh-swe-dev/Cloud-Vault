import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Files, Star, HardDrive, Upload, FolderPlus, StickyNote, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { filesService, storageService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import { formatBytes, formatDate } from '../utils'
import { useAuthStore } from '../store/authStore'
import { useUploadStore } from '../store/uploadStore'
import FileIcon from '../components/files/FileIcon'

const CAT_COLORS: Record<string, string> = {
  image: '#34C759', video: '#FF9F0A', audio: '#AF52DE', document: '#007AFF',
  spreadsheet: '#30B0C7', presentation: '#FF6B35', archive: '#8E8E93',
  text: '#5856D6', code: '#FF2D55', other: '#A2A2A7',
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function Ring({ pct }: { pct: number }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 130 130" className="w-32 h-32 shrink-0 -rotate-90">
      <circle cx="65" cy="65" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
      <motion.circle
        cx="65" cy="65" r={r} fill="none" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * pct) / 100 }} transition={{ duration: 1, ease: 'easeOut' }}
      />
      <text x="65" y="65" textAnchor="middle" dominantBaseline="central"
        className="rotate-90 origin-center" style={{ fill: 'var(--ink-1)', fontSize: 22, fontWeight: 700 }}>
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { openDrawer } = useUploadStore()
  const navigate = useNavigate()

  const { data: recentData, isLoading } = useQuery({
    queryKey: ['files', 'recent'],
    queryFn: () => filesService.list({ sort: 'createdAt', order: 'desc', limit: '8' }),
  })
  const { data: favData } = useQuery({
    queryKey: ['files', 'favorites'],
    queryFn: () => filesService.list({ favorites: 'true', limit: '4' }),
  })
  const { data: storageData } = useQuery({ queryKey: ['storage'], queryFn: storageService.usage })

  const recent = recentData?.data?.data?.files ?? []
  const favs = favData?.data?.data?.files ?? []
  const storage = storageData?.data?.data
  const used = storage?.storageUsed ?? 0
  const quota = storage?.storageQuota ?? 1
  const pct = Math.min((used / quota) * 100, 100)
  const cats: { category: string; size: number; count: number }[] = storage?.byCategory ?? []
  const maxCat = Math.max(1, ...cats.map(c => c.size))

  const newNote = async () => {
    try {
      const { data } = await filesService.createNote({ name: 'Untitled note' })
      navigate(`/editor/${data.data.file._id}`)
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Could not create note') }
  }

  const kpis = [
    { icon: Files, label: 'Total files', value: storage?.totalFiles ?? '—', color: '#007AFF' },
    { icon: HardDrive, label: 'Space used', value: formatBytes(used), color: '#5856D6' },
    { icon: HardDrive, label: 'Space free', value: formatBytes(Math.max(quota - used, 0)), color: '#34C759' },
    { icon: Star, label: 'Favorites', value: favs.length, color: '#FF9F0A' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5 max-w-6xl mx-auto">

      {/* Header + quick actions */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-3 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold text-ink-1 truncate">
            {greeting()}, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openDrawer} className="btn-primary text-sm"><Upload className="w-4 h-4" /> Upload</button>
          <button onClick={newNote} className="btn-secondary text-sm"><StickyNote className="w-4 h-4" /> New note</button>
          <Link to="/files" className="btn-secondary text-sm"><FolderPlus className="w-4 h-4" /> Files</Link>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="cv-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-ink-3">{label}</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </span>
            </div>
            <p className="text-2xl font-bold text-ink-1 tabular-nums truncate">{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Storage + breakdown */}
      <motion.div variants={staggerItem} className="cv-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm text-ink-1">Storage overview</h2>
          <Link to="/storage" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Details →</Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Ring pct={pct} />
          <div className="flex-1 w-full space-y-2.5 min-w-0">
            <p className="text-sm text-ink-2">
              <span className="font-semibold text-ink-1">{formatBytes(used)}</span> of {formatBytes(quota)} used
            </p>
            {cats.length === 0 ? (
              <p className="text-xs text-ink-3">No files yet.</p>
            ) : cats.map(c => (
              <div key={c.category} className="flex items-center gap-3 text-xs">
                <span className="w-20 capitalize text-ink-2 truncate">{c.category}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: CAT_COLORS[c.category] ?? '#8E8E93' }}
                    initial={{ width: 0 }} animate={{ width: `${(c.size / maxCat) * 100}%` }} transition={{ duration: 0.8 }} />
                </div>
                <span className="w-16 text-right text-ink-3 tabular-nums">{formatBytes(c.size)}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent files table */}
      <motion.div variants={staggerItem} className="cv-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cv">
          <h2 className="font-semibold text-sm text-ink-1">Recent files</h2>
          <Link to="/files" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8 rounded" />)}</div>
        ) : recent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-medium text-ink-1">No files yet</p>
            <p className="text-xs text-ink-3 mt-1">Upload a file or create a note to get started</p>
          </div>
        ) : (
          <ul>
            {recent.map((f: any) => (
              <li key={f._id}>
                <Link to={f.mimeType?.startsWith('text/') ? `/editor/${f._id}` : '/files'}
                  className="flex items-center gap-3 px-5 py-2.5 border-b border-cv last:border-0 hover:bg-sidebar transition-colors">
                  <FileIcon mimeType={f.mimeType} category={f.category} className="w-8 h-8 shrink-0" />
                  <span className="flex-1 min-w-0 text-sm font-medium text-ink-1 truncate">{f.name}</span>
                  <span className="hidden sm:block w-20 text-xs text-ink-3 text-right">{formatBytes(f.size)}</span>
                  <span className="hidden md:block w-28 text-xs text-ink-3 text-right">{formatDate(f.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  )
}
