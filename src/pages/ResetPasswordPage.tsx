import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cloud, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) { toast.error('Invalid reset link'); return }
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-app">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div variants={staggerItem} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-vault-sm" style={{ background: 'var(--accent)' }}><Cloud className="w-6 h-6 text-white" /></div>
            <span className="font-bold text-xl text-ink-1">CloudVault</span>
          </Link>
          <h1 className="text-3xl font-bold text-ink-1">Set new password</h1>
        </motion.div>
        <motion.div variants={staggerItem} className="cv-card p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="font-semibold text-lg mb-2 text-ink-1">Password updated!</h2>
              <p className="text-ink-3 text-sm">Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" required minLength={8} className="cv-input pr-11" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || !token}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
