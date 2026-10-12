import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Cloud, Shield, Zap, Globe, ArrowRight, Share2,
  FolderOpen, Eye, Lock, Check
} from 'lucide-react'
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants'

const features = [
  { icon: Shield, title: 'Private by Default', desc: 'End-to-end encrypted storage. Your files are signed and never exposed via public URLs.' },
  { icon: Zap, title: 'Instant Access', desc: 'Upload and stream with fast local or S3-compatible storage backends.' },
  { icon: Globe, title: 'Access Anywhere', desc: 'Browser-first. Works on any device, any OS, any screen size.' },
  { icon: Share2, title: 'Secure Sharing', desc: 'Share with password protection, expiry dates, and download controls.' },
  { icon: Eye, title: 'Rich Previews', desc: 'Preview images, video, audio, PDFs, and code — right in the browser.' },
  { icon: FolderOpen, title: 'Smart Organization', desc: 'Folders, favorites, powerful search, and multi-select file operations.' },
]

const plans = [
  { storage: '5 GB', label: 'Free' },
  { storage: 'Private', label: 'Your server' },
  { storage: '256-bit', label: 'Encryption' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3.5 border-b border-cv"
        style={{ background: 'rgba(var(--surface-rgb, 255,255,255), 0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Cloud className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-base text-ink-1">CloudVault</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(0,122,255,0.15) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(88,86,214,0.15) 0%, transparent 70%)' }}
          />
        </div>

        <motion.div
          variants={staggerContainer} initial="hidden" animate="visible"
          className="relative text-center max-w-3xl mx-auto"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border border-cv"
            style={{ background: 'var(--surface)', color: 'var(--accent)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--ok)' }} />
            Now in Beta — Open to Everyone
          </motion.div>

          <motion.h1 variants={staggerItem} className="text-5xl md:text-7xl font-black mb-6 leading-[1.08] tracking-tight text-ink-1">
            Your Files.<br />
            <span style={{ color: 'var(--accent)' }}>Everywhere.</span>
          </motion.h1>

          <motion.p variants={staggerItem} className="text-lg text-ink-2 mb-10 max-w-xl mx-auto leading-relaxed">
            A clean, private, and blazing-fast file manager. Upload, organize, preview,
            edit, and share — all from one beautiful interface.
          </motion.p>

          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn-primary text-base px-7 py-3 gap-2"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn-secondary text-base px-7 py-3"
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} className="mt-16 flex items-center justify-center gap-10">
            {plans.map(({ storage, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--accent)' }}>
                  {storage}
                </div>
                <div className="text-xs text-ink-3 mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink-1 mb-3">Everything you need</h2>
            <p className="text-ink-3">A complete cloud storage solution — private, fast, and beautiful.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                whileHover={{ y: -3 }}
                className="cv-card p-5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(0,122,255,0.09)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-ink-1 mb-1.5">{title}</h3>
                <p className="text-sm text-ink-3 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center cv-card p-10"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(0,122,255,0.1)' }}>
            <Lock className="w-6 h-6" style={{ color: 'var(--accent)' }} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-ink-1 mb-3">Start storing securely</h2>
          <p className="text-sm text-ink-3 mb-6 leading-relaxed">
            5 GB free storage, no credit card required.<br />
            Full control over your data.
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            {['No ads', 'No tracking', 'Open source'].map(item => (
              <span key={item} className="flex items-center gap-1 text-xs text-ink-2 font-medium">
                <Check className="w-3.5 h-3.5" style={{ color: 'var(--ok)' }} />
                {item}
              </span>
            ))}
          </div>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-primary text-base px-8 py-2.5"
            >
              Create Free Account
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cv py-6 px-6 text-center" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Cloud className="w-4 h-4 text-ink-3" strokeWidth={2} />
          <span className="font-semibold text-sm text-ink-2">CloudVault</span>
        </div>
        <p className="text-xs text-ink-3">
          © {new Date().getFullYear()} CloudVault. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
