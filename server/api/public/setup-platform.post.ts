// Initial platform setup - creates super admin and subscription plans
// This endpoint is only accessible when no super admin exists yet
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    })

    if (existingSuperAdmin) {
        throw createError({
            statusCode: 403,
            message: 'Platform is already set up. Super admin exists.'
        })
    }

    // Create Super Admin
    const hashedPassword = await bcrypt.hash('superadmin123', 12)
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@mypanel.com',
            password: hashedPassword,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true,
            organizationId: null
        }
    })

    // Create Subscription Plans
    const plans = [
        {
            name: 'Starter',
            description: 'Perfect for freelancers and small businesses',
            monthlyPrice: 9.99,
            yearlyPrice: 99.99,
            maxClients: 25,
            maxServices: 50,
            maxUsers: 2,
            features: JSON.stringify(['Up to 25 clients', 'Up to 50 services', '2 team members', 'Email support']),
            isActive: true,
            sortOrder: 1
        },
        {
            name: 'Professional',
            description: 'Ideal for growing businesses',
            monthlyPrice: 29.99,
            yearlyPrice: 299.99,
            maxClients: 100,
            maxServices: 200,
            maxUsers: 5,
            features: JSON.stringify(['Up to 100 clients', 'Up to 200 services', '5 team members', 'Priority support', 'Custom branding']),
            isActive: true,
            isPopular: true,
            sortOrder: 2
        },
        {
            name: 'Business',
            description: 'For established businesses',
            monthlyPrice: 79.99,
            yearlyPrice: 799.99,
            maxClients: -1,
            maxServices: -1,
            maxUsers: 20,
            features: JSON.stringify(['Unlimited clients', 'Unlimited services', '20 team members', '24/7 support', 'White-label']),
            isActive: true,
            sortOrder: 3
        }
    ]

    for (const plan of plans) {
        await prisma.subscriptionPlan.create({ data: plan })
    }

    return {
        success: true,
        message: 'Platform initialized successfully!',
        superAdmin: {
            email: 'superadmin@mypanel.com',
            password: 'superadmin123 (change this immediately!)'
        },
        plansCreated: plans.length
    }
})
