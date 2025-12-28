// Get organization's payment history
export default defineEventHandler(async (event) => {
    const ctx = await requireOrgContext(event)

    const payments = await prisma.organizationPayment.findMany({
        where: { organizationId: ctx.organizationId! },
        orderBy: { createdAt: 'desc' },
        take: 20
    })

    // Get plan info for each payment
    const organization = await prisma.organization.findUnique({
        where: { id: ctx.organizationId! },
        include: { plan: true }
    })

    return payments.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        createdAt: payment.createdAt,
        planName: organization?.plan?.name || 'Subscription'
    }))
})
