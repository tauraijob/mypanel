// Get all organizations (Super Admin only)
export default defineEventHandler(async (event) => {
    const ctx = await requireSuperAdmin(event)

    const organizations = await prisma.organization.findMany({
        include: {
            plan: true,
            _count: {
                select: {
                    users: true,
                    clients: true,
                    services: true,
                    invoices: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return organizations
})
