import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { LogoMark } from '../components/brand/Logo'
import { authService } from '../services'
import { staggerContainer, staggerItem } from '../animations/variants'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-app">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div variants={staggerItem} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <LogoMark size={28} />
            <span className="font-bold text-xl text-ink-1">CloudVault</span>
          </Link>
          <h1 className="text-3xl font-bold text-ink-1">Reset password</h1>
          <p className="text-ink-3 mt-2">We'll send you a reset link</p>
        </motion.div>
        <motion.div variants={staggerItem} className="cv-card p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="font-semibold text-lg mb-2 text-ink-1">Check your email</h2>
              <p className="text-ink-3 text-sm mb-6">If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.</p>
              <Link to="/login" className="btn-ghost flex items-center gap-2 justify-center"><ArrowLeft className="w-4 h-4" /> Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="cv-input" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </button>
              <Link to="/login" className="btn-ghost flex items-center gap-2 justify-center w-full"><ArrowLeft className="w-4 h-4" /> Back to login</Link>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
