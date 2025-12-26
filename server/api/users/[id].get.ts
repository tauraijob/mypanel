export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid user ID'
    })
  }

  // Users can view their own profile, admins can view anyone
  if (auth.role !== 'ADMIN' && auth.userId !== id) {
    throw createError({
      statusCode: 403,
      message: 'Access denied'
    })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  return user
})

