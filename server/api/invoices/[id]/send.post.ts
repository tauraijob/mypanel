import { format } from 'date-fns'
import { getPublicInvoiceUrl } from '../../../utils/publicToken'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid invoice ID'
    })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true }
  })

  if (!invoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  const settings = await prisma.settings.findFirst()
  const companyName = settings?.companyName || 'MyPanel'
  const currency = settings?.currencySymbol || '$'

  // Generate public URL for the invoice
  const host = getRequestHost(event)
  const protocol = getRequestProtocol(event)
  const baseUrl = `${protocol}://${host}`
  const viewUrl = getPublicInvoiceUrl(invoice.id, baseUrl)

  const template = emailTemplates.invoiceCreated({
    clientName: invoice.client.name,
    invoiceNumber: invoice.invoiceNumber,
    amount: `${currency}${Number(invoice.total).toFixed(2)}`,
    dueDate: format(invoice.dueDate, 'MMMM d, yyyy'),
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

  // Update status
  await prisma.invoice.update({
    where: { id },
    data: { status: invoice.status === 'DRAFT' ? 'SENT' : invoice.status }
  })

  return { success: true, message: 'Invoice sent successfully' }
})


