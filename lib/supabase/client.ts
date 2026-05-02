"use client"

/**
 * This project uses Prisma + NextAuth for authentication and data persistence.
 * Supabase is no longer required.
 * 
 * For authentication: Use NextAuth (see app/api/auth/[...nextauth]/handler.ts)
 * For data access: Use Prisma client (see lib/prisma.ts)
 */

export function getSupabaseClient() {
  throw new Error(
    'Supabase client is no longer used. This project uses Prisma + NextAuth. ' +
    'For auth: import from "next-auth/react". For data: import { prisma } from "@/lib/prisma"'
  )
}

export function isSupabaseAvailable(): boolean {
  return false
}

