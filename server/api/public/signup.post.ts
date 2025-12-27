// Organization signup (public)
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail, emailTemplates } from '../../utils/email'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validate required fields
    if (!body.organizationName || !body.email || !body.password || !body.name) {
        throw createError({
            statusCode: 400,
            message: 'Organization name, admin name, email, and password are required'
        })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
    })

    if (existingUser) {
        throw createError({
            statusCode: 400,
            message: 'An account with this email already exists'
        })
    }

    // Generate slug
    const slug = body.organizationName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingOrg = await prisma.organization.findUnique({
        where: { slug }
    })

    if (existingOrg) {
        throw createError({
            statusCode: 400,
            message: 'An organization with this name already exists'
        })
    }

    // Get selected plan
    let planId = null
    if (body.planId) {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: parseInt(body.planId) }
        })
        if (plan) {
            planId = plan.id
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create organization
    const org = await prisma.organization.create({
        data: {
            name: body.organizationName,
            slug,
            email: body.email,
            phone: body.phone || null,
            planId,
            subscriptionStatus: 'TRIAL',
            billingCycle: body.billingCycle || 'MONTHLY',
            isActive: true
        }
    })

    // Create admin user for this organization (not verified yet)
    const user = await prisma.user.create({
        data: {
            email: body.email,
            password: hashedPassword,
            name: body.name,
            phone: body.phone || null,
            role: 'ADMIN',
            isActive: true,
            emailVerified: false,
            verificationToken,
            verificationExpires,
            organizationId: org.id
        }
    })

    // Create default settings for the organization
    await prisma.settings.create({
        data: {
            organizationId: org.id,
            companyName: body.organizationName,
            companyEmail: body.email,
            currency: 'USD',
            currencySymbol: '$',
            invoicePrefix: 'INV-',
            quotePrefix: 'QUO-'
        }
    })

    // Create default service categories
    const defaultCategories = [
        { name: 'Web Hosting', color: '#3b82f6', icon: 'server' },
        { name: 'Web Development', color: '#8b5cf6', icon: 'globe' },
        { name: 'Consulting', color: '#10b981', icon: 'message-circle' }
    ]

    for (const cat of defaultCategories) {
        await prisma.serviceCategory.create({
            data: {
                ...cat,
                organizationId: org.id
            }
        })
    }

    // Send verification email
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    try {
        const emailData = emailTemplates.emailVerification({
            name: body.name,
            verifyUrl
        })

        await sendEmail({
            to: body.email,
            subject: emailData.subject,
            html: emailData.html,
            type: 'WELCOME'
        })
    } catch (error) {
        console.error('Failed to send verification email:', error)
        // Don't fail signup if email fails - user can request resend
    }

    return {
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        organizationId: org.id,
        userId: user.id
    }
})
