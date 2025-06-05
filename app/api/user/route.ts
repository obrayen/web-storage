// app/api/user/route.ts

// cara untuk membuat backend di next js


import { NextResponse } from 'next/server'
import { prisma } from "@/lib/db"

export async function GET() {
    // ga harus pake select * from table
    const data = await prisma.file.findUnique({
        where: {
            id: "cmbjfd8660000uhto03ej3mpa"
        }
    })
    return NextResponse.json(data)
}
