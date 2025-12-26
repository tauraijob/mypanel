export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid user ID'
    })
  }

  // Only admins can delete users
  if (auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Access denied. Admin privileges required.'
    })
  }

  // Prevent self-deletion
  if (auth.userId === id) {
    throw createError({
      statusCode: 400,
      message: 'You cannot delete your own account'
    })
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  await prisma.user.delete({
    where: { id }
  })

  return { success: true, message: 'User deleted successfully' }
})

