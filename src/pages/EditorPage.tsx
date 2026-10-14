import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Editor from '@monaco-editor/react'
import { Save, ArrowLeft, Download, Circle, Loader2, FileText } from 'lucide-react'
import { filesService } from '../services'
import { getLanguageFromMime, downloadBlob, formatBytes } from '../utils'
import toast from 'react-hot-toast'

export default function EditorPage() {
  const { fileId } = useParams<{ fileId?: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastModified, setLastModified] = useState<string | undefined>()
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isNew = fileId === 'new' || !fileId

  const fileQ = useQuery({
    queryKey: ['file', fileId],
    queryFn: () => filesService.get(fileId!),
    enabled: !isNew && !!fileId,
  })

  const contentQ = useQuery({
    queryKey: ['file-content', fileId],
    queryFn: () => filesService.getContent(fileId!),
    enabled: !isNew && !!fileId,
    retry: false,
  })

  useEffect(() => {
    if (contentQ.data) {
      setContent(contentQ.data.data.data.content)
      setLastModified(contentQ.data.data.data.updatedAt)
    }
  }, [contentQ.data])

  const file = fileQ.data?.data?.data?.file
  const language = file ? getLanguageFromMime(file.mimeType) : 'plaintext'

  const saveContent = useCallback(async (text: string) => {
    if (isNew || !fileId) return
    setSaving(true)
    try {
      const res = await filesService.updateContent(fileId, text, lastModified)
      setLastModified(res.data.data.updatedAt)
      setSaved(true)
      qc.invalidateQueries({ queryKey: ['files'] })
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Save failed'
      toast.error(msg)
      if (err?.response?.status === 409) {
        toast('Reload the page to get the latest version', { icon: '⚠️' })
      }
    } finally { setSaving(false) }
  }, [fileId, isNew, lastModified, qc])

  const handleChange = (val: string | undefined) => {
    const v = val ?? ''
    setContent(v)
    setSaved(false)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => saveContent(v), 2000)
  }

  const handleManualSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    saveContent(content)
  }

  const handleDownload = async () => {
    if (!file) return
    try { const { data } = await filesService.download(file._id); downloadBlob(data, file.name) }
    catch { toast.error('Download failed') }
  }

  if (!isNew && (fileQ.isLoading || contentQ.isLoading)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-vault-400 animate-spin" />
      </div>
    )
  }

  if (!isNew && contentQ.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-400">This file cannot be edited (binary or too large)</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col -m-3 sm:-m-5" style={{ height: 'calc(100vh - 52px)' }}>
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 border-b border-cv shrink-0"
           style={{ background: 'var(--menu-bg)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
          <FileText className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm text-ink-1 truncate">{file?.name ?? 'New File'}</h1>
            {file && <p className="text-xs text-ink-3 truncate">{formatBytes(file.size)} · {language}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-ink-3">
            {saving ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline">Saving…</span></>)
              : saved ? (<><Circle className="w-2.5 h-2.5 fill-green-400 text-green-400" /><span className="hidden sm:inline">Saved</span></>)
              : (<><Circle className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" /><span className="hidden sm:inline">Unsaved</span></>)}
          </div>
          {file && <button onClick={handleDownload} className="btn-ghost p-2"><Download className="w-4 h-4" /></button>}
          {!isNew && (
            <button onClick={handleManualSave} disabled={saved || saving} className="btn-primary text-sm">
              <Save className="w-4 h-4" /><span className="hidden sm:inline">Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleChange}
          theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
          options={{
            fontSize: window.innerWidth < 640 ? 13 : 14,
            fontFamily: 'JetBrains Mono, monospace',
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            lineNumbers: window.innerWidth < 640 ? 'off' : 'on',
            renderWhitespace: 'selection',
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}
