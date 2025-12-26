import { format } from 'date-fns'
import { getPublicInvoiceUrl } from '../../utils/publicToken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    clientId,
    dueDate,
    items,
    notes,
    terms,
    taxAmount,
    discount,
    sendEmail: shouldSendEmail
  } = body

  if (!clientId || !items || items.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Client and at least one item are required'
    })
  }

  // Get settings for invoice prefix
  const settings = await prisma.settings.findFirst()
  const prefix = settings?.invoicePrefix || 'INV-'
  const currency = settings?.currencySymbol || '$'

  // Get next invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { id: 'desc' }
  })
  const nextNumber = (lastInvoice?.id || 0) + 1
  const invoiceNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unitPrice)
  }, 0)

  const total = subtotal + (taxAmount || 0) - (discount || 0)

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      dueDate: new Date(dueDate),
      subtotal,
      taxAmount: taxAmount || 0,
      discount: discount || 0,
      total,
      notes,
      terms,
      status: 'DRAFT',
      items: {
        create: items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          serviceId: item.serviceId || null
        }))
      }
    },
    include: {
      client: true,
      items: true
    }
  })

  // Send email if requested
  if (shouldSendEmail) {
    const companyName = settings?.companyName || 'MyPanel'
    
    // Generate public URL for the invoice
    const host = getRequestHost(event)
    const protocol = getRequestProtocol(event)
    const baseUrl = `${protocol}://${host}`
    const viewUrl = getPublicInvoiceUrl(invoice.id, baseUrl)
    
    const template = emailTemplates.invoiceCreated({
      clientName: invoice.client.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: `${currency}${total.toFixed(2)}`,
      dueDate: format(new Date(dueDate), 'MMMM d, yyyy'),
      companyName,
      viewUrl
    })

    await sendEmail({
      to: invoice.client.email,
      subject: template.subject,
      html: template.html,
      type: 'INVOICE_CREATED',
      referenceType: 'invoice',
      referenceId: invoice.id
    })

    // Update status to SENT
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'SENT' }
    })
  }

  return invoice
})


