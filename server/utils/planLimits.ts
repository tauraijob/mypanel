// Utility to check and enforce subscription plan limits
import prisma from './prisma'

interface PlanLimits {
    maxClients: number
    maxUsers: number
    maxServices: number
}

interface UsageCounts {
    clients: number
    users: number
    services: number
}

export interface PlanCheckResult {
    allowed: boolean
    message?: string
    limit?: number
    current?: number
}

/**
 * Get the plan limits for an organization
 */
export async function getPlanLimits(organizationId: number): Promise<PlanLimits | null> {
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { plan: true }
    })

    if (!org?.plan) {
        // No plan = no limits (or you could return default limits)
        return null
    }

    return {
        maxClients: org.plan.maxClients,
        maxUsers: org.plan.maxUsers,
        maxServices: org.plan.maxServices
    }
}

/**
 * Get current usage counts for an organization
 */
export async function getUsageCounts(organizationId: number): Promise<UsageCounts> {
    const [clients, users, services] = await Promise.all([
        prisma.client.count({ where: { organizationId } }),
        prisma.user.count({ where: { organizationId } }),
        prisma.service.count({
            where: {
                client: { organizationId }
            }
        })
    ])

    return { clients, users, services }
}

/**
 * Check if organization can add more clients
 */
export async function canAddClient(organizationId: number): Promise<PlanCheckResult> {
    const limits = await getPlanLimits(organizationId)

    // No plan or unlimited (-1)
    if (!limits || limits.maxClients === -1) {
        return { allowed: true }
    }

    const currentCount = await prisma.client.count({ where: { organizationId } })

    if (currentCount >= limits.maxClients) {
        return {
            allowed: false,
            message: `You've reached your plan's limit of ${limits.maxClients} clients. Please upgrade to add more.`,
            limit: limits.maxClients,
            current: currentCount
        }
    }

    return { allowed: true, limit: limits.maxClients, current: currentCount }
}

/**
 * Check if organization can add more services
 */
export async function canAddService(organizationId: number): Promise<PlanCheckResult> {
    const limits = await getPlanLimits(organizationId)

    if (!limits || limits.maxServices === -1) {
        return { allowed: true }
    }

    const currentCount = await prisma.service.count({
        where: { client: { organizationId } }
    })

    if (currentCount >= limits.maxServices) {
        return {
            allowed: false,
            message: `You've reached your plan's limit of ${limits.maxServices} services. Please upgrade to add more.`,
            limit: limits.maxServices,
            current: currentCount
        }
    }

    return { allowed: true, limit: limits.maxServices, current: currentCount }
}

/**
 * Check if organization can add more users
 */
export async function canAddUser(organizationId: number): Promise<PlanCheckResult> {
    const limits = await getPlanLimits(organizationId)

    if (!limits || limits.maxUsers === -1) {
        return { allowed: true }
    }

    const currentCount = await prisma.user.count({ where: { organizationId } })

    if (currentCount >= limits.maxUsers) {
        return {
            allowed: false,
            message: `You've reached your plan's limit of ${limits.maxUsers} users. Please upgrade to add more.`,
            limit: limits.maxUsers,
            current: currentCount
        }
    }

    return { allowed: true, limit: limits.maxUsers, current: currentCount }
}

/**
 * Get full usage summary for an organization (for displaying in UI)
 */
export async function getUsageSummary(organizationId: number) {
    const [limits, counts] = await Promise.all([
        getPlanLimits(organizationId),
        getUsageCounts(organizationId)
    ])

    return {
        clients: {
            current: counts.clients,
            limit: limits?.maxClients ?? -1,
            unlimited: !limits || limits.maxClients === -1,
            percentage: limits && limits.maxClients > 0
                ? Math.round((counts.clients / limits.maxClients) * 100)
                : 0
        },
        users: {
            current: counts.users,
            limit: limits?.maxUsers ?? -1,
            unlimited: !limits || limits.maxUsers === -1,
            percentage: limits && limits.maxUsers > 0
                ? Math.round((counts.users / limits.maxUsers) * 100)
                : 0
        },
        services: {
            current: counts.services,
            limit: limits?.maxServices ?? -1,
            unlimited: !limits || limits.maxServices === -1,
            percentage: limits && limits.maxServices > 0
                ? Math.round((counts.services / limits.maxServices) * 100)
                : 0
        }
    }
}
