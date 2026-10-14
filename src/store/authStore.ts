import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string; name: string; email: string; storageQuota: number; storageUsed: number; isAdmin?: boolean
}
interface AuthState {
  user: User | null; accessToken: string | null; isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  updateUser: (u: Partial<User>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, accessToken: null, isAuthenticated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      updateUser: (u) => set((s) => ({ user: s.user ? { ...s.user, ...u } : null })),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'cloudvault-auth' }
  )
)
