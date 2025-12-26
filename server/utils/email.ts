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

// Navy Blue Glassmorphism Email Base Styles
const baseStyles = `
  body { 
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif; 
    margin: 0; 
    padding: 0;
    background: linear-gradient(135deg, #0a1929 0%, #102a43 50%, #0f172a 100%);
    min-height: 100vh;
  }
  .wrapper {
    padding: 40px 20px;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
    border-radius: 20px; 
    overflow: hidden; 
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .header { 
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white; 
    padding: 35px 30px; 
    text-align: center; 
  }
  .header-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    border-radius: 16px;
    margin: 0 auto 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
  }
  .header h1 { 
    margin: 0; 
    font-size: 24px; 
    font-weight: 700;
    color: #ffffff;
  }
  .header-subtitle { 
    margin: 8px 0 0; 
    opacity: 0.7; 
    font-size: 14px;
    color: #94a3b8;
  }
  .content { 
    padding: 35px 30px; 
    color: #cbd5e1;
    line-height: 1.7;
  }
  .content p { margin: 0 0 16px; }
  .content strong { color: #ffffff; }
  .amount-box { 
    text-align: center; 
    margin: 25px 0;
    padding: 25px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
    border-radius: 16px;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }
  .amount { 
    font-size: 42px; 
    font-weight: 700; 
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .amount-label {
    font-size: 13px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 5px;
  }
  .details { 
    background: rgba(255, 255, 255, 0.03); 
    padding: 20px 24px; 
    border-radius: 12px; 
    margin: 25px 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .details-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .details-row:last-child { border-bottom: none; }
  .details-label { color: #64748b; font-size: 14px; }
  .details-value { color: #ffffff; font-weight: 600; font-size: 14px; }
  .btn { 
    display: inline-block; 
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    color: white !important; 
    padding: 16px 40px; 
    border-radius: 12px; 
    text-decoration: none; 
    font-weight: 600;
    font-size: 15px;
    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
    transition: all 0.3s ease;
  }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 50px rgba(59, 130, 246, 0.4); }
  .btn-center { text-align: center; margin: 30px 0; }
  .alert-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%);
    border-left: 4px solid #f59e0b;
    padding: 16px 20px;
    border-radius: 0 12px 12px 0;
    margin: 25px 0;
    color: #fbbf24;
  }
  .alert-danger {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%);
    border-left: 4px solid #ef4444;
    padding: 16px 20px;
    border-radius: 0 12px 12px 0;
    margin: 25px 0;
    color: #fca5a5;
  }
  .alert-success {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
    border-left: 4px solid #10b981;
    padding: 16px 20px;
    border-radius: 0 12px 12px 0;
    margin: 25px 0;
    color: #6ee7b7;
  }
  .footer { 
    text-align: center; 
    padding: 25px 30px; 
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  .footer p { margin: 0; color: #475569; font-size: 13px; }
  .footer .company { color: #64748b; font-weight: 600; margin-top: 5px !important; }
  .link { color: #3b82f6; text-decoration: none; }
  .link:hover { text-decoration: underline; }
  .small-text { font-size: 12px; color: #64748b; margin-top: 15px !important; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: rgba(255, 255, 255, 0.05); padding: 14px; text-align: left; font-weight: 600; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #cbd5e1; }
  tr:hover td { background: rgba(255, 255, 255, 0.02); }
`

