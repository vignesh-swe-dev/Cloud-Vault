import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cloud, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [needsVerify, setNeedsVerify] = useState(false)
  const [resending, setResending] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNeedsVerify(false)
    try {
      const { data } = await authService.login({ email, password })
      setAuth(data.data.user, data.data.accessToken)
      toast.success(`Welcome back, ${data.data.user.name}!`)
      navigate('/dashboard')
    } catch (err: any) {
      if (err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') setNeedsVerify(true)
      toast.error(err?.response?.data?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setResending(true)
    try {
      await authService.resendVerification(email)
      toast.success('Verification email sent. Check your inbox.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Could not resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div variants={staggerItem} className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-vault-md"
              style={{ background: 'var(--accent)' }}
            >
              <Cloud className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-xl text-ink-1">CloudVault</span>
          </Link>
          <h1 className="text-2xl font-bold text-ink-1 mt-4">Sign in</h1>
          <p className="text-sm text-ink-3 mt-1">Welcome back — your files are waiting.</p>
        </motion.div>

        <motion.div variants={staggerItem} className="cv-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-1.5">Email</label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="cv-input"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-ink-2">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="cv-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              id="login-submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : 'Sign in'
              }
            </motion.button>
          </form>

          {needsVerify && (
            <div className="mt-4 p-3 rounded-lg text-sm text-ink-2" style={{ border: '1px solid var(--border)' }}>
              Your email isn't verified yet. Check your inbox (and spam) for the link.{' '}
              <button type="button" onClick={resend} disabled={resending || !email}
                className="font-medium" style={{ color: 'var(--accent)' }}>
                {resending ? 'Sending…' : 'Resend email'}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-ink-3 mt-5">
            No account?{' '}
            <Link to="/register" className="font-medium" style={{ color: 'var(--accent)' }}>
              Create one free
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
