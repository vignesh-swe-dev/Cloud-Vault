import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Search, Upload, Sun, Moon, Monitor, X, ChevronRight, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useUploadStore } from '../../store/uploadStore'
import { useThemeStore } from '../../store/themeStore'
import { authService } from '../../services'
import { scaleIn } from '../../animations/variants'
import toast from 'react-hot-toast'

const THEME_OPTIONS = [
  { value: 'light',  icon: Sun,     label: 'Light' },
  { value: 'dark',   icon: Moon,    label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const

export default function Navbar({ breadcrumbs, onMenu }: { breadcrumbs?: Array<{ label: string; to?: string }>; onMenu?: () => void }) {
  const { user, clearAuth } = useAuthStore()
  const { openDrawer } = useUploadStore()
  const { theme, setTheme } = useThemeStore()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/files?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    clearAuth()
    navigate('/login')
    toast.success('Logged out')
  }

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Clear search on page change
  useEffect(() => { setSearch('') }, [location.pathname])

  const ThemeIcon = THEME_OPTIONS.find(o => o.value === theme)?.icon ?? Monitor

  return (
    <header className="cv-toolbar shrink-0 z-20">
      <button className="btn-icon md:hidden shrink-0" onClick={onMenu} aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="breadcrumb flex-1 min-w-0 max-w-xs">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="w-3 h-3 text-ink-3 shrink-0" />}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? 'current' : ''}`}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? 'current' : ''}`}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      ) : (
        <div className="flex-1 hidden md:block" />
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="relative w-full md:max-w-sm min-w-0 flex-1 md:flex-none">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search files…"
          className="cv-input pl-8 pr-8 py-1.5 text-sm h-8"
          style={{ background: 'var(--sidebar)' }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      <div className="cv-sep" />

      {/* Upload */}
      <button onClick={openDrawer} className="btn-primary text-sm py-1.5 shrink-0" aria-label="Upload">
        <Upload className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Upload</span>
      </button>

      {/* Theme toggle + profile */}
      <div ref={menuRef} className="flex items-center gap-1 relative">
        {/* Theme picker */}
        <button
          className="btn-icon"
          onClick={() => { setThemeOpen(p => !p); setMenuOpen(false) }}
          title="Change theme"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {themeOpen && (
            <motion.div
              variants={scaleIn} initial="hidden" animate="visible" exit="exit"
              className="ctx-menu absolute right-0 sm:right-10 top-full mt-1.5"
            >
              {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setThemeOpen(false) }}
                  className={`ctx-item ${theme === value ? 'font-semibold text-accent' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {theme === value && <span className="ml-auto text-accent text-xs">✓</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile */}
        <button
          onClick={() => { setMenuOpen(p => !p); setThemeOpen(false) }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              variants={scaleIn} initial="hidden" animate="visible" exit="exit"
              className="ctx-menu absolute right-0 top-full mt-1.5 w-52"
            >
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium text-ink-1 truncate">{user?.name}</p>
                <p className="text-xs text-ink-3 truncate">{user?.email}</p>
              </div>
              <div className="ctx-sep" />
              <button onClick={handleLogout} className="ctx-item danger">
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
