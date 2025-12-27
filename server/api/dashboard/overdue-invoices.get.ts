
import { differenceInDays } from 'date-fns'

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

  // First, update overdue invoices for this organization only
  await prisma.invoice.updateMany({
    where: {
      status: { in: ['SENT', 'PARTIALLY_PAID'] },
      dueDate: { lt: now },
      organizationId
    },
    data: { status: 'OVERDUE' }
  })

  // Get overdue invoices for this organization
  const invoices = await prisma.invoice.findMany({
    where: {
      status: 'OVERDUE',
      organizationId
    },
    include: {
      client: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { dueDate: 'asc' },
    take: 10
  })

  const overdueInvoices = invoices.map(invoice => ({
    id: invoice.id,
    number: invoice.invoiceNumber,
    client: invoice.client.name,
    clientEmail: invoice.client.email,
    amount: Number(invoice.total) - Number(invoice.amountPaid),
    dueDate: invoice.dueDate,
    daysOverdue: differenceInDays(now, invoice.dueDate)
  }))

  return overdueInvoices
})
