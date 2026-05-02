import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"

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
        // Minimal placeholder: accept any credentials with an email.
        if (!credentials?.email) return null
        // Find or create user
        let user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) {
          user = await prisma.user.create({ data: { email: credentials.email, name: credentials.email } })
        }
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  }
}

export const handler = NextAuth(getAuthOptions())
