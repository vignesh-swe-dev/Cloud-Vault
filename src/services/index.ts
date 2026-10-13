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
}

export const filesService = {
  list: (params?: Record<string, any>) => api.get('/files', { params }),
  get: (id: string) => api.get(`/files/${id}`),
  upload: (formData: FormData, onProgress?: (p: number) => void) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total)) },
    }),
  download: (id: string) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
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
  downloadShared: (token: string, password?: string) =>
    api.get(`/shared/${token}`, { params: { download: 'true', ...(password ? { password } : {}) }, responseType: 'blob' }),
}

export const storageService = {
  usage: () => api.get('/storage/usage'),
}
