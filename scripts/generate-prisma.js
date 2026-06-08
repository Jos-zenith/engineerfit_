#!/usr/bin/env node
const { execSync } = require("child_process")
const path = require("path")

// Ensure DATABASE_URL is set for Prisma schema validation
if (!process.env.DATABASE_URL) {
  const defaultDb = "file:./prisma/dev.db"
  process.env.DATABASE_URL = defaultDb
  console.log(`[generate-prisma] Setting DATABASE_URL=${defaultDb}`)
} else {
  console.log(`[generate-prisma] DATABASE_URL already set: ${process.env.DATABASE_URL}`)
}

// Generate Prisma client with DATABASE_URL in environment
try {
  console.log("[generate-prisma] Running: pnpm exec prisma generate")
  execSync("pnpm exec prisma generate", {
    stdio: "inherit",
    env: { ...process.env },
    cwd: process.cwd(),
  })
  console.log("[generate-prisma] ✓ Prisma client generated successfully")
} catch (error) {
  console.error("[generate-prisma] ✗ Failed to generate Prisma client")
  process.exit(1)
}
