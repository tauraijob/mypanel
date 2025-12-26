export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid quotation ID'
    })
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      client: true,
      items: true
    }
  })

  if (!quotation) {
    throw createError({
      statusCode: 404,
      message: 'Quotation not found'
    })
  }

  // Get settings
  const settings = await prisma.settings.findFirst()
  const companyName = settings?.companyName || 'MyPanel'
  const currencySymbol = settings?.currencySymbol || '$'

  // Build items table
  const itemsHtml = quotation.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${Number(item.unitPrice).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${Number(item.amount).toFixed(2)}</td>
    </tr>
  `).join('')

  // Email template
  const template = {
    subject: `Quotation ${quotation.quoteNumber} from ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .quote-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #374151; color: white; padding: 12px; text-align: left; }
          .total-row { background: #f3f4f6; font-weight: bold; }
          .button { display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Quotation</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">${quotation.quoteNumber}</p>
          </div>
          <div class="content">
            <p>Dear ${quotation.client.name},</p>
            <p>Please find your quotation details below. This quote is valid until <strong>${new Date(quotation.validUntil).toLocaleDateString()}</strong>.</p>
            
            <div class="quote-info">
              <p style="margin: 0 0 10px;"><strong>Quote Number:</strong> ${quotation.quoteNumber}</p>
              <p style="margin: 0 0 10px;"><strong>Issue Date:</strong> ${new Date(quotation.issueDate).toLocaleDateString()}</p>
              <p style="margin: 0;"><strong>Valid Until:</strong> ${new Date(quotation.validUntil).toLocaleDateString()}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                  <td style="padding: 12px; text-align: right;">${currencySymbol}${Number(quotation.total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            ${quotation.notes ? `<p><strong>Notes:</strong> ${quotation.notes}</p>` : ''}
            
            <p>If you have any questions about this quotation, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>${companyName}</p>
          </div>
          <div class="footer">
            <p>This quotation was sent by ${companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Send email
  await sendEmail({
    to: quotation.client.email,
    subject: template.subject,
    html: template.html,
    type: 'QUOTE_SENT',
    referenceType: 'quotation',
    referenceId: quotation.id
  })

  // Update quotation status to SENT
  const updated = await prisma.quotation.update({
    where: { id },
    data: { status: 'SENT' },
    include: {
      client: true,
      items: true
    }
  })

  return { success: true, quotation: updated }
})

