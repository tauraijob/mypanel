export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid invoice ID'
    })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      items: {
        include: {
          service: true
        }
      },
      payments: {
        orderBy: { paymentDate: 'desc' }
      }
    }
  })

  if (!invoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  // Get settings for invoice template
  const settings = await prisma.settings.findFirst()

  return { invoice, settings }
})


