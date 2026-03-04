/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full URL of the backend API including /api suffix.
   *  Example: https://my-backend.onrender.com/api
   *  Leave unset in local dev — the Vite proxy handles /api → localhost:5000.
   */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
