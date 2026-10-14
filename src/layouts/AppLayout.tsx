import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import UploadDrawer from '../components/upload/UploadDrawer'
import { useUploadStore } from '../store/uploadStore'
import { AnimatePresence } from 'framer-motion'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isOpen: uploadOpen } = useUploadStore()
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'transparent' }}>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:translate-x-0 md:z-10
          bg-[var(--bg)] md:bg-transparent ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
      <AnimatePresence>{uploadOpen && <UploadDrawer />}</AnimatePresence>
    </div>
  )
}
