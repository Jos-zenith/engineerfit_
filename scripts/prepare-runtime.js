#!/usr/bin/env node
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./prisma/dev.db"
    console.log("[prepare-runtime] Setting DATABASE_URL=file:./prisma/dev.db")
  } else {
    console.log(`[prepare-runtime] DATABASE_URL already set: ${process.env.DATABASE_URL}`)
  }
}

function ensureSqliteFile() {
  if (!process.env.DATABASE_URL?.startsWith("file:")) {
    return
  }

  const dbPath = process.env.DATABASE_URL.slice("file:".length)
  const resolvedPath = dbPath.startsWith("./") ? path.resolve(process.cwd(), dbPath) : path.resolve(dbPath)
  const directory = path.dirname(resolvedPath)

  fs.mkdirSync(directory, { recursive: true })
  if (!fs.existsSync(resolvedPath)) {
    fs.writeFileSync(resolvedPath, "")
    console.log(`[prepare-runtime] Created SQLite database file at ${resolvedPath}`)
  }
}

function run(command) {
  execSync(command, {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  })
}

function hasGeneratedPrismaClient() {
  const clientEntry = path.join(process.cwd(), "generated", "prisma", "index.js")
  return fs.existsSync(clientEntry)
}

try {
  ensureDatabaseUrl()
  ensureSqliteFile()

  if (!hasGeneratedPrismaClient()) {
    console.log("[prepare-runtime] Prisma client not found; generating it now")
    run("pnpm exec prisma generate")
  } else {
    console.log("[prepare-runtime] Prisma client already generated; skipping generation")
  }

  run("pnpm exec prisma migrate deploy")
  console.log("[prepare-runtime] Runtime preparation completed")
} catch (error) {
  console.error("[prepare-runtime] Failed to prepare runtime")
  throw error
}
