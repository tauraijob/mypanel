export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid invoice ID'
    })
  }

  const existing = await prisma.invoice.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      notes: body.notes,
      terms: body.terms
    },
    include: {
      client: true,
      items: true
    }
  })

  return invoice
})

