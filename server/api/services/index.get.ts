

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const status = query.status as string || ''
  const clientId = query.clientId ? parseInt(query.clientId as string) : undefined
  const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { domain: { contains: search } },
      { client: { name: { contains: search } } }
    ]
  }

  if (status) {
    where.status = status
  }

  if (clientId) {
    where.clientId = clientId
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        category: true
      },
      orderBy: { nextDueDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.service.count({ where })
  ])

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})


