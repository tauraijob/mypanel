import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' }
    })
    console.log('Super Admins in DB:', JSON.stringify(users.map(u => ({ id: u.id, email: u.email, role: u.role, isActive: u.isActive })), null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
