export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid service ID'
    })
  }

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      client: true,
      category: true,
      invoiceItems: {
        include: {
          invoice: true
        }
      }
    }
  })

  if (!service) {
    throw createError({
      statusCode: 404,
      message: 'Service not found'
    })
  }

  return service
})


