

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { name, description, color, icon } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Category name is required'
    })
  }

  const existing = await prisma.serviceCategory.findUnique({
    where: { name }
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'A category with this name already exists'
    })
  }

  const category = await prisma.serviceCategory.create({
    data: {
      name,
      description,
      color: color || '#3b82f6',
      icon: icon || 'server'
    }
  })

  return category
})


