import { NextRequest } from "next/server"

// Force dynamic rendering to skip static generation
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { handler } = await import("./handler")
    return handler(request)
  } catch (error) {
    console.error("Auth GET error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { handler } = await import("./handler")
    return handler(request)
  } catch (error) {
    console.error("Auth POST error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
