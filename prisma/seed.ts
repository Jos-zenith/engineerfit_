import "dotenv/config"
import { prisma } from "@/lib/prisma"

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: { name: "Alex" },
    create: {
      email: "alex@example.com",
      name: "Alex",
      profiles: {
        create: {
          displayName: "Alex",
        },
      },
    },
  })

  await prisma.assessmentProfile.upsert({
    where: { id: "seed-profile-1" },
    update: {},
    create: {
      id: "seed-profile-1",
      userId: user.id,
      displayName: "Alex",
    },
  })

  console.log(`Seeded Prisma Postgres data for ${user.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })