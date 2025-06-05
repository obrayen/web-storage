import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/db"
import tinify from "tinify"

// Inisialisasi TinyPNG dengan API key
tinify.key = process.env.TINYPNG_API_KEY || "TV4hF5gP8SFsmQQ9d850l9jLY7K39VDt"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Hanya kompres jika file adalah gambar
    const isImage = file.type.startsWith("image/")
    let fileToUpload = file
    let compressedSize = file.size

    if (isImage) {
      try {
        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Kompres menggunakan TinyPNG
        const compressedBuffer = await tinify.fromBuffer(buffer).toBuffer()
        
        // Buat File baru dari buffer yang sudah dikompresi
        fileToUpload = new File([compressedBuffer], file.name, {
          type: file.type,
          lastModified: Date.now()
        })
        
        compressedSize = compressedBuffer.length
      } catch (error) {
        console.error("Error compressing image with TinyPNG:", error)
        // Jika terjadi error saat kompresi, lanjutkan dengan file asli
      }
    }

    // Upload to Vercel Blob, function untuk upload ke vercel blob provider
    const blob = await put(fileToUpload.name, fileToUpload, {
      access: "public",
      addRandomSuffix: true //nama filenya acak
    })

    // Save metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ""), 
        originalName: file.name,
        size: file.size,
        type: file.type.split("/")[0], 
        mimeType: file.type,
        blobUrl: blob.url,
        folder: (formData.get("folder") as string) || null,
        tags: [],
      },
    })

    

    return NextResponse.json(fileRecord)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}