export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid payment ID'
    })
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          client: true,
          items: true
        }
      }
    }
  })

  if (!payment) {
    throw createError({
      statusCode: 404,
      message: 'Payment not found'
    })
  }

  const settings = await prisma.settings.findFirst()

  return { payment, settings }
})

