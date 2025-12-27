
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export default defineEventHandler(async (event) => {
  // Require authentication and get user's organization
  const user = await requireAuth(event)

  if (!user.organizationId) {
    throw createError({
      statusCode: 403,
      message: 'Organization access required'
    })
  }

  const organizationId = user.organizationId
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Get counts - filtered by organization
  const [
    totalClients,
    activeServices,
    pendingInvoices,
    thisMonthRevenue,
    lastMonthRevenue,
    thisMonthClients,
    lastMonthClients
  ] = await Promise.all([
    prisma.client.count({
      where: {
        status: 'ACTIVE',
        organizationId
      }
    }),
    prisma.service.count({
      where: {
        status: 'ACTIVE',
        client: { organizationId }
      }
    }),
    prisma.invoice.findMany({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
        organizationId
      },
      select: { total: true, amountPaid: true }
    }),
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: thisMonthStart, lte: thisMonthEnd },
        invoice: { organizationId }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: lastMonthStart, lte: lastMonthEnd },
        invoice: { organizationId }
      },
      _sum: { amount: true }
    }),
    prisma.client.count({
      where: {
        createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
        organizationId
      }
    }),
    prisma.client.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        organizationId
      }
    })
  ])

  // Calculate pending amount
  const pendingAmount = pendingInvoices.reduce((sum, inv) => {
    return sum + (Number(inv.total) - Number(inv.amountPaid))
  }, 0)

  // Calculate percentage changes
  const thisMonth = Number(thisMonthRevenue._sum.amount) || 0
  const lastMonth = Number(lastMonthRevenue._sum.amount) || 0
  const revenueChange = lastMonth > 0
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    : 0

  const clientChange = lastMonthClients > 0
    ? Math.round(((thisMonthClients - lastMonthClients) / lastMonthClients) * 100)
    : 0

  return {
    totalClients,
    activeServices,
    pendingAmount,
    thisMonthRevenue: thisMonth,
    revenueChange,
    clientChange
  }
})
