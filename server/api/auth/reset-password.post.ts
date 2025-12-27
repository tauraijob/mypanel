// Reset password using token
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { token, password } = body

    if (!token || !password) {
        throw createError({
            statusCode: 400,
            message: 'Token and password are required'
        })
    }

    if (password.length < 8) {
        throw createError({
            statusCode: 400,
            message: 'Password must be at least 8 characters'
        })
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: {
                gt: new Date()
            }
        }
    })

    if (!user) {
        throw createError({
            statusCode: 400,
            message: 'Invalid or expired reset token. Please request a new password reset.'
        })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null
        }
    })

    return {
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.'
    }
})
