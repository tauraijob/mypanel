import nodemailer from 'nodemailer'
import prisma from './prisma'

interface EmailOptions {
  to: string
  subject: string
  html: string
  type: string
  referenceType?: string
  referenceId?: number
}

export const getEmailTransporter = async () => {
  // Try to get settings from database first
  const settings = await prisma.settings.findFirst()

  const config = {
    host: settings?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: settings?.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: settings?.smtpUser || process.env.SMTP_USER,
      pass: settings?.smtpPass || process.env.SMTP_PASS
    }
  }

  return nodemailer.createTransport(config)
}

export const sendEmail = async (options: EmailOptions) => {
  const settings = await prisma.settings.findFirst()
  const from = settings?.smtpFrom || process.env.SMTP_FROM || 'MyPanel <noreply@mypanel.com>'

  try {
    const transporter = await getEmailTransporter()

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html
    })

    // Log email
    await prisma.emailLog.create({
      data: {
        recipient: options.to,
        subject: options.subject,
        body: options.html,
        type: options.type as any,
        status: 'sent',
        referenceType: options.referenceType,
        referenceId: options.referenceId
      }
    })

    return { success: true }
  } catch (error: any) {
    // Log failed email
    await prisma.emailLog.create({
      data: {
        recipient: options.to,
        subject: options.subject,
        body: options.html,
        type: options.type as any,
        status: 'failed',
        error: error.message,
        referenceType: options.referenceType,
        referenceId: options.referenceId
      }
    })

    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

// Email Templates
export const emailTemplates = {
  invoiceCreated: (data: { clientName: string; invoiceNumber: string; amount: string; dueDate: string; companyName: string; viewUrl?: string }) => ({
    subject: `Invoice ${data.invoiceNumber} from ${data.companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .amount { font-size: 32px; font-weight: bold; color: #0f172a; text-align: center; margin: 20px 0; }
          .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .btn:hover { background: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">${data.companyName}</h1>
            <p style="margin:10px 0 0;opacity:0.8;">Invoice Notification</p>
          </div>
          <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>A new invoice has been generated for your account.</p>
            <div class="amount">${data.amount}</div>
            <div class="details">
              <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
              <p><strong>Due Date:</strong> ${data.dueDate}</p>
            </div>
            ${data.viewUrl ? `
            <p style="text-align:center;">
              <a href="${data.viewUrl}" class="btn" style="color: white;">View Invoice Online</a>
            </p>
            <p style="text-align:center; margin-top: 15px; font-size: 12px; color: #64748b;">
              Or copy this link: <a href="${data.viewUrl}" style="color: #3b82f6;">${data.viewUrl}</a>
            </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>${data.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentReminder: (data: { clientName: string; invoiceNumber: string; amount: string; dueDate: string; daysUntilDue: number; companyName: string; viewUrl?: string }) => ({
    subject: `Payment Reminder: Invoice ${data.invoiceNumber} due in ${data.daysUntilDue} day(s)`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .amount { font-size: 32px; font-weight: bold; color: #0f172a; text-align: center; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">⏰ Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>This is a friendly reminder that your invoice is due soon.</p>
            <div class="warning">
              <strong>Invoice ${data.invoiceNumber}</strong> is due in <strong>${data.daysUntilDue} day(s)</strong> (${data.dueDate})
            </div>
            <div class="amount">${data.amount}</div>
            ${data.viewUrl ? `
            <p style="text-align:center;">
              <a href="${data.viewUrl}" class="btn" style="color: white;">View Invoice & Pay</a>
            </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>${data.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  invoiceOverdue: (data: { clientName: string; invoiceNumber: string; amount: string; dueDate: string; daysOverdue: number; companyName: string; viewUrl?: string }) => ({
    subject: `⚠️ OVERDUE: Invoice ${data.invoiceNumber} is ${data.daysOverdue} day(s) past due`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .amount { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
          .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .btn { display: inline-block; background: #dc2626; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">⚠️ Payment Overdue</h1>
          </div>
          <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>Your invoice is now <strong>${data.daysOverdue} day(s) past due</strong>. Please settle this payment as soon as possible to avoid service interruption.</p>
            <div class="alert">
              <strong>Invoice ${data.invoiceNumber}</strong> was due on ${data.dueDate}
            </div>
            <div class="amount">${data.amount}</div>
            ${data.viewUrl ? `
            <p style="text-align:center;">
              <a href="${data.viewUrl}" class="btn" style="color: white;">View Invoice & Pay Now</a>
            </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>If you have already made this payment, please disregard this notice.</p>
            <p>${data.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  serviceSuspended: (data: { clientName: string; serviceName: string; reason: string; companyName: string }) => ({
    subject: `Service Suspended: ${data.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">🚫 Service Suspended</h1>
          </div>
          <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>Your service has been suspended due to: <strong>${data.reason}</strong></p>
            <div class="alert">
              <strong>Service:</strong> ${data.serviceName}
            </div>
            <p>To restore your service, please settle any outstanding payments or contact support.</p>
            <p style="text-align:center;">
              <a href="#" class="btn">Contact Support</a>
            </p>
          </div>
          <div class="footer">
            <p>${data.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  serviceActivated: (data: { clientName: string; serviceName: string; companyName: string }) => ({
    subject: `Service Activated: ${data.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .success { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">✅ Service Activated</h1>
          </div>
          <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>Great news! Your service has been activated and is now ready to use.</p>
            <div class="success">
              <strong>Service:</strong> ${data.serviceName}
            </div>
            <p>Thank you for your business!</p>
          </div>
          <div class="footer">
            <p>${data.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  adminRenewalReminder: (data: { services: Array<{ clientName: string; serviceName: string; dueDate: string; amount: string }> }) => ({
    subject: `📅 Renewal Reminder: ${data.services.length} service(s) due soon`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">📅 Upcoming Renewals</h1>
            <p style="margin:10px 0 0;opacity:0.8;">${data.services.length} service(s) due soon</p>
          </div>
          <div class="content">
            <p>The following services are due for renewal:</p>
            <table>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Due Date</th>
                <th>Amount</th>
              </tr>
              ${data.services.map(s => `
                <tr>
                  <td>${s.clientName}</td>
                  <td>${s.serviceName}</td>
                  <td>${s.dueDate}</td>
                  <td>${s.amount}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          <div class="footer">
            <p>MyPanel - Client Management System</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  serviceTerminated: (data: { clientName: string; serviceName: string; companyName: string }) => ({
    subject: `Service Terminated: ${data.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #374151, #1f2937); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">❌ Service Terminated</h1>
          </div>
          <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>Your service has been terminated.</p>
            <div class="alert">
              <strong>Service:</strong> ${data.serviceName}
            </div>
            <p>If you believe this was done in error or would like to reactivate your service, please contact us.</p>
            <p>Thank you for your past business.</p>
          </div>
          <div class="footer">
            <p>${data.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  adminServiceStatusChange: (data: { action: string; serviceName: string; clientName: string; clientEmail: string; companyName: string; reason?: string }) => ({
    subject: `🔔 Service ${data.action}: ${data.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .details p { margin: 8px 0; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">🔔 Service ${data.action}</h1>
            <p style="margin:10px 0 0;opacity:0.8;">Admin Notification</p>
          </div>
          <div class="content">
            <p>A service status has been changed.</p>
            <div class="details">
              <p><strong>Action:</strong> ${data.action}</p>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Client:</strong> ${data.clientName}</p>
              <p><strong>Client Email:</strong> ${data.clientEmail}</p>
              ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            </div>
            <p>The client has been notified of this change.</p>
          </div>
          <div class="footer">
            <p>${data.companyName} - Admin Panel</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}


