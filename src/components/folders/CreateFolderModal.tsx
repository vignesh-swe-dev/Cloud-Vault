import React, { useState } from 'react'
import { FolderPlus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void> | void
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = folderName.trim()
    if (!trimmed) {
      setError('Please provide a folder name')
      return
    }
    if (/[/\\?%*:|"<>]/g.test(trimmed)) {
      setError('Folder name cannot contain special characters (/ \\ ? % * : | " < >)')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      await onCreate(trimmed)
      setFolderName('')
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create folder')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Folder"
      description="Organize your files in a dedicated directory"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Folder Name"
          value={folderName}
          onChange={(e) => {
            setFolderName(e.target.value)
            if (error) setError('')
          }}
          placeholder="e.g. Work Documents"
          leftIcon={<FolderPlus className="w-4 h-4" />}
          error={error}
          autoFocus
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Folder
          </Button>
        </div>
      </form>
    </Modal>
  )
}
