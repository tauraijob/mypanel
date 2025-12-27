// Export all organization data for backup
export default defineEventHandler(async (event) => {
    const authUser = requireAuth(event)

    // Get user's organization
    const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { organizationId: true, role: true, email: true }
    })

    if (!user?.organizationId) {
        throw createError({
            statusCode: 403,
            message: 'No organization associated with your account'
        })
    }

    // Only admins can export all data
    if (user.role !== 'ADMIN') {
        throw createError({
            statusCode: 403,
            message: 'Only organization admins can export data'
        })
    }

    const orgId = user.organizationId

    // Fetch all organization data
    const [
        organization,
        settings,
        clients,
        services,
        categories,
        invoices,
        quotations,
        payments
    ] = await Promise.all([
        prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                slug: true,
                email: true,
                phone: true,
                createdAt: true
            }
        }),
        prisma.settings.findFirst({
            where: { organizationId: orgId }
        }),
        prisma.client.findMany({
            where: { organizationId: orgId },
            include: { _count: { select: { services: true, invoices: true } } }
        }),
        prisma.service.findMany({
            where: { organizationId: orgId },
            include: { client: { select: { name: true } }, category: { select: { name: true } } }
        }),
        prisma.serviceCategory.findMany({
            where: { organizationId: orgId }
        }),
        prisma.invoice.findMany({
            where: { organizationId: orgId },
            include: {
                client: { select: { name: true, email: true } },
                items: true
            }
        }),
        prisma.quotation.findMany({
            where: { organizationId: orgId },
            include: {
                client: { select: { name: true, email: true } },
                items: true
            }
        }),
        prisma.payment.findMany({
            where: { organizationId: orgId },
            include: {
                client: { select: { name: true } },
                invoice: { select: { invoiceNumber: true } }
            }
        })
    ])

    const backup = {
        exportedAt: new Date().toISOString(),
        organization,
        settings,
        data: {
            clients,
            services,
            categories,
            invoices,
            quotations,
            payments
        },
        summary: {
            totalClients: clients.length,
            totalServices: services.length,
            totalCategories: categories.length,
            totalInvoices: invoices.length,
            totalQuotations: quotations.length,
            totalPayments: payments.length
        }
    }

    return backup
})
