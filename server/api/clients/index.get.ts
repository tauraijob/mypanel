

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const status = query.status as string || ''

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { company: { contains: search } }
    ]
  }

  if (status) {
    where.status = status
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        _count: {
          select: {
            services: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.client.count({ where })
  ])

  return {
    clients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})


