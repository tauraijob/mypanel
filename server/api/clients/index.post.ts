

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

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

  // Check if email exists
  const existing = await prisma.client.findUnique({
    where: { email }
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'A client with this email already exists'
    })
  }

  const client = await prisma.client.create({
    data: {
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


