export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const status = query.status as string || ''

  // Get user's organization
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { organizationId: true, role: true }
  })

  // Super admin without org context - error
  if (user?.role === 'SUPER_ADMIN' && !query.orgId) {
    throw createError({
      statusCode: 400,
      message: 'Super admin must specify orgId'
    })
  }

  // Non super-admin must have an organization
  if (user?.role !== 'SUPER_ADMIN' && !user?.organizationId) {
    throw createError({
      statusCode: 403,
      message: 'No organization associated with your account'
    })
  }

  const organizationId = user?.role === 'SUPER_ADMIN'
    ? parseInt(query.orgId as string)
    : user?.organizationId

  const where: any = { organizationId }

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
