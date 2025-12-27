// Get public subscription plans (no auth required)
export default defineEventHandler(async () => {
    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
            id: true,
            name: true,
            description: true,
            monthlyPrice: true,
            yearlyPrice: true,
            maxClients: true,
            maxUsers: true,
            maxServices: true,
            features: true
        }
    })

    return plans
})
