import { FileCategory } from '../types'

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
}

export function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function isImageMime(mime: string) { return mime.startsWith('image/') }
export function isVideoMime(mime: string) { return mime.startsWith('video/') }
export function isAudioMime(mime: string) { return mime.startsWith('audio/') }
export function isPdfMime(mime: string) { return mime === 'application/pdf' }
export function isTextEditable(mime: string) {
  return mime.startsWith('text/') || ['application/json','application/xml','application/sql'].includes(mime)
}

export function categoryColor(cat: FileCategory): string {
  const map: Record<FileCategory, string> = {
    image: 'text-pink-400 bg-pink-400/10',
    video: 'text-red-400 bg-red-400/10',
    audio: 'text-orange-400 bg-orange-400/10',
    document: 'text-blue-400 bg-blue-400/10',
    spreadsheet: 'text-green-400 bg-green-400/10',
    presentation: 'text-yellow-400 bg-yellow-400/10',
    archive: 'text-gray-400 bg-gray-400/10',
    text: 'text-vault-400 bg-vault-400/10',
    code: 'text-cyan-400 bg-cyan-400/10',
    other: 'text-white/40 bg-white/10',
  }
  return map[cat] ?? map.other
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function getLanguageFromMime(mime: string): string {
  const map: Record<string, string> = {
    'text/javascript': 'javascript', 'application/javascript': 'javascript',
    'text/typescript': 'typescript', 'application/typescript': 'typescript',
    'text/html': 'html', 'text/css': 'css', 'application/json': 'json',
    'text/xml': 'xml', 'application/xml': 'xml', 'text/yaml': 'yaml',
    'text/x-python': 'python', 'text/x-java-source': 'java',
    'text/markdown': 'markdown', 'text/plain': 'plaintext',
    'application/sql': 'sql',
  }
  return map[mime] ?? 'plaintext'
}
