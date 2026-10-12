import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  isDark: () => boolean
}

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      isDark: () => {
        const t = get().theme
        if (t === 'dark') return true
        if (t === 'light') return false
        return getSystemDark()
      },
    }),
    { name: 'cloudvault-theme' },
  ),
)

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    if (getSystemDark()) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}

export function initTheme() {
  const stored = localStorage.getItem('cloudvault-theme')
  try {
    const parsed = stored ? JSON.parse(stored) : null
    const theme: Theme = parsed?.state?.theme ?? 'system'
    applyTheme(theme)
  } catch {
    applyTheme('system')
  }

  // Listen for system changes when theme=system
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const stored2 = localStorage.getItem('cloudvault-theme')
    try {
      const parsed2 = stored2 ? JSON.parse(stored2) : null
      const t: Theme = parsed2?.state?.theme ?? 'system'
      if (t === 'system') applyTheme('system')
    } catch {}
  })
}
