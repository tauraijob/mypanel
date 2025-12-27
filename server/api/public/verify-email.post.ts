// Email verification endpoint
import { sendEmail, emailTemplates } from '../../utils/email'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { token } = body

    if (!token) {
        throw createError({
            statusCode: 400,
            message: 'Verification token is required'
        })
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
        where: {
            verificationToken: token,
            emailVerified: false
        },
        include: {
            organization: true
        }
    })

    if (!user) {
        throw createError({
            statusCode: 400,
            message: 'Invalid or expired verification token'
        })
    }

    // Check if token expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
        throw createError({
            statusCode: 400,
            message: 'Verification link has expired. Please request a new one.'
        })
    }

    // Mark email as verified
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
            verificationExpires: null
        }
    })

    // Set subscription start date now that email is verified
    if (user.organization) {
        await prisma.organization.update({
            where: { id: user.organization.id },
            data: {
                subscriptionStart: new Date(),
                subscriptionEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
            }
        })
    }

    // Send welcome email
    try {
        const baseUrl = process.env.APP_URL || 'http://localhost:3000'
        const emailData = emailTemplates.welcomeEmail({
            name: user.name,
            organizationName: user.organization?.name || 'Your Organization',
            loginUrl: `${baseUrl}/login`
        })

        await sendEmail({
            to: user.email,
            subject: emailData.subject,
            html: emailData.html,
            type: 'WELCOME'
        })
    } catch (error) {
        console.error('Failed to send welcome email:', error)
    }

    return {
        success: true,
        message: 'Email verified successfully! You can now log in.'
    }
})
