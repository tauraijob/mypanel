export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)

  // Get user's organization
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { organizationId: true, role: true }
  })

  // Build where clause based on user role
  let whereClause: any = {}

  // Regular org admins only see their organization's emails
  // Emails with organizationId = null (e.g., welcome/verification emails) are only visible to super admin
  if (user?.role !== 'SUPER_ADMIN' && user?.organizationId) {
    whereClause.organizationId = user.organizationId
  }
  // Super admins (no organizationId) see all emails

  const logs = await prisma.emailLog.findMany({
    where: whereClause,
    orderBy: { sentAt: 'desc' },
    take: 100
  })

  return logs
})
