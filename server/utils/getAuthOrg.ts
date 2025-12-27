import { H3Event } from 'h3'

/**
 * Get organization ID from authenticated user
 * Returns organizationId for regular users, or parses orgId from query for super admin
 */
export const getAuthOrgId = async (event: H3Event): Promise<number> => {
    const authUser = requireAuth(event)

    const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { organizationId: true, role: true }
    })

    if (!user) {
        throw createError({ statusCode: 401, message: 'User not found' })
    }

    // Super admin can optionally view specific org
    if (user.role === 'SUPER_ADMIN') {
        const query = getQuery(event)
        if (query.orgId) {
            return parseInt(query.orgId as string)
        }
        throw createError({ statusCode: 400, message: 'Super admin must specify orgId for this action' })
    }

    // Regular users must have an organization
    if (!user.organizationId) {
        throw createError({ statusCode: 403, message: 'No organization associated with your account' })
    }

    return user.organizationId
}

/**
 * Get organization ID if user is regular org member, or null if super admin without orgId
 * Useful for queries that should return all data for super admin
 */
export const getOptionalAuthOrgId = async (event: H3Event): Promise<number | null> => {
    const authUser = requireAuth(event)

    const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { organizationId: true, role: true }
    })

    if (!user) {
        throw createError({ statusCode: 401, message: 'User not found' })
    }

    if (user.role === 'SUPER_ADMIN') {
        const query = getQuery(event)
        return query.orgId ? parseInt(query.orgId as string) : null
    }

    return user.organizationId
}

/**
 * Check if current user is super admin
 */
export const isSuperAdmin = async (event: H3Event): Promise<boolean> => {
    const authUser = requireAuth(event)

    const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { role: true }
    })

    return user?.role === 'SUPER_ADMIN'
}
