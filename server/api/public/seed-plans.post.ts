// Seed subscription plans only - for adding plans to existing platform
export default defineEventHandler(async (event) => {
    // Check if plans already exist
    const existingPlans = await prisma.subscriptionPlan.count()

    if (existingPlans > 0) {
        return {
            success: true,
            message: `${existingPlans} plans already exist.`,
            existingPlans
        }
    }

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
        message: 'Subscription plans created!',
        plansCreated: plans.length
    }
})
