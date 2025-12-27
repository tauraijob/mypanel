// Update organization (Super Admin only)
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    const id = parseInt(getRouterParam(event, 'id') || '')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Invalid organization ID'
        })
    }

    const org = await prisma.organization.update({
        where: { id },
        data: {
            name: body.name,
            email: body.email,
            phone: body.phone,
            planId: body.planId,
            subscriptionStatus: body.subscriptionStatus,
            subscriptionStart: body.subscriptionStart ? new Date(body.subscriptionStart) : undefined,
            subscriptionEnd: body.subscriptionEnd ? new Date(body.subscriptionEnd) : undefined,
            billingCycle: body.billingCycle,
            isActive: body.isActive
        },
        include: { plan: true }
    })

    return org
})
