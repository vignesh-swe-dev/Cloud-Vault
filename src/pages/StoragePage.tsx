import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { HardDrive } from 'lucide-react'
import { storageService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import { formatBytes } from '../utils'
import { categoryColor } from '../utils'
import { FileCategory } from '../types'

export default function StoragePage() {
  const { data } = useQuery({ queryKey: ['storage'], queryFn: () => storageService.usage() })
  const storage = data?.data?.data
  const usedPct = storage ? Math.min((storage.storageUsed / storage.storageQuota) * 100, 100) : 0

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <HardDrive className="w-7 h-7" style={{ color: 'var(--accent)' }} />
        <h1 className="text-2xl font-bold text-ink-1">Storage</h1>
      </motion.div>

      <motion.div variants={staggerItem} className="cv-card p-6">
        <div className="flex justify-between mb-2">
          <span className="text-ink-2 font-medium">Used</span>
          <span className="font-semibold text-ink-1">{formatBytes(storage?.storageUsed ?? 0)} / {formatBytes(storage?.storageQuota ?? 0)}</span>
        </div>
        <div className="h-5 bg-cv rounded-full overflow-hidden mb-4">
          <motion.div className="h-full rounded-full"
            style={{ background: usedPct > 90 ? 'var(--danger, #ef4444)' : 'var(--accent)' }}
            initial={{ width: 0 }} animate={{ width: `${usedPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold text-ink-1">{formatBytes(storage?.storageUsed ?? 0)}</p><p className="text-xs text-ink-3 mt-1">Used</p></div>
          <div><p className="text-2xl font-bold text-ink-1">{formatBytes((storage?.storageQuota ?? 0) - (storage?.storageUsed ?? 0))}</p><p className="text-xs text-ink-3 mt-1">Free</p></div>
          <div><p className="text-2xl font-bold text-ink-1">{storage?.totalFiles ?? 0}</p><p className="text-xs text-ink-3 mt-1">Files</p></div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="cv-card p-6">
        <h2 className="font-semibold text-lg mb-4 text-ink-1">By Category</h2>
        <div className="space-y-4">
          {(storage?.byCategory ?? []).sort((a: any, b: any) => b.size - a.size).map((cat: any) => {
            const pct = storage ? (cat.size / storage.storageUsed) * 100 : 0
            const colorCls = categoryColor(cat.category as FileCategory)
            const barColor = colorCls.split(' ')[0].replace('text-', 'bg-')
            return (
              <div key={cat.category}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={`font-medium ${colorCls.split(' ')[0]} capitalize`}>{cat.category}</span>
                  <span className="text-ink-3">{formatBytes(cat.size)} · {cat.count} files</span>
                </div>
                <div className="h-2 bg-cv rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${barColor}`}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            )
          })}
          {(!storage?.byCategory?.length) && <p className="text-ink-3 text-sm text-center py-4">No files yet</p>}
        </div>
      </motion.div>
    </motion.div>
  )
}
