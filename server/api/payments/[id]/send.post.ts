export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid payment ID'
    })
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          client: true
        }
      }
    }
  })

  if (!payment) {
    throw createError({
      statusCode: 404,
      message: 'Payment not found'
    })
  }

  const settings = await prisma.settings.findFirst()
  const companyName = settings?.companyName || 'MyPanel'
  const currencySymbol = settings?.currencySymbol || '$'

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatMethod = (method: string) => {
    const methods: Record<string, string> = {
      BANK_TRANSFER: 'Bank Transfer',
      CASH: 'Cash',
      CREDIT_CARD: 'Credit Card',
      PAYPAL: 'PayPal',
      MOBILE_MONEY: 'Mobile Money',
      CRYPTO: 'Cryptocurrency',
      OTHER: 'Other'
    }
    return methods[method] || method
  }

  const receiptNumber = `REC-${String(payment.id).padStart(4, '0')}`

  // Beautiful receipt email template
  const template = {
    subject: `Payment Receipt ${receiptNumber} from ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background: #f1f5f9; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
          .header p { color: #a7f3d0; margin: 8px 0 0; font-size: 14px; }
          .success-badge { display: inline-block; background: white; color: #059669; padding: 12px 24px; border-radius: 50px; font-weight: 700; font-size: 14px; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .content { background: white; padding: 40px 30px; }
          .amount-box { text-align: center; padding: 30px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; margin-bottom: 30px; }
          .amount { font-size: 48px; font-weight: 800; color: #059669; margin: 0; }
          .amount-label { color: #64748b; font-size: 14px; margin-top: 8px; }
          .details-card { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
          .details-card h3 { margin: 0 0 16px; color: #1e293b; font-size: 16px; font-weight: 600; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-size: 14px; }
          .detail-value { color: #1e293b; font-weight: 600; font-size: 14px; }
          .client-info { display: flex; align-items: center; gap: 16px; padding: 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 24px; }
          .client-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #059669, #0d9488); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
          .client-details h4 { margin: 0; color: #1e293b; font-size: 16px; }
          .client-details p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
          .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 0; color: #64748b; font-size: 13px; }
          .company-info { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
          .company-info p { font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div style="padding: 20px;">
          <div class="container">
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>${receiptNumber}</p>
              <div class="success-badge">✓ Payment Received</div>
            </div>
            
            <div class="content">
              <div class="amount-box">
                <p class="amount">${currencySymbol}${Number(payment.amount).toFixed(2)}</p>
                <p class="amount-label">Amount Paid</p>
              </div>

              <div class="details-card">
                <h3>Payment Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${formatDate(payment.paymentDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Method</span>
                  <span class="detail-value">${formatMethod(payment.paymentMethod)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Invoice</span>
                  <span class="detail-value">${payment.invoice.invoiceNumber}</span>
                </div>
                ${payment.reference ? `
                <div class="detail-row">
                  <span class="detail-label">Reference</span>
                  <span class="detail-value">${payment.reference}</span>
                </div>
                ` : ''}
              </div>

              <div class="client-info">
                <div class="client-avatar">${payment.invoice.client.name.charAt(0).toUpperCase()}</div>
                <div class="client-details">
                  <h4>${payment.invoice.client.name}</h4>
                  <p>${payment.invoice.client.email}</p>
                </div>
              </div>

              <p style="text-align: center; color: #64748b;">
                Thank you for your payment! This email serves as your official receipt.
              </p>
            </div>
            
            <div class="footer">
              <p>This receipt was sent by <strong>${companyName}</strong></p>
              <div class="company-info">
                ${settings?.companyEmail ? `<p>${settings.companyEmail}</p>` : ''}
                ${settings?.companyPhone ? `<p>${settings.companyPhone}</p>` : ''}
                ${settings?.companyAddress ? `<p>${settings.companyAddress}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Send email
  await sendEmail({
    to: payment.invoice.client.email,
    subject: template.subject,
    html: template.html,
    type: 'PAYMENT_RECEIVED',
    referenceType: 'payment',
    referenceId: payment.id
  })

  return { 
    success: true, 
    message: `Receipt sent to ${payment.invoice.client.email}` 
  }
})

