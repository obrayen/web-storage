import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const sortBy = searchParams.get("sortBy") || "uploadedAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { originalName: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        type ? { type: { contains: type, mode: "insensitive" as const } } : {},
      ],
    }

    const files = await prisma.file.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Get file info before deletion
    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete from database
    await prisma.file.delete({
      where: { id },
    })

    // Delete from Vercel Blob
    try {
      await fetch(file.blobUrl, { method: "DELETE" })
    } catch (blobError) {
      console.error("Error deleting from blob:", blobError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
