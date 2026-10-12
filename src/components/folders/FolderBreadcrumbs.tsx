import React from 'react'
import { ChevronRight, Home, Folder } from 'lucide-react'
import { CloudFolder } from '../../types'

export interface FolderBreadcrumbsProps {
  currentFolder?: CloudFolder | null
  parentFolders?: CloudFolder[]
  onNavigate: (folderId: string | null) => void
}

export const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({
  currentFolder,
  parentFolders = [],
  onNavigate,
}) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>All Files</span>
      </button>

      {parentFolders.map((folder) => (
        <React.Fragment key={folder._id}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => onNavigate(folder._id)}
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors truncate max-w-[120px]"
          >
            <Folder className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{folder.name}</span>
          </button>
        </React.Fragment>
      ))}

      {currentFolder && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
            <Folder className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />
            <span className="truncate">{currentFolder.name}</span>
          </span>
        </>
      )}
    </nav>
  )
}
