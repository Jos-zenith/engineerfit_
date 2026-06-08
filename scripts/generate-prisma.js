#!/usr/bin/env node
const { execSync } = require("child_process")

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db"
  console.log("Using fallback DATABASE_URL=file:./prisma/dev.db")
}

execSync("pnpm exec prisma generate", {
  stdio: "inherit",
  env: process.env,
})
