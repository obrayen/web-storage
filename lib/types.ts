export interface FileData {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  mimeType: string
  blobUrl: string
  uploadedAt: string
  folder?: string
  tags: string[]
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: "uploading" | "completed" | "error"
}
