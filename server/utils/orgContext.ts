import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'

// Use same JWT_SECRET pattern as auth.ts
const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key'

interface OrgContext {
    userId: number
    userRole: string
    organizationId: number | null
    isSuperAdmin: boolean
}

/**
 * Gets the organization context from the request
 * Used by all API routes to scope data to the user's organization
 */
export const getOrgContext = async (event: H3Event): Promise<OrgContext | null> => {
    const authHeader = getHeader(event, 'Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
        return null
    }

    const token = authHeader.substring(7)

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as any

        // Fetch user with organization
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                role: true,
                organizationId: true,
                isActive: true
            }
        })

        if (!user || !user.isActive) {
            return null
        }

        return {
            userId: user.id,
            userRole: user.role,
            organizationId: user.organizationId,
            isSuperAdmin: user.role === 'SUPER_ADMIN'
        }
    } catch {
        return null
    }
}

/**
 * Requires authentication and returns org context
 * Throws 401 if not authenticated
 */
export const requireOrgContext = async (event: H3Event): Promise<OrgContext> => {
    const ctx = await getOrgContext(event)

    if (!ctx) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    return ctx
}

/**
 * Requires Super Admin access
 * Throws 403 if not Super Admin
 */
export const requireSuperAdmin = async (event: H3Event): Promise<OrgContext> => {
    const ctx = await requireOrgContext(event)

    if (!ctx.isSuperAdmin) {
        throw createError({
            statusCode: 403,
            message: 'Super Admin access required'
        })
    }

    return ctx
}

/**
 * Gets organization filter for Prisma queries
 * Super Admins can optionally filter by orgId query param
 */
export const getOrgFilter = async (event: H3Event): Promise<{ organizationId: number }> => {
    const ctx = await requireOrgContext(event)

    // Super Admin viewing specific org
    if (ctx.isSuperAdmin) {
        const query = getQuery(event)
        const orgId = query.orgId as string
        if (orgId) {
            return { organizationId: parseInt(orgId) }
        }
        // Super Admin without orgId - show all (handled in specific endpoints)
        throw createError({
            statusCode: 400,
            message: 'orgId required for this endpoint'
        })
    }

    // Regular users - must have an organization
    if (!ctx.organizationId) {
        throw createError({
            statusCode: 403,
            message: 'No organization associated with your account'
        })
    }

    return { organizationId: ctx.organizationId }
}

/**
 * Gets optional organization filter (for queries that don't require org)
 */
export const getOptionalOrgFilter = async (event: H3Event): Promise<{ organizationId?: number } | null> => {
    const ctx = await getOrgContext(event)

    if (!ctx) return null

    if (ctx.isSuperAdmin) {
        const query = getQuery(event)
        const orgId = query.orgId as string
        if (orgId) {
            return { organizationId: parseInt(orgId) }
        }
        return {} // Super Admin sees all
    }

    if (!ctx.organizationId) return null

    return { organizationId: ctx.organizationId }
}