// Helper to create email wrapper
const emailWrapper = (content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${baseStyles}</style>
  </head>
  <body>
    <div class="wrapper">
      ${content}
    </div>
  </body>
  </html>
`

// Email Templates
export const emailTemplates = {
  invoiceCreated: (data: { clientName: string; invoiceNumber: string; amount: string; dueDate: string; companyName: string; viewUrl?: string }) => ({
    subject: `Invoice ${data.invoiceNumber} from ${data.companyName}`,
    html: emailWrapper(`
      <div class="container">
        <div class="header">
          <div class="header-icon">📄</div>
          <h1>${data.companyName}</h1>
          <p class="header-subtitle">New Invoice</p>
        </div>
        <div class="content">
          <p>Hi <strong>${data.clientName}</strong>,</p>
          <p>A new invoice has been generated for your account. Please review the details below.</p>
          
          <div class="amount-box">
            <div class="amount">${data.amount}</div>
            <div class="amount-label">Amount Due</div>
          </div>
          
          <div class="details">
            <div class="details-row">
              <span class="details-label">Invoice Number</span>
              <span class="details-value">${data.invoiceNumber}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Due Date</span>
              <span class="details-value">${data.dueDate}</span>
            </div>
          </div>
          
          ${data.viewUrl ? `
          <div class="btn-center">
            <a href="${data.viewUrl}" class="btn">View Invoice Online</a>
          </div>
          <p class="small-text" style="text-align: center;">
            Or copy this link: <a href="${data.viewUrl}" class="link">${data.viewUrl}</a>
          </p>
          ` : ''}
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p class="company">${data.companyName}</p>
        </div>
      </div>
    `)
  }),

  paymentReminder: (data: { clientName: string; invoiceNumber: string; amount: string; dueDate: string; daysUntilDue: number; companyName: string; viewUrl?: string }) => ({
    subject: `Payment Reminder: Invoice ${data.invoiceNumber} due in ${data.daysUntilDue} day(s)`,
    html: emailWrapper(`
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%);">
          <div class="header-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">⏰</div>
          <h1>Payment Reminder</h1>
          <p class="header-subtitle">Invoice due soon</p>
        </div>
        <div class="content">
          <p>Hi <strong>${data.clientName}</strong>,</p>
          <p>This is a friendly reminder that your invoice is due soon.</p>
          
          <div class="alert-warning">
            <strong>Invoice ${data.invoiceNumber}</strong> is due in <strong>${data.daysUntilDue} day(s)</strong> on ${data.dueDate}
          </div>
          
          <div class="amount-box">
            <div class="amount">${data.amount}</div>
            <div class="amount-label">Amount Due</div>
          </div>
          
          ${data.viewUrl ? `
          <div class="btn-center">
            <a href="${data.viewUrl}" class="btn" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">View Invoice & Pay</a>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>Thank you for your prompt attention!</p>
          <p class="company">${data.companyName}</p>
        </div>
      </div>
    `)
  }),

  invoiceOverdue: (data: { clientName: string; invoiceNumber: string; amount: string; dueDate: string; daysOverdue: number; companyName: string; viewUrl?: string }) => ({
    subject: `⚠️ OVERDUE: Invoice ${data.invoiceNumber} is ${data.daysOverdue} day(s) past due`,
    html: emailWrapper(`
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%);">
          <div class="header-icon" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">⚠️</div>
          <h1>Payment Overdue</h1>
          <p class="header-subtitle">Immediate attention required</p>
        </div>
        <div class="content">
          <p>Hi <strong>${data.clientName}</strong>,</p>
          <p>Your invoice is now <strong>${data.daysOverdue} day(s) past due</strong>. Please settle this payment as soon as possible to avoid service interruption.</p>
          
          <div class="alert-danger">
            <strong>Invoice ${data.invoiceNumber}</strong> was due on ${data.dueDate}
          </div>
          
          <div class="amount-box" style="border-color: rgba(239, 68, 68, 0.3);">
            <div class="amount" style="background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); -webkit-background-clip: text; background-clip: text;">${data.amount}</div>
            <div class="amount-label">Total Outstanding</div>
          </div>
          
          ${data.viewUrl ? `
          <div class="btn-center">
            <a href="${data.viewUrl}" class="btn" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">Pay Now</a>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>If you have already made this payment, please disregard this notice.</p>
          <p class="company">${data.companyName}</p>
        </div>
      </div>
    `)
  }),

  serviceSuspended: (data: { clientName: string; serviceName: string; reason: string; companyName: string }) => ({
    subject: `Service Suspended: ${data.serviceName}`,
    html: emailWrapper(`
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%);">
          <div class="header-icon" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">🚫</div>
          <h1>Service Suspended</h1>
          <p class="header-subtitle">Action required</p>
        </div>
        <div class="content">
          <p>Hi <strong>${data.clientName}</strong>,</p>
          <p>Your service has been suspended due to: <strong>${data.reason}</strong></p>
          
          <div class="alert-danger">
            <strong>Service:</strong> ${data.serviceName}
          </div>
          
          <p>To restore your service, please settle any outstanding payments or contact our support team.</p>
          
          <div class="btn-center">
            <a href="#" class="btn">Contact Support</a>
          </div>
        </div>
        <div class="footer">
          <p class="company">${data.companyName}</p>
        </div>
      </div>
    `)
  }),

  serviceActivated: (data: { clientName: string; serviceName: string; companyName: string }) => ({
    subject: `Service Activated: ${data.serviceName}`,
    html: emailWrapper(`
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);">
          <div class="header-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">✅</div>
          <h1>Service Activated</h1>
          <p class="header-subtitle">You're all set!</p>
        </div>
        <div class="content">
          <p>Hi <strong>${data.clientName}</strong>,</p>
          <p>Great news! Your service has been activated and is now ready to use.</p>
          
          <div class="alert-success">
            <strong>Service:</strong> ${data.serviceName}
          </div>
          
          <p>Thank you for choosing us. If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>Welcome aboard!</p>
          <p class="company">${data.companyName}</p>
        </div>
      </div>
    `)
  }),

  adminRenewalReminder: (data: { services: Array<{ clientName: string; serviceName: string; dueDate: string; amount: string }> }) => ({
    subject: `📅 Renewal Reminder: ${data.services.length} service(s) due soon`,
    html: emailWrapper(`
      <div class="container">
        <div class="header">
          <div class="header-icon">📅</div>
          <h1>Upcoming Renewals</h1>
          <p class="header-subtitle">${data.services.length} service(s) due for renewal</p>
        </div>
        <div class="content">
          <p>The following services are due for renewal in the next 7 days:</p>
          
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Due Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.services.map(s => `
                <tr>
                  <td>${s.clientName}</td>
                  <td>${s.serviceName}</td>
                  <td>${s.dueDate}</td>
                  <td><strong>${s.amount}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="footer">
          <p class="company">MyPanel - Client Management System</p>
        </div>
      </div>
    `)
  }),

  serviceTerminated: (data: { clientName: string; serviceName: string; companyName: string }) => ({
    subject: `Service Terminated: ${data.serviceName}`,
    html: emailWrapper(`
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.3) 100%);">
          <div class="header-icon" style="background: linear-gradient(135deg, #475569 0%, #334155 100%);">❌</div>
          <h1>Service Terminated</h1>
          <p class="header-subtitle">Account update</p>
        </div>
        <div class="content">
          <p>Hi <strong>${data.clientName}</strong>,</p>
          <p>Your service has been terminated.</p>
          
          <div class="details">
            <div class="details-row">
              <span class="details-label">Service</span>
              <span class="details-value">${data.serviceName}</span>
            </div>
          </div>
          
          <p>If you believe this was done in error or would like to reactivate your service, please contact us.</p>
          <p>Thank you for your past business.</p>
        </div>
        <div class="footer">
          <p class="company">${data.companyName}</p>
        </div>
      </div>
    `)
  }),

  adminServiceStatusChange: (data: { action: string; serviceName: string; clientName: string; clientEmail: string; companyName: string; reason?: string }) => ({
    subject: `🔔 Service ${data.action}: ${data.serviceName}`,
    html: emailWrapper(`
      <div class="container">
        <div class="header">
          <div class="header-icon">🔔</div>
          <h1>Service ${data.action}</h1>
          <p class="header-subtitle">Admin Notification</p>
        </div>
        <div class="content">
          <p>A service status has been changed. Here are the details:</p>
          
          <div class="details">
            <div class="details-row">
              <span class="details-label">Action</span>
              <span class="details-value">${data.action}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Service</span>
              <span class="details-value">${data.serviceName}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Client</span>
              <span class="details-value">${data.clientName}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Client Email</span>
              <span class="details-value">${data.clientEmail}</span>
            </div>
            ${data.reason ? `
            <div class="details-row">
              <span class="details-label">Reason</span>
              <span class="details-value">${data.reason}</span>
            </div>
            ` : ''}
          </div>
          
          <p>The client has been notified of this change.</p>
        </div>
        <div class="footer">
          <p class="company">${data.companyName} - Admin Panel</p>
        </div>
      </div>
    `)
  })
}
