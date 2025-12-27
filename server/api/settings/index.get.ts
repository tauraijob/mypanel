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

  // Get organization-specific settings
  let settings = await prisma.settings.findFirst({
    where: { organizationId: user.organizationId }
  })

  // Create default settings for this organization if none exist
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        companyName: 'My Company',
        currency: 'USD',
        currencySymbol: '$',
        invoicePrefix: 'INV-',
        quotePrefix: 'QUO-',
        organizationId: user.organizationId
      }
    })
  }

  return settings
})
