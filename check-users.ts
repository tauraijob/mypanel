import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    console.log('COUNT:', users.length)
    for (const user of users) {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`)
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
