import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { filesService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import { formatBytes, formatDate } from '../utils'
import FileIcon from '../components/files/FileIcon'
import { CloudFile } from '../types'
import toast from 'react-hot-toast'

export default function TrashPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['files', 'trash'], queryFn: () => filesService.list({ trashed: 'true' }) })
  const files: CloudFile[] = data?.data?.data?.files ?? []

  const restoreMut = useMutation({ mutationFn: (id: string) => filesService.restore(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['files'] }); toast.success('File restored') } })
  const permDeleteMut = useMutation({ mutationFn: (id: string) => filesService.permanentDelete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['files'] }); toast.success('Permanently deleted') } })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <Trash2 className="w-7 h-7 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          <p className="text-white/50 text-sm">Files here are not counted toward storage quota</p>
        </div>
      </motion.div>

      {files.length === 0 ? (
        <motion.div variants={staggerItem} className="glass-card text-center py-20">
          <Trash2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">Trash is empty</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={staggerItem} className="flex items-center gap-2 p-4 glass rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-300/80">Files in trash can be restored or permanently deleted. Permanent deletion cannot be undone.</p>
          </motion.div>

          <motion.div variants={staggerItem} className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Size</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Deleted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {files.map(file => (
                  <tr key={file._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileIcon mimeType={file.mimeType} category={file.category} className="w-6 h-6 opacity-60" />
                        <span className="text-sm font-medium text-white/70 truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/40 hidden md:table-cell">{formatBytes(file.size)}</td>
                    <td className="px-4 py-3 text-sm text-white/40 hidden lg:table-cell">{file.trashedAt ? formatDate(file.trashedAt) : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => restoreMut.mutate(file._id)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-vault-600/20 text-vault-300 hover:bg-vault-600/30 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                        <button onClick={() => { if (confirm('Permanently delete? This cannot be undone.')) permDeleteMut.mutate(file._id) }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
