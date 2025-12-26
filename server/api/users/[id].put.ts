import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid user ID'
    })
  }

  // Users can edit their own profile (limited), admins can edit anyone
  const isOwnProfile = auth.userId === id
  const isAdmin = auth.role === 'ADMIN'

  if (!isAdmin && !isOwnProfile) {
    throw createError({
      statusCode: 403,
      message: 'Access denied'
    })
  }

  const body = await readBody(event)
  const { email, password, name, phone, role, isActive } = body

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  // Check if email is being changed and if it conflicts
  if (email && email !== existing.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    })
    if (emailExists) {
      throw createError({
        statusCode: 400,
        message: 'A user with this email already exists'
      })
    }
  }

  // Build update data
  const updateData: any = {}
  
  // Fields anyone can update on their own profile
  if (name) updateData.name = name
  if (phone !== undefined) updateData.phone = phone
  if (email) updateData.email = email
  
  // Password update
  if (password) {
    updateData.password = await bcrypt.hash(password, 10)
  }
  
  // Admin-only fields
  if (isAdmin) {
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  })

  return user
})

