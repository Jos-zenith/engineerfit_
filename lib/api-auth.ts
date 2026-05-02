import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

function getRoleFromMetadata(user: { user_metadata?: Record<string, unknown> }) {
  const metadataRole = user.user_metadata?.role
  if (metadataRole === "student" || metadataRole === "recruiter") {
    return metadataRole
  }

  return null
}

export async function requireAuth(request: NextRequest) {
  // Try to read NextAuth session token from cookies (server-side)
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !token.sub) {
      return { error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), user: null }
    }

    const user = {
      id: token.sub,
      email: typeof token.email === "string" ? token.email : null,
      user_metadata: token,
    }

    return { error: null, user }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify session"
    return { error: new Response(JSON.stringify({ error: message }), { status: 500 }), user: null }
  }
}

export async function requireRole(request: NextRequest, role: "student" | "recruiter") {
  const auth = await requireAuth(request)
  if (auth.error || !auth.user) {
    return { ...auth, profile: null }
  }

  try {
    const profile = await prisma.assessmentProfile.findFirst({
      where: { userId: auth.user.id },
    })

    const roleFromMetadata = getRoleFromMetadata(auth.user)

    if (!profile && roleFromMetadata !== role) {
      return {
        error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
        user: auth.user,
        profile: null,
      }
    }

    if (profile && profile.role !== role && roleFromMetadata !== role) {
      return {
        error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
        user: auth.user,
        profile: null,
      }
    }

    const resolvedProfile = profile || {
      id: auth.user.id,
      role,
      full_name: typeof auth.user.user_metadata?.full_name === "string" ? auth.user.user_metadata.full_name : null,
    }

    return { error: null, user: auth.user, profile: resolvedProfile }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    return {
      error: new Response(JSON.stringify({ error: message }), { status: 403 }),
      user: auth.user,
      profile: null,
    }
  }
}

