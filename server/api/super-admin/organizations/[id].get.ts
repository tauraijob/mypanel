// Get single organization details (Super Admin only)
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    const id = parseInt(getRouterParam(event, 'id') || '')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Invalid organization ID'
        })
    }

    const org = await prisma.organization.findUnique({
        where: { id },
        include: {
            plan: true,
            settings: true,
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    lastLogin: true
                }
            },
            _count: {
                select: {
                    clients: true,
                    services: true,
                    invoices: true,
                    payments: true
                }
            }
        }
    })

    if (!org) {
        throw createError({
            statusCode: 404,
            message: 'Organization not found'
        })
    }

    // Get revenue stats
    const payments = await prisma.payment.aggregate({
        where: { organizationId: id },
        _sum: { amount: true }
    })

    return {
        ...org,
        totalRevenue: payments._sum.amount || 0
    }
})
