export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          subscriptionStatus: true,
          plan: {
            select: {
              name: true,
              maxClients: true,
              maxUsers: true,
              maxServices: true
            }
          }
        }
      }
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
