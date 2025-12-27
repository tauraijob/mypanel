import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Super Admin and Subscription Plans...')

    // Create Super Admin user
    const hashedPassword = await bcrypt.hash('superadmin123', 12)
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@mypanel.com' },
        update: {
            role: 'SUPER_ADMIN',
            password: hashedPassword,
            isActive: true,
            emailVerified: true
        },
        create: {
            email: 'superadmin@mypanel.com',
            password: hashedPassword,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true,
            organizationId: null  // Super admin has no organization
        }
    })
    console.log('✅ Super Admin created:', superAdmin.email)

    // Create Subscription Plans
    const plans = [
        {
            name: 'Starter',
            description: 'Perfect for freelancers and small businesses just getting started',
            monthlyPrice: 9.99,
            yearlyPrice: 99.99,
            maxClients: 25,
            maxServices: 50,
            maxUsers: 2,
            maxInvoicesPerMonth: 50,
            features: JSON.stringify([
                'Up to 25 clients',
                'Up to 50 services',
                '2 team members',
                'Email support',
                'Basic reports'
            ]),
            isActive: true,
            isPopular: false
        },
        {
            name: 'Professional',
            description: 'Ideal for growing businesses with larger client bases',
            monthlyPrice: 29.99,
            yearlyPrice: 299.99,
            maxClients: 100,
            maxServices: 200,
            maxUsers: 5,
            maxInvoicesPerMonth: 200,
            features: JSON.stringify([
                'Up to 100 clients',
                'Up to 200 services',
                '5 team members',
                'Priority email support',
                'Advanced reports',
                'Custom branding',
                'API access'
            ]),
            isActive: true,
            isPopular: true
        },
        {
            name: 'Business',
            description: 'For established businesses needing unlimited access',
            monthlyPrice: 79.99,
            yearlyPrice: 799.99,
            maxClients: -1, // Unlimited
            maxServices: -1,
            maxUsers: 20,
            maxInvoicesPerMonth: -1,
            features: JSON.stringify([
                'Unlimited clients',
                'Unlimited services',
                '20 team members',
                '24/7 priority support',
                'Advanced analytics',
                'White-label branding',
                'API access',
                'Dedicated account manager'
            ]),
            isActive: true,
            isPopular: false
        }
    ]

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan
        })
    }
    console.log('✅ Subscription plans created')

    console.log('')
    console.log('🎉 Super Admin seeding complete!')
    console.log('')
    console.log('📋 Super Admin credentials:')
    console.log('   Email: superadmin@mypanel.com')
    console.log('   Password: superadmin123')
    console.log('')
    console.log('⚠️  IMPORTANT: Change the password after first login!')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
