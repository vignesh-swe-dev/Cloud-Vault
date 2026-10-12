import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Editor from '@monaco-editor/react'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Download, Circle, Loader2, FileText } from 'lucide-react'
import { filesService } from '../services'
import { getLanguageFromMime, downloadBlob, formatBytes } from '../utils'
import { fadeInDown } from '../animations/variants'
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
    <div className="flex flex-col h-full -m-6">
      {/* Toolbar */}
      <motion.div variants={fadeInDown} initial="hidden" animate="visible"
        className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-dark-800/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
          <FileText className="w-5 h-5 text-vault-400" />
          <div>
            <h1 className="font-semibold text-sm">{file?.name ?? 'New File'}</h1>
            {file && <p className="text-xs text-white/40">{formatBytes(file.size)} · {language}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Circle className="w-2.5 h-2.5 fill-green-400 text-green-400" /> Saved</>
            ) : (
              <><Circle className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" /> Unsaved</>
            )}
          </div>
          {file && (
            <button onClick={handleDownload} className="btn-ghost p-2 text-sm flex items-center gap-1.5">
              <Download className="w-4 h-4" />
            </button>
          )}
          {!isNew && (
            <motion.button onClick={handleManualSave} disabled={saved || saving}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2 py-2 text-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> Save
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
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
