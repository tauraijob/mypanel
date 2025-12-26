export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid quotation ID'
    })
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      client: true,
      items: true
    }
  })

  if (!quotation) {
    throw createError({
      statusCode: 404,
      message: 'Quotation not found'
    })
  }

  // Get settings for template
  const settings = await prisma.settings.findFirst()

  return { quotation, settings }
})

