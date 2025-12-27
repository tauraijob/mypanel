export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }

  // Find user with organization
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          subscriptionStatus: true
        }
      }
    }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      message: 'Your account has been deactivated. Please contact an administrator.'
    })
  }

  // Check if organization is active (for non-super admins)
  if (user.role !== 'SUPER_ADMIN' && user.organization) {
    if (!user.organization.isActive) {
      throw createError({
        statusCode: 403,
        message: 'Your organization has been suspended. Please contact support.'
      })
    }
    if (user.organization.subscriptionStatus === 'EXPIRED' || user.organization.subscriptionStatus === 'CANCELLED') {
      throw createError({
        statusCode: 403,
        message: 'Your subscription has expired. Please renew to continue using the service.'
      })
    }
  }

  // Check if email is verified (for non-super admins)
  if (user.role !== 'SUPER_ADMIN' && !user.emailVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email before logging in. Check your inbox for the verification link.'
    })
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  })

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId
  })

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization
    }
  }
})
