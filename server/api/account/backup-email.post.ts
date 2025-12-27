// Send backup data to user's email
export default defineEventHandler(async (event) => {
    const authUser = requireAuth(event)

    // Get user's organization and email
    const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { organizationId: true, role: true, email: true, name: true }
    })

    if (!user?.organizationId) {
        throw createError({
            statusCode: 403,
            message: 'No organization associated with your account'
        })
    }

    // Only admins can email backups
    if (user.role !== 'ADMIN') {
        throw createError({
            statusCode: 403,
            message: 'Only organization admins can request backup emails'
        })
    }

    const orgId = user.organizationId

    // Get organization info
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { name: true }
    })

    // Fetch all organization data
    const [
        settings,
        clients,
        services,
        categories,
        invoices,
        quotations,
        payments
    ] = await Promise.all([
        prisma.settings.findFirst({ where: { organizationId: orgId } }),
        prisma.client.findMany({ where: { organizationId: orgId } }),
        prisma.service.findMany({ where: { organizationId: orgId } }),
        prisma.serviceCategory.findMany({ where: { organizationId: orgId } }),
        prisma.invoice.findMany({
            where: { organizationId: orgId },
            include: { items: true }
        }),
        prisma.quotation.findMany({
            where: { organizationId: orgId },
            include: { items: true }
        }),
        prisma.payment.findMany({ where: { organizationId: orgId } })
    ])

    const backup = {
        exportedAt: new Date().toISOString(),
        organizationName: org?.name,
        data: { clients, services, categories, invoices, quotations, payments },
        summary: {
            totalClients: clients.length,
            totalServices: services.length,
            totalInvoices: invoices.length,
            totalQuotations: quotations.length,
            totalPayments: payments.length
        }
    }

    const backupJson = JSON.stringify(backup, null, 2)
    const date = new Date().toISOString().split('T')[0]

    // Create email with backup attachment info
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #2563eb, #0891b2); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat { display: inline-block; margin: 10px 20px 10px 0; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #64748b; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        pre { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; font-size: 11px; overflow: auto; max-height: 300px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📦 Data Backup</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">${org?.name || 'Your Organization'}</p>
        </div>
        <div class="content">
          <p>Hello ${user.name || 'there'},</p>
          <p>Here's your complete data backup from MyPanel, generated on <strong>${new Date().toLocaleDateString()}</strong>.</p>
          
          <div class="summary">
            <h3 style="margin: 0 0 15px; color: #1e293b;">Backup Summary</h3>
            <div class="stat">
              <div class="stat-value">${clients.length}</div>
              <div class="stat-label">Clients</div>
            </div>
            <div class="stat">
              <div class="stat-value">${services.length}</div>
              <div class="stat-label">Services</div>
            </div>
            <div class="stat">
              <div class="stat-value">${invoices.length}</div>
              <div class="stat-label">Invoices</div>
            </div>
            <div class="stat">
              <div class="stat-value">${quotations.length}</div>
              <div class="stat-label">Quotations</div>
            </div>
            <div class="stat">
              <div class="stat-value">${payments.length}</div>
              <div class="stat-label">Payments</div>
            </div>
          </div>

          <p><strong>Your backup data is attached below.</strong> Save this JSON file securely — it contains all your business data.</p>
          
          <details>
            <summary style="cursor: pointer; color: #2563eb; font-weight: 600;">Click to preview backup data</summary>
            <pre>${backupJson.substring(0, 2000)}${backupJson.length > 2000 ? '\n... (truncated for preview)' : ''}</pre>
          </details>
        </div>
        <div class="footer">
          <p>This backup was requested from your MyPanel account.</p>
          <p>Keep this email safe — we recommend saving the JSON file to a secure location.</p>
        </div>
      </div>
    </body>
    </html>
  `

    // Send email with backup
    await sendEmail({
        to: user.email,
        subject: `📦 Data Backup - ${org?.name} - ${date}`,
        html: emailHtml,
        attachments: [
            {
                filename: `mypanel-backup-${date}.json`,
                content: backupJson,
                contentType: 'application/json'
            }
        ],
        type: 'BACKUP',
        organizationId: orgId
    })

    return {
        success: true,
        message: `Backup sent to ${user.email}`,
        recipient: user.email
    }
})
