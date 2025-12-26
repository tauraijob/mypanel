export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid client ID'
    })
  }

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      services: {
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' }
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 10
      },
      quotations: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!client) {
    throw createError({
      statusCode: 404,
      message: 'Client not found'
    })
  }

  return client
})


