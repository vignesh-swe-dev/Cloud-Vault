import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import UploadDrawer from '../components/upload/UploadDrawer'
import { useUploadStore } from '../store/uploadStore'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isOpen: uploadOpen } = useUploadStore()
  const location = useLocation()

  // scroll progress bar + toolbar shadow (the scrolling element is <main>, not the window)
  const mainRef = useRef<HTMLElement>(null)
  const { scrollY, scrollYProgress } = useScroll({ container: mainRef })
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  useEffect(() => scrollY.on('change', v => setScrolled(v > 8)), [scrollY])

  useEffect(() => {
    setMobileOpen(false)
    mainRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  // button ripple
  const ripple = (e: React.PointerEvent) => {
    const btn = (e.target as HTMLElement).closest('.btn-primary, .btn-secondary') as HTMLElement | null
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const d = Math.max(r.width, r.height)
    const s = document.createElement('span')
    s.className = 'ripple'
    s.style.width = s.style.height = `${d}px`
    s.style.left = `${e.clientX - r.left - d / 2}px`
    s.style.top = `${e.clientY - r.top - d / 2}px`
    btn.appendChild(s)
    setTimeout(() => s.remove(), 650)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'transparent' }} onPointerDown={ripple}>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:translate-x-0 md:z-10
          bg-[var(--bg)] md:bg-transparent ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
      </div>

      <div data-scrolled={scrolled} className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenu={() => setMobileOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
      <AnimatePresence>{uploadOpen && <UploadDrawer />}</AnimatePresence>
    </div>
  )
}
