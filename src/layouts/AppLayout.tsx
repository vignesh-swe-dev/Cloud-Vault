import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import UploadDrawer from '../components/upload/UploadDrawer'
import { useUploadStore } from '../store/uploadStore'
import { AnimatePresence } from 'framer-motion'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isOpen: uploadOpen } = useUploadStore()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
      <AnimatePresence>
        {uploadOpen && <UploadDrawer />}
      </AnimatePresence>
    </div>
  )
}
