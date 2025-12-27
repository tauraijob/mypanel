export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)
  const body = await readBody(event)

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

  const {
    name,
    email,
    phone,
    company,
    billingAddress,
    billingCity,
    billingState,
    billingZip,
    billingCountry,
    serviceAddress,
    serviceCity,
    serviceState,
    serviceZip,
    serviceCountry,
    notes
  } = body

  if (!name || !email) {
    throw createError({
      statusCode: 400,
      message: 'Name and email are required'
    })
  }

  // Check if email exists within this organization
  const existing = await prisma.client.findFirst({
    where: { email, organizationId }
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'A client with this email already exists'
    })
  }

  const client = await prisma.client.create({
    data: {
      organizationId,
      name,
      email,
      phone,
      company,
      billingAddress,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
      serviceAddress,
      serviceCity,
      serviceState,
      serviceZip,
      serviceCountry,
      notes
    }
  })

  return client
})
