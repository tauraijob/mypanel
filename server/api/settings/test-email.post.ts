import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { testEmail } = body

  // Get settings from database
  const settings = await prisma.settings.findFirst()

  if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPass) {
    throw createError({
      statusCode: 400,
      message: 'SMTP settings are not configured. Please fill in SMTP Host, Username, and Password.'
    })
  }

  // Create transporter with settings
  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort || 587,
    secure: settings.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass
    }
  })

  const fromAddress = settings.smtpFrom || `${settings.companyName || 'MyPanel'} <${settings.smtpUser}>`
  const recipientEmail = testEmail || settings.companyEmail || settings.smtpUser

  try {
    // Verify connection first
    await transporter.verify()

    // Send test email
    await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject: `✅ Test Email from ${settings.companyName || 'MyPanel'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
            .success-badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; color: #64748b; font-size: 12px; }
            .info-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
            .info-row:last-child { border-bottom: none; }
            .label { color: #64748b; }
            .value { color: #1e293b; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Email Configuration Successful!</h1>
            </div>
            <div class="content">
              <p style="text-align: center;">
                <span class="success-badge">✓ Connection Verified</span>
              </p>
              
              <p>Great news! Your SMTP configuration is working correctly. This test email confirms that your email settings are properly configured.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1e293b;">Configuration Details</h3>
                <div class="info-row">
                  <span class="label">SMTP Host:</span>
                  <span class="value">${settings.smtpHost}</span>
                </div>
                <div class="info-row">
                  <span class="label">SMTP Port:</span>
                  <span class="value">${settings.smtpPort || 587}</span>
                </div>
                <div class="info-row">
                  <span class="label">Username:</span>
                  <span class="value">${settings.smtpUser}</span>
                </div>
                <div class="info-row">
                  <span class="label">From Address:</span>
                  <span class="value">${fromAddress}</span>
                </div>
              </div>
              
              <p>You can now send:</p>
              <ul>
                <li>Invoice notifications</li>
                <li>Payment confirmations</li>
                <li>Quotation emails</li>
                <li>Service status updates</li>
                <li>Automated reminders</li>
              </ul>
            </div>
            <div class="footer">
              <p>This test email was sent from ${settings.companyName || 'MyPanel'}</p>
              <p>Sent at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    // Log the test email
    await prisma.emailLog.create({
      data: {
        recipient: recipientEmail,
        subject: `✅ Test Email from ${settings.companyName || 'MyPanel'}`,
        body: 'Test email to verify SMTP configuration',
        type: 'CUSTOM',
        status: 'sent'
      }
    })

    return { 
      success: true, 
      message: `Test email sent successfully to ${recipientEmail}`,
      recipient: recipientEmail
    }
  } catch (error: any) {
    // Log the failed attempt
    await prisma.emailLog.create({
      data: {
        recipient: recipientEmail,
        subject: `Test Email from ${settings.companyName || 'MyPanel'}`,
        body: 'Test email to verify SMTP configuration',
        type: 'CUSTOM',
        status: 'failed',
        error: error.message
      }
    })

    throw createError({
      statusCode: 500,
      message: `Failed to send email: ${error.message}`
    })
  }
})

