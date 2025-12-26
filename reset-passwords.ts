import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 12)

    await prisma.user.update({
        where: { email: 'admin@mypanel.com' },
        data: { password: hashedPassword }
    })

    console.log('✅ Admin password updated to: admin123')

    // Also update sales user
    const salesPassword = await bcrypt.hash('sales123', 12)
    await prisma.user.update({
        where: { email: 'sales@mypanel.com' },
        data: { password: salesPassword }
    })

    console.log('✅ Sales password updated to: sales123')
}

main()
    .finally(() => prisma.$disconnect())
