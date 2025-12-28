// Get public subscription plans (no auth required)
// Sorted with lowest price in the middle (medium, lowest, highest)
export default defineEventHandler(async () => {
    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { monthlyPrice: 'asc' },
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

    // If we have 3 or more plans, reorder to put lowest price in middle
    // Order becomes: [medium, lowest, highest] for a more appealing layout
    if (plans.length >= 3) {
        // Plans are sorted by price ascending: [lowest, medium, highest, ...]
        const lowest = plans[0]
        const medium = plans[1]
        const highest = plans[2]

        // Reorder: medium, lowest (most popular), highest
        const reordered = [medium, lowest, highest]

        // Add any remaining plans at the end if there are more than 3
        if (plans.length > 3) {
            reordered.push(...plans.slice(3))
        }

        // Add isPopular flag to the lowest price plan (now in the middle)
        return reordered.map((plan, index) => ({
            ...plan,
            monthlyPrice: Number(plan.monthlyPrice),
            yearlyPrice: Number(plan.yearlyPrice),
            isPopular: index === 1 // Middle position (the cheapest)
        }))
    }

    // For less than 3 plans, mark the first (cheapest) as popular
    return plans.map((plan, index) => ({
        ...plan,
        monthlyPrice: Number(plan.monthlyPrice),
        yearlyPrice: Number(plan.yearlyPrice),
        isPopular: index === 0
    }))
})
