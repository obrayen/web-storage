"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileIcon } from "lucide-react"
import { useToast } from "@/contexts/toast-context"
import type { UploadProgress } from "@/lib/types"

interface FileUploadProps {
  onUploadComplete: () => void
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const { showToast } = useToast()

  const uploadFile = async (file: File) => {
    const uploadId = Math.random().toString(36).substr(2, 9)

    setUploads((prev) => [
      ...prev,
      {
        fileName: file.name,
        progress: 0,
        status: "uploading",
      },
    ])

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      setUploads((prev) =>
        prev.map((upload) =>
          upload.fileName === file.name ? { ...upload, progress: 100, status: "completed" } : upload,
        ),
      )

      showToast("success", `${file.name} uploaded successfully`)
      onUploadComplete()

      // Remove from uploads list after 2 seconds
      setTimeout(() => {
        setUploads((prev) => prev.filter((upload) => upload.fileName !== file.name))
      }, 2000)
    } catch (error) {
      setUploads((prev) =>
        prev.map((upload) => (upload.fileName === file.name ? { ...upload, status: "error" } : upload)),
      )
      showToast("error", `Failed to upload ${file.name}`)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(uploadFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const removeUpload = (fileName: string) => {
    setUploads((prev) => prev.filter((upload) => upload.fileName !== fileName))
  }

  return (
    <div className="space-y-4">
      <motion.div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse (max 50MB per file)</p>
      </motion.div>

      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploads.map((upload) => (
              <motion.div
                key={upload.fileName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <FileIcon className="w-5 h-5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{upload.fileName}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <motion.div
                      className={`h-2 rounded-full ${
                        upload.status === "completed"
                          ? "bg-green-500"
                          : upload.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${upload.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeUpload(upload.fileName)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
