export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid client ID'
    })
  }

  // Get user's organization
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { organizationId: true, role: true }
  })

  if (!user?.organizationId && user?.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'No organization associated with your account'
    })
  }

  const organizationId = user.organizationId!

  const existing = await prisma.client.findUnique({
    where: {
      id,
      organizationId // Ensure security
    }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Client not found'
    })
  }

  // Check email uniqueness if changed within this organization
  if (body.email && body.email !== existing.email) {
    const emailExists = await prisma.client.findFirst({
      where: {
        email: body.email,
        organizationId
      }
    })
    if (emailExists) {
      throw createError({
        statusCode: 400,
        message: 'A client with this email already exists'
      })
    }
  }

  const client = await prisma.client.update({
    where: {
      id,
      organizationId
    },
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


