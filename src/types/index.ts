export type FileCategory = 'image'|'video'|'audio'|'document'|'spreadsheet'|'presentation'|'archive'|'text'|'code'|'other'

export interface CloudFile {
  _id: string
  name: string
  originalName: string
  mimeType: string
  size: number
  storageKey: string
  category: FileCategory
  userId: string
  folderId: string | null
  isTrashed: boolean
  trashedAt: string | null
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface CloudFolder {
  _id: string
  name: string
  userId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface Share {
  _id: string
  fileId: CloudFile | string
  userId: string
  tokenHash: string
  token?: string
  shareUrl?: string
  passwordHash: string | null
  expiresAt: string | null
  allowDownload: boolean
  accessCount: number
  createdAt: string
}

export interface StorageUsage {
  storageUsed: number
  storageQuota: number
  totalFiles: number
  totalSize: number
  byCategory: Array<{ category: FileCategory; size: number; count: number }>
}

export interface User {
  id: string
  name: string
  email: string
  storageQuota: number
  storageUsed: number
  isAdmin?: boolean
}

export interface UploadItem {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  folderId?: string | null
}
