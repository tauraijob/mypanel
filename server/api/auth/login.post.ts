export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
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
    role: user.role
  })

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
})


