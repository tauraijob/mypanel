export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)

  // Get user's organization
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { organizationId: true, role: true }
  })

  // Must have an organization
  if (!user?.organizationId) {
    throw createError({
      statusCode: 403,
      message: 'No organization associated with your account'
    })
  }

  const categories = await prisma.serviceCategory.findMany({
    where: {
      organizationId: user.organizationId
    },
    include: {
      _count: {
        select: { services: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return categories
})
