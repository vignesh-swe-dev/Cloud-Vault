import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3X3, List, SortAsc, SortDesc, Trash2, Star, StarOff,
  Download, Share2, Pencil, FolderPlus, FolderOpen, Check, X,
  ChevronDown, MoreHorizontal, Home, FileText, StickyNote
} from 'lucide-react'
import { filesService, foldersService } from '../services'
import { staggerContainer, staggerItem, scaleIn } from '../animations/variants'
import { formatBytes, formatDate, categoryColor, downloadBlob } from '../utils'
import FileIcon from '../components/files/FileIcon'
import FilePreviewModal from '../components/files/FilePreviewModal'
import ShareModal from '../components/files/ShareModal'
import { CloudFile, CloudFolder } from '../types'
import { useDropzone } from 'react-dropzone'
import { useUploadStore } from '../store/uploadStore'
import { v4 as uuid } from 'uuid'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'name',      label: 'Name' },
  { value: 'createdAt', label: 'Date Added' },
  { value: 'size',      label: 'Size' },
  { value: 'type',      label: 'Type' },
]

export default function FilesPage() {
  const { folderId } = useParams<{ folderId?: string }>()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const qc = useQueryClient()
  const navigate = useNavigate()

  const handleNewNote = async () => {
    try {
      const { data } = await filesService.createNote({ name: 'Untitled note', folderId })
      qc.invalidateQueries({ queryKey: ['files'] })
      navigate(`/notes/${data.data.file._id}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Could not create note')
    }
  }

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = useState<CloudFile | null>(null)
  const [shareFile, setShareFile] = useState<CloudFile | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [ctxMenu, setCtxMenu] = useState<{ file: CloudFile; x: number; y: number } | null>(null)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const { addItems } = useUploadStore()

  const filesQ = useQuery({
    queryKey: ['files', folderId, sort, order, search],
    queryFn: () => filesService.list({ folderId: folderId ?? 'root', sort, order, ...(search ? { search } : {}) }),
  })
  const foldersQ = useQuery({
    queryKey: ['folders', folderId],
    queryFn: () => foldersService.list({ parentId: folderId ?? 'root' }),
  })

  const files: CloudFile[] = filesQ.data?.data?.data?.files ?? []
  const folders: CloudFolder[] = foldersQ.data?.data?.data?.folders ?? []
  const isLoading = filesQ.isLoading || foldersQ.isLoading

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const selectAll = () => setSelected(new Set(files.map(f => f._id)))
  const clearSelected = () => setSelected(new Set())

  const deleteMut = useMutation({
    mutationFn: (id: string) => filesService.permanentDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['files'] }); qc.invalidateQueries({ queryKey: ['storage'] }); toast.success('File deleted') },
  })
  const favMut = useMutation({
    mutationFn: ({ id, fav }: { id: string; fav: boolean }) => filesService.update(id, { isFavorite: fav }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  })
  const renameMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => filesService.update(id, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['files'] }); setRenameId(null); toast.success('Renamed') },
  })
  const bulkDeleteMut = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => filesService.permanentDelete(id))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['files'] }); qc.invalidateQueries({ queryKey: ['storage'] }); setSelected(new Set()); toast.success('Files deleted') },
  })
  const createFolderMut = useMutation({
    mutationFn: (name: string) => foldersService.create(name, folderId ?? null),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['folders'] }); setShowNewFolder(false); setNewFolderName('') },
  })
  const deleteFolderMut = useMutation({
    mutationFn: (id: string) => foldersService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['folders'] }); toast.success('Folder deleted') },
  })

  const onDrop = useCallback((accepted: File[]) => {
    const items = accepted.map(f => ({
      id: uuid(), file: f, progress: 0, status: 'pending' as const, folderId: folderId ?? null,
    }))
    addItems(items)
    items.forEach(async item => {
      const { useUploadStore: store } = await import('../store/uploadStore')
      const { updateItem } = store.getState()
      updateItem(item.id, { status: 'uploading' })
      const fd = new FormData()
      fd.append('file', item.file)
      if (item.folderId) fd.append('folderId', item.folderId)
      try {
        await filesService.upload(fd, p => updateItem(item.id, { progress: p }))
        updateItem(item.id, { status: 'done', progress: 100 })
        qc.invalidateQueries({ queryKey: ['files'] })
        qc.invalidateQueries({ queryKey: ['storage'] })
      } catch (e: any) {
        updateItem(item.id, { status: 'error', error: e?.response?.data?.message ?? 'Upload failed' })
      }
    })
  }, [folderId, addItems, qc])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true, noClick: true })

  const handleDownload = async (file: CloudFile) => {
    try {
      const { data } = await filesService.download(file._id)
      downloadBlob(data, file.name)
    } catch { toast.error('Download failed') }
  }

  const openCtx = (e: React.MouseEvent, file: CloudFile) => {
    e.preventDefault()
    setCtxMenu({ file, x: e.clientX, y: e.clientY })
  }

  const commitRename = () => {
    if (renameId && renameVal.trim()) renameMut.mutate({ id: renameId, name: renameVal.trim() })
    else setRenameId(null)
  }

  // Skeleton cards
  const SkeletonCard = () => (
    <div className="cv-card p-3 space-y-2">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="skeleton h-2.5 w-1/2 rounded" />
    </div>
  )

  return (
    <div {...getRootProps()} className="relative min-h-full" onClick={() => setCtxMenu(null)}>
      <input {...getInputProps()} />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="drag-overlay pointer-events-none"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-7 h-7 text-accent" style={{ color: 'var(--accent)' }} />
              </div>
              <p className="font-semibold text-accent" style={{ color: 'var(--accent)' }}>
                Drop to upload
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu */}
      <AnimatePresence>
        {ctxMenu && (
          <motion.div
            variants={scaleIn} initial="hidden" animate="visible" exit="exit"
            className="ctx-menu fixed"
            style={{ top: ctxMenu.y, left: ctxMenu.x }}
            onClick={e => e.stopPropagation()}
          >
            <button className="ctx-item" onClick={() => { setPreviewFile(ctxMenu.file); setCtxMenu(null) }}>
              <FileText className="w-3.5 h-3.5" /> Preview
            </button>
            <button className="ctx-item" onClick={() => { handleDownload(ctxMenu.file); setCtxMenu(null) }}>
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button className="ctx-item" onClick={() => {
              setRenameId(ctxMenu.file._id); setRenameVal(ctxMenu.file.name.replace(/\.[^.]+$/, '')); setCtxMenu(null)
            }}>
              <Pencil className="w-3.5 h-3.5" /> Rename
            </button>
            <button className="ctx-item" onClick={() => {
              favMut.mutate({ id: ctxMenu.file._id, fav: !ctxMenu.file.isFavorite }); setCtxMenu(null)
            }}>
              {ctxMenu.file.isFavorite
                ? <><StarOff className="w-3.5 h-3.5" /> Remove Favorite</>
                : <><Star className="w-3.5 h-3.5" /> Add to Favorites</>
              }
            </button>
            <button className="ctx-item" onClick={() => { setShareFile(ctxMenu.file); setCtxMenu(null) }}>
              <Share2 className="w-3.5 h-3.5" /> Share…
            </button>
            <div className="ctx-sep" />
            <button className="ctx-item danger" onClick={() => {
              if (window.confirm('Delete this file permanently?')) deleteMut.mutate(ctxMenu.file._id);
              setCtxMenu(null);
            }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 max-w-full">

        {/* ── Toolbar row ── */}
        <motion.div variants={staggerItem} className="flex items-center gap-2 flex-wrap">
          {/* Breadcrumbs */}
          <nav className="breadcrumb flex-1 min-w-0">
            <Link to="/files" className="breadcrumb-item">
              <Home className="w-3.5 h-3.5 inline mr-0.5" />
              All Files
            </Link>
            {folderId && (
              <>
                <ChevronDown className="w-3 h-3 text-ink-3 -rotate-90 shrink-0" />
                <span className="breadcrumb-item current">Folder</span>
              </>
            )}
            {search && (
              <>
                <ChevronDown className="w-3 h-3 text-ink-3 -rotate-90 shrink-0" />
                <span className="breadcrumb-item current">"{search}"</span>
              </>
            )}
          </nav>

          {/* Multi-select bar */}
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(0,122,255,0.1)', color: 'var(--accent)' }}
              >
                <Check className="w-3.5 h-3.5" />
                {selected.size} selected
                <button
                  onClick={() => {
                    if (window.confirm('Delete these files permanently?')) bulkDeleteMut.mutate([...selected])
                  }}
                  className="ml-1 px-2 py-0.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--danger)', color: '#fff' }}
                >
                  Delete
                </button>
                <button onClick={clearSelected} className="btn-icon w-5 h-5">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New Note */}
          <button onClick={handleNewNote} className="btn-secondary text-sm py-1.5">
            <StickyNote className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Note</span>
          </button>

          {/* New Folder */}
          <button onClick={() => setShowNewFolder(true)} className="btn-secondary text-sm py-1.5">
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Folder</span>
          </button>

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(p => !p)}
              className="btn-secondary text-sm py-1.5"
            >
              {order === 'asc' ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
              <ChevronDown className="w-3 h-3 text-ink-3" />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  variants={scaleIn} initial="hidden" animate="visible" exit="exit"
                  className="ctx-menu absolute right-0 top-full mt-1 z-30"
                >
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`ctx-item ${sort === o.value ? 'font-semibold text-accent' : ''}`}
                      onClick={() => { setSort(o.value); setSortOpen(false) }}
                    >
                      {o.label}
                      {sort === o.value && <span className="ml-auto text-xs text-accent">✓</span>}
                    </button>
                  ))}
                  <div className="ctx-sep" />
                  <button className="ctx-item" onClick={() => { setOrder(o => o === 'asc' ? 'desc' : 'asc'); setSortOpen(false) }}>
                    {order === 'asc' ? 'Descending' : 'Ascending'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle */}
          <div className="seg-ctrl">
            <button
              onClick={() => setView('grid')}
              className={`seg-ctrl-btn ${view === 'grid' ? 'active' : ''}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`seg-ctrl-btn ${view === 'list' ? 'active' : ''}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* New folder input */}
        <AnimatePresence>
          {showNewFolder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 items-center overflow-hidden"
            >
              <input
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFolderName.trim()) createFolderMut.mutate(newFolderName.trim())
                  if (e.key === 'Escape') setShowNewFolder(false)
                }}
                placeholder="Folder name"
                className="cv-input max-w-xs text-sm py-1.5"
              />
              <button
                onClick={() => newFolderName.trim() && createFolderMut.mutate(newFolderName.trim())}
                className="btn-primary text-sm py-1.5"
              >
                Create
              </button>
              <button onClick={() => setShowNewFolder(false)} className="btn-ghost text-sm">Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : files.length === 0 && folders.length === 0 ? (
          // Empty state
          <motion.div variants={staggerItem}>
            <div className="cv-card text-center py-20 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                style={{ background: 'var(--sidebar)' }}>
                <FolderOpen className="w-8 h-8 text-ink-3" />
              </div>
              <p className="font-semibold text-ink-1">
                {search ? `No results for "${search}"` : 'This folder is empty'}
              </p>
              <p className="text-sm text-ink-3">
                {search ? 'Try a different search term.' : 'Drop files here or click Upload to add files.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Folders */}
            {folders.length > 0 && (
              <motion.div variants={staggerItem}>
                <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2 px-0.5">
                  Folders
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                  {folders.map(folder => (
                    <motion.div
                      key={folder._id}
                      className="cv-card group flex items-center gap-2.5 py-2.5 px-3 cursor-pointer"
                    >
                      <FolderOpen className="w-6 h-6 shrink-0" style={{ color: '#FF9F0A' }} strokeWidth={1.8} />
                      <span className="text-sm font-medium text-ink-1 truncate flex-1 min-w-0">{folder.name}</span>
                      <button
                        onClick={e => { e.stopPropagation(); deleteFolderMut.mutate(folder._id) }}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 btn-icon w-5 h-5 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Files */}
            {files.length > 0 && (
              <motion.div variants={staggerItem}>
                {folders.length > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-wider px-0.5">
                      Files
                    </h2>
                    {files.length > 1 && (
                      <button onClick={selectAll} className="text-xs text-accent hover:underline" style={{ color: 'var(--accent)' }}>
                        Select All
                      </button>
                    )}
                  </div>
                )}

                {view === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {files.map(file => (
                      <motion.div
                        key={file._id}
                        onContextMenu={e => openCtx(e, file)}
                        className={`file-card group relative ${selected.has(file._id) ? 'ring-2 ring-accent' : ''}`}
                        style={selected.has(file._id) ? { '--tw-ring-color': 'var(--accent)' } as any : {}}
                        onClick={() => setPreviewFile(file)}
                      >
                        {/* Select checkbox */}
                        <div
                          className={`absolute top-2 left-2 w-4.5 h-4.5 rounded-full border transition-all z-10
                            ${selected.has(file._id)
                              ? 'opacity-100 border-none'
                              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 border-ink-3 bg-surface'
                            }`}
                          onClick={e => toggleSelect(file._id, e)}
                        >
                          {selected.has(file._id) && (
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: 'var(--accent)' }}
                            >
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Favorite star */}
                        {file.isFavorite && (
                          <div className="absolute top-2 right-2 z-10">
                            <Star className="w-3.5 h-3.5 fill-warn" style={{ color: '#FF9F0A' }} />
                          </div>
                        )}

                        <FileIcon mimeType={file.mimeType} category={file.category} className="w-11 h-11 mb-2.5" />
                        {renameId === file._id ? (
                          <input
                            autoFocus
                            value={renameVal}
                            onChange={e => setRenameVal(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenameId(null) }}
                            className="cv-input text-xs py-0.5 px-1 w-full"
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <p className="text-sm font-medium text-ink-1 truncate leading-tight">{file.name}</p>
                        )}
                        <p className="text-xs text-ink-3 mt-0.5">{formatBytes(file.size)}</p>

                        {/* Hover actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); openCtx(e as any, file) }}
                            className="btn-icon w-6 h-6"
                            style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="cv-surface overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-cv text-xs font-semibold text-ink-3 uppercase tracking-wider">
                          <th className="px-4 py-2.5 text-left">Name</th>
                          <th className="px-4 py-2.5 text-left hidden md:table-cell">Size</th>
                          <th className="px-4 py-2.5 text-left hidden lg:table-cell">Modified</th>
                          <th className="px-4 py-2.5 text-right w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((file, i) => (
                          <motion.tr
                            key={file._id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-cv last:border-0 hover:bg-sidebar transition-colors cursor-pointer group"
                            style={{ '--tw-bg-opacity': '1' } as any}
                            onClick={() => setPreviewFile(file)}
                            onContextMenu={e => openCtx(e, file)}
                          >
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <FileIcon mimeType={file.mimeType} category={file.category} className="w-7 h-7" />
                                <span className="text-sm font-medium text-ink-1 truncate max-w-[140px] sm:max-w-[200px]">{file.name}</span>
                                {file.isFavorite && <Star className="w-3 h-3 shrink-0" style={{ color: '#FF9F0A', fill: '#FF9F0A' }} />}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-sm text-ink-3 hidden md:table-cell">{formatBytes(file.size)}</td>
                            <td className="px-4 py-2.5 text-sm text-ink-3 hidden lg:table-cell">{formatDate(file.updatedAt)}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                onClick={e => e.stopPropagation()}>
                                <button onClick={() => handleDownload(file)} className="btn-icon w-6 h-6">
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => favMut.mutate({ id: file._id, fav: !file.isFavorite })} className="btn-icon w-6 h-6">
                                  {file.isFavorite
                                    ? <StarOff className="w-3.5 h-3.5" style={{ color: '#FF9F0A' }} />
                                    : <Star className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => setShareFile(file)} className="btn-icon w-6 h-6">
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Delete this file permanently?')) deleteMut.mutate(file._id)
                                  }}
                                  className="btn-icon w-6 h-6 hover:text-danger"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onShare={() => { setShareFile(previewFile); setPreviewFile(null) }}
        />
      )}
      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}
    </div>
  )
}
