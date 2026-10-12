import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cloud, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data } = await authService.register({ name, email, password })
      setAuth(data.data.user, data.data.accessToken)
      toast.success(`Welcome, ${data.data.user.name}!`)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="w-full max-w-sm"
      >
        <motion.div variants={staggerItem} className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-vault-md"
              style={{ background: 'var(--accent)' }}>
              <Cloud className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-xl text-ink-1">CloudVault</span>
          </Link>
          <h1 className="text-2xl font-bold text-ink-1 mt-4">Create account</h1>
          <p className="text-sm text-ink-3 mt-1">5 GB free. No credit card required.</p>
        </motion.div>

        <motion.div variants={staggerItem} className="cv-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-1.5">Full Name</label>
              <input
                type="text"
                id="register-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                autoComplete="name"
                className="cv-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-1.5">Email</label>
              <input
                type="email"
                id="register-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="cv-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  id="register-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              {/* Password strength */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        background: i <= strength
                          ? (strength === 1 ? 'var(--danger)' : strength === 2 ? 'var(--warn)' : 'var(--ok)')
                          : 'var(--border)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              id="register-submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : 'Create account'
              }
            </motion.button>
          </form>

          <p className="text-center text-sm text-ink-3 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
