// Get all users for super admin (all org admins across platform)
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    const query = getQuery(event)
    const search = query.search as string || ''
    const role = query.role as string || ''
    const orgId = query.orgId ? parseInt(query.orgId as string) : undefined

    const where: any = {}

    // Exclude super admin from the list (they manage themselves elsewhere)
    where.role = { not: 'SUPER_ADMIN' }

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } }
        ]
    }

    if (role && role !== 'SUPER_ADMIN') {
        where.role = role
    }

    if (orgId) {
        where.organizationId = orgId
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            organization: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return users
})
