import React from 'react'
import { motion } from 'framer-motion'
import { Folder, MoreVertical, Trash2 } from 'lucide-react'
import { CloudFolder } from '../../types'
import { Dropdown } from '../ui/Dropdown'

export interface FolderCardProps {
  folder: CloudFolder
  onOpen: (folderId: string) => void
  onDelete?: (folder: CloudFolder) => void
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onOpen, onDelete }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={() => onOpen(folder._id)}
      className="group relative flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
          <Folder className="w-5 h-5 fill-current" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
            {folder.name}
          </p>
          <p className="text-[11px] text-slate-400">
            {new Date(folder.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown
          trigger={
            <button
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Folder actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={[
            ...(onDelete
              ? [
                  {
                    id: 'delete',
                    label: 'Delete folder',
                    icon: <Trash2 className="w-4 h-4" />,
                    danger: true,
                    onClick: () => onDelete(folder),
                  },
                ]
              : []),
          ]}
        />
      </div>
    </motion.div>
  )
}
