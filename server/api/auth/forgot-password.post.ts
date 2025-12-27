// Request password reset - sends email with reset link
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email } = body

    if (!email) {
        throw createError({
            statusCode: 400,
            message: 'Email is required'
        })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { organization: true }
    })

    // Always return success to prevent email enumeration
    if (!user) {
        return {
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
        }
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save token to database
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires
        }
    })

    // Get app URL
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`

    // Send reset email
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #2563eb, #0891b2); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #0891b2); color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .warning { background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e; font-size: 14px; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔐 Password Reset</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">MyPanel</p>
        </div>
        <div class="content">
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password for your MyPanel account.</p>
          
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset My Password</a>
          </p>
          
          <div class="warning">
            <strong>⏰ This link expires in 1 hour.</strong><br>
            If you didn't request this, you can safely ignore this email.
          </div>
          
          <p style="font-size: 14px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <code style="word-break: break-all;">${resetLink}</code>
          </p>
        </div>
        <div class="footer">
          <p>This email was sent because a password reset was requested for your account.</p>
          <p>© ${new Date().getFullYear()} MyPanel. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

    await sendEmail({
        to: user.email,
        subject: '🔐 Reset Your Password - MyPanel',
        html: emailHtml,
        type: 'PASSWORD_RESET',
        organizationId: user.organizationId || undefined
    })

    return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
    }
})
