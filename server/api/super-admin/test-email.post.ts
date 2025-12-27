// Send test email to verify SMTP configuration
import { getEmailTransporter } from '../../utils/email'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
    const ctx = await requireSuperAdmin(event)
    const body = await readBody(event).catch(() => ({}))

    // Get super admin's email to send test to
    const user = await prisma.user.findUnique({
        where: { id: ctx.userId }
    })

    if (!user) {
        throw createError({
            statusCode: 404,
            message: 'User not found'
        })
    }

    // Construct override config if provided in body
    let transporter
    const smtpHost = body.smtpHost
    const smtpUser = body.smtpUser
    const smtpPass = body.smtpPass

    if (smtpHost) {
        const config: any = {
            host: smtpHost,
            port: body.smtpPort ? parseInt(body.smtpPort) : 587,
            secure: body.smtpSecure || false
        }

        if (smtpUser && smtpPass) {
            config.auth = { user: smtpUser, pass: smtpPass }
        }

        transporter = nodemailer.createTransport(config)
    } else {
        // Use saved settings
        transporter = await getEmailTransporter()
    }

    try {
        await transporter.sendMail({
            from: body.smtpFrom || 'MyPanel Test <noreply@mypanel.com>',
            to: user.email,
            subject: '🧪 MyPanel SMTP Test Email',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0; }
                        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 30px; }
                        h1 { color: #3b82f6; }
                        .success { background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; display: inline-block; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✅ SMTP Configuration Working!</h1>
                        <p>This test email confirms that your SMTP settings are configured correctly.</p>
                        <p class="success">Email delivery is working</p>
                        <p style="margin-top: 20px; color: #94a3b8;">
                            <strong>Configuration Details:</strong><br>
                            Sent at: ${new Date().toLocaleString()}<br>
                            Recipient: ${user.email}<br>
                            Source: ${smtpHost ? 'Form Settings' : 'Saved Settings'}
                        </p>
                    </div>
                </body>
                </html>
            `
        })

        return {
            success: true,
            message: `Test email sent to ${user.email}!`
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: `Failed to send email: ${error.message}`
        })
    }
})

