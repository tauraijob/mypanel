
import { differenceInDays } from 'date-fns'

export default defineEventHandler(async () => {
  const now = new Date()

  // First, update overdue invoices
  await prisma.invoice.updateMany({
    where: {
      status: { in: ['SENT', 'PARTIALLY_PAID'] },
      dueDate: { lt: now }
    },
    data: { status: 'OVERDUE' }
  })

  // Get overdue invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      status: 'OVERDUE'
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


