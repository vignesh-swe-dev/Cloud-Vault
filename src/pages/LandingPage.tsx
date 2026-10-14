import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Zap, Globe, ArrowRight, FolderOpen, Eye, StickyNote, Check } from 'lucide-react'
import Logo from '../components/brand/Logo'
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants'

const features = [
  { icon: Shield, title: 'Private by Default', desc: 'Your files are only reachable after you sign in. Nothing is exposed through public URLs.' },
  { icon: Zap, title: 'Instant Access', desc: 'Fast uploads and downloads on top of reliable cloud storage.' },
  { icon: Globe, title: 'Access Anywhere', desc: 'Browser-first. Works on any device, any OS, any screen size.' },
  { icon: StickyNote, title: 'Built-in Notes', desc: 'Write and keep notes next to your files, with autosave on every change.' },
  { icon: Eye, title: 'Rich Previews', desc: 'Preview images, video, audio, PDFs, and text right in the browser.' },
  { icon: FolderOpen, title: 'Smart Organization', desc: 'Folders, media views, fast search, and multi-select file operations.' },
]

const stats = [
  { value: '500 MB', label: 'Free storage' },
  { value: 'OTP', label: 'Verified signup' },
  { value: 'HTTPS', label: 'Encrypted in transit' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-cv" style={{ background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <Link to="/"><Logo size={28} /></Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-14">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
          <motion.div variants={staggerItem}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border border-cv"
            style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ok)' }} />
            Now in Beta — open to everyone
          </motion.div>
          <motion.h1 variants={staggerItem} className="text-4xl sm:text-6xl font-bold leading-[1.1] text-ink-1">
            Your files.<br /><span style={{ color: 'var(--accent)' }}>Everywhere.</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="mt-5 text-base sm:text-lg text-ink-2 max-w-xl mx-auto leading-relaxed">
            A clean, private and fast file manager. Upload, organize, preview, write notes, and
            find everything from one simple interface.
          </motion.p>
          <motion.div variants={staggerItem} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary text-base px-6 py-2.5">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-2.5">Sign in</Link>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="max-w-3xl mx-auto mt-14 grid grid-cols-3 cv-card p-0 overflow-hidden">
          {stats.map(({ value, label }, i) => (
            <div key={label} className={`py-5 text-center ${i > 0 ? 'border-l border-cv' : ''}`}>
              <div className="text-xl sm:text-2xl font-bold text-ink-1">{value}</div>
              <div className="text-xs text-ink-3 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 border-y border-cv" style={{ background: 'var(--surface)' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }} className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-1 mb-2">Everything you need</h2>
            <p className="text-ink-3">Simple cloud storage that stays out of your way.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={staggerItem} className="cv-card p-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}>
                  <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-ink-1 mb-1">{title}</h3>
                <p className="text-sm text-ink-3 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-xl mx-auto text-center cv-card p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-ink-1 mb-2">Start storing securely</h2>
          <p className="text-sm text-ink-3 mb-5">500 MB free. No credit card required.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-6">
            {['No ads', 'No tracking', 'Your data stays yours'].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-ink-2 font-medium">
                <Check className="w-3.5 h-3.5" style={{ color: 'var(--ok)' }} /> {item}
              </span>
            ))}
          </div>
          <Link to="/register" className="btn-primary text-base px-7 py-2.5">Create free account</Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cv py-6 px-4 text-center" style={{ background: 'var(--surface)' }}>
        <div className="flex justify-center mb-2"><Logo size={22} /></div>
        <p className="text-xs text-ink-3">© {new Date().getFullYear()} CloudVault. All rights reserved.</p>
      </footer>
    </div>
  )
}
