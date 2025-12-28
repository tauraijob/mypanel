// Utility to send super admin notifications for important events
import prisma from './prisma'
import { sendEmail } from './email'
import { format } from 'date-fns'

interface PaymentNotificationData {
    organizationId: number
    organizationName: string
    organizationEmail: string
    amount: number
    currency: string
    planName: string
    periodStart: Date | null
    periodEnd: Date | null
    paymentMethod: string
}

/**
 * Send payment notification to super admin
 */
export async function notifySuperAdminPayment(data: PaymentNotificationData) {
    try {
        // Get super admin user
        const superAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        })

        if (!superAdmin) {
            console.log('No super admin found to notify')
            return
        }

        const periodText = data.periodStart && data.periodEnd
            ? `${format(data.periodStart, 'MMM dd, yyyy')} - ${format(data.periodEnd, 'MMM dd, yyyy')}`
            : 'N/A'

        await sendEmail({
            to: superAdmin.email,
            subject: `💰 New Payment: ${data.organizationName} - $${data.amount.toFixed(2)}`,
            html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .label { color: #6b7280; }
        .value { font-weight: 600; color: #111827; }
        .amount-box { background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: 700; color: #059669; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">💰 Payment Received</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">MyPanel Platform</p>
        </div>
        <div class="content">
          <p>A new subscription payment has been received:</p>
          
          <div class="amount-box">
            <div class="amount">$${data.amount.toFixed(2)} ${data.currency}</div>
            <div style="color: #6b7280; margin-top: 5px;">${data.planName} Plan</div>
          </div>
          
          <div style="margin: 20px 0;">
            <div class="info-row">
              <span class="label">Organization</span>
              <span class="value">${data.organizationName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email</span>
              <span class="value">${data.organizationEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Method</span>
              <span class="value">${data.paymentMethod}</span>
            </div>
            <div class="info-row">
              <span class="label">Subscription Period</span>
              <span class="value">${periodText}</span>
            </div>
            <div class="info-row" style="border: none;">
              <span class="label">Payment Date</span>
              <span class="value">${format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>
          
          <p style="background: #f0fdf4; padding: 15px; border-radius: 8px; color: #166534;">
            ✅ The organization's subscription has been automatically activated.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from MyPanel.</p>
        </div>
      </div>
    </body>
    </html>
            `,
            type: 'ADMIN_NOTIFICATION'
        })

        console.log(`Super admin notified about payment from ${data.organizationName}`)
    } catch (error) {
        console.error('Failed to send super admin payment notification:', error)
    }
}

/**
 * Send new signup notification to super admin
 */
export async function notifySuperAdminNewSignup(organization: { id: number; name: string; email: string }, planName: string) {
    try {
        const superAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        })

        if (!superAdmin) return

        await sendEmail({
            to: superAdmin.email,
            subject: `🎉 New Signup: ${organization.name}`,
            html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .label { color: #6b7280; }
        .value { font-weight: 600; color: #111827; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 New Organization Signup</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">MyPanel Platform</p>
        </div>
        <div class="content">
          <p>A new organization has signed up for MyPanel:</p>
          
          <div style="margin: 20px 0;">
            <div class="info-row">
              <span class="label">Organization</span>
              <span class="value">${organization.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Email</span>
              <span class="value">${organization.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Selected Plan</span>
              <span class="value">${planName}</span>
            </div>
            <div class="info-row" style="border: none;">
              <span class="label">Signup Date</span>
              <span class="value">${format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>
          
          <p style="background: #eff6ff; padding: 15px; border-radius: 8px; color: #1e40af;">
            📋 The organization has started their 14-day free trial.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from MyPanel.</p>
        </div>
      </div>
    </body>
    </html>
            `,
            type: 'ADMIN_NOTIFICATION'
        })

        console.log(`Super admin notified about new signup: ${organization.name}`)
    } catch (error) {
        console.error('Failed to send super admin signup notification:', error)
    }
}

/**
 * Send account deletion notification to super admin
 */
export async function notifySuperAdminAccountDeletion(organization: { name: string; email: string }) {
    try {
        const superAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        })

        if (!superAdmin) return

        await sendEmail({
            to: superAdmin.email,
            subject: `⚠️ Account Deleted: ${organization.name}`,
            html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⚠️ Account Deleted</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">MyPanel Platform</p>
        </div>
        <div class="content">
          <p>An organization has deleted their account:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: 600; color: #991b1b;">${organization.name}</p>
            <p style="margin: 5px 0 0; color: #7f1d1d;">${organization.email}</p>
          </div>
          
          <p style="color: #6b7280;">
            All associated data has been permanently deleted.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Deletion date: ${format(new Date(), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from MyPanel.</p>
        </div>
      </div>
    </body>
    </html>
            `,
            type: 'ADMIN_NOTIFICATION'
        })

        console.log(`Super admin notified about account deletion: ${organization.name}`)
    } catch (error) {
        console.error('Failed to send super admin deletion notification:', error)
    }
}
