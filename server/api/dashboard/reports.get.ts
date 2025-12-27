import { startOfDay, subDays, subMonths, subYears, format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns'

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
  const query = getQuery(event)
  const period = (query.period as string) || 'month' // week, month, year

  const now = new Date()
  let startDate: Date
  let labels: string[] = []
  let groupBy: 'day' | 'week' | 'month' = 'day'

  // Determine date range based on period
  switch (period) {
    case 'week':
      startDate = subDays(now, 7)
      groupBy = 'day'
      labels = eachDayOfInterval({ start: startDate, end: now }).map(d => format(d, 'EEE'))
      break
    case 'year':
      startDate = subYears(now, 1)
      groupBy = 'month'
      labels = eachMonthOfInterval({ start: startDate, end: now }).map(d => format(d, 'MMM'))
      break
    case 'month':
    default:
      startDate = subMonths(now, 1)
      groupBy = 'day'
      labels = eachDayOfInterval({ start: startDate, end: now }).map(d => format(d, 'dd'))
      break
  }

  // Get all payments in the period for this organization
  const payments = await prisma.payment.findMany({
    where: {
      paymentDate: { gte: startDate, lte: now },
      invoice: { organizationId }
    },
    select: {
      amount: true,
      paymentDate: true,
      paymentMethod: true
    },
    orderBy: { paymentDate: 'asc' }
  })

  // Get all invoices created in the period for this organization
  const invoices = await prisma.invoice.findMany({
    where: {
      issueDate: { gte: startDate, lte: now },
      organizationId
    },
    select: {
      total: true,
      status: true,
      issueDate: true
    },
    orderBy: { issueDate: 'asc' }
  })

  // Group payments by period
  const revenueData: number[] = new Array(labels.length).fill(0)
  const invoiceData: number[] = new Array(labels.length).fill(0)

  for (const payment of payments) {
    let index: number
    const date = new Date(payment.paymentDate)

    switch (groupBy) {
      case 'day':
        index = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        break
      case 'week':
        index = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
        break
      case 'month':
        index = (date.getFullYear() - startDate.getFullYear()) * 12 + date.getMonth() - startDate.getMonth()
        break
    }

    if (index >= 0 && index < revenueData.length) {
      revenueData[index] += Number(payment.amount)
    }
  }

  for (const invoice of invoices) {
    let index: number
    const date = new Date(invoice.issueDate)

    switch (groupBy) {
      case 'day':
        index = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        break
      case 'week':
        index = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
        break
      case 'month':
        index = (date.getFullYear() - startDate.getFullYear()) * 12 + date.getMonth() - startDate.getMonth()
        break
    }

    if (index >= 0 && index < invoiceData.length) {
      invoiceData[index] += Number(invoice.total)
    }
  }

  // Calculate summary stats
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total), 0)
  const paidInvoices = invoices.filter(i => i.status === 'PAID').length
  const pendingInvoices = invoices.filter(i => ['SENT', 'PARTIALLY_PAID'].includes(i.status)).length
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE').length

  // Payment methods breakdown
  const paymentMethods: Record<string, number> = {}
  for (const payment of payments) {
    const method = payment.paymentMethod
    paymentMethods[method] = (paymentMethods[method] || 0) + Number(payment.amount)
  }

  // Invoice status breakdown
  const invoiceStatusCounts = {
    paid: paidInvoices,
    pending: pendingInvoices,
    overdue: overdueInvoices
  }

  return {
    labels,
    revenueData,
    invoiceData,
    summary: {
      totalRevenue,
      totalInvoiced,
      collectionRate: totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0,
      invoiceCount: invoices.length,
      paymentCount: payments.length
    },
    paymentMethods,
    invoiceStatus: invoiceStatusCounts
  }
})
