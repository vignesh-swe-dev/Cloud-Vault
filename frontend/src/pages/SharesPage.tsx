import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Share2, Trash2, Copy, Check, Link2, Lock, Clock } from 'lucide-react'
import { sharesService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import { formatDateTime } from '../utils'
import { useState } from 'react'
import { Share } from '../types'
import toast from 'react-hot-toast'

export default function SharesPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['shares'], queryFn: () => sharesService.list() })
  const shares: Share[] = data?.data?.data?.shares ?? []
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const deleteMut = useMutation({ mutationFn: (id: string) => sharesService.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['shares'] }); toast.success('Share revoked') } })

  const copyLink = (share: Share) => {
    const url = `${window.location.origin}/shared/${(share as any).tokenHash?.slice(0, 8) ?? 'link'}`
    navigator.clipboard.writeText(url)
    setCopiedId(share._id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Copied!')
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <Share2 className="w-7 h-7 text-green-400" />
        <h1 className="text-2xl font-bold">Shared Files</h1>
      </motion.div>

      {shares.length === 0 ? (
        <motion.div variants={staggerItem} className="glass-card text-center py-20">
          <Share2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No shared links yet</p>
          <p className="text-white/25 text-sm mt-1">Share files from the Files page</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {shares.map(share => {
            const file = share.fileId as any
            const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date()
            return (
              <div key={share._id} className={`glass p-4 rounded-xl flex items-center gap-4 ${isExpired ? 'opacity-50' : ''}`}>
                <Link2 className="w-5 h-5 text-vault-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{typeof file === 'object' ? file?.name : 'File'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {share.passwordHash && <span className="flex items-center gap-1 text-xs text-white/40"><Lock className="w-3 h-3" /> Password</span>}
                    {share.expiresAt && <span className="flex items-center gap-1 text-xs text-white/40"><Clock className="w-3 h-3" /> {isExpired ? 'Expired' : `Expires ${formatDateTime(share.expiresAt)}`}</span>}
                    <span className="text-xs text-white/30">{share.accessCount} views</span>
                    <span className="text-xs text-white/30">Created {formatDateTime(share.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => copyLink(share)} className="btn-ghost p-2">
                    {copiedId === share._id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteMut.mutate(share._id)} className="btn-ghost p-2 text-white/40 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
