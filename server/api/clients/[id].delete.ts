export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

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

  await prisma.client.delete({
    where: { id }
  })

  return { success: true, message: 'Client deleted successfully' }
})


