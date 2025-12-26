import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  // Only admins can create users
  const auth = await requireAuth(event)
  
  if (auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Access denied. Admin privileges required.'
    })
  }

  const body = await readBody(event)
  const { email, password, name, phone, role } = body

  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      message: 'Email, password, and name are required'
    })
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'A user with this email already exists'
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      role: role || 'SALES',
      isActive: true
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  return user
})

