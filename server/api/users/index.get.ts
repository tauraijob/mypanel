export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  // Get user's organization
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { organizationId: true, role: true }
  })

  // Must have an organization (unless super admin)
  if (!currentUser?.organizationId && currentUser?.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'No organization associated with your account'
    })
  }

  // Build where clause - org admins only see their org's users
  const whereClause: any = {}
  if (currentUser?.organizationId) {
    whereClause.organizationId = currentUser.organizationId
  }

  const users = await prisma.user.findMany({
    where: whereClause,
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
