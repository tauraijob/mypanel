export default defineEventHandler(async (event) => {
  // Only admins can list users
  const auth = await requireAuth(event)
  
  if (auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Access denied. Admin privileges required.'
    })
  }

  const users = await prisma.user.findMany({
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
      // password excluded for security
    },
    orderBy: { createdAt: 'desc' }
  })

  return users
})

