import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Link2, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { CloudFile } from '../../types'
import { modalOverlay, modalContent } from '../../animations/variants'
import { sharesService } from '../../services'
import { formatDateTime } from '../../utils'
import toast from 'react-hot-toast'

interface Props { file: CloudFile; onClose: () => void }

export default function ShareModal({ file, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [allowDownload, setAllowDownload] = useState(true)
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const { data } = await sharesService.create({
        fileId: file._id,
        ...(password ? { password } : {}),
        ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
        allowDownload,
      })
      const token = data.data.share.token
      const url = `${window.location.origin}/shared/${token}`
      setShareUrl(url)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to create share')
    } finally { setLoading(false) }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied!')
  }

  return (
    <AnimatePresence>
      <motion.div variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div variants={modalContent} initial="hidden" animate="visible" exit="exit"
          className="glass-card w-full max-w-md" onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-vault-400" />
              <h2 className="font-semibold text-lg">Share "{file.name}"</h2>
            </div>
            <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
          </div>

          {shareUrl ? (
            <div className="space-y-4">
              <p className="text-sm text-white/60">Share link created! Copy and send it.</p>
              <div className="flex gap-2">
                <input readOnly value={shareUrl} className="input text-sm flex-1" />
                <button onClick={copyLink} className="btn-primary px-4 py-2 flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={onClose} className="btn-secondary w-full py-2.5">Done</button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password (optional)</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Leave blank for no password" className="input pr-10" />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Expires (optional)</label>
                <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                  className="input" min={new Date().toISOString().slice(0, 16)} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} className="accent-violet-500 w-4 h-4" />
                <span className="text-sm text-white/70">Allow download</span>
              </label>
              <button onClick={handleCreate} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Link2 className="w-4 h-4" /> Generate Link</>}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
