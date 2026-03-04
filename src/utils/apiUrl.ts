/**
 * API URL helpers
 *
 * In local dev  : VITE_API_URL is undefined → falls back to '/api' which the
 *                 Vite dev-server proxy forwards to http://localhost:5000.
 * In production : VITE_API_URL=https://<backend>.onrender.com/api is baked in
 *                 at build time by Vite.
 */
export const API_URL: string = import.meta.env.VITE_API_URL || '/api'

/**
 * Returns the full URL for a backend API path.
 * e.g. buildApiUrl('/files/123/download') → '/api/files/123/download' (local)
 *                                          → 'https://...onrender.com/api/files/123/download' (prod)
 */
export function buildApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/**
 * Returns the absolute URL for a file served from local storage.
 * Local storage files are hosted by the backend at /api/local-storage/<key>.
 * In production with S3 the backend returns a full https:// URL directly, so
 * this helper is only needed when the URL starts with /api/.
 *
 * Usage:  <img src={resolveFileUrl(file.url)} />
 */
export function resolveFileUrl(url: string): string {
  if (!url) return ''
  // Already an absolute URL (S3 pre-signed, etc.) — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // Relative /api/... URL — prepend the backend host
  if (url.startsWith('/api/')) {
    const backendOrigin = API_URL.replace(/\/api\/?$/, '')
    // In local dev backendOrigin is '' (empty string), so the URL stays relative ✓
    return `${backendOrigin}${url}`
  }
  return url
}
