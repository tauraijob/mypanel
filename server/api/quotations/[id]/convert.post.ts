
import { addDays } from 'date-fns'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event).catch(() => ({})) || {}

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid quotation ID'
    })
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: true, client: true }
  })

  if (!quotation) {
    throw createError({
      statusCode: 404,
      message: 'Quotation not found'
    })
  }

  if (quotation.status === 'CONVERTED') {
    throw createError({
      statusCode: 400,
      message: 'Quotation has already been converted to an invoice'
    })
  }

  // Get settings for invoice prefix
  const settings = await prisma.settings.findFirst()
  const prefix = settings?.invoicePrefix || 'INV-'

  // Get next invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { id: 'desc' }
  })
  const nextNumber = (lastInvoice?.id || 0) + 1
  const invoiceNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`

  // Create invoice from quotation
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: quotation.clientId,
      dueDate: addDays(new Date(), body.dueDays || 14),
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      discount: quotation.discount,
      total: quotation.total,
      notes: quotation.notes,
      terms: quotation.terms,
      status: 'DRAFT',
      items: {
        create: quotation.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount
        }))
      }
    },
    include: {
      client: true,
      items: true
    }
  })

  // Update quotation status
  await prisma.quotation.update({
    where: { id },
    data: { status: 'CONVERTED' }
  })

  return { success: true, invoice }
})


