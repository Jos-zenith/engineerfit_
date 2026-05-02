import "dotenv/config"
import { PrismaClient } from "@/generated/prisma"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Set it to a SQLite file URL like file:./prisma/dev.db in .env before using Prisma.")
}

const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV !== "production" ? ["error"] : undefined,
})

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

export { prisma }
export default prisma