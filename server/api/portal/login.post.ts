import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            message: 'Email and password are required'
        })
    }

    // Find client
    const client = await prisma.client.findFirst({
        where: {
            email,
            status: 'ACTIVE' // Only active clients
        },
        include: {
            organization: true
        }
    })

    if (!client || !client.password) {
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials'
        })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, client.password)
    if (!isValid) {
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials'
        })
    }

    if (!client.organization.isActive) {
        throw createError({
            statusCode: 403,
            message: 'Organization is inactive'
        })
    }

    // Update last login
    await prisma.client.update({
        where: { id: client.id },
        data: { lastLogin: new Date() }
    })

    // Generate JWT
    const config = useRuntimeConfig()
    const token = jwt.sign(
        {
            id: client.id,
            email: client.email,
            role: 'CLIENT',
            organizationId: client.organizationId,
            name: client.name
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    )

    return {
        token,
        user: {
            id: client.id,
            email: client.email,
            name: client.name,
            organizationName: client.organization.name
        }
    }
})
