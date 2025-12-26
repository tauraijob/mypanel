export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid client ID'
    })
  }

  const existing = await prisma.client.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Client not found'
    })
  }

  // Check email uniqueness if changed
  if (body.email && body.email !== existing.email) {
    const emailExists = await prisma.client.findUnique({
      where: { email: body.email }
    })
    if (emailExists) {
      throw createError({
        statusCode: 400,
        message: 'A client with this email already exists'
      })
    }
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      billingAddress: body.billingAddress,
      billingCity: body.billingCity,
      billingState: body.billingState,
      billingZip: body.billingZip,
      billingCountry: body.billingCountry,
      serviceAddress: body.serviceAddress,
      serviceCity: body.serviceCity,
      serviceState: body.serviceState,
      serviceZip: body.serviceZip,
      serviceCountry: body.serviceCountry,
      notes: body.notes,
      status: body.status
    }
  })

  return client
})


