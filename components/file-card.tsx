"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MoreVertical, Download, Eye, Trash2 } from "lucide-react"
import type { FileData } from "@/lib/types"
import { formatFileSize, getFileIcon, isPreviewable } from "@/lib/utils"
import { useToast } from "@/contexts/toast-context"

interface FileCardProps {
  file: FileData
  onDelete: (id: string) => void
  onPreview: (file: FileData) => void
}

export default function FileCard({ file, onDelete, onPreview }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { showToast } = useToast()

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = file.blobUrl
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast("success", "Download started")
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/files?id=${file.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      onDelete(file.id)
      showToast("success", "File deleted successfully")
    } catch (error) {
      showToast("error", "Failed to delete file")
    } finally {
      setIsDeleting(false)
    }
  }

  const canPreview = isPreviewable(file.mimeType)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow relative group"
    >
      {/* File Icon/Thumbnail */}
      <div className="flex items-center justify-center h-16 mb-3">
        {file.mimeType.startsWith("image/") ? (
          <img src={file.blobUrl || "/placeholder.svg"} alt={file.name} className="w-16 h-16 object-cover rounded-lg" />
        ) : (
          <div className="text-4xl">{getFileIcon(file.mimeType)}</div>
        )}
      </div>

      {/* File Info */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={file.name}>
          {file.name}
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>{formatFileSize(file.size)}</p>
          <p>{file.type.toUpperCase()}</p>
          <p>{new Date(file.uploadedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            disabled={isDeleting}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
            >
              {canPreview && (
                <button
                  onClick={() => {
                    onPreview(file)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              )}
              <button
                onClick={() => {
                  handleDownload()
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => {
                  handleDelete()
                  setShowMenu(false)
                }}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Click overlay for mobile */}
      <div className="absolute inset-0 md:hidden" onClick={() => canPreview && onPreview(file)} />
    </motion.div>
  )
}
