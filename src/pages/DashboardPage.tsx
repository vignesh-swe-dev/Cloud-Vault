import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Files, Star, HardDrive, Clock, FolderOpen, ArrowRight, TrendingUp } from 'lucide-react'
import { filesService, storageService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import { formatBytes, formatDate, categoryColor } from '../utils'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import FileIcon from '../components/files/FileIcon'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['files', 'recent'],
    queryFn: () => filesService.list({ sort: 'createdAt', order: 'desc', limit: '8' }),
  })
  const { data: favData } = useQuery({
    queryKey: ['files', 'favorites'],
    queryFn: () => filesService.list({ favorites: 'true', limit: '4' }),
  })
  const { data: storageData } = useQuery({
    queryKey: ['storage'],
    queryFn: storageService.usage,
  })

  const recentFiles = recentData?.data?.data?.files ?? []
  const favFiles = favData?.data?.data?.files ?? []
  const storage = storageData?.data?.data
  const usedPct = storage ? Math.min((storage.storageUsed / storage.storageQuota) * 100, 100) : 0

  const stats = [
    {
      icon: Files,
      label: 'Total Files',
      value: storage?.totalFiles ?? '—',
      color: '#007AFF',
      bg: 'rgba(0,122,255,0.1)',
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: formatBytes(storage?.storageUsed ?? 0),
      color: '#5856D6',
      bg: 'rgba(88,86,214,0.1)',
    },
    {
      icon: Star,
      label: 'Favorites',
      value: favFiles.length,
      color: '#FF9F0A',
      bg: 'rgba(255,159,10,0.1)',
    },
    {
      icon: TrendingUp,
      label: 'Quota',
      value: formatBytes(storage?.storageQuota ?? 0),
      color: '#34C759',
      bg: 'rgba(52,199,89,0.1)',
    },
  ]

  const SkeletonCard = () => (
    <div className="cv-card p-3 space-y-2">
      <div className="skeleton w-11 h-11 rounded-xl" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="skeleton h-2.5 w-1/2 rounded" />
    </div>
  )

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-6xl">

      {/* Greeting */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-ink-1">
          {greeting()},{' '}
          <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="cv-card flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-ink-1 leading-tight truncate">{value}</p>
              <p className="text-xs text-ink-3 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Storage bar */}
      <motion.div variants={staggerItem} className="cv-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-ink-3" strokeWidth={2} />
            <span className="font-semibold text-sm text-ink-1">Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-3">
              {formatBytes(storage?.storageUsed ?? 0)} of {formatBytes(storage?.storageQuota ?? 0)}
            </span>
            <Link to="/storage" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              Details →
            </Link>
          </div>
        </div>
        <div className="storage-bar mb-3">
          <motion.div
            className="storage-fill"
            initial={{ width: 0 }}
            animate={{ width: `${usedPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        {storage?.byCategory && storage.byCategory.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {storage.byCategory.map((c: any) => (
              <span key={c.category} className={`badge ${categoryColor(c.category)} capitalize`}>
                {c.category} · {formatBytes(c.size)}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Files */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-ink-3" strokeWidth={2} />
            <h2 className="font-semibold text-sm text-ink-1">Recent</h2>
          </div>
          <Link to="/files" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recentFiles.length === 0 ? (
          <div className="cv-card text-center py-12 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--sidebar)' }}>
              <Files className="w-6 h-6 text-ink-3" />
            </div>
            <p className="text-sm font-medium text-ink-1">No files yet</p>
            <p className="text-xs text-ink-3">Upload your first file to get started</p>
            <Link to="/files">
              <button className="btn-primary text-sm mt-2">Upload Files</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {recentFiles.map((file: any) => (
              <motion.div
                key={file._id}
                whileHover={{ y: -2 }}
                className="file-card group"
              >
                <FileIcon mimeType={file.mimeType} category={file.category} className="w-10 h-10 mb-2.5" />
                <p className="text-sm font-medium text-ink-1 truncate leading-tight">{file.name}</p>
                <p className="text-xs text-ink-3 mt-0.5">{formatBytes(file.size)}</p>
                <p className="text-xs text-ink-3">{formatDate(file.createdAt)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Favorites */}
      {favFiles.length > 0 && (
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: '#FF9F0A' }} strokeWidth={2} />
              <h2 className="font-semibold text-sm text-ink-1">Favorites</h2>
            </div>
            <Link to="/favorites" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {favFiles.map((file: any) => (
              <motion.div key={file._id} whileHover={{ y: -2 }} className="file-card">
                <FileIcon mimeType={file.mimeType} category={file.category} className="w-10 h-10 mb-2.5" />
                <p className="text-sm font-medium text-ink-1 truncate">{file.name}</p>
                <p className="text-xs text-ink-3 mt-0.5">{formatBytes(file.size)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
