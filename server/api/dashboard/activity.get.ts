import { format, formatDistanceToNow } from 'date-fns'

export default defineEventHandler(async () => {
  const now = new Date()

  // Get recent payments
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { paymentDate: 'desc' },
    include: {
      client: { select: { name: true } },
      invoice: { select: { invoiceNumber: true } }
    }
  })

  // Get recent invoices
  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true } }
    }
  })

  // Get recent clients
  const recentClients = await prisma.client.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  })

  // Get recent service status changes (suspended services)
  const suspendedServices = await prisma.service.findMany({
    where: { status: 'SUSPENDED' },
    take: 3,
    orderBy: { updatedAt: 'desc' },
    include: {
      client: { select: { name: true } }
    }
  })

  // Combine and sort all activities
  const activities: any[] = []

  // Add payment activities
  for (const payment of recentPayments) {
    activities.push({
      id: `payment-${payment.id}`,
      type: 'payment',
      message: `Payment of $${Number(payment.amount).toFixed(2)} received from ${payment.client.name}`,
      detail: `Invoice ${payment.invoice.invoiceNumber}`,
      time: payment.paymentDate,
      timeAgo: formatDistanceToNow(payment.paymentDate, { addSuffix: true }),
      icon: 'check-circle',
      color: 'emerald'
    })
  }

  // Add invoice activities
  for (const invoice of recentInvoices) {
    activities.push({
      id: `invoice-${invoice.id}`,
      type: 'invoice',
      message: `Invoice ${invoice.invoiceNumber} created for ${invoice.client.name}`,
      detail: `$${Number(invoice.total).toFixed(2)}`,
      time: invoice.createdAt,
      timeAgo: formatDistanceToNow(invoice.createdAt, { addSuffix: true }),
      icon: 'file-text',
      color: 'blue'
    })
  }

  // Add new client activities
  for (const client of recentClients) {
    activities.push({
      id: `client-${client.id}`,
      type: 'client',
      message: `New client "${client.name}" was added`,
      detail: client.company || client.email,
      time: client.createdAt,
      timeAgo: formatDistanceToNow(client.createdAt, { addSuffix: true }),
      icon: 'user-plus',
      color: 'cyan'
    })
  }

  // Add suspended service activities
  for (const service of suspendedServices) {
    activities.push({
      id: `service-${service.id}`,
      type: 'service',
      message: `Service "${service.name}" was suspended`,
      detail: service.client.name,
      time: service.updatedAt,
      timeAgo: formatDistanceToNow(service.updatedAt, { addSuffix: true }),
      icon: 'pause-circle',
      color: 'rose'
    })
  }

  // Sort by time descending and take top 10
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  
  return activities.slice(0, 10)
})

