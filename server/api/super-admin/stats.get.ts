// Get dashboard stats for Super Admin with optional period filter
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    const query = getQuery(event)
    const period = (query.period as string) || 'month' // 'day', 'month', 'year'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let groupCount: number
    let labels: string[] = []

    if (period === 'day') {
        // Last 7 days
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        groupCount = 7
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
        }
    } else if (period === 'year') {
        // Last 12 months
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 11)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        groupCount = 12
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        for (let i = 11; i >= 0; i--) {
            const monthIndex = (now.getMonth() - i + 12) % 12
            labels.push(months[monthIndex])
        }
    } else {
        // Last 6 months (default)
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 5)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        groupCount = 6
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (now.getMonth() - i + 12) % 12
            labels.push(months[monthIndex])
        }
    }

    const [
        totalOrgs,
        activeOrgs,
        totalUsers,
        totalClients,
        totalInvoices,
        recentOrgs,
        planStats,
        orgsInPeriod,
        revenueInPeriod,
        statusBreakdown
    ] = await Promise.all([
        prisma.organization.count(),
        prisma.organization.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
        prisma.client.count(),
        prisma.invoice.count(),
        prisma.organization.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                subscriptionStatus: true,
                createdAt: true,
                plan: { select: { name: true } }
            }
        }),
        prisma.subscriptionPlan.findMany({
            select: {
                name: true,
                monthlyPrice: true,
                _count: { select: { organizations: true } }
            }
        }),
        // Organizations created in period
        prisma.organization.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true }
        }),
        // Revenue in period
        prisma.organizationPayment.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: { gte: startDate }
            },
            select: { amount: true, createdAt: true }
        }),
        // Status breakdown
        prisma.organization.groupBy({
            by: ['subscriptionStatus'],
            _count: true
        })
    ])

    // Total revenue (all time)
    const totalRevenue = await prisma.organizationPayment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
    })

    // Revenue in selected period
    const periodRevenue = await prisma.organizationPayment.aggregate({
        where: {
            status: 'COMPLETED',
            createdAt: { gte: startDate }
        },
        _sum: { amount: true }
    })

    // Initialize arrays for chart data
    const signupsData = new Array(groupCount).fill(0)
    const revenueData = new Array(groupCount).fill(0)

    // Helper to get index based on period type
    const getIndex = (date: Date): number => {
        if (period === 'day') {
            const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
            return groupCount - 1 - daysDiff
        } else {
            const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
            return groupCount - 1 - monthsDiff
        }
    }

    // Aggregate signups
    orgsInPeriod.forEach((org: any) => {
        const index = getIndex(new Date(org.createdAt))
        if (index >= 0 && index < groupCount) {
            signupsData[index]++
        }
    })

    // Aggregate revenue
    revenueInPeriod.forEach((payment: any) => {
        const index = getIndex(new Date(payment.createdAt))
        if (index >= 0 && index < groupCount) {
            revenueData[index] += Number(payment.amount || 0)
        }
    })

    // Process status breakdown
    const statusData = statusBreakdown.map((s: any) => ({
        status: s.subscriptionStatus,
        count: s._count
    }))

    return {
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        totalUsers,
        totalClients,
        totalInvoices,
        platformRevenue: totalRevenue._sum.amount || 0,
        periodRevenue: periodRevenue._sum.amount || 0,
        recentOrganizations: recentOrgs,
        planStats,
        chartData: {
            labels,
            signups: signupsData,
            revenue: revenueData,
            period
        },
        statusBreakdown: statusData
    }
})
