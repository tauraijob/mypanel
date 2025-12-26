export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid quotation ID'
    })
  }

  const existing = await prisma.quotation.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Quotation not found'
    })
  }

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      status: body.status,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      notes: body.notes,
      terms: body.terms
    },
    include: {
      client: true,
      items: true
    }
  })

  return quotation
})

