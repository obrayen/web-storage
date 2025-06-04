"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, ExternalLink } from "lucide-react"
import type { FileData } from "@/lib/types"
import { formatFileSize } from "@/lib/utils"

interface FilePreviewModalProps {
  file: FileData | null
  isOpen: boolean
  onClose: () => void
}

export default function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  if (!file) return null

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = file.blobUrl
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderPreview = () => {
    if (file.mimeType.startsWith("image/")) {
      return (
        <img
          src={file.blobUrl || "/placeholder.svg"}
          alt={file.name}
          className="max-w-full max-h-[60vh] object-contain rounded-lg"
        />
      )
    }

    if (file.mimeType === "application/pdf") {
      return <iframe src={file.blobUrl} className="w-full h-[60vh] rounded-lg" title={file.name} />
    }

    if (file.mimeType.startsWith("text/")) {
      return (
        <div className="w-full h-[60vh] bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-auto">
          <iframe src={file.blobUrl} className="w-full h-full border-none" title={file.name} />
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-lg font-medium">Preview not available</p>
        <p className="text-sm">Click download to view this file</p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">{file.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatFileSize(file.size)} • {file.type.toUpperCase()} •{" "}
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <a
                  href={file.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 flex items-center justify-center">{renderPreview()}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
