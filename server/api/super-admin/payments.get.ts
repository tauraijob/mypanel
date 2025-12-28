// Super admin endpoint to view all organization payments
// Using simpler query approach like dashboard stats
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    try {
        const query = getQuery(event)
        const statusFilter = query.status as string | undefined

        // Get all payments (simple query without complex relations)
        const payments = await prisma.organizationPayment.findMany({
            where: statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined,
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        // Get organizations separately to avoid relation issues
        const orgIds = [...new Set(payments.map(p => p.organizationId))]
        const organizations = await prisma.organization.findMany({
            where: { id: { in: orgIds } },
            include: { plan: true }
        })

        // Create lookup map
        const orgMap = new Map(organizations.map(o => [o.id, o]))

        // Calculate stats
        const completedPayments = payments.filter(p => p.status === 'COMPLETED')
        const pendingPayments = payments.filter(p => p.status === 'PENDING')
        const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0)

        return {
            payments: payments.map(p => {
                const org = orgMap.get(p.organizationId)
                return {
                    id: p.id,
                    organizationId: p.organizationId,
                    organizationName: org?.name || 'Unknown',
                    organizationEmail: org?.email || 'N/A',
                    planName: org?.plan?.name || 'N/A',
                    amount: Number(p.amount),
                    currency: p.currency,
                    paymentMethod: p.paymentMethod,
                    status: p.status,
                    transactionId: p.transactionId,
                    periodStart: p.periodStart,
                    periodEnd: p.periodEnd,
                    createdAt: p.createdAt
                }
            }),
            stats: {
                totalRevenue,
                completedCount: completedPayments.length,
                pendingCount: pendingPayments.length
            }
        }
    } catch (error: any) {
        console.error('Super admin payments error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to load payments'
        })
    }
})
