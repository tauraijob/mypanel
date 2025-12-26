export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
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


