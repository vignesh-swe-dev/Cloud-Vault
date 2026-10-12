import {
  Image, Video, Music, FileText, FileSpreadsheet, Presentation,
  Archive, Code2, File, FileCode
} from 'lucide-react'
import { FileCategory } from '../../types'

const categoryMap: Record<FileCategory, { icon: typeof File; color: string; bg: string }> = {
  image:        { icon: Image,           color: '#FF375F', bg: 'rgba(255,55,95,0.1)' },
  video:        { icon: Video,           color: '#FF6B00', bg: 'rgba(255,107,0,0.1)' },
  audio:        { icon: Music,           color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)' },
  document:     { icon: FileText,        color: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
  spreadsheet:  { icon: FileSpreadsheet, color: '#34C759', bg: 'rgba(52,199,89,0.1)' },
  presentation: { icon: Presentation,   color: '#FF6B00', bg: 'rgba(255,107,0,0.1)' },
  archive:      { icon: Archive,         color: '#8E8E93', bg: 'rgba(142,142,147,0.1)' },
  text:         { icon: FileText,        color: '#5856D6', bg: 'rgba(88,86,214,0.1)' },
  code:         { icon: Code2,           color: '#32D74B', bg: 'rgba(50,215,75,0.1)' },
  other:        { icon: File,            color: '#8E8E93', bg: 'rgba(142,142,147,0.1)' },
}

interface Props {
  mimeType?: string
  category: FileCategory
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function FileIcon({ category, className = 'w-8 h-8', size }: Props) {
  const meta = categoryMap[category] ?? categoryMap.other
  const Icon = meta.icon

  // Determine padding from size hint
  const pad = size === 'sm' ? '0.25rem' : size === 'lg' ? '0.625rem' : '0.4rem'

  return (
    <div
      className={`${className} rounded-xl flex items-center justify-center shrink-0`}
      style={{ background: meta.bg, padding: pad }}
    >
      <Icon
        className="w-full h-full"
        style={{ color: meta.color }}
        strokeWidth={1.8}
      />
    </div>
  )
}
