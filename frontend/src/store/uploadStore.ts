import { create } from 'zustand'
import { UploadItem } from '../types'

interface UploadStore {
  isOpen: boolean
  items: UploadItem[]
  openDrawer: () => void
  closeDrawer: () => void
  addItems: (items: UploadItem[]) => void
  updateItem: (id: string, patch: Partial<UploadItem>) => void
  removeItem: (id: string) => void
  clearDone: () => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  isOpen: false,
  items: [],
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  addItems: (items) => set((s) => ({ items: [...s.items, ...items], isOpen: true })),
  updateItem: (id, patch) => set((s) => ({ items: s.items.map(i => i.id === id ? { ...i, ...patch } : i) })),
  removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
  clearDone: () => set((s) => ({ items: s.items.filter(i => i.status !== 'done') })),
}))
