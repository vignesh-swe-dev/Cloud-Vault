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
  upload: async (
    payload: FormData | { file: File; folderId?: string | null },
    onProgress?: (p: number) => void,
  ) => {
    let file: File | null = null
    let folderId: string | null = null

    if (payload instanceof FormData) {
      file = payload.get('file') as File
      folderId = (payload.get('folderId') as string) || null
    } else {
      file = payload.file
      folderId = payload.folderId || null
    }

    if (!file) throw new Error('No file provided')

    try {
      // Step 1: Initialize upload (check quota and check if S3 presigned URL is available)
      const { data: initRes } = await api.post('/files/init-upload', {
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        folderId,
      })

      if (initRes.data?.mode === 's3' && initRes.data?.uploadUrl) {
        const { uploadUrl, storageKey, name } = initRes.data

        // Step 2: Upload directly to S3/R2 with vanilla axios (no Authorization header)
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          onUploadProgress: (e) => {
            if (onProgress && e.total) {
              onProgress(Math.round((e.loaded * 100) / e.total))
            }
          },
        })

        // Step 3: Complete upload on backend to record in DB
        return api.post('/files/complete-upload', {
          name,
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          storageKey,
          folderId,
        })
      }
    } catch (err: any) {
      // If quota exceeded (413), fail immediately
      if (err?.response?.status === 413) throw err
      // If error is not a fallback case, rethrow
      if (err?.response?.data?.message) throw err
    }

    // Fallback: local backend multipart upload
    const fd = payload instanceof FormData ? payload : new FormData()
    if (!(payload instanceof FormData)) {
      fd.append('file', file)
      if (folderId) fd.append('folderId', folderId)
    }

    return api.post('/files/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
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
