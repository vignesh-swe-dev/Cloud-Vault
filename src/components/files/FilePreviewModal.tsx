import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Download, Share2, Trash2, Star, StarOff, ExternalLink,
  Info, Calendar, HardDrive, Tag
} from 'lucide-react'
import { CloudFile } from '../../types'
import { modalOverlay, modalContent } from '../../animations/variants'
import {
  isImageMime, isVideoMime, isAudioMime, isPdfMime, isTextEditable,
  formatBytes, formatDateTime, downloadBlob
} from '../../utils'
import { filesService } from '../../services'
import { buildApiUrl, resolveFileUrl } from '../../utils/apiUrl'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import FileIcon from './FileIcon'

interface Props { file: CloudFile; onClose: () => void; onShare: () => void }

export default function FilePreviewModal({ file, onClose, onShare }: Props) {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: downloadUrlData } = useQuery({
    queryKey: ['file-download-url', file._id],
    queryFn: async () => {
      try {
        const res = await filesService.getDownloadUrl(file._id)
        return res.data?.data?.url as string
      } catch {
        return null
      }
    },
    staleTime: 10 * 60 * 1000,
  })

  const previewUrl = (downloadUrlData && resolveFileUrl(downloadUrlData)) || buildApiUrl(`/files/${file._id}/download`)

  const deleteMut = useMutation({
    mutationFn: () => filesService.permanentDelete(file._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] })
      qc.invalidateQueries({ queryKey: ['storage'] })
      onClose()
      toast.success('File deleted')
    },
  })
  const favMut = useMutation({
    mutationFn: () => filesService.update(file._id, { isFavorite: !file.isFavorite }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  })

  const handleDownload = async () => {
    try { const { data } = await filesService.download(file._id); downloadBlob(data, file.name) }
    catch { toast.error('Download failed') }
  }

  const renderPreview = () => {
    if (isImageMime(file.mimeType)) {
      return (
        <div className="flex items-center justify-center rounded-xl overflow-hidden"
          style={{ background: 'var(--bg)', maxHeight: '55vh' }}>
          <img
            src={previewUrl}
            alt={file.name}
            className="max-h-[55vh] max-w-full object-contain"
          />
        </div>
      )
    }
    if (isVideoMime(file.mimeType)) {
      return (
        <video controls className="w-full rounded-xl max-h-[55vh]" style={{ background: '#000' }}>
          <source src={previewUrl} type={file.mimeType} />
        </video>
      )
    }
    if (isAudioMime(file.mimeType)) {
      return (
        <div className="p-8 rounded-xl flex flex-col items-center gap-5"
          style={{ background: 'var(--bg)' }}>
          <FileIcon mimeType={file.mimeType} category={file.category} className="w-16 h-16" />
          <audio controls className="w-full max-w-sm">
            <source src={previewUrl} type={file.mimeType} />
          </audio>
        </div>
      )
    }
    if (isPdfMime(file.mimeType)) {
      return (
        <iframe
          src={previewUrl}
          title={file.name}
          className="w-full rounded-xl border border-cv"
          style={{ height: '55vh' }}
          sandbox="allow-scripts allow-same-origin"
        />
      )
    }
    if (isTextEditable(file.mimeType)) {
      return (
        <div className="text-center py-10 rounded-xl" style={{ background: 'var(--bg)' }}>
          <FileIcon mimeType={file.mimeType} category={file.category} className="w-14 h-14 mx-auto mb-4" />
          <p className="text-sm text-ink-2 mb-4">Open in the editor to view and edit this file.</p>
          <button
            onClick={() => {
              const isNote = file.category === 'text' || file.name.endsWith('.txt') || file.name.endsWith('.md')
              navigate(isNote ? `/notes/${file._id}` : `/editor/${file._id}`)
              onClose()
            }}
            className="btn-primary gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Open in {file.category === 'text' || file.name.endsWith('.txt') ? 'Notes' : 'Editor'}
          </button>
        </div>
      )
    }
    return (
      <div className="text-center py-12 rounded-xl" style={{ background: 'var(--bg)' }}>
        <FileIcon mimeType={file.mimeType} category={file.category} className="w-16 h-16 mx-auto mb-4" />
        <p className="text-sm text-ink-3">No preview available for this file type</p>
        <p className="text-xs text-ink-3 mt-1 font-mono">{file.mimeType}</p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
        className="modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          variants={modalContent} initial="hidden" animate="visible" exit="exit"
          className="modal-box"
          style={{ maxWidth: '680px' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <FileIcon mimeType={file.mimeType} category={file.category} className="w-9 h-9 shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-ink-1 truncate">{file.name}</h2>
              <p className="text-xs text-ink-3 mt-0.5">{formatBytes(file.size)}</p>
            </div>
            <button onClick={onClose} className="btn-icon shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview */}
          <div className="mb-5">{renderPreview()}</div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-3 mb-5 text-xs">
            <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-1.5 text-ink-3 mb-1">
                <HardDrive className="w-3 h-3" /> Size
              </div>
              <p className="font-medium text-ink-1">{formatBytes(file.size)}</p>
            </div>
            <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-1.5 text-ink-3 mb-1">
                <Calendar className="w-3 h-3" /> Added
              </div>
              <p className="font-medium text-ink-1">{formatDateTime(file.createdAt)}</p>
            </div>
            <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-1.5 text-ink-3 mb-1">
                <Tag className="w-3 h-3" /> Type
              </div>
              <p className="font-medium text-ink-1 truncate capitalize">{file.category}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-cv">
            <button onClick={handleDownload} className="btn-primary text-sm py-1.5 gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button onClick={onShare} className="btn-secondary text-sm py-1.5 gap-1.5">
              <Share2 className="w-3.5 h-3.5" /> Share…
            </button>
            <button onClick={() => favMut.mutate()} className="btn-secondary text-sm py-1.5 gap-1.5">
              {file.isFavorite
                ? <><StarOff className="w-3.5 h-3.5" /> Unfavorite</>
                : <><Star className="w-3.5 h-3.5" /> Favorite</>
              }
            </button>
            <button
              onClick={() => {
                if (window.confirm('Delete this file permanently?')) deleteMut.mutate()
              }}
              className="btn-secondary text-sm py-1.5 gap-1.5 ml-auto"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
