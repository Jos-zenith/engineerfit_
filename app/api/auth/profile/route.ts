import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

function tokenToUser(token: Awaited<ReturnType<typeof getToken>>) {
  if (!token?.sub) {
    return null
  }

  return {
    id: token.sub,
    email: typeof token.email === "string" ? token.email : null,
    name: typeof token.name === "string" ? token.name : null,
    role: token.role === "student" || token.role === "recruiter" ? token.role : null,
    fullName: typeof token.full_name === "string" ? token.full_name : null,
  }
}

async function requireSessionUser(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  return tokenToUser(token)
}

function profileToResponse(profile: { id: string; displayName: string; role: string | null }) {
  return {
    id: profile.id,
    role: profile.role === "student" || profile.role === "recruiter" ? profile.role : null,
    full_name: profile.displayName,
  }
}

export async function GET(request: NextRequest) {
  const user = await requireSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.assessmentProfile.findFirst({
    where: { userId: user.id },
  })

  const resolvedProfile = profile
    ? profileToResponse(profile)
    : {
        id: user.id,
        role: user.role,
        full_name: user.fullName ?? user.name ?? user.email ?? "User",
      }

  return NextResponse.json({
    profile: resolvedProfile,
    user: { id: user.id, email: user.email },
  })
}

export async function POST(request: NextRequest) {
  const user = await requireSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const role = body?.role === "recruiter" ? "recruiter" : "student"
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : null

  const displayName = fullName || user.fullName || user.name || user.email || "User"

  const existingProfile = await prisma.assessmentProfile.findFirst({
    where: { userId: user.id },
  })

  const profile = existingProfile
    ? await prisma.assessmentProfile.update({
        where: { id: existingProfile.id },
        data: {
          displayName,
          role,
        },
      })
    : await prisma.assessmentProfile.create({
        data: {
          userId: user.id,
          displayName,
          role,
        },
      })

  await prisma.user.update({
    where: { id: user.id },
    data: { name: displayName },
  })

  return NextResponse.json({ profile: profileToResponse(profile) })
}
