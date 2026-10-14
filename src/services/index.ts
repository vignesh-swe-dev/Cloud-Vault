import axios from 'axios'
import { api } from './api'

export interface LoginData { email: string; password: string }
export interface RegisterData { name: string; email: string; password: string }

export const authService = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyOtp: (email: string, code: string, purpose: 'signup' | 'login') => api.post('/auth/verify-otp', { email, code, purpose }),
  resendOtp: (email: string, purpose: 'signup' | 'login') => api.post('/auth/resend-otp', { email, purpose }),
}

export const filesService = {
  list: (params?: Record<string, any>) => api.get('/files', { params }),
  get: (id: string) => api.get(`/files/${id}`),
  upload: async (formData: FormData, onProgress?: (p: number) => void) => {
    const file = formData.get('file') as File
    const folderId = (formData.get('folderId') as string) || undefined
    const mimeType = file.type || 'application/octet-stream'

    // 1) ask the backend for a direct upload link
    const { data } = await api.post('/files/upload-url', { name: file.name, size: file.size, mimeType, folderId })
    const info = data.data

    // local storage (dev) / mongo: old way through the server
    if (!info?.direct) {
      return api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total)) },
      })
    }

    // 2) browser -> S3 directly (plain axios, no cookies or auth header)
    await axios.put(info.url, file, {
      headers: { 'Content-Type': info.mimeType },
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total)) },
    })

    // 3) tell the backend to save the record
    return api.post('/files/upload-complete', {
      storageKey: info.storageKey, name: file.name, size: file.size, mimeType: info.mimeType, folderId,
    })
  },
  download: async (id: string) => {
    try {
      const res = await api.get(`/files/${id}/download-url`)
      const url = res.data?.data?.url
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return axios.get(url, { responseType: 'blob' })
      }
    } catch {
      // Fallback
    }
    return api.get(`/files/${id}/download`, { responseType: 'blob' })
  },
  getDownloadUrl: (id: string) => api.get(`/files/${id}/download-url`),
  update: (id: string, data: any) => api.patch(`/files/${id}`, data),
  delete: (id: string) => api.delete(`/files/${id}`),
  restore: (id: string) => api.post(`/files/${id}/restore`),
  permanentDelete: (id: string) => api.delete(`/files/${id}/permanent`),
  bulkDelete: (fileIds: string[]) => api.post('/files/bulk-delete', { fileIds }),
  getContent: (id: string) => api.get(`/files/${id}/content`),
  updateContent: (id: string, content: string, lastModified?: string) =>
    api.put(`/files/${id}/content`, { content, lastModified }),
}

export const foldersService = {
  list: (params?: Record<string, any>) => api.get('/folders', { params }),
  create: (name: string, parentId?: string | null) => api.post('/folders', { name, parentId }),
  update: (id: string, name: string) => api.patch(`/folders/${id}`, { name }),
  delete: (id: string) => api.delete(`/folders/${id}`),
  move: (id: string, parentId: string | null) => api.post(`/folders/${id}/move`, { parentId }),
}

export const sharesService = {
  create: (data: any) => api.post('/shares', data),
  list: () => api.get('/shares'),
  delete: (id: string) => api.delete(`/shares/${id}`),
  getShared: (token: string, password?: string) =>
    api.get(`/shared/${token}`, { params: password ? { password } : {} }),
  downloadShared: async (token: string, password?: string) => {
    try {
      const res = await api.get(`/shared/${token}`, { params: password ? { password } : {} })
      const downloadUrl = res.data?.data?.downloadUrl
      if (downloadUrl && (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://'))) {
        return axios.get(downloadUrl, { responseType: 'blob' })
      }
    } catch {
      // Fallback
    }
    return api.get(`/shared/${token}`, {
      params: { download: 'true', ...(password ? { password } : {}) },
      responseType: 'blob',
    })
  },
}

export const storageService = {
  usage: () => api.get('/storage/usage'),
}
