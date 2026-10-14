import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Film, Music, FileText } from 'lucide-react'
import { filesService } from '../services'
import { buildApiUrl } from '../utils/apiUrl'
import { formatBytes } from '../utils'
import FileIcon from '../components/files/FileIcon'
import FilePreviewModal from '../components/files/FilePreviewModal'

const TABS = [
  { key: 'image', label: 'Images', icon: ImageIcon },
  { key: 'video', label: 'Videos', icon: Film },
  { key: 'audio', label: 'Audio', icon: Music },
  { key: 'document', label: 'Documents', icon: FileText },
]

function Thumb({ file }: { file: any }) {
  const [failed, setFailed] = useState(false)
  if (file.category !== 'image' || failed) {
    return <div className="w-full h-full flex items-center justify-center"><FileIcon mimeType={file.mimeType} category={file.category} className="w-12 h-12" /></div>
  }
  return (
    <img src={buildApiUrl(`/files/${file._id}/download`)} alt={file.name} loading="lazy"
      onError={() => setFailed(true)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
  )
}

export default function MediaPage() {
  const [tab, setTab] = useState('image')
  const [preview, setPreview] = useState<any | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['media', tab],
    queryFn: () => filesService.list({ folderId: 'all', category: tab, limit: '100', sort: 'createdAt', order: 'desc' }),
  })
  const files: any[] = data?.data?.data?.files ?? []

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-1">Media</h1>
        <p className="text-sm text-ink-3">Everything you uploaded, from every folder.</p>
      </div>

      <div className="seg-ctrl w-fit max-w-full overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={tab === key ? 'active' : ''}>
            <Icon className="w-3.5 h-3.5 inline mr-1.5" />{label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="cv-card text-center py-16 text-sm text-ink-3">Nothing here yet. Upload some files from All Files.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <AnimatePresence mode="popLayout">
            {files.map((f, i) => (
              <motion.button
                key={f._id} layout
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setPreview(f)}
                className="group text-left rounded-xl overflow-hidden border border-cv bg-surface hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden" style={{ background: 'var(--sidebar)' }}><Thumb file={f} /></div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-medium text-ink-1 truncate">{f.name}</p>
                  <p className="text-[11px] text-ink-3">{formatBytes(f.size)}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {preview && <FilePreviewModal file={preview} onClose={() => setPreview(null)} onShare={() => {}} />}
    </div>
  )
}
