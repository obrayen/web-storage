"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/header"
import FileUpload from "@/components/file-upload"
import SearchFilterBar from "@/components/search-filter-bar"
import FileCard from "@/components/file-card"
import FileList from "@/components/file-list"
import FilePreviewModal from "@/components/file-preview-modal"
import type { FileData } from "@/lib/types"

export default function Dashboard() {
  const [files, setFiles] = useState<FileData[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("uploadedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [previewFile, setPreviewFile] = useState<FileData | null>(null)

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        type: selectedType,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/files?${params}`)
      if (!response.ok) throw new Error("Failed to fetch files")

      const data = await response.json()
      setFiles(data)
      setFilteredFiles(data)
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [searchTerm, selectedType, sortBy, sortOrder])

  const handleFileDelete = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
    setFilteredFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleUploadComplete = () => {
    fetchFiles()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload Files</h2>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </motion.section>

          {/* Search and Filter */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SearchFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </motion.section>

          {/* Files Section */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Files ({filteredFiles.length})
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                  {filteredFiles.map((file) => (
                    <FileCard key={file.id} file={file} onDelete={handleFileDelete} onPreview={setPreviewFile} />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FileList files={filteredFiles} onDelete={handleFileDelete} onPreview={setPreviewFile} />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredFiles.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No files found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedType
                    ? "Try adjusting your search or filters"
                    : "Upload some files to get started"}
                </p>
              </motion.div>
            )}
          </motion.section>
        </div>
      </main>

      {/* File Preview Modal */}
      <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  )
}
