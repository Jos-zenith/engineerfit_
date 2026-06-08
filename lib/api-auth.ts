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
      const devDetails = process.env.NODE_ENV !== "production" ? {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        tokenPresent: !!token,
        tokenKeys: token ? Object.keys(token) : [],
      } : undefined

      // Helpful debug info for local development — avoid leaking token contents.
      console.debug("[requireAuth] unauthorized access", devDetails)

      return {
        error: new Response(JSON.stringify({ error: "Unauthorized", details: devDetails }), { status: 401 }),
        user: null,
      }
    }

    const user = {
      id: token.sub,
      email: typeof token.email === "string" ? token.email : null,
      user_metadata: token,
    }

    console.debug("[requireAuth] token OK for user", { id: user.id, hasEmail: !!user.email })

    return { error: null, user }
  } catch (error) {
    console.error("[requireAuth] error verifying session", error)
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
      console.debug("[requireRole] profile missing and role metadata mismatch", { userId: auth.user.id, expectedRole: role, roleFromMetadata })
      return {
        error: new Response(JSON.stringify({ error: `Forbidden: this account is not a ${role}. Please sign in as a ${role} and complete your profile.` }), { status: 403 }),
        user: auth.user,
        profile: null,
      }
    }

    if (profile && profile.role !== role && roleFromMetadata !== role) {
      console.debug("[requireRole] profile role mismatch", { userId: auth.user.id, profileRole: profile.role, expectedRole: role, roleFromMetadata })
      return {
        error: new Response(JSON.stringify({ error: `Forbidden: this account has role ${profile.role}. Please sign in with a ${role} account.` }), { status: 403 }),
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
    console.error("[requireRole] error resolving role/profile", error)
    const message = error instanceof Error ? error.message : "Forbidden"
    return {
      error: new Response(JSON.stringify({ error: message }), { status: 403 }),
      user: auth.user,
      profile: null,
    }
  }
}

