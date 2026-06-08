import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"

interface AuthUser {
  id: string
  email: string | null
  name: string | null
  role?: "student" | "recruiter" | null
  full_name?: string | null
}

function getAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email) return null

          let user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user) {
            user = await prisma.user.create({ data: { email: credentials.email, name: credentials.email } })
          }

          const profile = await prisma.assessmentProfile.findFirst({ where: { userId: user.id } })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: profile?.role === "student" || profile?.role === "recruiter" ? profile.role : null,
            full_name: profile?.displayName ?? user.name ?? user.email,
          }
        },
      }),
    ],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          const typedUser = user as AuthUser
          if (typedUser.role) {
            token.role = typedUser.role
          }
          if (typedUser.full_name) {
            token.full_name = typedUser.full_name
          }
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.role as "student" | "recruiter" | null
          session.user.full_name = token.full_name as string | null
        }
        return session
      },
    },
  }
}

export const handler = NextAuth(getAuthOptions())
