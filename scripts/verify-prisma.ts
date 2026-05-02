import "dotenv/config"
import { prisma } from "@/lib/prisma"

async function main() {
  const result = await prisma.user.findMany({ take: 1 })
  console.log("✅ Connected")
  console.log(`Rows read: ${result.length}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })