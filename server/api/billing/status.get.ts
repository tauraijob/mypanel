import { checkSubscriptionStatus } from '../../utils/subscription'

export default defineEventHandler(async (event) => {
    const ctx = await requireOrgContext(event)

    const organization = await prisma.organization.findUnique({
        where: { id: ctx.organizationId },
        include: { plan: true }
    })

    if (!organization) throw createError({ statusCode: 404, message: 'Organization not found' })

    const { status, valid, message, daysLeft } = checkSubscriptionStatus(organization)

    // If status in DB is different from calculated status (e.g. date passed), update it
    if (status === 'EXPIRED' && organization.subscriptionStatus !== 'EXPIRED') {
        await prisma.organization.update({
            where: { id: organization.id },
            data: { subscriptionStatus: 'EXPIRED' }
        })
    }

    return {
        status, // Calculated status
        valid,
        message,
        daysLeft,
        expiresAt: organization.subscriptionEnd,
        plan: organization.plan || { name: 'Free Trial', monthlyPrice: 0 }
    }
})
