import "dotenv/config"
import { PrismaClient } from "../generated/prisma"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db"
}

const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV !== "production" ? ["error"] : undefined,
})

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

export { prisma }
export default prisma