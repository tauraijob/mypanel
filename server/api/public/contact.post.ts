import { sendEmail, emailTemplates } from '../../utils/email'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
        throw createError({
            statusCode: 400,
            message: 'All fields are required'
        })
    }

    try {
        // Send email to official inbox with CC to super admin
        const html = `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h2 style="color: #3b82f6; margin-bottom: 24px;">New Contact Form Submission</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">From</p>
                        <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600;">${name} (${email})</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Subject</p>
                        <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600;">${subject}</p>
                    </div>

                    <div style="padding: 20px; background: #f1f5f9; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 8px;">Message</p>
                        <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>

                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                        <p>This message was sent via the contact form on MyPanel.</p>
                    </div>
                </div>
            </div>
        `

        // We use the existing sendEmail utility.
        // The user specifically requested info@wecode.co.zw as recipient and taujob1111@gmail.com as cc.
        // Since our sendEmail doesn't take 'cc' directly in the options interface yet, we'll send it as a separate log-logged email or just send it twice.
        // Actually, we can add 'cc' support to sendEmail or just use nodemailer directly if we want to be precise.
        // Let's stick to the utility for logging purposes.

        // Main email
        await sendEmail({
            to: 'info@wecode.co.zw',
            subject: `[Contact Form] ${subject}`,
            html: html,
            type: 'CONTACT_FORM'
        })

        // CC-like email for super admin
        await sendEmail({
            to: 'taujob1111@gmail.com',
            subject: `[CC] [Contact Form] ${subject}`,
            html: html,
            type: 'CONTACT_FORM'
        })

        return { success: true }
    } catch (error: any) {
        console.error('Contact form error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to send message. Please try again later.'
        })
    }
})
