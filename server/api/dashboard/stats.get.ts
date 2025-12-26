
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export default defineEventHandler(async () => {
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Get counts
  const [
    totalClients,
    activeServices,
    pendingInvoices,
    thisMonthRevenue,
    lastMonthRevenue,
    thisMonthClients,
    lastMonthClients
  ] = await Promise.all([
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.service.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.findMany({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] }
      },
      select: { total: true, amountPaid: true }
    }),
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: thisMonthStart, lte: thisMonthEnd }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: lastMonthStart, lte: lastMonthEnd }
      },
      _sum: { amount: true }
    }),
    prisma.client.count({
      where: { createdAt: { gte: thisMonthStart, lte: thisMonthEnd } }
    }),
    prisma.client.count({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
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


