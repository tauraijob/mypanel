export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)

  // Get user's organization
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { organizationId: true, role: true }
  })

  // Must have an organization
  if (!user?.organizationId) {
    throw createError({
      statusCode: 403,
      message: 'No organization associated with your account'
    })
  }

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const clientId = query.clientId ? parseInt(query.clientId as string) : undefined
  const method = query.method as string || ''
  const search = query.search as string || ''

  // Filter by organization
  const where: any = {
    organizationId: user.organizationId
  }

  if (clientId) {
    where.clientId = clientId
  }

  if (method) {
    where.paymentMethod = method
  }

  if (search) {
    where.OR = [
      {
        client: {
          name: { contains: search }
        }
      },
      {
        invoice: {
          invoiceNumber: { contains: search }
        }
      },
      {
        reference: { contains: search }
      }
    ]
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        invoice: {
          select: { id: true, invoiceNumber: true, total: true }
        }
      },
      orderBy: { paymentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.payment.count({ where })
  ])

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
