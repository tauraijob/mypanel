// Trial Expiration Reminder Job
// This API should be called by a cron job (e.g., daily at 9am)
// You can set up a cron service to call: POST /api/cron/trial-reminders

export default defineEventHandler(async (event) => {
    // Optional: Verify cron secret for security
    const query = getQuery(event)
    const cronSecret = query.secret
    const expectedSecret = process.env.CRON_SECRET

    // If CRON_SECRET is set, require it
    if (expectedSecret && cronSecret !== expectedSecret) {
        throw createError({
            statusCode: 401,
            message: 'Invalid cron secret'
        })
    }

    const now = new Date()
    const reminderDays = [5, 3, 1] // Days before expiration to send reminders
    const results: any[] = []

    // Get super admin email for notifications
    const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        select: { email: true, name: true }
    })

    for (const days of reminderDays) {
        // Calculate the target date range (exactly X days from now)
        const targetDate = new Date(now)
        targetDate.setDate(targetDate.getDate() + days)

        // Set to start and end of that day
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        // Find organizations expiring in X days
        const expiringOrgs = await prisma.organization.findMany({
            where: {
                subscriptionEnd: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                subscriptionStatus: {
                    in: ['TRIAL', 'ACTIVE']
                },
                isActive: true
            },
            include: {
                plan: true,
                users: {
                    where: { role: 'ADMIN' },
                    select: { email: true, name: true }
                }
            }
        })

        for (const org of expiringOrgs) {
            // Get the admin email
            const adminEmail = org.users[0]?.email || org.email
            const adminName = org.users[0]?.name || 'there'
            const isTrial = org.subscriptionStatus === 'TRIAL'
            const expiryDate = org.subscriptionEnd ? new Date(org.subscriptionEnd).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'soon'

            // Send reminder to org admin
            const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
            .header { background: ${isTrial ? 'linear-gradient(135deg, #2563eb, #0891b2)' : 'linear-gradient(135deg, #059669, #0d9488)'}; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .warning-box { background: ${days <= 1 ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${days <= 1 ? '#fecaca' : '#fde68a'}; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .days-count { font-size: 48px; font-weight: bold; color: ${days <= 1 ? '#dc2626' : '#d97706'}; text-align: center; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #0891b2); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⏰ ${isTrial ? 'Trial' : 'Subscription'} Expiring Soon</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">${org.name}</p>
            </div>
            <div class="content">
              <p>Hello ${adminName},</p>
              
              <div class="warning-box">
                <p class="days-count">${days}</p>
                <p style="text-align: center; margin: 0; color: #64748b;">days remaining</p>
              </div>
              
              <p>Your ${isTrial ? 'free trial' : 'subscription'}${org.plan ? ` (${org.plan.name})` : ''} expires on <strong>${expiryDate}</strong>.</p>
              
              ${isTrial ? `
                <p>To continue using MyPanel and keep all your data, please upgrade to a paid plan before your trial ends.</p>
                <p><strong>What happens after the trial?</strong></p>
                <ul>
                  <li>You'll lose access to your dashboard</li>
                  <li>You won't be able to send invoices or quotations</li>
                  <li>Your data will be preserved for 30 days</li>
                </ul>
              ` : `
                <p>To ensure uninterrupted service, please renew your subscription before it expires.</p>
              `}
              
              <p style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://mypanel.wecode.co.zw'}/settings" class="button">
                  ${isTrial ? 'Upgrade Now' : 'Renew Subscription'}
                </a>
              </p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} MyPanel. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `

            await sendEmail({
                to: adminEmail,
                subject: `⏰ Your ${isTrial ? 'Trial' : 'Subscription'} Expires in ${days} Day${days > 1 ? 's' : ''} - ${org.name}`,
                html: emailHtml,
                type: 'SUBSCRIPTION_REMINDER',
                organizationId: org.id
            })

            results.push({
                organization: org.name,
                email: adminEmail,
                days,
                type: isTrial ? 'TRIAL' : 'SUBSCRIPTION'
            })
        }

        // Notify super admin about expiring organizations
        if (expiringOrgs.length > 0 && superAdmin?.email) {
            const orgList = expiringOrgs.map(o => `• ${o.name} (${o.email}) - ${o.subscriptionStatus}`).join('\n')

            await sendEmail({
                to: superAdmin.email,
                subject: `📊 ${expiringOrgs.length} Organization(s) Expiring in ${days} Days`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .org-list { background: #f8fafc; border-radius: 8px; padding: 15px; margin: 15px 0; }
              .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">📊 Expiration Alert</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">${days} Days Until Expiration</p>
              </div>
              <div class="content">
                <p>Hello ${superAdmin.name || 'Admin'},</p>
                <p>The following <strong>${expiringOrgs.length} organization(s)</strong> will expire in ${days} days:</p>
                
                <div class="org-list">
                  ${expiringOrgs.map(o => `
                    <div style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                      <strong>${o.name}</strong><br>
                      <span style="color: #64748b; font-size: 14px;">${o.email} • ${o.subscriptionStatus}${o.plan ? ` • ${o.plan.name}` : ''}</span>
                    </div>
                  `).join('')}
                </div>
                
                <p><a href="${process.env.APP_URL || 'https://mypanel.wecode.co.zw'}/super-admin/organizations">View All Organizations →</a></p>
              </div>
              <div class="footer">
                <p>MyPanel Admin Notification</p>
              </div>
            </div>
          </body>
          </html>
        `,
                type: 'ADMIN_NOTIFICATION'
            })
        }
    }

    return {
        success: true,
        remindersSent: results.length,
        details: results
    }
})
