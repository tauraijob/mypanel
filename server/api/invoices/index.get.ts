

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const status = query.status as string || ''
  const clientId = query.clientId ? parseInt(query.clientId as string) : undefined

  const where: any = {}

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { client: { name: { contains: search } } },
      { client: { email: { contains: search } } }
    ]
  }

  if (status) {
    where.status = status
  }

  if (clientId) {
    where.clientId = clientId
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        items: true,
        _count: {
          select: { payments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.invoice.count({ where })
  ])

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})


