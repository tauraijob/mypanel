export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid service ID'
    })
  }

  const existing = await prisma.service.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Service not found'
    })
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      billingCycle: body.billingCycle,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      nextDueDate: body.nextDueDate ? new Date(body.nextDueDate) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      status: body.status,
      domain: body.domain,
      server: body.server,
      username: body.username,
      notes: body.notes,
      categoryId: body.categoryId
    },
    include: {
      client: true,
      category: true
    }
  })

  return service
})


