// Get organization's plan usage summary
export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    if (!user.organizationId) {
        throw createError({
            statusCode: 403,
            message: 'Organization access required'
        })
    }

    const usage = await getUsageSummary(user.organizationId)

    // Also get plan details
    const org = await prisma.organization.findUnique({
        where: { id: user.organizationId },
        include: { plan: true }
    })

    return {
        plan: org?.plan ? {
            id: org.plan.id,
            name: org.plan.name,
            monthlyPrice: Number(org.plan.monthlyPrice),
            yearlyPrice: Number(org.plan.yearlyPrice),
            features: org.plan.features
        } : null,
        usage,
        subscriptionStatus: org?.subscriptionStatus,
        subscriptionEnd: org?.subscriptionEnd
    }
})
