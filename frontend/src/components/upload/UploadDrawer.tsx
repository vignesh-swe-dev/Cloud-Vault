import { useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { useUploadStore } from '../../store/uploadStore'
import { filesService } from '../../services'
import { useQueryClient } from '@tanstack/react-query'
import { formatBytes } from '../../utils'
import toast from 'react-hot-toast'

export default function UploadDrawer() {
  const { items, addItems, updateItem, removeItem, clearDone, closeDrawer } = useUploadStore()
  const qc = useQueryClient()

  const startUpload = useCallback(async (item: ReturnType<typeof useUploadStore.getState>['items'][0]) => {
    updateItem(item.id, { status: 'uploading' })
    const fd = new FormData()
    fd.append('file', item.file)
    if (item.folderId) fd.append('folderId', item.folderId)
    try {
      await filesService.upload(fd, (p) => updateItem(item.id, { progress: p }))
      updateItem(item.id, { status: 'done', progress: 100 })
      qc.invalidateQueries({ queryKey: ['files'] })
      qc.invalidateQueries({ queryKey: ['storage'] })
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Upload failed'
      updateItem(item.id, { status: 'error', error: msg })
      toast.error(msg)
    }
  }, [updateItem, qc])

  const onDrop = useCallback((accepted: File[]) => {
    const newItems = accepted.map(file => ({ id: uuid(), file, progress: 0, status: 'pending' as const }))
    addItems(newItems)
    newItems.forEach(startUpload)
  }, [addItems, startUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true })

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-96 bg-dark-800 border-l border-white/10 z-50 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="font-semibold text-lg">Uploads</h2>
        <div className="flex gap-2">
          <button onClick={clearDone} className="btn-ghost text-xs py-1 px-2">Clear done</button>
          <button onClick={closeDrawer} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`mx-4 mt-4 p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer text-center
          ${isDragActive ? 'border-vault-500 bg-vault-500/10' : 'border-white/20 hover:border-white/40'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-white/40" />
        <p className="text-sm text-white/50">Drop files here or click to browse</p>
      </div>

      {/* Queue */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className="glass p-3 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-white/40">{formatBytes(item.file.size)}</p>
                  {item.status === 'uploading' && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-vault-gradient rounded-full"
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                  {item.status === 'error' && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
                </div>
                <div className="shrink-0">
                  {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-vault-400 animate-spin" />}
                  {item.status === 'done' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {item.status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                  {item.status === 'pending' && <Loader2 className="w-5 h-5 text-white/30 animate-spin" />}
                </div>
                <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-white/70 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="text-center py-10 text-white/30 text-sm">No uploads yet</div>
        )}
      </div>
    </motion.div>
  )
}
