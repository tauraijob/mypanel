// Resend verification email
import crypto from 'crypto'
import { sendEmail, emailTemplates } from '../../utils/email'
import { getAppUrl } from '../../utils/config'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email } = body

    if (!email) {
        throw createError({
            statusCode: 400,
            message: 'Email is required'
        })
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        // Don't reveal if email exists
        return {
            success: true,
            message: 'If an account exists, a verification email has been sent.'
        }
    }

    if (user.emailVerified) {
        throw createError({
            statusCode: 400,
            message: 'Email is already verified. You can log in.'
        })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationToken,
            verificationExpires
        }
    })

    // Send verification email
    const baseUrl = getAppUrl()
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    try {
        const emailData = emailTemplates.emailVerification({
            name: user.name,
            verifyUrl
        })

        await sendEmail({
            to: user.email,
            subject: emailData.subject,
            html: emailData.html,
            type: 'VERIFICATION'
        })
    } catch (error) {
        console.error('Failed to send verification email:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to send verification email. Please try again.'
        })
    }

    return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
    }
})
