import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Cloud, Download, Lock, Clock, Loader2, AlertTriangle } from 'lucide-react'
import { sharesService } from '../services'
import { formatBytes, formatDateTime, downloadBlob } from '../utils'
import { staggerContainer, staggerItem } from '../animations/variants'
import FileIcon from '../components/files/FileIcon'
import toast from 'react-hot-toast'

export default function SharedFilePage() {
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState('')
  const [enteredPassword, setEnteredPassword] = useState<string | undefined>()
  const [downloading, setDownloading] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shared', token, enteredPassword],
    queryFn: () => sharesService.getShared(token!, enteredPassword),
    retry: false,
    enabled: !!token,
  })

  const sharedData = data?.data?.data
  const file = sharedData?.file
  const needsPassword = (error as any)?.response?.data?.requiresPassword

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnteredPassword(password)
  }

  const handleDownload = async () => {
    if (!sharedData?.allowDownload) { toast.error('Download not allowed'); return }
    setDownloading(true)
    try {
      const { data: blob } = await sharesService.downloadShared(token!, enteredPassword)
      downloadBlob(blob, file?.name ?? 'download')
    } catch { toast.error('Download failed') }
    finally { setDownloading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center gap-2 px-8 py-4 border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
        <div className="w-8 h-8 rounded-lg bg-vault-gradient flex items-center justify-center">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-gradient">CloudVault</span>
        <span className="text-white/30 ml-2 text-sm">Shared File</span>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full max-w-md">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-vault-400 animate-spin" />
            </div>
          )}

          {needsPassword && !enteredPassword && (
            <motion.div variants={staggerItem} className="glass-card text-center">
              <Lock className="w-12 h-12 text-vault-400 mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-2">Password Protected</h2>
              <p className="text-white/50 text-sm mb-6">Enter the password to access this file</p>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password" required className="input" autoFocus />
                <button type="submit" className="btn-primary w-full py-2.5">Unlock</button>
              </form>
            </motion.div>
          )}

          {error && !needsPassword && (
            <motion.div variants={staggerItem} className="glass-card text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-2">Link Unavailable</h2>
              <p className="text-white/50 text-sm">{(error as any)?.response?.data?.message ?? 'This share link is invalid or has expired.'}</p>
            </motion.div>
          )}

          {file && (
            <motion.div variants={staggerItem} className="glass-card text-center">
              <FileIcon mimeType={file.mimeType} category="other" className="w-16 h-16 mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-1 truncate">{file.name}</h2>
              <p className="text-white/50 text-sm mb-1">{formatBytes(file.size)}</p>
              <p className="text-white/30 text-xs mb-6">Shared on {formatDateTime(file.createdAt)}</p>

              {sharedData.allowDownload ? (
                <motion.button onClick={handleDownload} disabled={downloading}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center gap-2 mx-auto px-8 py-3">
                  {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> Download File</>}
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                  <Lock className="w-4 h-4" /> Download not allowed by owner
                </div>
              )}

              {sharedData.expiresAt && (
                <div className="flex items-center justify-center gap-1.5 text-white/30 text-xs mt-4">
                  <Clock className="w-3.5 h-3.5" /> Expires {formatDateTime(sharedData.expiresAt)}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
