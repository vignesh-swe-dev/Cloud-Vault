import { FileCategory } from '../models/File';

const CATEGORY_MAP: Record<string, FileCategory> = {
  // Images
  'image/png': 'image', 'image/jpeg': 'image', 'image/gif': 'image',
  'image/svg+xml': 'image', 'image/webp': 'image', 'image/bmp': 'image',
  'image/tiff': 'image',
  // Video
  'video/mp4': 'video', 'video/webm': 'video', 'video/quicktime': 'video',
  'video/x-matroska': 'video', 'video/x-msvideo': 'video',
  // Audio
  'audio/mpeg': 'audio', 'audio/wav': 'audio', 'audio/aac': 'audio',
  'audio/flac': 'audio', 'audio/ogg': 'audio',
  // Documents
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.oasis.opendocument.text': 'document',
  'application/rtf': 'document',
  // Spreadsheets
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'text/csv': 'spreadsheet',
  'application/vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
  // Presentations
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/vnd.oasis.opendocument.presentation': 'presentation',
  // Archives
  'application/zip': 'archive', 'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive', 'application/x-tar': 'archive',
  'application/gzip': 'archive',
  // Text
  'text/plain': 'text', 'text/markdown': 'text',
  // Code
  'text/html': 'code', 'text/css': 'code', 'text/javascript': 'code',
  'application/typescript': 'code', 'application/json': 'code',
  'text/xml': 'code', 'application/xml': 'code', 'text/yaml': 'code',
  'text/x-python': 'code', 'text/x-java-source': 'code',
  'text/x-csrc': 'code', 'text/x-c++src': 'code',
  'application/x-php': 'code', 'application/sql': 'code',
};

export function getFileCategory(mimeType: string): FileCategory {
  return CATEGORY_MAP[mimeType] ?? 'other';
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\.{2,}/g, '.')
    .trim()
    .substring(0, 255);
}

export function generateStorageKey(userId: string, fileName: string): string {
  const { v4: uuidv4 } = require('uuid');
  const ext = fileName.split('.').pop() ?? '';
  return `${userId}/${uuidv4()}${ext ? '.' + ext : ''}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function isTextEditable(mimeType: string): boolean {
  const editablePrefixes = ['text/', 'application/json', 'application/xml',
    'application/typescript', 'application/javascript', 'application/sql', 'text/yaml'];
  return editablePrefixes.some((p) => mimeType.startsWith(p));
}
