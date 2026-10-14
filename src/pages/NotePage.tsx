import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, ArrowLeft, Save, Loader2, Download, Trash2, Check,
  Copy, PanelLeft, PanelLeftClose, StickyNote, FileText, Sparkles, X
} from 'lucide-react'
import { filesService } from '../services'
import { downloadBlob, formatDate, formatDateTime } from '../utils'
import { CloudFile } from '../types'
import toast from 'react-hot-toast'

export default function NotePage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  // Selection & UI state
  const isNew = !id || id === 'new'
  const [activeId, setActiveId] = useState<string | null>(isNew ? null : id)
  const [title, setTitle] = useState('Untitled note')
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileShowEditor, setMobileShowEditor] = useState(!isNew)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef(content)
  const titleRef = useRef(title)
  const activeIdRef = useRef(activeId)

  // Keep refs in sync
  contentRef.current = content
  titleRef.current = title
  activeIdRef.current = activeId

  // Sync activeId with URL param
  useEffect(() => {
    if (id && id !== 'new') {
      setActiveId(id)
      setMobileShowEditor(true)
    } else {
      setActiveId(null)
      setTitle('Untitled note')
      setContent('')
      setSaved(true)
    }
  }, [id])

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  // 1. Fetch all notes (category: text, all folders)
  const notesQ = useQuery({
    queryKey: ['notes-list'],
    queryFn: async () => {
      const res = await filesService.list({ category: 'text', folderId: 'all', limit: 100 })
      return res.data?.data?.files as CloudFile[]
    },
  })

  // Filter notes by search query
  const notes = useMemo(() => {
    const list = notesQ.data || []
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter((n) => n.name.toLowerCase().includes(q))
  }, [notesQ.data, searchQuery])

  // 2. Query active note metadata
  const fileQ = useQuery({
    queryKey: ['note-file', activeId],
    queryFn: () => filesService.get(activeId!),
    enabled: !!activeId,
  })

  // 3. Query active note content
  const contentQ = useQuery({
    queryKey: ['note-content', activeId],
    queryFn: () => filesService.getContent(activeId!),
    enabled: !!activeId,
  })

  // Sync file title when metadata loads
  useEffect(() => {
    if (fileQ.data?.data?.data?.file) {
      const fileName = fileQ.data.data.data.file.name
      setTitle(fileName.replace(/\.(txt|md)$/i, ''))
    }
  }, [fileQ.data])

  // Sync content when content query loads
  useEffect(() => {
    if (contentQ.data?.data?.data) {
      const loaded = contentQ.data.data.data.content ?? ''
      setContent(loaded)
      setLastSavedTime(contentQ.data.data.data.updatedAt)
      setSaved(true)
    }
  }, [contentQ.data])

  // Auto-resize textarea to fit content
  const adjustHeight = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.max(el.scrollHeight, window.innerHeight * 0.55)}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [content])

  // Save handler (uses refs to avoid stale closures)
  const handleSave = async (overrideContent?: string, overrideTitle?: string) => {
    const currentNoteId = activeIdRef.current
    const contentToSave = overrideContent !== undefined ? overrideContent : contentRef.current
    const rawTitle = overrideTitle !== undefined ? overrideTitle : titleRef.current
    const titleToSave = rawTitle.trim() || 'Untitled note'
    const fileName = titleToSave.endsWith('.txt') ? titleToSave : `${titleToSave}.txt`

    setSaving(true)
    try {
      if (!currentNoteId) {
        // Create new note
        const { data } = await filesService.createNote({
          name: fileName,
          content: contentToSave,
        })
        const newFile = data.data.file
        setActiveId(newFile._id)
        qc.invalidateQueries({ queryKey: ['notes-list'] })
        qc.invalidateQueries({ queryKey: ['files'] })
        navigate(`/notes/${newFile._id}`, { replace: true })
        setLastSavedTime(new Date().toISOString())
        setSaved(true)
        toast.success('Note created')
      } else {
        // Update existing note content & title
        await Promise.all([
          filesService.updateContent(currentNoteId, contentToSave),
          filesService.update(currentNoteId, { name: fileName }),
        ])
        qc.invalidateQueries({ queryKey: ['notes-list'] })
        qc.invalidateQueries({ queryKey: ['files'] })
        setLastSavedTime(new Date().toISOString())
        setSaved(true)
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  // Trigger auto-save debounce on content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setContent(newText)
    setSaved(false)

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      handleSave(newText)
    }, 1200)
  }

  // Trigger auto-save debounce on title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    setSaved(false)

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      handleSave(undefined, newTitle)
    }, 1200)
  }

  // Create new note action
  const handleCreateNew = () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = null
    }
    setActiveId(null)
    setTitle('Untitled note')
    setContent('')
    setSaved(true)
    setLastSavedTime(null)
    setMobileShowEditor(true)
    navigate('/notes/new')
  }

  // Select existing note
  const handleSelectNote = (note: CloudFile) => {
    if (activeId === note._id) return
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = null
    }
    setActiveId(note._id)
    setTitle(note.name.replace(/\.(txt|md)$/i, ''))
    setContent('')
    setSaved(true)
    setMobileShowEditor(true)
    navigate(`/notes/${note._id}`)
  }

  // Copy note text
  const handleCopy = () => {
    if (!content) {
      toast('Note is empty', { icon: 'ℹ️' })
      return
    }
    navigator.clipboard.writeText(content)
    toast.success('Copied note to clipboard')
  }

  // Download note as .txt
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `${title || 'note'}.txt`)
  }

  // Delete note
  const delMut = useMutation({
    mutationFn: (targetId: string) => filesService.permanentDelete(targetId),
    onSuccess: (_, targetId) => {
      qc.invalidateQueries({ queryKey: ['notes-list'] })
      qc.invalidateQueries({ queryKey: ['files'] })
      toast.success('Note deleted')
      if (activeId === targetId) {
        handleCreateNew()
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Delete failed'),
  })

  // Word and character counts
  const wordCount = useMemo(() => {
    const trimmed = content.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [content])

  const charCount = content.length

  const isLoadingCurrent = !!activeId && (fileQ.isLoading || contentQ.isLoading)

  return (
    <div className="flex h-[calc(100vh-64px)] -m-3 sm:-m-5 overflow-hidden">
      {/* ── Left Sidebar: Notes Library ─────────────────────────────── */}
      <div
        className={`cv-sidebar flex flex-col shrink-0 border-r border-cv transition-all duration-200 z-10 ${
          sidebarOpen ? 'w-full sm:w-72 md:w-80' : 'w-0 overflow-hidden border-none'
        } ${mobileShowEditor ? 'hidden sm:flex' : 'flex'}`}
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Header & New Note */}
        <div className="p-3.5 border-b border-cv flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm text-ink-1">Notes</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-border text-ink-3 font-medium">
              {notesQ.data?.length ?? 0}
            </span>
          </div>

          <button
            onClick={handleCreateNew}
            className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1 shadow-sm"
            title="Create new note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-2.5 border-b border-cv">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-ink-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg bg-surface border border-cv text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-ink-3 hover:text-ink-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notesQ.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-ink-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="text-xs">Loading notes...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 px-4 text-ink-3">
              <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">
                {searchQuery ? 'No matching notes found' : 'No notes yet'}
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-3 text-xs text-accent hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Write a note
              </button>
            </div>
          ) : (
            notes.map((n) => {
              const isSelected = activeId === n._id
              const displayTitle = n.name.replace(/\.(txt|md)$/i, '')
              return (
                <div
                  key={n._id}
                  onClick={() => handleSelectNote(n)}
                  className={`group relative flex flex-col p-2.5 rounded-xl cursor-pointer text-left transition-all ${
                    isSelected
                      ? 'bg-accent/10 border border-accent/30 text-ink-1 shadow-sm'
                      : 'hover:bg-surface text-ink-2 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight flex-1">
                      {displayTitle || 'Untitled note'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Delete "${displayTitle}" permanently?`)) {
                          delMut.mutate(n._id)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-danger text-ink-3 p-0.5 rounded transition-opacity"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-3">
                    <span>{formatDate(n.createdAt)}</span>
                    <span>·</span>
                    <span className="capitalize">{n.mimeType === 'text/markdown' ? 'Markdown' : 'Text'}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Right Content: Note Editor ──────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-y-auto bg-base ${
          !mobileShowEditor ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Editor Toolbar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 border-b border-cv backdrop-blur-md"
          style={{ background: 'var(--header-bg, var(--surface))' }}
        >
          {/* Left items: Back (mobile) / Toggle Sidebar (desktop) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileShowEditor(false)}
              className="sm:hidden btn-ghost p-1.5 text-ink-2 hover:text-ink-1 flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Notes
            </button>

            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="hidden sm:inline-flex btn-ghost p-1.5 text-ink-3 hover:text-ink-1"
              title={sidebarOpen ? 'Hide notes list' : 'Show notes list'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>

            <span className="text-xs text-ink-3 hidden md:inline-flex items-center gap-1.5">
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" /> Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" /> Saved
                </>
              ) : (
                <span className="text-amber-400 font-medium">Unsaved</span>
              )}
              {lastSavedTime && !saving && (
                <span className="opacity-60">· {formatDateTime(lastSavedTime)}</span>
              )}
            </span>
          </div>

          {/* Right items: Stats & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Word & char counter badge */}
            <span className="text-[11px] text-ink-3 px-2 py-1 rounded-md bg-border/40 hidden lg:inline">
              {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
            </span>

            <button
              onClick={() => handleSave()}
              disabled={saving || saved}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>

            <button
              onClick={handleCopy}
              className="btn-ghost p-1.5 text-ink-3 hover:text-ink-1"
              title="Copy note text"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="btn-ghost p-1.5 text-ink-3 hover:text-ink-1"
              title="Download as .txt"
            >
              <Download className="w-4 h-4" />
            </button>

            {activeId && (
              <button
                onClick={() => {
                  if (window.confirm('Delete this note permanently?')) {
                    delMut.mutate(activeId)
                  }
                }}
                className="btn-ghost p-1.5 text-ink-3 hover:text-danger"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Note Paper Area */}
        <div className="flex-1 p-3 sm:p-6 md:p-8 max-w-4xl w-full mx-auto">
          {isLoadingCurrent ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-ink-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm">Loading note content...</p>
            </div>
          ) : (
            <div className="cv-card note-paper px-6 sm:px-12 py-7 sm:py-10 shadow-sm transition-all min-h-[75vh]">
              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={() => {
                  if (!saved) handleSave(undefined, title)
                }}
                placeholder="Note title..."
                className="w-full bg-transparent border-0 outline-0 p-0 text-xl sm:text-2xl md:text-3xl font-bold text-ink-1 placeholder:text-ink-3/40"
              />

              {/* Lined Notebook Paper Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={() => {
                  if (!saved) handleSave(content, undefined)
                }}
                placeholder="Write your note here..."
                className="note-body"
                rows={18}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
