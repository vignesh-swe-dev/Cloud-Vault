import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { filesService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import { formatBytes } from '../utils'
import FileIcon from '../components/files/FileIcon'
import { useState } from 'react'
import { CloudFile } from '../types'
import FilePreviewModal from '../components/files/FilePreviewModal'
import ShareModal from '../components/files/ShareModal'

export default function FavoritesPage() {
  const { data } = useQuery({ queryKey: ['files', 'favorites'], queryFn: () => filesService.list({ favorites: 'true' }) })
  const files: CloudFile[] = data?.data?.data?.files ?? []
  const [preview, setPreview] = useState<CloudFile | null>(null)
  const [share, setShare] = useState<CloudFile | null>(null)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
        <h1 className="text-2xl font-bold">Favorites</h1>
      </motion.div>

      {files.length === 0 ? (
        <motion.div variants={staggerItem} className="glass-card text-center py-20">
          <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No favorites yet</p>
          <p className="text-white/25 text-sm mt-1">Star files to find them quickly</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map(file => (
            <motion.div key={file._id} whileHover={{ y: -3 }} className="file-card rounded-xl group" onClick={() => setPreview(file)}>
              <FileIcon mimeType={file.mimeType} category={file.category} className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-white/40 mt-1">{formatBytes(file.size)}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {preview && <FilePreviewModal file={preview} onClose={() => setPreview(null)} onShare={() => { setShare(preview); setPreview(null) }} />}
      {share && <ShareModal file={share} onClose={() => setShare(null)} />}
    </motion.div>
  )
}
