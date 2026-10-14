import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Cloud, LayoutDashboard, FolderOpen, Star,
  Share2, HardDrive, ChevronRight, LogOut, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services'
import { sidebarVariants } from '../../animations/variants'
import { useQuery } from '@tanstack/react-query'
import { storageService } from '../../services'
import { formatBytes } from '../../utils'
import toast from 'react-hot-toast'

const links = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/files',      icon: FolderOpen,       label: 'All Files' },
  { to: '/favorites',  icon: Star,             label: 'Favorites' },
  { to: '/shares',     icon: Share2,           label: 'Shared' },
]

const bottomLinks = [
  { to: '/storage', icon: HardDrive, label: 'Storage' },
]

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const { data: storageData } = useQuery({
    queryKey: ['storage'],
    queryFn: storageService.usage,
    enabled: !collapsed,
  })
  const storage = storageData?.data?.data
  const usedPct = storage
    ? Math.min((storage.storageUsed / storage.storageQuota) * 100, 100)
    : user
    ? Math.min((user.storageUsed / user.storageQuota) * 100, 100)
    : 0
  const usedBytes = storage?.storageUsed ?? user?.storageUsed ?? 0
  const quotaBytes = storage?.storageQuota ?? user?.storageQuota ?? 0

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    clearAuth()
    navigate('/login')
    toast.success('Logged out')
  }

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      initial={false}
      className="cv-sidebar flex flex-col h-full shrink-0 overflow-hidden relative z-10"
      style={{ willChange: 'width' }}
    >
      {/* macOS window controls (decorative) */}
      {!collapsed && <div className="mac-dots-row"><span className="mac-dots" /></div>}

      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ minHeight: 44 }}>
        <div
          className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-vault-sm"
          style={{ background: 'var(--accent)' }}
        >
          <Cloud className="w-4 h-4 text-white" strokeWidth={2.2} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-base text-ink-1 whitespace-nowrap leading-none">
                CloudVault
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="section-label"
            >
              Library
            </motion.p>
          )}
        </AnimatePresence>

        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="section-label"
            >
              Storage
            </motion.p>
          )}
        </AnimatePresence>

        {bottomLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* ── Storage indicator ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mb-2 p-3 rounded-xl overflow-hidden"
            style={{ background: 'var(--sidebar)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-ink-2">Storage</span>
              <span className="text-ink-3">{Math.round(usedPct)}%</span>
            </div>
            <div className="storage-bar mb-2">
              <motion.div
                className="storage-fill"
                initial={{ width: 0 }}
                animate={{ width: `${usedPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-ink-3">
              {formatBytes(usedBytes)} of {formatBytes(quotaBytes)} used
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User / bottom controls ── */}
      <div className="border-t border-cv px-2 py-2 space-y-0.5">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-2 py-2 mb-1 min-w-0"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-1 truncate leading-tight">{user?.name}</p>
                <p className="text-xs text-ink-3 truncate leading-tight">{user?.email}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={onToggle}
          className="sidebar-link w-full"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeft className="w-4 h-4" strokeWidth={2} />
            : <PanelLeftClose className="w-4 h-4" strokeWidth={2} />
          }
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
