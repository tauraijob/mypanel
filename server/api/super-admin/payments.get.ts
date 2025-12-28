// Super admin endpoint to view all organization payments
export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    // Only super admin can access
    if (user.role !== 'SUPER_ADMIN') {
        throw createError({
            statusCode: 403,
            message: 'Super admin access required'
        })
    }

    const query = getQuery(event)
    const status = query.status as string | undefined
    const limit = parseInt(query.limit as string) || 50

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
        where.status = status
    }

    const payments = await prisma.organizationPayment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            organization: {
                include: {
                    plan: true
                }
            }
        }
    })

    // Calculate stats
    const stats = await prisma.organizationPayment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: 'COMPLETED' }
    })

    const pendingCount = await prisma.organizationPayment.count({
        where: { status: 'PENDING' }
    })

    return {
        payments: payments.map(p => ({
            id: p.id,
            organizationId: p.organizationId,
            organizationName: p.organization.name,
            organizationEmail: p.organization.email,
            planName: p.organization.plan?.name || 'N/A',
            amount: Number(p.amount),
            currency: p.currency,
            paymentMethod: p.paymentMethod,
            status: p.status,
            transactionId: p.transactionId,
            periodStart: p.periodStart,
            periodEnd: p.periodEnd,
            createdAt: p.createdAt
        })),
        stats: {
            totalRevenue: Number(stats._sum.amount) || 0,
            completedCount: stats._count || 0,
            pendingCount
        }
    }
})
