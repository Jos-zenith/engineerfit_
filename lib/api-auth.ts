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

function getHeaderRole(request: NextRequest) {
  const role = request.headers.get("x-user-role")
  return role === "student" || role === "recruiter" ? role : null
}

async function ensureGuestUser(role: "student" | "recruiter") {
  const userId = `guest-${role}`
  const existingUser = await prisma.user.findUnique({ where: { id: userId } })

  if (existingUser) {
    return existingUser
  }

  return prisma.user.create({
    data: {
      id: userId,
      email: `${userId}@guest.local`,
      name: role === "recruiter" ? "Recruiter Guest" : "Student Guest",
    },
  })
}

async function ensureGuestProfile(userId: string, role: "student" | "recruiter") {
  const existingProfile = await prisma.assessmentProfile.findFirst({ where: { userId } })

  if (existingProfile) {
    return existingProfile
  }

  return prisma.assessmentProfile.create({
    data: {
      userId,
      displayName: role === "recruiter" ? "Recruiter Guest" : "Student Guest",
      role,
    },
  })
}

export async function requireAuth(request: NextRequest) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })

    if (token?.sub) {
      const user = {
        id: token.sub,
        email: typeof token.email === "string" ? token.email : null,
        user_metadata: token,
      }

      return { error: null, user }
    }

    const headerRole = getHeaderRole(request)
    if (headerRole) {
      const guestUser = await ensureGuestUser(headerRole)
      await ensureGuestProfile(guestUser.id, headerRole)

      return {
        error: null,
        user: {
          id: guestUser.id,
          email: guestUser.email,
          user_metadata: { role: headerRole, full_name: guestUser.name },
        },
      }
    }

    const devDetails = process.env.NODE_ENV !== "production" ? {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      tokenPresent: !!token,
      tokenKeys: token ? Object.keys(token) : [],
    } : undefined

    return {
      error: new Response(JSON.stringify({ error: "Unauthorized", details: devDetails }), { status: 401 }),
      user: null,
    }
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
    const headerRole = getHeaderRole(request)
    const resolvedRole = headerRole ?? roleFromMetadata ?? role

    if (!profile && resolvedRole !== role) {
      return {
        error: new Response(JSON.stringify({ error: `Forbidden: this account is not a ${role}. Please choose the ${role} experience.` }), { status: 403 }),
        user: auth.user,
        profile: null,
      }
    }

    if (profile && profile.role !== role && resolvedRole !== role) {
      return {
        error: new Response(JSON.stringify({ error: `Forbidden: this account has role ${profile.role}. Please choose the ${role} experience.` }), { status: 403 }),
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

